"use server"; 
// This function runs on the server (needed for DB and auth)

import { db } from "@/lib/db"; 
// Import database connection

import { currentUser } from "@clerk/nextjs/server"; 
// Get the currently logged-in user from Clerk

import { redirect } from "next/navigation"; 
// Used to redirect users to another page

export async function startConversationAction(vendorId: string) {
  // This function starts (or opens) a chat with a vendor

  const user = await currentUser(); 
  // Get the logged-in user

  if (!user) return redirect("/sign-in"); 
  // If user is not logged in, send them to sign-in page

  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
  }); 
  // Find the user in our database using Clerk ID

  if (!dbUser) return redirect("/dashboard"); 
  // If user not found in DB, go back to dashboard

  if (dbUser.id === vendorId) return; 
  // Stop the user from starting a chat with themselves

  let conversation = await db.conversation.findFirst({
    where: {
      OR: [
        { userOneId: dbUser.id, userTwoId: vendorId },
        { userOneId: vendorId, userTwoId: dbUser.id },
      ],
    },
  }); 
  // Check if a conversation already exists
  // (User → Vendor OR Vendor → User)

  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        userOneId: dbUser.id,
        userTwoId: vendorId,
      },
    });
  }
  // If no conversation exists, create a new one

  redirect(`/inbox/${conversation.id}`); 
  // Redirect user to the chat room page
}
