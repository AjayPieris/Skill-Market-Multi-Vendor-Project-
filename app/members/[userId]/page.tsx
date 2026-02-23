import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
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
      where: { vendorId: member.id, deletedAt: null }, // Exclude soft-deleted gigs
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
    <div className="container mx-auto px-4 py-10 space-y-8">
      {/* Instagram-like profile header */}
      <div className="flex items-start gap-6">
        <img
          src={member.image || "https://github.com/shadcn.png"}
          alt={member.name ?? "Member"}
          className="w-20 h-20 rounded-full border"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3">
            <h1 className="text-xl md:text-2xl font-bold truncate">
              {member.name ?? "Unnamed"}
            </h1>

            <div className="flex items-center gap-6">
              <div className="text-sm">
                <span className="font-semibold">{gigs.length}</span> posts
              </div>

              <ConnectionsSheet
                followers={followersForSheet}
                following={followingForSheet}
                viewerId={viewerDbUser?.id ?? null}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              {professionalLabel(member.bio)}
            </p>

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

      <div className="space-y-3">
        <div className="text-base font-semibold">Gigs ({gigs.length})</div>
        <div>
          {gigs.length === 0 ? (
            <div className="text-sm text-muted-foreground">No gigs yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gigs.map((gig) => (
                <div key={gig.id} className="border rounded-lg overflow-hidden">
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img
                      src={gig.imageUrl}
                      alt={gig.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-3 space-y-2">
                    <div className="font-medium line-clamp-2">{gig.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {gig.category} • ${gig.price}
                    </div>
                    <Link href={`/gigs/${gig.id}`} className="inline-block">
                      <Button size="sm">Book</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 text-xs text-muted-foreground">
            Total posts: {gigs.length}
          </div>
        </div>
      </div>
    </div>
  );
}
