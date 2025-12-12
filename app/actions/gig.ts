"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function createGigAction(formData: FormData, imageUrl: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Get data from the form
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const price = Number(formData.get("price"));

  // Find the database user to link the gig
  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id }
  });

  if (!dbUser) throw new Error("User not found in DB");

  // Create the Gig
  await db.gig.create({
    data: {
      title,
      description,
      price,
      imageUrl,
      category,
      vendorId: dbUser.id,
    },
  });

  // Revalidate? (Optional, Next.js usually handles this)
}