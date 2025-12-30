"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type SidebarUser = {
  id: string;
  name: string | null;
  bio: string | null;
  image: string | null;
};

type SuggestionUser = SidebarUser & {
  createdAt: string;
};

function professionalLabel(user: SidebarUser) {
  const professional = (user.bio ?? "").trim();
  return professional.length > 0 ? professional : "Member";
}

export default function FollowersSidebar({
  initialFollowers,
}: {
  initialFollowers: SidebarUser[];
}) {
  const router = useRouter();
  const [followers, setFollowers] =
    React.useState<SidebarUser[]>(initialFollowers);
  const [open, setOpen] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<SuggestionUser[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);
  const [adding, setAdding] = React.useState<Record<string, boolean>>({});
  const [startingChat, setStartingChat] = React.useState<
    Record<string, boolean>
  >({});

  const loadSuggestions = React.useCallback(async () => {
    setLoadingSuggestions(true);
    try {
      const res = await fetch("/api/follow/suggestions", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { suggestions: SuggestionUser[] };
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  React.useEffect(() => {
    if (!open) return;
    void loadSuggestions();
  }, [open, loadSuggestions]);

  async function addFollower(targetUserId: string) {
    setAdding((prev) => ({ ...prev, [targetUserId]: true }));
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });

      if (!res.ok) return;

      const added = suggestions.find((s) => s.id === targetUserId);
      if (added) {
        setFollowers((prev) => [added, ...prev]);
        setSuggestions((prev) => prev.filter((s) => s.id !== targetUserId));
      }
    } finally {
      setAdding((prev) => ({ ...prev, [targetUserId]: false }));
    }
  }

  async function startChat(userId: string) {
    setStartingChat((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await fetch("/api/conversations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) return;
      const data = (await res.json()) as { conversationId?: string };
      if (data?.conversationId) {
        router.push(`/inbox/${data.conversationId}`);
      }
    } finally {
      setStartingChat((prev) => ({ ...prev, [userId]: false }));
    }
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Followers</h3>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm" variant="outline">
              Add followers
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>New suggestions</SheetTitle>
              <SheetDescription>
                Newest members first. Click Add followers to follow.
              </SheetDescription>
            </SheetHeader>

            <div className="px-4 pb-4 overflow-auto">
              {loadingSuggestions ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : suggestions.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No new suggestions.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {suggestions.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-3 border rounded-lg p-3"
                    >
                      <div className="min-w-0 flex items-center gap-3">
                        <img
                          src={member.image || "https://github.com/shadcn.png"}
                          alt={member.name ?? "Member"}
                          className="w-9 h-9 rounded-full border"
                        />
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {member.name ?? "Unnamed"}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {professionalLabel(member)}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => void addFollower(member.id)}
                        disabled={!!adding[member.id]}
                      >
                        {adding[member.id] ? "Adding…" : "Add"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {followers.length === 0 ? (
        <div className="text-sm text-muted-foreground">No followers yet.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {followers.slice(0, 6).map((u) => (
            <div
              key={u.id}
              className="border rounded-lg p-3 flex items-center gap-3"
            >
              <Link
                href={`/members/${u.id}`}
                className="flex items-center gap-3 min-w-0 flex-1"
              >
                <img
                  src={u.image || "https://github.com/shadcn.png"}
                  alt={u.name ?? "Member"}
                  className="w-9 h-9 rounded-full border"
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {u.name ?? "Unnamed"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {professionalLabel(u)}
                  </div>
                </div>
              </Link>

              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  void startChat(u.id);
                }}
                disabled={!!startingChat[u.id]}
                aria-label="Chat"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
