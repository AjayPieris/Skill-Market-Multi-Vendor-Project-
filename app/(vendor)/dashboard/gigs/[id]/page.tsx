import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import EditGigForm from "./edit-gig-form";

export default async function EditGigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await currentUser();
  if (!user) return redirect("/sign-in");

  const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return redirect("/dashboard");

  const gig = await db.gig.findUnique({ where: { id } });
  if (!gig) return notFound();

  if (gig.vendorId !== dbUser.id) return redirect("/dashboard/gigs");

  return (
    <EditGigForm
      gigId={gig.id}
      initialTitle={gig.title}
      initialDescription={gig.description}
      initialCategory={gig.category}
      initialPrice={gig.price}
      initialImageUrl={gig.imageUrl}
    />
  );
}
