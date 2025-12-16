"use client";

import { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { sendMessageAction } from "@/app/actions/message";

interface MessageProps {
  id: string; // Unique message ID
  content: string; // Message text
  senderId: string; // Who sent the message
  sender: {
    name: string | null; // Sender name
    image: string | null; // Sender profile image
  };
  createdAt: Date; // Message time
}

interface ChatBoxProps {
  conversationId: string; // Current conversation ID
  currentUserId: string; // Logged-in user ID
  initialMessages: MessageProps[]; // Old messages from database
}

export default function ChatBox({
  conversationId,
  currentUserId,
  initialMessages,
}: ChatBoxProps) {
  const [messages, setMessages] = useState(initialMessages);
  // Stores all chat messages (old + new)

  const [newMessage, setNewMessage] = useState("");
  // Stores the text currently typed by the user

  const bottomRef = useRef<HTMLDivElement>(null);
  // Used to auto-scroll to the latest message

  useEffect(() => {
    // Runs when chat opens or conversationId changes

    Pusher.logToConsole = false;
    // Enable only if debugging real-time events

    const pusher = new Pusher(
      process.env.NEXT_PUBLIC_PUSHER_KEY!, // Pusher public key
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!, // Pusher cluster
      }
    );

    const channel = pusher.subscribe(conversationId);
    // Join the Pusher channel for this conversation

    channel.bind("new-message", (data: any) => {
      // When a new message is received in real-time
      setMessages((current) => [...current, data]);
      // Add new message to message list
    });

    return () => {
      pusher.unsubscribe(conversationId);
      // Stop listening when leaving the chat
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    // Automatically scroll to bottom when messages change
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent page reload on form submit

    if (!newMessage.trim()) return;
    // Do not send empty messages

    await sendMessageAction(conversationId, newMessage);
    // Call server action to save and broadcast the message

    setNewMessage("");
    // Clear input field after sending
  };

  return (
    <div className="flex flex-col h-150 border rounded-lg bg-gray-50">
      {/* Messages display area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          // Check if message was sent by current user

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              // Align right if my message, left if other user
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  isMe
                    ? "bg-blue-600 text-white" // My message style
                    : "bg-white border text-black" // Other user message style
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                {/* Message text */}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
        {/* Invisible div to scroll to the latest message */}
      </div>

      {/* Message input area */}
      <div className="p-4 bg-white border-t rounded-b-lg">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={newMessage} // Message input value
            onChange={(e) => setNewMessage(e.target.value)}
            // Update state when typing
            placeholder="Type a message..." // Input hint
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="w-4 h-4" />
            {/* Send button icon */}
          </Button>
        </form>
      </div>
    </div>
  );
}
