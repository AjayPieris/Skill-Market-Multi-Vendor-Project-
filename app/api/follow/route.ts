import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const followers = await db.follow.findMany({
    where: { followingId: dbUser.id },
    orderBy: { createdAt: "desc" },
    include: {
      follower: {
        select: {
          id: true,
          name: true,
          bio: true,
          image: true,
          createdAt: true,
        },
      },
    },
  });

  return NextResponse.json({
    followers: followers.map((f) => f.follower),
  });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const targetUserId = body?.targetUserId as string | undefined;

  if (!targetUserId) {
    return NextResponse.json(
      { error: "targetUserId is required" },
      { status: 400 }
    );
  }

  if (targetUserId === dbUser.id) {
    return NextResponse.json(
      { error: "You cannot follow yourself" },
      { status: 400 }
    );
  }

  const target = await db.user.findUnique({ where: { id: targetUserId } });
  if (!target) return NextResponse.json({ error: "Target user not found" }, { status: 404 });

  await db.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: dbUser.id,
        followingId: targetUserId,
      },
    },
    create: {
      followerId: dbUser.id,
      followingId: targetUserId,
    },
    update: {},
  });

  // Notify the person being followed
  await pusherServer.trigger(targetUserId, "new-activity-notification", {
    type: "follow",
    actorName: dbUser.name ?? "Someone",
    actorImage: dbUser.image ?? null,
    message: `${dbUser.name ?? "Someone"} started following you`,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const targetUserId = body?.targetUserId as string | undefined;

  if (!targetUserId) {
    return NextResponse.json(
      { error: "targetUserId is required" },
      { status: 400 }
    );
  }

  if (targetUserId === dbUser.id) {
    return NextResponse.json(
      { error: "You cannot unfollow yourself" },
      { status: 400 }
    );
  }

  await db.follow.deleteMany({
    where: {
      followerId: dbUser.id,
      followingId: targetUserId,
    },
  });

  return NextResponse.json({ ok: true });
}
