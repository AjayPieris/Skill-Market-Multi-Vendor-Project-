import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params;
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true, image: true } } },
      },
      userOne: { select: { id: true, name: true, image: true } },
      userTwo: { select: { id: true, name: true, image: true } },
    },
  });

  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParticipant =
    conversation.userOneId === dbUser.id || conversation.userTwoId === dbUser.id;
  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const otherUser =
    conversation.userOneId === dbUser.id ? conversation.userTwo : conversation.userOne;

  return NextResponse.json({ messages: conversation.messages, otherUser });
}
