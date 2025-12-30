"use client";

import { useState } from "react";

import { UploadDropzone } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileAction } from "@/app/actions/profile";
import { cn } from "@/lib/utils";

export default function ProfileForm({
  initialName,
  initialBio,
  initialImage,
}: {
  initialName: string;
  initialBio: string;
  initialImage: string;
}) {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [imageUrl, setImageUrl] = useState(initialImage);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<null | {
    type: "success" | "error";
    message: string;
  }>(null);

  async function onSave() {
    setSaving(true);
    setStatus(null);
    try {
      await updateProfileAction({ name, bio, image: imageUrl });
      setStatus({ type: "success", message: "Profile updated." });
    } catch (e) {
      setStatus({ type: "error", message: "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <Label>Profile photo</Label>
        {imageUrl ? (
          <div className="flex items-center gap-4">
            <img
              src={imageUrl}
              alt="Profile"
              className="w-16 h-16 rounded-full border object-cover"
            />

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImageUrl("")}
                type="button"
              >
                Change photo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setImageUrl("")}
                type="button"
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border p-2">
            <UploadDropzone
              endpoint="profileImage"
              onClientUploadComplete={(res) => {
                setImageUrl(res[0].url);
              }}
              onUploadError={(error: Error) => {
                setStatus({ type: "error", message: error.message });
              }}
            />
          </div>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bio">Bio / Professional</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="e.g. UI/UX Designer"
        />
      </div>

      <Button
        className="w-full"
        onClick={() => void onSave()}
        disabled={saving}
      >
        {saving ? "Saving…" : "Save"}
      </Button>

      {status ? (
        <div
          className={cn(
            "text-sm",
            status.type === "success" ? "text-emerald-600" : "text-destructive"
          )}
        >
          {status.message}
        </div>
      ) : null}
    </div>
  );
}
