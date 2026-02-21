"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { pusherServer } from "@/lib/pusher";

export async function placeOrderAction(gigId: string) {
  const user = await currentUser();

  // 1. Must be logged in to buy
  if (!user) {
    return redirect("/sign-in");
  }

  // 2. Find the user in our DB
  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id }
  });

  if (!dbUser) {
    // If they don't exist in DB yet, create them (Safety sync)
    // In a real app, we might redirect to a setup page, but let's handle it simply:
    return redirect("/dashboard"); 
  }

  // 3. Find the Gig to get the price
  const gig = await db.gig.findUnique({
    where: { id: gigId },
    include: { vendor: true },
  });

  if (!gig) throw new Error("Gig not found");

  // 4. Create the Order
  await db.order.create({
    data: {
      price: gig.price,
      status: "completed", // Auto-complete for now
      buyerId: dbUser.id,
      gigId: gig.id,
    },
  });

  // 5. Notify the vendor about the new order
  await pusherServer.trigger(gig.vendor.id, "new-activity-notification", {
    type: "order",
    actorName: dbUser.name ?? "Someone",
    actorImage: dbUser.image ?? null,
    message: `${dbUser.name ?? "Someone"} ordered your gig "${gig.title}"`,
    gigTitle: gig.title,
  });

  // 6. Redirect to a Thank You page
  redirect("/orders/success");
}