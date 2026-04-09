import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");

  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser || dbUser.role !== "admin") {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>You are not authorized to view this page.</p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-16 flex bg-gray-50">
      {/* SIDEBAR — hidden on mobile */}
      <aside className="w-64 bg-white border-r max-md:hidden flex-shrink-0 overflow-y-auto">
        <div className="p-6">
          <h2 className="font-bold text-xl mb-6">Admin Panel</h2>
          <nav className="flex flex-col gap-2">
            <Link href="/admin-panel">
              <Button variant="ghost" className="w-full justify-start">
                Overview
              </Button>
            </Link>
            <Link href="/admin-panel/vendors">
              <Button variant="ghost" className="w-full justify-start">
                Vendors
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full justify-start mt-10">
                Back to Home
              </Button>
            </Link>
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
}
