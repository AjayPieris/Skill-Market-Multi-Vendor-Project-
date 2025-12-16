"use server"; 

import { db } from "@/lib/db"; 
import { currentUser } from "@clerk/nextjs/server"; 
import { pusherServer } from "@/lib/pusher"; 

export async function markReadAction(conversationId: string) {
  // Server action to mark messages as "read" in a conversation
  const user = await currentUser(); 
  // Get the current logged-in user

  if (!user) return; 
  // If no user is logged in, stop the function

  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true },
  });

  if (!dbUser) return;

  await db.message.updateMany({
    where: {
      conversationId,               // Only messages from this conversation
      senderId: { not: dbUser.id },  // Messages sent by the OTHER user
      isRead: false,                 // Only unread messages
    },
    data: {
      isRead: true,                  // Mark them as read
    },
  });
  // Update database to mark messages as read

  await pusherServer.trigger(
    conversationId,                 // Channel name (conversation ID)
    "messages-seen",                 // Event name listened by clients
    {
      seenBy: dbUser.id,             // Who has seen the messages (DB user id)
    }
  );
  // Notify other users in real-time that messages were seen
}
