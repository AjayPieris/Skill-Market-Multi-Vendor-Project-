"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function MemberActions({
  memberId,
  initialIsFollowing,
}: {
  memberId: string;
  initialIsFollowing: boolean;
}) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [busy, setBusy] = useState(false);

  async function follow() {
    setBusy(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: memberId }),
      });

      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }

      if (res.ok) setIsFollowing(true);
    } finally {
      setBusy(false);
    }
  }

  async function unfollow() {
    setBusy(true);
    try {
      const res = await fetch("/api/follow", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: memberId }),
      });

      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }

      if (res.ok) setIsFollowing(false);
    } finally {
      setBusy(false);
    }
  }

  async function message() {
    setBusy(true);
    try {
      const res = await fetch("/api/conversations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: memberId }),
      });

      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }

      if (!res.ok) return;
      const data = (await res.json()) as { conversationId?: string };
      if (data?.conversationId) {
        window.dispatchEvent(
          new CustomEvent("open-chat-conversation", {
            detail: { conversationId: data.conversationId },
          }),
        );
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {isFollowing ? (
        <Button
          variant="outline"
          onClick={() => void unfollow()}
          disabled={busy}
        >
          Following
        </Button>
      ) : (
        <Button onClick={() => void follow()} disabled={busy}>
          Follow
        </Button>
      )}

      <Button variant="outline" onClick={() => void message()} disabled={busy}>
        <MessageCircle className="w-4 h-4 mr-2" />
        Message
      </Button>
    </div>
  );
}
