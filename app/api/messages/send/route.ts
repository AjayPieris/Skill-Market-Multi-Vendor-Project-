import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      conversationId?: string;
      content?: string;
    };

    if (!body.conversationId || !body.content) {
      return NextResponse.json(
        { error: "conversationId and content are required" },
        { status: 400 }
      );
    }

    const content = body.content.trim();
    if (!content) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, name: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const conversation = await db.conversation.findUnique({
      where: { id: body.conversationId },
      include: { userOne: true, userTwo: true },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const isParticipant =
      conversation.userOneId === dbUser.id || conversation.userTwoId === dbUser.id;

    if (!isParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const receiver =
      conversation.userOneId === dbUser.id
        ? conversation.userTwo
        : conversation.userOne;

    const newMessage = await db.message.create({
      data: {
        content,
        conversationId: body.conversationId,
        senderId: dbUser.id,
        isRead: false,
      },
      include: {
        sender: true,
      },
    });

    await pusherServer.trigger(body.conversationId, "new-message", newMessage);

    await pusherServer.trigger(receiver.id, "new-notification", {
      conversationId: body.conversationId,
      senderName: dbUser.name,
      content: content.substring(0, 30) + "...",
    });

    return NextResponse.json({ message: newMessage });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
