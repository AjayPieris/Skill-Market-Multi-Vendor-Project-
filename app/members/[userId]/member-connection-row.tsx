"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type ConnectionUser = {
  id: string;
  name: string | null;
  bio: string | null;
  image: string | null;
};

function professionalLabel(bio: string | null) {
  const professional = (bio ?? "").trim();
  return professional.length > 0 ? professional : "Member";
}

export default function MemberConnectionRow({
  user,
}: {
  user: ConnectionUser;
}) {
  const router = useRouter();
  const disabled = !user?.id;

  async function startChat() {
    const res = await fetch("/api/conversations/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });

    if (!res.ok) return;
    const data = (await res.json()) as { conversationId?: string };
    if (data?.conversationId) {
      router.push(`/inbox/${data.conversationId}`);
    }
  }

  return (
    <div className="border rounded-lg p-3 flex items-center gap-3">
      <Link
        href={`/members/${user.id}`}
        className="flex items-center gap-3 min-w-0 flex-1"
      >
        <img
          src={user.image || "https://github.com/shadcn.png"}
          alt={user.name ?? "Member"}
          className="w-10 h-10 rounded-full border"
        />
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">
            {user.name ?? "Unnamed"}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {professionalLabel(user.bio)}
          </div>
        </div>
      </Link>

      <Button
        size="icon"
        variant="ghost"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void startChat();
        }}
        disabled={disabled}
        aria-label="Chat"
      >
        <MessageCircle className="w-4 h-4" />
      </Button>
    </div>
  );
}
