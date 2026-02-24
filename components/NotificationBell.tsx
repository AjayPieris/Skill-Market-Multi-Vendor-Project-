"use client";

import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import {
  Bell,
  ShoppingBag,
  UserPlus,
  Briefcase,
  Pencil,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type ActivityType = "order" | "follow" | "new-gig" | "edit-gig";

type ActivityNotification = {
  id: string;
  type: ActivityType;
  actorName: string;
  actorImage?: string | null;
  message: string;
  createdAt: Date;
  link?: string; // optional URL to navigate to on click
};

type IncomingPayload = {
  type?: ActivityType;
  actorName?: string;
  actorImage?: string | null;
  message?: string;
  gigId?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationBell({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [notifications, setNotifications] = useState<ActivityNotification[]>(
    [],
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const idRef = useRef(0);
  const router = useRouter();

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(currentUserId);

    channel.bind("new-activity-notification", (data: unknown) => {
      const payload = (data ?? {}) as IncomingPayload;
      if (!payload.type || !payload.message) return;

      const notification: ActivityNotification = {
        id: String(++idRef.current),
        type: payload.type,
        actorName: payload.actorName ?? "Someone",
        actorImage: payload.actorImage ?? null,
        message: payload.message,
        createdAt: new Date(),
        link: payload.gigId ? `/gigs/${payload.gigId}` : undefined,
      };

      setNotifications((prev) => [notification, ...prev].slice(0, 20));
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      pusher.unsubscribe(currentUserId);
      pusher.disconnect();
    };
  }, [currentUserId]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) setUnreadCount(0);
  };

  const formatTime = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Bell trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => handleOpenChange(!isOpen)}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => handleOpenChange(false)}
          />

          {/* Panel — full-width on mobile, fixed-width on desktop */}
          <div className="fixed left-0 right-0 top-16 z-50 md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:w-72 md:rounded-xl md:shadow-2xl md:border md:border-gray-100 bg-white shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-sm text-gray-800">
                Activity
              </span>
              <button
                onClick={() => handleOpenChange(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="p-5 text-sm text-gray-400 text-center">
                No activity yet.
              </div>
            ) : (
              <div className="max-h-[60vh] md:max-h-80 overflow-y-auto divide-y divide-gray-100">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (n.link) {
                        handleOpenChange(false);
                        router.push(n.link);
                      }
                    }}
                    className={`flex items-start gap-3 px-4 py-3 ${
                      n.link ? "cursor-pointer hover:bg-gray-50 transition" : ""
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {n.actorImage ? (
                        <img
                          src={n.actorImage}
                          alt={n.actorName}
                          className="w-8 h-8 rounded-full border object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          {n.type === "order" ? (
                            <ShoppingBag className="w-4 h-4 text-blue-600" />
                          ) : n.type === "new-gig" ? (
                            <Briefcase className="w-4 h-4 text-purple-600" />
                          ) : n.type === "edit-gig" ? (
                            <Pencil className="w-4 h-4 text-orange-500" />
                          ) : (
                            <UserPlus className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 leading-snug">
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatTime(n.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
                        n.type === "order"
                          ? "bg-blue-100 text-blue-700"
                          : n.type === "new-gig"
                            ? "bg-purple-100 text-purple-700"
                            : n.type === "edit-gig"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700"
                      }`}
                    >
                      {n.type === "order"
                        ? "Order"
                        : n.type === "new-gig"
                          ? "New Gig"
                          : n.type === "edit-gig"
                            ? "Updated"
                            : "Follow"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
