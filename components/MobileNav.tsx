"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  isAdmin: boolean;
}

export default function MobileNav({ isAdmin }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition"
        aria-label="Toggle menu"
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Dropdown drawer */}
      {open && (
        <div className="absolute top-16 left-0 right-0 z-50 bg-white border-b shadow-lg">
          <nav className="flex flex-col px-4 py-4 gap-2">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="py-3 px-4 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition"
            >
              Dashboard
            </Link>
            {isAdmin && (
              <Link
                href="/admin-panel"
                onClick={() => setOpen(false)}
                className="py-3 px-4 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
