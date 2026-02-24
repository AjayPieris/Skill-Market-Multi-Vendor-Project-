"use client";

import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard } from "lucide-react";

export default function UserProfileButton() {
  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Link
          label="Dashboard"
          labelIcon={<LayoutDashboard className="w-4 h-4" />}
          href="/dashboard"
        />
      </UserButton.MenuItems>
    </UserButton>
  );
}
