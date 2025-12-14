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

  // CHECK ROLE: Are they really an Admin?
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
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-900">
        <h1 className="font-bold text-xl text-white">Admin Control Center</h1>
        <div className="flex gap-4">
            <Link href="/admin-panel" className="hover:text-blue-400">Overview</Link>
            <Link href="/" className="hover:text-blue-400">Exit to Website</Link>
        </div>
      </nav>
      <main className="p-8">
        {children}
      </main>
    </div>
  );
}