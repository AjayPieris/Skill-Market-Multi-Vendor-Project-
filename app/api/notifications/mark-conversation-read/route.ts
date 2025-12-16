import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = (await req.json()) as { conversationId?: string };
    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, userOneId: true, userTwoId: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const isParticipant =
      conversation.userOneId === dbUser.id || conversation.userTwoId === dbUser.id;

    if (!isParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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

    return NextResponse.json({ unreadCount });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
