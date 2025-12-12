// components/Navbar.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Importing the button we just installed
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="border-b shadow-sm bg-white">
      <div className="flex h-16 items-center px-4 container mx-auto justify-between">
        
        {/* LOGO SECTION */}
        <Link href="/" className="font-bold text-2xl text-blue-600">
          Skill<span className="text-black">Market</span>
        </Link>

        {/* NAVIGATION LINKS (Hidden on small screens) */}
        <div className="hidden md:!flex gap-6 text-sm font-medium text-gray-600">
          <Link href="/search" className="hover:text-blue-600 transition">
            Find Talent
          </Link>
          <Link href="/become-seller" className="hover:text-blue-600 transition">
            Become a Seller
          </Link>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-2 items-center">
            
            {/* If user is NOT logged in, show this: */}
            <SignedOut>
                <SignInButton mode="modal">
                    <Button variant="outline">Sign In</Button>
                </SignInButton>
                <Button>Join Free</Button>
            </SignedOut>

            {/* If user IS logged in, show this: */}
            <SignedIn>
                <Link href="/dashboard">
                    <Button variant="ghost">Dashboard</Button>
                </Link>
                <UserButton />
            </SignedIn>

        </div>
        
      </div>
    </nav>
  );
}