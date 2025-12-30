import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const existing = await db.follow.findMany({
    where: { followerId: dbUser.id },
    select: { followingId: true },
  });

  const excludeIds = new Set<string>([dbUser.id, ...existing.map((e) => e.followingId)]);

  const members = await db.user.findMany({
    where: {
      id: {
        notIn: Array.from(excludeIds),
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      bio: true,
      image: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ suggestions: members });
}
