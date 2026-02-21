import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const conversations = await db.conversation.findMany({
    where: {
      OR: [{ userOneId: dbUser.id }, { userTwoId: dbUser.id }],
    },
    include: {
      userOne: { select: { id: true, name: true, image: true } },
      userTwo: { select: { id: true, name: true, image: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true, senderId: true, isRead: true },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  // Get per-conversation unread counts
  const unreadCounts = await db.message.groupBy({
    by: ["conversationId"],
    where: {
      isRead: false,
      senderId: { not: dbUser.id },
      conversation: {
        OR: [{ userOneId: dbUser.id }, { userTwoId: dbUser.id }],
      },
    },
    _count: { id: true },
  });

  const unreadMap: Record<string, number> = {};
  for (const row of unreadCounts) {
    unreadMap[row.conversationId] = row._count.id;
  }

  // Sort by last message time (most recent first)
  const sorted = conversations.sort((a, b) => {
    const aTime = a.messages[0]?.createdAt
      ? new Date(a.messages[0].createdAt).getTime()
      : 0;
    const bTime = b.messages[0]?.createdAt
      ? new Date(b.messages[0].createdAt).getTime()
      : 0;
    return bTime - aTime;
  });

  const result = sorted.map((conv) => {
    const otherUser =
      conv.userOneId === dbUser.id ? conv.userTwo : conv.userOne;
    const lastMessage = conv.messages[0] ?? null;
    return {
      conversationId: conv.id,
      otherUser,
      lastMessage,
      unreadCount: unreadMap[conv.id] ?? 0,
    };
  });

  return NextResponse.json({ conversations: result, currentUserId: dbUser.id });
}
