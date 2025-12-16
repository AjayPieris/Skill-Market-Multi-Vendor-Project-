import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { ShieldCheck } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

export default async function Navbar() {
  const user = await currentUser();

  // Initialize variables
  let isAdmin = false;
  let dbUserId = "";
  let unreadCount = 0;

  // If user is logged in, fetch data from OUR database
  if (user) {
    const baseUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });

    if (baseUser) {
      dbUserId = baseUser.id; // We need this ID for the Pusher channel
      if (baseUser.role === "admin") isAdmin = true;

      unreadCount = await db.message.count({
        where: {
          isRead: false,
          senderId: { not: baseUser.id },
          conversation: {
            OR: [{ userOneId: baseUser.id }, { userTwoId: baseUser.id }],
          },
        },
      });
    }
  }

  return (
    <nav className="border-b shadow-sm bg-white">
      <div className="flex h-16 items-center px-4 container mx-auto justify-between">
        {/* LOGO */}
        <Link href="/" className="font-bold text-2xl text-blue-600">
          Skill<span className="text-black">Market</span>
        </Link>

        {/* MIDDLE LINKS (Hidden on mobile) */}
        <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          <Link href="/search" className="hover:text-blue-600 transition">
            Find Talent
          </Link>
          <Link
            href="/become-seller"
            className="hover:text-blue-600 transition"
          >
            Become a Seller
          </Link>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-2 items-center">
          {/* If user is NOT logged in */}
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline">Sign In</Button>
            </SignInButton>
            <Button>Join Free</Button>
          </SignedOut>

          {/* If user IS logged in */}
          <SignedIn>
            {/* 1. Admin Button */}
            {isAdmin && (
              <Link href="/admin-panel">
                <Button variant="destructive" size="sm" className="gap-2 mr-2">
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </Button>
              </Link>
            )}

            {/* 2. Notification Bell (Only works if we found the DB user) */}
            {dbUserId && (
              <NotificationBell
                currentUserId={dbUserId}
                initialUnreadCount={unreadCount}
              />
            )}

            {/* 3. Dashboard & Profile */}
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
