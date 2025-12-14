import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import NavbarRoutes from "@/components/NavbarRoutes";

export default async function Navbar() {
  // 1. Get the current user from Clerk
  const user = await currentUser();

  // 2. If logged in, check their role in OUR database
  let isAdmin = false;
  if (user) {
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });
    if (dbUser?.role === "admin") {
      isAdmin = true;
    }
  }

  return (
    <nav className="border-b shadow-sm bg-white">
      <div className="flex h-16 items-center px-4 container mx-auto justify-between">
        {/* LOGO */}
        <Link href="/" className="font-bold text-2xl text-blue-600">
          Skill<span className="text-black">Market</span>
        </Link>

        {/* MIDDLE LINKS (Hidden on mobile) */}
        <div className="hidden md:!flex gap-6 text-sm font-medium text-gray-600">
          <Link href="/search" className="hover:text-blue-600 transition">
            Find Talent
          </Link>
          <Link
            href="/become-seller"
            className="hover:text-blue-600 transition"
          >
            Become a Seller
          </Link>
        </div>

        {/* ACTION BUTTONS */}
        <NavbarRoutes isAdmin={isAdmin} />
      </div>
    </nav>
  );
}
