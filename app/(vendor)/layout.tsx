import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FollowersSidebar from "@/components/FollowersSidebar";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Get the authenticated user from Clerk
  const user = await currentUser();

  // If not logged in, kick them to login page
  if (!user) {
    return redirect("/sign-in");
  }

  // 2. Upsert the user — creates if missing, updates image/name if already exists.
  const ensuredDbUser = await db.user.upsert({
    where: { clerkId: user.id },
    create: {
      clerkId: user.id,
      email: user.emailAddresses[0].emailAddress,
      name: user.firstName + " " + user.lastName,
      image: user.imageUrl,
      role: "vendor",
    },
    update: {}, // don't overwrite user-edited fields (name, image, bio)
  });

  // People who follow ME
  const followerUsers = ensuredDbUser
    ? await db.follow.findMany({
        where: { followingId: ensuredDbUser.id },
        orderBy: { createdAt: "desc" },
        include: {
          follower: {
            select: { id: true, name: true, bio: true, image: true },
          },
        },
      })
    : [];

  // 4. Render the Dashboard Layout
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR — hidden on mobile */}
      <aside className="w-64 bg-white border-r max-md:hidden flex-shrink-0">
        <div className="p-6">
          <h2 className="font-bold text-xl mb-6">Seller Portal</h2>
          <nav className="flex flex-col gap-2">
            <Link href="/dashboard/profile">
              <Button variant="ghost" className="w-full justify-start">
                Profile
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                Overview
              </Button>
            </Link>
            <Link href="/dashboard/gigs">
              <Button variant="ghost" className="w-full justify-start">
                My Gigs
              </Button>
            </Link>
            <Link href="/dashboard/orders">
              <Button variant="ghost" className="w-full justify-start">
                Orders
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full justify-start mt-10">
                Back to Home
              </Button>
            </Link>
          </nav>

          <FollowersSidebar
            initialFollowers={followerUsers.map((f) => f.follower)}
          />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">{children}</main>

      {/* MOBILE BOTTOM NAV — only on small screens */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40 flex justify-around items-center h-16 px-2">
        <Link
          href="/dashboard"
          className="flex flex-col items-center gap-0.5 text-xs text-gray-600 hover:text-blue-600 py-1 px-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Overview
        </Link>
        <Link
          href="/dashboard/gigs"
          className="flex flex-col items-center gap-0.5 text-xs text-gray-600 hover:text-blue-600 py-1 px-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          My Gigs
        </Link>
        <Link
          href="/dashboard/orders"
          className="flex flex-col items-center gap-0.5 text-xs text-gray-600 hover:text-blue-600 py-1 px-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          Orders
        </Link>
        <Link
          href="/dashboard/profile"
          className="flex flex-col items-center gap-0.5 text-xs text-gray-600 hover:text-blue-600 py-1 px-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Profile
        </Link>
        <Link
          href="/"
          className="flex flex-col items-center gap-0.5 text-xs text-gray-600 hover:text-blue-600 py-1 px-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Home
        </Link>
      </nav>
    </div>
  );
}
