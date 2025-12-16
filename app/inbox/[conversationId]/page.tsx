import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChatBox from "@/components/ChatBox";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const user = await currentUser();
  if (!user) return redirect("/sign-in");

  // Get current user DB ID
  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return redirect("/");

  // 1. Fetch the Conversation & Messages
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      userOne: true, // Need names/pics
      userTwo: true,
      messages: {
        orderBy: { createdAt: "asc" }, // Oldest first
        include: { sender: true },
      },
    },
  });

  if (!conversation) return redirect("/dashboard");

  // 2. Figure out who we are talking to
  const otherUser =
    conversation.userOneId === dbUser.id
      ? conversation.userTwo
      : conversation.userOne;

  return (
    <div className="container mx-auto px-4 max-w-4xl h-[calc(100dvh-4rem)] flex flex-col py-4">
      <div className="mb-4 flex items-center gap-3 border-b pb-4">
        <img
          src={otherUser.image || ""}
          className="w-10 h-10 rounded-full border"
        />
        <h1 className="text-xl font-bold">Chat with {otherUser.name}</h1>
      </div>

      {/* Load the Client Component */}
      <div className="flex-1 min-h-0">
        <ChatBox
          conversationId={conversation.id}
          currentUserId={dbUser.id}
          otherUserId={otherUser.id}
          otherUserName={otherUser.name}
          otherUserImage={otherUser.image}
          initialMessages={conversation.messages}
        />
      </div>
    </div>
  );
}
