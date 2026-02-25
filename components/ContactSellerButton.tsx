"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ContactSellerButton({
  vendorId,
}: {
  vendorId: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleContact() {
    setLoading(true);
    try {
      const res = await fetch("/api/conversations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: vendorId }),
      });

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
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full mt-3"
      onClick={handleContact}
      disabled={loading}
    >
      {loading ? "Opening chat..." : "Contact Seller"}
    </Button>
  );
}
