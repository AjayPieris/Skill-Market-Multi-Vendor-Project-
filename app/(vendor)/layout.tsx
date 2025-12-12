
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Get the authenticated user from Clerk
  const user = await currentUser();

  // If not logged in, kick them to login page
  if (!user) {
    return redirect("/sign-in");
  }

  // 2. CHECK DATABASE: Do we have this user?
  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
  });

  // 3. IF NOT: Create them automatically!
  if (!dbUser) {
    await db.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.firstName + " " + user.lastName,
        image: user.imageUrl,
        role: "vendor", // By default, anyone visiting dashboard becomes a vendor for now
      },
    });
  }

  // 4. Render the Dashboard Layout
  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* SIDEBAR (Simple version) */}
      <aside className="w-64 bg-white border-r hidden md:!block">
        <div className="p-6">
          <h2 className="font-bold text-xl mb-6">Seller Portal</h2>
          <nav className="flex flex-col gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">Overview</Button>
            </Link>
            <Link href="/dashboard/gigs">
              <Button variant="ghost" className="w-full justify-start">My Gigs</Button>
            </Link>
            <Link href="/dashboard/orders">
              <Button variant="ghost" className="w-full justify-start">Orders</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full justify-start mt-10">Back to Home</Button>
            </Link>
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8">
        {children}
      </main>
      
    </div>
  );
}