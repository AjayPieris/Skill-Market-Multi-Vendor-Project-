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
  isFollowing,
  busy,
  onOpenProfile,
  onFollow,
  onUnfollow,
  onMessage,
}: {
  user: ConnectionUser;
  viewerId: string | null;
  isFollowing: boolean;
  busy: boolean;
  onOpenProfile: () => void;
  onFollow: () => void;
  onUnfollow: () => void;
  onMessage: () => void;
}) {
  const isSelf = !!viewerId && user.id === viewerId;

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
          {isFollowing ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onUnfollow}
              disabled={busy}
            >
              Following
            </Button>
          ) : (
            <Button size="sm" onClick={onFollow} disabled={busy}>
              Follow
            </Button>
          )}

          <Button
            size="icon"
            variant="outline"
            onClick={onMessage}
            disabled={busy}
            aria-label="Message"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ConnectionsSheet({
  followers,
  following,
  viewerId,
}: {
  followers: ConnectionUser[];
  following: ConnectionUser[];
  viewerId: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const [tab, setTab] = React.useState<"followers" | "following">("followers");

  const initialFollowMap = React.useMemo(() => {
    const map = new Map<string, boolean>();
    for (const u of [...followers, ...following]) {
      map.set(u.id, !!u.initialIsFollowing);
    }
    return map;
  }, [followers, following]);

  const [followMap, setFollowMap] =
    React.useState<Map<string, boolean>>(initialFollowMap);
  const [busyUserId, setBusyUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setFollowMap(initialFollowMap);
  }, [initialFollowMap]);

  const users = tab === "followers" ? followers : following;

  async function follow(targetUserId: string) {
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
        setFollowMap((prev) => {
          const next = new Map(prev);
          next.set(targetUserId, true);
          return next;
        });
      }
    } finally {
      setBusyUserId(null);
    }
  }

  async function unfollow(targetUserId: string) {
    setBusyUserId(targetUserId);
    try {
      const res = await fetch("/api/follow", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });

      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }

      if (res.ok) {
        setFollowMap((prev) => {
          const next = new Map(prev);
          next.set(targetUserId, false);
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
        router.push(`/inbox/${data.conversationId}`);
      }
    } finally {
      setBusyUserId(null);
    }
  }

  return (
    <>
      <button
        type="button"
        className="text-sm cursor-pointer"
        onClick={() => {
          setTab("followers");
          setOpen(true);
        }}
      >
        <span className="font-semibold">{followers.length}</span> followers
      </button>

      <button
        type="button"
        className="text-sm cursor-pointer"
        onClick={() => {
          setTab("following");
          setOpen(true);
        }}
      >
        <span className="font-semibold">{following.length}</span> following
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
                  const isFollowing = followMap.get(u.id) ?? false;
                  const busy = busyUserId === u.id;

                  return (
                    <Row
                      key={`${tab}-${u.id}`}
                      user={u}
                      viewerId={viewerId}
                      isFollowing={isFollowing}
                      busy={busy}
                      onOpenProfile={() => {
                        setOpen(false);
                        router.push(`/members/${u.id}`);
                      }}
                      onFollow={() => void follow(u.id)}
                      onUnfollow={() => void unfollow(u.id)}
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
