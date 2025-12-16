"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, CheckCheck } from "lucide-react"; // <--- Import Icons

interface MessageProps {
  id: string;
  content: string;
  senderId: string;
  sender: { name: string | null; image: string | null };
  createdAt: Date;
  isRead: boolean; // <--- Make sure this is included
}

interface ChatBoxProps {
  conversationId: string;
  currentUserId: string;
  otherUserId: string;
  otherUserName: string | null;
  otherUserImage: string | null;
  initialMessages: MessageProps[];
}

export default function ChatBox({
  conversationId,
  currentUserId,
  otherUserId,
  otherUserName,
  otherUserImage,
  initialMessages,
}: ChatBoxProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);
  const [isOtherOnline, setIsOtherOnline] = useState(false);
  const otherLastPingAtMsRef = useRef<number>(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const markRead = async () => {
    try {
      await fetch("/api/messages/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // 1. ON LOAD: Mark messages as read immediately
    startTransition(() => {
      void markRead();
    });

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(conversationId);

    const ONLINE_TTL_MS = 30_000;
    const PING_EVERY_MS = 10_000;

    const pingPresence = async () => {
      try {
        await fetch("/api/presence/ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId }),
        });
      } catch {
        // ignore
      }
    };

    void pingPresence();
    const pingIntervalId = window.setInterval(() => {
      void pingPresence();
    }, PING_EVERY_MS);

    const onlineIntervalId = window.setInterval(() => {
      const last = otherLastPingAtMsRef.current;
      setIsOtherOnline(last > 0 && Date.now() - last < ONLINE_TTL_MS);
    }, 2_000);

    // 2. Listen for NEW messages
    channel.bind("new-message", (data: any) => {
      setMessages((current) => [...current, data]);

      // If I'm looking at the chat and the other user sends a message, mark it read.
      if (data.senderId !== currentUserId) {
        startTransition(() => {
          void markRead();
        });
      }

      // Scroll to bottom
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    });

    // 3. Listen for "SEEN" event (Blue ticks + Last seen)
    channel.bind("messages-seen", (payload: any) => {
      setMessages((current) =>
        current.map((msg) => ({
          ...msg,
          // Only messages sent by ME can become "read" by the other user.
          isRead: msg.senderId === currentUserId ? true : msg.isRead,
        }))
      );

      // If the OTHER user is the one who saw messages, update Last seen.
      if (payload?.seenBy && payload.seenBy === otherUserId) {
        const seenAt =
          typeof payload.seenAt === "string"
            ? payload.seenAt
            : new Date().toISOString();
        setLastSeenAt(seenAt);

        const ms = Date.parse(seenAt);
        if (!Number.isNaN(ms)) {
          otherLastPingAtMsRef.current = ms;
        }
      }
    });

    // 4. Listen for presence pings (Online / Last seen)
    channel.bind("presence-ping", (payload: any) => {
      if (!payload || payload.userId !== otherUserId) return;

      const at =
        typeof payload.at === "string" ? payload.at : new Date().toISOString();
      const ms = Date.parse(at);
      otherLastPingAtMsRef.current = Number.isNaN(ms) ? Date.now() : ms;
      setIsOtherOnline(true);
      setLastSeenAt(at);
    });

    return () => {
      window.clearInterval(pingIntervalId);
      window.clearInterval(onlineIntervalId);
      pusher.unsubscribe(conversationId);
      pusher.disconnect();
    };
  }, [conversationId, currentUserId, otherUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, content: newMessage }),
    });
    setNewMessage("");
  };

  // Helper to format time (e.g., 10:30 AM)
  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="flex flex-col h-full min-h-0 border rounded-xl bg-white overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
        <img
          src={otherUserImage || ""}
          alt={otherUserName || "User"}
          className="h-9 w-9 rounded-full border bg-white"
        />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-gray-900">
            {otherUserName || "Chat"}
          </div>
          <div className="text-xs text-gray-500">
            {isOtherOnline
              ? "Online"
              : lastSeenAt && hydrated
              ? `Last seen ${formatTime(lastSeenAt)}`
              : ""}
          </div>
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-gray-100 p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              {!isMe && (
                <img
                  src={msg.sender?.image || ""}
                  alt={msg.sender?.name || "User"}
                  className="h-7 w-7 rounded-full border bg-white"
                />
              )}

              <div
                className={`max-w-[78%] rounded-2xl px-3 py-2 shadow-sm ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-md"
                    : "bg-white text-black rounded-bl-md"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
                  {msg.content}
                </p>

                <div className="mt-1 flex items-center justify-end gap-1">
                  <span
                    className={`text-[10px] ${
                      isMe ? "text-blue-200" : "text-gray-500"
                    }`}
                  >
                    {hydrated ? formatTime(msg.createdAt) : ""}
                  </span>

                  {isMe && (
                    <span className="inline-flex">
                      {msg.isRead ? (
                        <CheckCheck className="w-3 h-3 text-cyan-300" />
                      ) : (
                        <CheckCheck className="w-3 h-3 text-blue-300 opacity-70" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-3 bg-white border-t">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-gray-100 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button type="submit" size="icon" className="rounded-full">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
