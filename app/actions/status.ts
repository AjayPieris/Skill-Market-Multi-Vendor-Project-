"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

// Create a new status (story) — expires in 24 h
export async function createStatusAction(
  mediaUrl: string,
  mediaType: string,
  caption: string | null
) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) throw new Error("User not found");

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 h

  await db.status.create({
    data: {
      userId: dbUser.id,
      mediaUrl,
      mediaType,
      caption,
      expiresAt,
    },
  });
}

// Record that the current user viewed a status
export async function markStatusViewedAction(statusId: string) {
  const user = await currentUser();
  if (!user) return;

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return;

  await db.statusView.upsert({
    where: { statusId_viewerId: { statusId, viewerId: dbUser.id } },
    update: {},
    create: { statusId, viewerId: dbUser.id },
  });
}

// Delete own status (owner-only)
export async function deleteStatusAction(statusId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) throw new Error("User not found");

  const status = await db.status.findUnique({ where: { id: statusId } });
  if (!status) throw new Error("Status not found");
  if (status.userId !== dbUser.id) throw new Error("Forbidden");

  await db.status.delete({ where: { id: statusId } });
}
