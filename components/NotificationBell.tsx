"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NotificationBellProps {
  currentUserId: string;
  initialUnreadCount: number; // We will fetch this from DB initially
}

export default function NotificationBell({
  currentUserId,
  initialUnreadCount,
}: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [newNotifications, setNewNotifications] = useState<any[]>([]); // Store temporary list of new alerts
  const router = useRouter();

  const handleNotificationClick = async (conversationId: string) => {
    try {
      const res = await fetch("/api/notifications/mark-conversation-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });

      if (res.ok) {
        const result = (await res.json()) as { unreadCount: number };
        setUnreadCount(result.unreadCount);
      }
      setNewNotifications((prev) =>
        prev.filter((notif) => notif.conversationId !== conversationId)
      );
    } catch {
      // If marking read fails, still allow navigation.
    } finally {
      router.push(`/inbox/${conversationId}`);
    }
  };

  useEffect(() => {
    // 1. Connect to Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // 2. Subscribe to MY personal channel (using my User ID)
    const channel = pusher.subscribe(currentUserId);

    // 3. Listen for "new-notification"
    channel.bind("new-notification", (data: any) => {
      console.log("DING! New notification:", data);
      setUnreadCount((prev) => prev + 1);
      setNewNotifications((prev) => [data, ...prev]); // Add to top of list
    });

    return () => {
      pusher.unsubscribe(currentUserId);
    };
  }, [currentUserId]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-gray-600" />

          {/* THE RED DOT */}
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {newNotifications.length === 0 && unreadCount === 0 ? (
          <div className="p-4 text-sm text-gray-500 text-center">
            No new messages.
          </div>
        ) : (
          <>
            {/* Show Live Notifications */}
            {newNotifications.map((notif, i) => (
              <DropdownMenuItem
                key={i}
                className="cursor-pointer p-3"
                onClick={() => handleNotificationClick(notif.conversationId)}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-xs">{notif.senderName}</span>
                  <span className="text-xs text-gray-500">{notif.content}</span>
                </div>
              </DropdownMenuItem>
            ))}

            {/* Link to see all messages */}
            {unreadCount > 0 && (
              <DropdownMenuItem className="justify-center border-t mt-2">
                <Link
                  href="/dashboard"
                  className="text-blue-600 text-xs font-bold w-full text-center"
                >
                  View Inbox
                </Link>
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
