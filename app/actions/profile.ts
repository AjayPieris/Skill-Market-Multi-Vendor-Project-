"use server";

import { db } from "@/lib/db";
import { clerkClient, currentUser } from "@clerk/nextjs/server";

export async function updateProfileAction(input: {
  name?: string;
  bio?: string;
  image?: string;
}) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) throw new Error("User not found");

  const name = (input.name ?? "").trim();
  const bio = (input.bio ?? "").trim();
  const image = (input.image ?? "").trim();

  // 1. Update our database
  await db.user.update({
    where: { id: dbUser.id },
    data: {
      name: name.length > 0 ? name : null,
      bio: bio.length > 0 ? bio : null,
      image: image.length > 0 ? image : null,
    },
  });

  // 2. Sync name to Clerk so UserButton shows the updated name
  const clerk = await clerkClient();
  if (name.length > 0) {
    const spaceIdx = name.indexOf(" ");
    const firstName = spaceIdx === -1 ? name : name.slice(0, spaceIdx);
    const lastName = spaceIdx === -1 ? "" : name.slice(spaceIdx + 1);
    await clerk.users.updateUser(user.id, { firstName, lastName });
  }

  // 3. Sync profile photo to Clerk so UserButton shows the updated avatar
  if (image.length > 0) {
    try {
      const res = await fetch(image);
      const buffer = await res.arrayBuffer();
      const contentType = res.headers.get("content-type") ?? "image/jpeg";
      const ext = contentType.split("/")[1]?.split(";")[0] ?? "jpg";
      const file = new File([buffer], `avatar.${ext}`, { type: contentType });
      await clerk.users.updateUserProfileImage(user.id, { file });
    } catch {
      // Photo sync failure is non-fatal — DB is already updated
    }
  }

  return { ok: true };
}
