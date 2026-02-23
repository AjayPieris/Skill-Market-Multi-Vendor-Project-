import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import Stripe from "stripe";

// Tell Next.js NOT to parse the body — Stripe needs the raw bytes for signature verification
export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    console.error("Stripe webhook error:", msg);
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  // ── Handle checkout completed ─────────────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const gigId = session.metadata?.gigId;
    const buyerId = session.metadata?.buyerId;
    const vendorId = session.metadata?.vendorId;

    if (!gigId || !buyerId) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const gig = await db.gig.findUnique({ where: { id: gigId } });
    if (!gig) return NextResponse.json({ error: "Gig not found" }, { status: 404 });

    // Create the order in DB
    await db.order.create({
      data: {
        price: gig.price,
        status: "completed",
        buyerId,
        gigId,
        stripeSessionId: session.id,
      },
    });

    // Notify the vendor via Pusher
    if (vendorId) {
      const buyer = await db.user.findUnique({ where: { id: buyerId } });
      await pusherServer.trigger(vendorId, "new-activity-notification", {
        type: "order",
        actorName: buyer?.name ?? "Someone",
        actorImage: buyer?.image ?? null,
        message: `${buyer?.name ?? "Someone"} ordered your gig "${gig.title}"`,
        gigTitle: gig.title,
      });
    }
  }

  return NextResponse.json({ received: true });
}
