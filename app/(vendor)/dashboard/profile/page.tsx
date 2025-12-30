import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EditProfileSheet from "./edit-profile-sheet";
import DashboardConnectionsSheet from "./connections-sheet";

function professionalLabel(bio: string | null) {
  const professional = (bio ?? "").trim();
  return professional.length > 0 ? professional : "Member";
}

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return redirect("/dashboard");

  const [postsCount, followers, following, gigs] = await Promise.all([
    db.gig.count({ where: { vendorId: dbUser.id } }),
    db.follow.findMany({
      where: { followingId: dbUser.id },
      orderBy: { createdAt: "desc" },
      include: {
        follower: { select: { id: true, name: true, bio: true, image: true } },
      },
    }),
    db.follow.findMany({
      where: { followerId: dbUser.id },
      orderBy: { createdAt: "desc" },
      include: {
        following: { select: { id: true, name: true, bio: true, image: true } },
      },
    }),
    db.gig.findMany({
      where: { vendorId: dbUser.id },
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

  const followBackIds = new Set(
    (
      await db.follow.findMany({
        where: {
          followerId: dbUser.id,
          followingId: { in: followerUsers.map((u) => u.id) },
        },
        select: { followingId: true },
      })
    ).map((r) => r.followingId)
  );

  const followersForSheet = followerUsers.map((u) => ({
    ...u,
    initialIsFollowing: followBackIds.has(u.id),
  }));

  const followingForSheet = followingUsers.map((u) => ({
    ...u,
    initialIsFollowing: true,
  }));

  return (
    <div className="container mx-auto px-4 py-10 space-y-8 max-w-5xl">
      <div className="flex items-start gap-5 md:gap-8">
        <img
          src={dbUser.image || "https://github.com/shadcn.png"}
          alt={dbUser.name ?? "Profile"}
          className="w-24 h-24 md:w-28 md:h-28 rounded-full border object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold truncate">
                {dbUser.name ?? "Unnamed"}
              </h1>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-base font-semibold leading-none">
                  {postsCount}
                </div>
                <div className="text-xs text-muted-foreground">posts</div>
              </div>

              <DashboardConnectionsSheet
                followers={followersForSheet}
                following={followingForSheet}
                viewerId={dbUser.id}
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">
                {professionalLabel(dbUser.bio)}
              </div>
            </div>

            <div className="pt-1">
              <EditProfileSheet
                initialName={dbUser.name ?? ""}
                initialBio={dbUser.bio ?? ""}
                initialImage={dbUser.image ?? ""}
              />
            </div>
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
                    <div className="text-sm font-medium line-clamp-1">
                      {gig.title}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {gig.category} • ${gig.price}
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <Link href={`/gigs/${gig.id}`} className="inline-block">
                        <Button variant="outline" size="sm" className="h-8">
                          View
                        </Button>
                      </Link>
                      <Link
                        href={`/dashboard/gigs/${gig.id}`}
                        className="inline-block"
                      >
                        <Button size="sm" className="h-8">
                          Edit
                        </Button>
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
