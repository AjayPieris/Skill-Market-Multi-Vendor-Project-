"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { pusherServer } from "@/lib/pusher";

// Creates a Stripe Checkout session and redirects the user to it
export async function createCheckoutSessionAction(gigId: string) {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return redirect("/dashboard");

  const gig = await db.gig.findUnique({
    where: { id: gigId },
    include: { vendor: true },
  });
  if (!gig) throw new Error("Gig not found");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: gig.title,
            description: gig.description.slice(0, 200),
            images: [gig.imageUrl],
          },
          unit_amount: gig.price * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      gigId: gig.id,
      buyerId: dbUser.id,
      vendorId: gig.vendorId,
    },
    success_url: `${appUrl}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/gigs/${gig.id}`,
  });

  redirect(session.url!);
}

// Called from the success page — verifies payment and creates the order (idempotent)
export async function fulfillOrderFromSessionAction(
  sessionId: string
): Promise<{ ok: boolean; alreadyExists?: boolean; error?: string }> {
  // Already fulfilled? Return early (idempotent — safe on refresh).
  const existing = await db.order.findUnique({
    where: { stripeSessionId: sessionId },
  });
  if (existing) return { ok: true, alreadyExists: true };

  // Retrieve the session from Stripe to verify payment
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Stripe error";
    console.error("[fulfillOrder] stripe.retrieve failed:", msg);
    return { ok: false, error: `Stripe retrieval failed: ${msg}` };
  }

  if (session.payment_status !== "paid") {
    return { ok: false, error: `Payment not confirmed (status: ${session.payment_status})` };
  }

  const gigId = session.metadata?.gigId;
  const buyerId = session.metadata?.buyerId;
  const vendorId = session.metadata?.vendorId;

  if (!gigId || !buyerId) {
    return { ok: false, error: "Missing gigId or buyerId in session metadata" };
  }

  const gig = await db.gig.findUnique({ where: { id: gigId } });
  if (!gig) return { ok: false, error: `Gig ${gigId} not found` };

  try {
    await db.order.create({
      data: {
        price: gig.price,
        status: "completed",
        buyerId,
        gigId,
        stripeSessionId: sessionId,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "DB error";
    console.error("[fulfillOrder] db.order.create failed:", msg);
    return { ok: false, error: `DB write failed: ${msg}` };
  }

  // Notify the vendor via Pusher
  if (vendorId) {
    try {
      const buyer = await db.user.findUnique({ where: { id: buyerId } });
      await pusherServer.trigger(vendorId, "new-activity-notification", {
        type: "order",
        actorName: buyer?.name ?? "Someone",
        actorImage: buyer?.image ?? null,
        message: `${buyer?.name ?? "Someone"} ordered your gig "${gig.title}"`,
        gigTitle: gig.title,
      });
    } catch (err) {
      // Non-critical — order is already created, just log and continue
      console.error("[fulfillOrder] Pusher notify failed:", err);
    }
  }

  return { ok: true };
}