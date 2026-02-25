import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MemberActions from "./member-actions";
import ConnectionsSheet from "./connections-sheet";

function professionalLabel(bio: string | null) {
  const professional = (bio ?? "").trim();
  return professional.length > 0 ? professional : "Member";
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const member = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, bio: true, image: true, createdAt: true },
  });

  if (!member) return notFound();

  const viewer = await currentUser();
  const viewerDbUser = viewer
    ? await db.user.findUnique({ where: { clerkId: viewer.id } })
    : null;
  const isSelf = viewerDbUser?.id === member.id;

  const isFollowing =
    !isSelf && viewerDbUser
      ? !!(await db.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: viewerDbUser.id,
              followingId: member.id,
            },
          },
        }))
      : false;

  const [followers, following, gigs] = await Promise.all([
    db.follow.findMany({
      where: { followingId: member.id },
      orderBy: { createdAt: "desc" },
      include: {
        follower: { select: { id: true, name: true, bio: true, image: true } },
      },
    }),
    db.follow.findMany({
      where: { followerId: member.id },
      orderBy: { createdAt: "desc" },
      include: {
        following: { select: { id: true, name: true, bio: true, image: true } },
      },
    }),
    db.gig.findMany({
      where: { vendorId: member.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        category: true,
        price: true,
        imageUrl: true,
        createdAt: true,
      },
    }),
  ]);

  const followerUsers = followers.map((f) => f.follower);
  const followingUsers = following.map((f) => f.following);

  const viewerFollowingIds = viewerDbUser
    ? new Set(
        (
          await db.follow.findMany({
            where: {
              followerId: viewerDbUser.id,
              followingId: {
                in: Array.from(
                  new Set(
                    [...followerUsers, ...followingUsers].map((u) => u.id),
                  ),
                ),
              },
            },
            select: { followingId: true },
          })
        ).map((r) => r.followingId),
      )
    : new Set<string>();

  const followersForSheet = followerUsers.map((u) => ({
    ...u,
    initialIsFollowing: viewerFollowingIds.has(u.id),
  }));

  const followingForSheet = followingUsers.map((u) => ({
    ...u,
    initialIsFollowing: viewerFollowingIds.has(u.id),
  }));

  return (
    <div className="container mx-auto px-4 py-10 space-y-8 max-w-5xl">
      {/* Instagram-style profile header */}
      <div className="flex items-start gap-5 md:gap-8">
        <img
          src={member.image || "https://github.com/shadcn.png"}
          alt={member.name ?? "Member"}
          className="w-24 h-24 md:w-28 md:h-28 rounded-full border object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold truncate">
                {member.name ?? "Unnamed"}
              </h1>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-base font-semibold leading-none">
                  {gigs.length}
                </div>
                <div className="text-xs text-muted-foreground">posts</div>
              </div>

              <ConnectionsSheet
                followers={followersForSheet}
                following={followingForSheet}
                viewerId={viewerDbUser?.id ?? null}
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">
                {professionalLabel(member.bio)}
              </div>
            </div>

            {!isSelf ? (
              <div className="pt-1">
                <MemberActions
                  memberId={member.id}
                  initialIsFollowing={isFollowing}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gigs ({gigs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {gigs.length === 0 ? (
            <div className="text-sm text-muted-foreground">No gigs yet.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {gigs.map((gig) => (
                <div key={gig.id} className="border rounded-lg overflow-hidden">
                  <Link href={`/gigs/${gig.id}`} className="block">
                    <div className="aspect-square bg-muted overflow-hidden">
                      <img
                        src={gig.imageUrl}
                        alt={gig.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  <div className="p-2">
                    <div className="text-sm font-medium line-clamp-1">{gig.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {gig.category} • ${gig.price}
                    </div>
                    <div className="pt-2">
                      <Link href={`/gigs/${gig.id}`} className="inline-block">
                        <Button size="sm" className="h-8">Book</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

