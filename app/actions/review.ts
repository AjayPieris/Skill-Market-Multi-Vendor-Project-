"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function submitReviewAction(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) throw new Error("User not found");

  const orderId = formData.get("orderId") as string;
  const gigId = formData.get("gigId") as string;
  const rating = parseInt(formData.get("rating") as string, 10);
  const comment = (formData.get("comment") as string)?.trim();

  if (!orderId || !gigId || !rating || !comment) {
    throw new Error("All fields are required");
  }
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  // Verify this order belongs to the current user
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { review: true },
  });

  if (!order) throw new Error("Order not found");
  if (order.buyerId !== dbUser.id) throw new Error("Not your order");
  if (order.review) throw new Error("Already reviewed");
  if (order.gigId !== gigId) throw new Error("Order does not match this gig");

  await db.review.create({
    data: {
      orderId,
      gigId,
      reviewerId: dbUser.id,
      rating,
      comment,
    },
  });

  revalidatePath(`/gigs/${gigId}`);
}
