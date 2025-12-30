"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { UploadDropzone } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateGigAction } from "@/app/actions/gig";

export default function EditGigForm({
  gigId,
  initialTitle,
  initialDescription,
  initialCategory,
  initialPrice,
  initialImageUrl,
}: {
  gigId: string;
  initialTitle: string;
  initialDescription: string;
  initialCategory: string;
  initialPrice: number;
  initialImageUrl: string;
}) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    try {
      await updateGigAction(gigId, formData, imageUrl);
      router.push("/dashboard/gigs");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Edit Gig</h1>

      <div className="border p-6 rounded-lg bg-white shadow-sm space-y-6">
        <div>
          <Label>Gig Thumbnail</Label>
          {imageUrl ? (
            <div className="relative mt-2">
              <img
                src={imageUrl}
                alt="Upload"
                className="w-full h-48 object-cover rounded-md"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setImageUrl("")}
                type="button"
              >
                Remove
              </Button>
            </div>
          ) : (
            <UploadDropzone
              endpoint="gigImage"
              onClientUploadComplete={(res) => {
                setImageUrl(res[0].url);
              }}
              onUploadError={(error: Error) => {
                alert(`ERROR! ${error.message}`);
              }}
            />
          )}
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Gig Title</Label>
            <Input
              name="title"
              id="title"
              defaultValue={initialTitle}
              placeholder="e.g. I will design a minimalist logo"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <select
              name="category"
              id="category"
              defaultValue={initialCategory}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="Design">Design</option>
              <option value="Development">Development</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              name="description"
              id="description"
              defaultValue={initialDescription}
              placeholder="Describe your service..."
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              name="price"
              id="price"
              type="number"
              min="5"
              defaultValue={initialPrice}
              placeholder="50"
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
