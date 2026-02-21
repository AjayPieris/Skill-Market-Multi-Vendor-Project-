import { redirect } from "next/navigation";

// Chat is now handled by the NavChatWidget in the navbar.
// Redirect any direct /inbox links to home.
export default async function ConversationPage() {
  redirect("/");
}
