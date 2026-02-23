import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const now = new Date();

  // IDs of everyone this user follows
  const following = await db.follow.findMany({
    where: { followerId: dbUser.id },
    select: { followingId: true },
  });
  const followingIds = following.map((f) => f.followingId);

  // Statuses from own account + followed accounts that haven't expired
  const statuses = await db.status.findMany({
    where: {
      userId: { in: [dbUser.id, ...followingIds] },
      expiresAt: { gt: now },
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      views: { where: { viewerId: dbUser.id } }, // only MY view record
      _count: { select: { views: true } },       // total view count
    },
    orderBy: { createdAt: "desc" },
  });

  // Always return own bubble (even when user has no active statuses)
  const meEntry = {
    userId: dbUser.id,
    name: dbUser.name ?? "Me",
    image: dbUser.image,
    isMe: true,
    hasUnseen: false,
    statuses: statuses
      .filter((s) => s.userId === dbUser.id)
      .map((s) => ({
        id: s.id,
        mediaUrl: s.mediaUrl,
        mediaType: s.mediaType,
        caption: s.caption,
        expiresAt: s.expiresAt.toISOString(),
        createdAt: s.createdAt.toISOString(),
        viewedByMe: true, // own story is always "seen"
        viewCount: s._count.views,
      })),
  };

  // One entry per followed user that has at least one active status
  const otherEntries = followingIds
    .map((uid) => {
      const userStatuses = statuses.filter((s) => s.userId === uid);
      if (userStatuses.length === 0) return null;

      const u = userStatuses[0].user;
      return {
        userId: uid,
        name: u.name ?? "Unknown",
        image: u.image,
        isMe: false,
        hasUnseen: userStatuses.some((s) => s.views.length === 0), // unseen = no view record for me
        statuses: userStatuses.map((s) => ({
          id: s.id,
          mediaUrl: s.mediaUrl,
          mediaType: s.mediaType,
          caption: s.caption,
          expiresAt: s.expiresAt.toISOString(),
          createdAt: s.createdAt.toISOString(),
          viewedByMe: s.views.length > 0,
          viewCount: s._count.views,
        })),
      };
    })
    .filter(Boolean);

  return NextResponse.json([meEntry, ...otherEntries]);
}
