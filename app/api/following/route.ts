import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const following = await db.follow.findMany({
    where: { followerId: dbUser.id },
    orderBy: { createdAt: "desc" },
    include: {
      following: {
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
    following: following.map((f) => f.following),
  });
}
