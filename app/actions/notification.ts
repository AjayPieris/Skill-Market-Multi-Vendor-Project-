"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function markConversationReadAction(conversationId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) throw new Error("User not found");

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, userOneId: true, userTwoId: true },
  });

  if (!conversation) throw new Error("Conversation not found");

  const isParticipant =
    conversation.userOneId === dbUser.id || conversation.userTwoId === dbUser.id;

  if (!isParticipant) throw new Error("Forbidden");

  await db.message.updateMany({
    where: {
      conversationId,
      isRead: false,
      senderId: { not: dbUser.id },
    },
    data: {
      isRead: true,
    },
  });

  const unreadCount = await db.message.count({
    where: {
      isRead: false,
      senderId: { not: dbUser.id },
      conversation: {
        OR: [{ userOneId: dbUser.id }, { userTwoId: dbUser.id }],
      },
    },
  });

  return { unreadCount };
}
