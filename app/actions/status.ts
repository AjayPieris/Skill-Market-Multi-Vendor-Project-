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

// Reply to a status — find/create a DM with the owner and send the message
export async function replyToStatusAction(statusId: string, message: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) throw new Error("User not found");

  const status = await db.status.findUnique({ where: { id: statusId } });
  if (!status) throw new Error("Status not found");

  const ownerId = status.userId;
  if (ownerId === dbUser.id) throw new Error("Cannot reply to your own status");

  // Find or create a conversation between the two users
  let conversation = await db.conversation.findFirst({
    where: {
      OR: [
        { userOneId: dbUser.id, userTwoId: ownerId },
        { userOneId: ownerId, userTwoId: dbUser.id },
      ],
    },
  });

  if (!conversation) {
    conversation = await db.conversation.create({
      data: { userOneId: dbUser.id, userTwoId: ownerId },
    });
  }

  // Send the reply as a message prefixed with a tag
  await db.message.create({
    data: {
      content: `↩ Status reply: ${message}`,
      conversationId: conversation.id,
      senderId: dbUser.id,
      isRead: false,
    },
  });

  return conversation.id;
}

// Return the list of viewers for a status (owner-only)
export async function getStatusViewersAction(
  statusId: string
): Promise<{ id: string; name: string | null; image: string | null }[]> {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) throw new Error("User not found");

  const status = await db.status.findUnique({ where: { id: statusId } });
  if (!status) throw new Error("Status not found");
  if (status.userId !== dbUser.id) throw new Error("Forbidden");

  const views = await db.statusView.findMany({
    where: { statusId },
    orderBy: { viewedAt: "desc" },
  });

  // Bulk-fetch viewers
  const viewerIds = views.map((v) => v.viewerId);
  const users = await db.user.findMany({
    where: { id: { in: viewerIds } },
    select: { id: true, name: true, image: true },
  });

  // Return in view-time order
  return viewerIds
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean) as { id: string; name: string | null; image: string | null }[];
}
