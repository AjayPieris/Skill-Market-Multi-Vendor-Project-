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
    <div className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none">
      <nav className="pointer-events-auto mx-auto max-w-6xl rounded-full border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/90 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.05),0_8px_20px_-6px_rgba(0,0,0,0.1)] transition-all dark:border-slate-700/80 dark:from-slate-800 dark:to-slate-900/90 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(0,0,0,0.2),0_8px_20px_-6px_rgba(0,0,0,0.5)]">
        <div className="flex h-16 items-center justify-between px-6 md:px-8">
          {/* LOGO */}
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight transition-transform hover:scale-105"
          >
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Skill
            </span>
            <span className="text-slate-900 dark:text-white">Market</span>
          </Link>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* If user is NOT logged in */}
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-200 text-blue-700 transition-colors duration-300 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950"
                >
                  Sign In
                </Button>
              </SignInButton>
              <Button
                size="sm"
                className="max-sm:hidden border-0 bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md transition-opacity duration-300 hover:opacity-90 hover:shadow-lg"
              >
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
    </div>
  );
}
