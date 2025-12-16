import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const unreadCount = await db.message.count({
      where: {
        isRead: false,
        senderId: { not: dbUser.id },
        conversation: {
          OR: [{ userOneId: dbUser.id }, { userTwoId: dbUser.id }],
        },
      },
    });

    const conversations = await db.conversation.findMany({
      where: {
        OR: [{ userOneId: dbUser.id }, { userTwoId: dbUser.id }],
      },
      select: {
        id: true,
        messages: {
          where: {
            isRead: false,
            senderId: { not: dbUser.id },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            sender: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    const items = conversations
      .filter((c) => c.messages.length > 0)
      .map((c) => {
        const lastUnread = c.messages[0];
        return {
          conversationId: c.id,
          senderName: lastUnread.sender?.name ?? "Someone",
          senderImage: lastUnread.sender?.image ?? null,
          content: lastUnread.content,
          createdAt: lastUnread.createdAt,
        };
      })
      .sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return bTime - aTime;
      });

    return NextResponse.json({ unreadCount, items });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
