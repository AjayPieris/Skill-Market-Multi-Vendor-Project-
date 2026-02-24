"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Pusher from "pusher-js";
import { MessageCircle, Send, X, ChevronLeft } from "lucide-react";

type NewNotificationPayload = {
  conversationId?: string;
  senderName?: string;
  senderImage?: string | null;
  content?: string;
};

interface OtherUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface LastMessage {
  content: string;
  createdAt: string;
  senderId: string;
  isRead: boolean;
}

interface ConversationItem {
  conversationId: string;
  otherUser: OtherUser;
  lastMessage: LastMessage | null;
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isRead: boolean;
  sender: { id: string; name: string | null; image: string | null };
}

function formatTime(date: string | Date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function Avatar({
  src,
  name,
  size = 9,
}: {
  src: string | null;
  name: string | null;
  size?: number;
}) {
  const initials = (name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? "User"}
        className={`w-${size} h-${size} rounded-full object-cover border border-gray-200 shrink-0`}
      />
    );
  }
  return (
    <div
      className={`w-${size} h-${size} rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0`}
    >
      {initials}
    </div>
  );
}

export default function NavChatWidget({
  currentUserId,
  initialUnreadCount,
}: {
  currentUserId: string;
  initialUnreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // Per-conversation unread map: { conversationId -> count }
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});

  // Total badge shown on icon
  const [totalUnread, setTotalUnread] = useState(initialUnreadCount);

  const bottomRef = useRef<HTMLDivElement>(null);
  const convPusherRef = useRef<Pusher | null>(null);
  const convChannelRef = useRef<ReturnType<Pusher["subscribe"]> | null>(null);
  const selectedIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  // â”€â”€ ALWAYS-ON personal channel â€” works even when widget is closed â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(currentUserId);

    channel.bind("new-chat-notification", (data: unknown) => {
      const payload = (data ?? null) as NewNotificationPayload | null;
      const convId = payload?.conversationId;

      // If the panel is open AND that exact conversation is selected, don't badge it
      const isFocused = open && selectedIdRef.current === convId;

      if (!isFocused) {
        setTotalUnread((prev) => prev + 1);
        if (convId) {
          setUnreadMap((prev) => ({
            ...prev,
            [convId]: (prev[convId] ?? 0) + 1,
          }));
        }
      }

      // Always update last-message preview in list
      if (convId && payload?.content) {
        setConversations((prev) =>
          prev.map((c) =>
            c.conversationId === convId
              ? {
                  ...c,
                  lastMessage: c.lastMessage
                    ? { ...c.lastMessage, content: payload.content! }
                    : null,
                }
              : c,
          ),
        );
      }
    });

    return () => {
      pusher.unsubscribe(currentUserId);
      pusher.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  const fetchConversations = useCallback(async () => {
    const res = await fetch("/api/conversations/list");
    if (!res.ok) return;
    const data = (await res.json()) as { conversations: ConversationItem[] };
    setConversations(data.conversations);

    const dbMap: Record<string, number> = {};
    for (const c of data.conversations) {
      dbMap[c.conversationId] = c.unreadCount;
    }
    setUnreadMap((prev) => {
      const merged: Record<string, number> = { ...dbMap };
      for (const [k, v] of Object.entries(prev)) {
        if ((merged[k] ?? 0) < v) merged[k] = v;
      }
      return merged;
    });

    const dbTotal = data.conversations.reduce((s, c) => s + c.unreadCount, 0);
    setTotalUnread(dbTotal);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Refresh list whenever widget opens
  useEffect(() => {
    if (open) fetchConversations();
  }, [open, fetchConversations]);

  const openConversation = useCallback(
    async (convId: string) => {
      setLoading(true);
      setSelectedId(convId);
      setMessages([]);

      const res = await fetch(`/api/conversations/${convId}/messages`);
      if (res.ok) {
        const data = (await res.json()) as {
          messages: Message[];
          otherUser: OtherUser;
        };
        setMessages(data.messages);
        setOtherUser(data.otherUser);
      }
      setLoading(false);

      // Clear badge for this conversation
      const convUnread = unreadMap[convId] ?? 0;
      setTotalUnread((prev) => Math.max(0, prev - convUnread));
      setUnreadMap((prev) => ({ ...prev, [convId]: 0 }));

      // Mark as read in DB
      fetch("/api/messages/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId }),
      }).catch(() => {});

      // Subscribe to this conversation for live messages
      if (convChannelRef.current) {
        convPusherRef.current?.unsubscribe(convChannelRef.current.name);
      }
      const pusher =
        convPusherRef.current ??
        new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });
      convPusherRef.current = pusher;
      const ch = pusher.subscribe(convId);
      convChannelRef.current = ch;

      type IncomingMsg = Omit<Message, "createdAt"> & { createdAt: string };

      ch.bind("new-message", (msg: IncomingMsg) => {
        if (!msg?.id) return;
        setMessages((prev) => [...prev, msg]);
        setTimeout(
          () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
          80,
        );

        if (msg.senderId !== currentUserId) {
          fetch("/api/messages/mark-read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversationId: convId }),
          }).catch(() => {});
        }

        setConversations((prev) =>
          prev.map((c) =>
            c.conversationId === convId
              ? {
                  ...c,
                  lastMessage: {
                    content: msg.content,
                    createdAt: msg.createdAt,
                    senderId: msg.senderId,
                    isRead: false,
                  },
                }
              : c,
          ),
        );
      });
    },
    [currentUserId, unreadMap],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !selectedId) return;
    const content = text.trim();
    setText("");
    await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selectedId, content }),
    });
    fetchConversations();
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedId(null);
    setMessages([]);
    setOtherUser(null);
    if (convChannelRef.current) {
      convPusherRef.current?.unsubscribe(convChannelRef.current.name);
      convChannelRef.current = null;
    }
  };

  return (
    <div className="relative">
      {/* Chat Icon */}
      <button
        onClick={() => (open ? handleClose() : setOpen(true))}
        className="relative p-2 rounded-full hover:bg-gray-100 transition text-gray-600 hover:text-blue-600"
        aria-label="Open chat"
      >
        <MessageCircle className="w-5 h-5" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-4 h-4 flex items-center justify-center px-0.5">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </button>

      {/* Floating Panel */}
      {open && (
        <div
          className={`fixed z-50 shadow-2xl overflow-hidden flex border border-gray-200 bg-white
            inset-x-0 top-16 bottom-0 rounded-none
            md:rounded-2xl md:inset-auto md:top-[68px] md:right-4 md:bottom-auto md:left-auto
            ${selectedId ? "md:w-[680px]" : "md:w-[320px]"} md:h-[500px]`}
          style={{ transition: "width 0.2s ease" }}
        >
          {/* LEFT: Conversation List */}
          <div
            className={`flex flex-col border-r bg-white ${
              selectedId ? "hidden md:flex md:w-64 md:shrink-0" : "w-full"
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <span className="font-semibold text-sm text-gray-800">
                Messages
              </span>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">
                  No conversations yet.
                </div>
              ) : (
                conversations.map((conv) => {
                  const count = unreadMap[conv.conversationId] ?? 0;
                  return (
                    <button
                      key={conv.conversationId}
                      onClick={() => openConversation(conv.conversationId)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition text-left ${
                        selectedId === conv.conversationId
                          ? "bg-blue-50 border-l-2 border-blue-600"
                          : ""
                      }`}
                    >
                      <Avatar
                        src={conv.otherUser.image}
                        name={conv.otherUser.name}
                        size={9}
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm truncate ${
                            count > 0
                              ? "font-bold text-gray-900"
                              : "font-medium text-gray-700"
                          }`}
                        >
                          {conv.otherUser.name ?? "User"}
                        </div>
                        <div
                          className={`text-xs truncate ${
                            count > 0
                              ? "text-gray-800 font-medium"
                              : "text-gray-400"
                          }`}
                        >
                          {conv.lastMessage?.content ?? "Start a conversation"}
                        </div>
                      </div>
                      {count > 0 && (
                        <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-4.5 h-4.5 flex items-center justify-center px-1 shrink-0">
                          {count > 99 ? "99+" : count}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: Chat Window */}
          {selectedId && (
            <div className="flex flex-col flex-1 min-w-0 w-full bg-white">
              <div className="flex items-center gap-3 px-4 py-3 border-b bg-gray-50">
                <button
                  onClick={() => {
                    setSelectedId(null);
                    setMessages([]);
                    setOtherUser(null);
                    if (convChannelRef.current) {
                      convPusherRef.current?.unsubscribe(
                        convChannelRef.current.name,
                      );
                      convChannelRef.current = null;
                    }
                  }}
                  className="text-gray-400 hover:text-blue-600 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {otherUser && (
                  <>
                    <Avatar
                      src={otherUser.image}
                      name={otherUser.name}
                      size={8}
                    />
                    <span className="font-semibold text-sm text-gray-800 truncate">
                      {otherUser.name ?? "User"}
                    </span>
                  </>
                )}
              </div>

              <div className="flex-1 overflow-y-auto bg-gray-100 px-4 py-3 space-y-2">
                {loading ? (
                  <div className="flex justify-center items-center h-full text-sm text-gray-400">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-sm text-gray-400">
                    No messages yet. Say hi!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isMe && (
                          <Avatar
                            src={msg.sender.image}
                            name={msg.sender.name}
                            size={6}
                          />
                        )}
                        <div
                          className={`max-w-[75%] px-3 py-2 rounded-2xl shadow-sm text-sm ${
                            isMe
                              ? "bg-blue-600 text-white rounded-br-sm"
                              : "bg-white text-gray-900 rounded-bl-sm"
                          }`}
                        >
                          <p className="whitespace-pre-wrap wrap-break-word leading-relaxed">
                            {msg.content}
                          </p>
                          <div
                            className={`text-[10px] mt-0.5 text-right ${
                              isMe ? "text-blue-200" : "text-gray-400"
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form
                onSubmit={handleSend}
                className="flex items-center gap-2 px-3 py-2 bg-white border-t"
              >
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
