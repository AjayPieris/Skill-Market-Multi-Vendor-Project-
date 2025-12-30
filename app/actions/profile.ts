"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function updateProfileAction(input: {
  name: string;
  bio: string;
  image: string;
}) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) throw new Error("User not found");

  const name = (input.name ?? "").trim();
  const bio = (input.bio ?? "").trim();
  const image = (input.image ?? "").trim();

  await db.user.update({
    where: { id: dbUser.id },
    data: {
      name: name.length > 0 ? name : null,
      bio: bio.length > 0 ? bio : null,
      image: image.length > 0 ? image : null,
    },
  });

  return { ok: true };
}
