"use client";

import * as React from "react";
import { Users } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import FollowersSidebar from "@/components/FollowersSidebar";

type SidebarUser = {
  id: string;
  name: string | null;
  bio: string | null;
  image: string | null;
};

export default function MobileFollowersSheet({
  initialFollowers,
}: {
  initialFollowers: SidebarUser[];
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex flex-col items-center gap-0.5 text-xs text-gray-600 hover:text-blue-600 py-1 px-3">
          <Users className="w-5 h-5" />
          Followers
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Followers</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto px-4 pb-4">
          <FollowersSidebar initialFollowers={initialFollowers} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
