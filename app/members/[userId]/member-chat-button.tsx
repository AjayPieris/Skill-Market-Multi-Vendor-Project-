"use client";

import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function MemberChatButton({ memberId }: { memberId: string }) {
  const router = useRouter();

  async function startChat() {
    const res = await fetch("/api/conversations/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: memberId }),
    });

    if (!res.ok) return;
    const data = (await res.json()) as { conversationId?: string };
    if (data?.conversationId) {
      router.push(`/inbox/${data.conversationId}`);
    }
  }

  return (
    <Button
      size="icon"
      variant="outline"
      onClick={() => void startChat()}
      aria-label="Chat"
    >
      <MessageCircle className="w-4 h-4" />
    </Button>
  );
}
