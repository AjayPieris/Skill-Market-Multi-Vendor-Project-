"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { pusherServer } from "@/lib/pusher";

export async function createGigAction(formData: FormData, imageUrl: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Get data from the form
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const price = Number(formData.get("price"));
  const packageDescription = (formData.get("packageDescription") as string) || null;
  const deliveryDays = Number(formData.get("deliveryDays")) || 3;
  const revisions = (formData.get("revisions") as string) || "Unlimited";

  // Find the database user to link the gig
  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id }
  });

  if (!dbUser) throw new Error("User not found in DB");

  // Create the Gig
  const newGig = await db.gig.create({
    data: {
      title,
      description,
      price,
      imageUrl,
      category,
      vendorId: dbUser.id,
      packageDescription,
      deliveryDays,
      revisions,
    },
  });

  // Notify all followers about the new gig
  const followers = await db.follow.findMany({
    where: { followingId: dbUser.id },
    select: { followerId: true },
  });

  await Promise.all(
    followers.map((f) =>
      pusherServer.trigger(f.followerId, "new-activity-notification", {
        type: "new-gig",
        actorName: dbUser.name ?? "Someone",
        actorImage: dbUser.image ?? null,
        message: `${dbUser.name ?? "Someone"} posted a new gig: "${title}"`,
        gigId: newGig.id,
      })
    )
  );
}

export async function updateGigAction(
  gigId: string,
  formData: FormData,
  imageUrl?: string
) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const price = Number(formData.get("price"));
  const packageDescription = (formData.get("packageDescription") as string) || null;
  const deliveryDays = Number(formData.get("deliveryDays")) || 3;
  const revisions = (formData.get("revisions") as string) || "Unlimited";

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) throw new Error("User not found in DB");

  const gig = await db.gig.findUnique({ where: { id: gigId } });
  if (!gig) throw new Error("Gig not found");
  if (gig.vendorId !== dbUser.id) throw new Error("Forbidden");

  await db.gig.update({
    where: { id: gigId },
    data: {
      title,
      description,
      category,
      price,
      packageDescription,
      deliveryDays,
      revisions,
      ...(imageUrl ? { imageUrl } : {}),
    },
  });

  // Notify all followers about the updated gig
  const followers = await db.follow.findMany({
    where: { followingId: dbUser.id },
    select: { followerId: true },
  });

  await Promise.all(
    followers.map((f) =>
      pusherServer.trigger(f.followerId, "new-activity-notification", {
        type: "edit-gig",
        actorName: dbUser.name ?? "Someone",
        actorImage: dbUser.image ?? null,
        message: `${dbUser.name ?? "Someone"} updated their gig: "${title}"`,
        gigId: gigId,
      })
    )
  );
}

export async function deleteGigAction(gigId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) throw new Error("User not found in DB");

  const gig = await db.gig.findUnique({ where: { id: gigId } });
  if (!gig) throw new Error("Gig not found");
  if (gig.vendorId !== dbUser.id) throw new Error("Forbidden");

  // Soft delete
  await db.gig.update({
    where: { id: gigId },
    data: { deletedAt: new Date() },
  });
}