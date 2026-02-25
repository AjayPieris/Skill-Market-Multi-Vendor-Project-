import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { ShieldCheck } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import NavChatWidget from "@/components/NavChatWidget";
import StatusBar from "@/components/StatusBar";
import UserProfileButton from "@/components/UserProfileButton";

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
    <nav className="border-b shadow-sm bg-white sticky top-0 z-50">
      <div className="flex h-16 items-center px-4 container mx-auto justify-between">
        {/* LOGO */}
        <Link href="/" className="font-bold text-2xl text-blue-600">
          Skill<span className="text-black">Market</span>
        </Link>

        {/* ACTION BUTTONS */}
        <div className="flex gap-1 md:gap-2 items-center">
          {/* If user is NOT logged in */}
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </SignInButton>
            <Button size="sm" className="max-sm:hidden">
              Join Free
            </Button>
          </SignedOut>

          {/* If user IS logged in */}
          <SignedIn>
            {/* 1. Admin Button — hidden on mobile (in hamburger menu) */}
            {isAdmin && (
              <Link href="/admin-panel" className="max-md:hidden">
                <Button variant="destructive" size="sm" className="gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </Button>
              </Link>
            )}

            {/* 2. Stories / Status */}
            {dbUserId && <StatusBar currentUserId={dbUserId} />}

            {/* 3. Chat Widget */}
            {dbUserId && (
              <NavChatWidget
                currentUserId={dbUserId}
                initialUnreadCount={unreadCount}
              />
            )}

            {/* 4. Notification Bell */}
            {dbUserId && <NotificationBell currentUserId={dbUserId} />}

            <UserProfileButton />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
