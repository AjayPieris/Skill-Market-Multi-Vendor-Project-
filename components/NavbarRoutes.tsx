"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

interface NavbarRoutesProps {
  isAdmin: boolean;
}

export default function NavbarRoutes({ isAdmin }: NavbarRoutesProps) {
  return (
    <div className="flex gap-2 items-center">
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="outline">Sign In</Button>
        </SignInButton>
        <SignInButton mode="modal">
        <Button>Join Free</Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        {isAdmin && (
          <Link href="/admin-panel">
            <Button variant="destructive" size="sm" className="gap-2 mr-2">
              <ShieldCheck className="w-4 h-4" />
              Admin
            </Button>
          </Link>
        )}

        <Link href="/dashboard">
          <Button variant="ghost">Dashboard</Button>
        </Link>
        <UserButton />
      </SignedIn>
    </div>
  );
}
