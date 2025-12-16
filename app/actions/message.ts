"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { pusherServer } from "@/lib/pusher";

export async function sendMessageAction(conversationId: string, content: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) throw new Error("User not found");

  // 1. Find the conversation to identify the Receiver
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: { userOne: true, userTwo: true }
  });

  if (!conversation) throw new Error("Conversation not found");

  // Identify the OTHER user (The Receiver)
  const receiver = conversation.userOneId === dbUser.id 
    ? conversation.userTwo 
    : conversation.userOne;

  // 2. Save Message to DB
  const newMessage = await db.message.create({
    data: {
      content,
      conversationId,
      senderId: dbUser.id,
      isRead: false, // Default is unread
    },
    include: {
      sender: true,
    }
  });

  // 3. Trigger CHAT Update (Updates the open chat window)
  await pusherServer.trigger(conversationId, "new-message", newMessage);

  // 4. Trigger NOTIFICATION (Updates the bell icon for the receiver)
  // We use the receiver's ID as their personal channel name
  await pusherServer.trigger(receiver.id, "new-notification", {
    conversationId,
    senderName: dbUser.name,
    content: content.substring(0, 30) + "..." // Send a preview
  });

  return newMessage;
}