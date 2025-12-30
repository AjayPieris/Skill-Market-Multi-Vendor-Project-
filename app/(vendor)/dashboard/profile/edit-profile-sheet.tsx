"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import ProfileForm from "./profile-form";

export default function EditProfileSheet({
  initialName,
  initialBio,
  initialImage,
}: {
  initialName: string;
  initialBio: string;
  initialImage: string;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-4">
          Edit profile
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>Update your photo, name, and bio.</SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-6 overflow-y-auto">
          <ProfileForm
            initialName={initialName}
            initialBio={initialBio}
            initialImage={initialImage}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
