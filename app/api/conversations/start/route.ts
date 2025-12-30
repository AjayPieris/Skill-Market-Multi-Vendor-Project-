import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const otherUserId = body?.userId as string | undefined;

  if (!otherUserId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  if (otherUserId === dbUser.id) {
    return NextResponse.json(
      { error: "You cannot start a conversation with yourself" },
      { status: 400 }
    );
  }

  const otherUser = await db.user.findUnique({ where: { id: otherUserId } });
  if (!otherUser) {
    return NextResponse.json({ error: "Other user not found" }, { status: 404 });
  }

  let conversation = await db.conversation.findFirst({
    where: {
      OR: [
        { userOneId: dbUser.id, userTwoId: otherUserId },
        { userOneId: otherUserId, userTwoId: dbUser.id },
      ],
    },
  });

  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        userOneId: dbUser.id,
        userTwoId: otherUserId,
      },
    });
  }

  return NextResponse.json({ conversationId: conversation.id });
}
