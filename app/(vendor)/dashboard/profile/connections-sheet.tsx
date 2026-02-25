"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

type ConnectionUser = {
  id: string;
  name: string | null;
  bio: string | null;
  image: string | null;
  initialIsFollowing: boolean;
};

function professionalLabel(bio: string | null) {
  const professional = (bio ?? "").trim();
  return professional.length > 0 ? professional : "Member";
}

function Row({
  user,
  viewerId,
  showFollowBack,
  isFollowing,
  busy,
  onOpenProfile,
  onFollowBack,
  onMessage,
}: {
  user: ConnectionUser;
  viewerId: string;
  showFollowBack: boolean;
  isFollowing: boolean;
  busy: boolean;
  onOpenProfile: () => void;
  onFollowBack: () => void;
  onMessage: () => void;
}) {
  const isSelf = user.id === viewerId;

  return (
    <div className="w-full border rounded-lg px-3 py-2 flex items-center gap-3">
      <button
        type="button"
        onClick={onOpenProfile}
        className="flex items-center gap-3 min-w-0 flex-1 text-left hover:opacity-90 cursor-pointer"
      >
        <img
          src={user.image || "https://github.com/shadcn.png"}
          alt={user.name ?? "Member"}
          className="w-10 h-10 rounded-full border object-cover"
        />
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">
            {user.name ?? "Unnamed"}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {professionalLabel(user.bio)}
          </div>
        </div>
      </button>

      {isSelf ? null : (
        <div className="flex items-center gap-2">
          {showFollowBack && !isFollowing ? (
            <Button size="sm" onClick={onFollowBack} disabled={busy}>
              Follow back
            </Button>
          ) : null}

          {(showFollowBack ? isFollowing : true) ? (
            <Button
              size="icon"
              variant="outline"
              onClick={onMessage}
              disabled={busy}
              aria-label="Message"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function DashboardConnectionsSheet({
  followers,
  following,
  viewerId,
}: {
  followers: ConnectionUser[];
  following: ConnectionUser[];
  viewerId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<"followers" | "following">("followers");
  const [busyUserId, setBusyUserId] = React.useState<string | null>(null);

  const initialFollowBackMap = React.useMemo(() => {
    const map = new Map<string, boolean>();
    for (const u of followers) map.set(u.id, !!u.initialIsFollowing);
    return map;
  }, [followers]);

  const [followBackMap, setFollowBackMap] =
    React.useState(initialFollowBackMap);

  React.useEffect(() => {
    setFollowBackMap(initialFollowBackMap);
  }, [initialFollowBackMap]);

  async function followBack(targetUserId: string) {
    setBusyUserId(targetUserId);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });

      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }

      if (res.ok) {
        setFollowBackMap((prev) => {
          const next = new Map(prev);
          next.set(targetUserId, true);
          return next;
        });
      }
    } finally {
      setBusyUserId(null);
    }
  }

  async function message(targetUserId: string) {
    setBusyUserId(targetUserId);
    try {
      const res = await fetch("/api/conversations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId }),
      });

      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }

      if (!res.ok) return;
      const data = (await res.json()) as { conversationId?: string };
      if (data?.conversationId) {
        setOpen(false);
        window.dispatchEvent(
          new CustomEvent("open-chat-conversation", {
            detail: { conversationId: data.conversationId },
          }),
        );
      }
    } finally {
      setBusyUserId(null);
    }
  }

  const users = tab === "followers" ? followers : following;

  return (
    <>
      <button
        type="button"
        className="text-center cursor-pointer hover:opacity-90"
        onClick={() => {
          setTab("followers");
          setOpen(true);
        }}
      >
        <div className="text-base font-semibold leading-none">
          {followers.length}
        </div>
        <div className="text-xs text-muted-foreground">followers</div>
      </button>

      <button
        type="button"
        className="text-center cursor-pointer hover:opacity-90"
        onClick={() => {
          setTab("following");
          setOpen(true);
        }}
      >
        <div className="text-base font-semibold leading-none">
          {following.length}
        </div>
        <div className="text-xs text-muted-foreground">following</div>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>
              {tab === "followers" ? "Followers" : "Following"}
            </SheetTitle>
          </SheetHeader>

          <div className="px-4 pb-6">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={tab === "followers" ? "default" : "outline"}
                onClick={() => setTab("followers")}
              >
                Followers
              </Button>
              <Button
                type="button"
                size="sm"
                variant={tab === "following" ? "default" : "outline"}
                onClick={() => setTab("following")}
              >
                Following
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              {users.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No {tab} yet.
                </div>
              ) : (
                users.map((u) => {
                  const isFollowingBack = followBackMap.get(u.id) ?? false;
                  const busy = busyUserId === u.id;
                  const showFollowBack = tab === "followers";

                  return (
                    <Row
                      key={`${tab}-${u.id}`}
                      user={u}
                      viewerId={viewerId}
                      showFollowBack={showFollowBack}
                      isFollowing={showFollowBack ? isFollowingBack : true}
                      busy={busy}
                      onOpenProfile={() => {
                        setOpen(false);
                        router.push(`/members/${u.id}`);
                      }}
                      onFollowBack={() => void followBack(u.id)}
                      onMessage={() => void message(u.id)}
                    />
                  );
                })
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
