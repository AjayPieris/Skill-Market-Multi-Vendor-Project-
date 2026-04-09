// app/(vendor)/dashboard/gigs/create/page.tsx
"use client"; // This must be a Client Component because it uses forms/state

import { useState } from "react";
import { UploadDropzone } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createGigAction } from "@/app/actions/gig";
import { useRouter } from "next/navigation";

export default function CreateGigPage() {
  const router = useRouter();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("Graphics & Design");

  async function handleSubmit(formData: FormData) {
    // We add the image URLs to the form data manually
    if (imageUrls.length === 0) {
      alert("Please upload at least one image!");
      return;
    }

    // Call the server action
    await createGigAction(formData, imageUrls);
    router.push("/dashboard/gigs"); // Redirect back to list
  }

  const removeImage = (urlToRemove: string) => {
    setImageUrls((prev) => prev.filter((url) => url !== urlToRemove));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Create a New Gig</h1>

      <div className="border p-6 rounded-lg bg-white shadow-sm space-y-6">
        {/* 1. IMAGE UPLOAD SECTION */}
        <div>
          <Label>Gig Images (Up to 4)</Label>

          <div className="grid grid-cols-2 gap-4 mt-2 mb-4">
            {imageUrls.map((url, i) => (
              <div key={url} className="relative">
                <img
                  src={url}
                  alt={`Upload ${i + 1}`}
                  className="w-full h-32 object-cover rounded-md border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-7 px-2 text-xs"
                  onClick={() => removeImage(url)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          {imageUrls.length < 4 && (
            <UploadDropzone
              endpoint="gigImage"
              onClientUploadComplete={(res) => {
                const newUrls = res.map((r) => r.url);
                setImageUrls((prev) => [...prev, ...newUrls].slice(0, 4));
                alert("Upload Completed");
              }}
              onUploadError={(error: Error) => {
                alert(`ERROR! ${error.message}`);
              }}
            />
          )}
        </div>

        {/* 2. FORM SECTION */}
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Gig Title</Label>
            <Input
              name="title"
              id="title"
              placeholder="e.g. I will design a minimalist logo"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Graphics & Design">
                  Graphics & Design
                </SelectItem>
                <SelectItem value="Programming & Tech">
                  Programming & Tech
                </SelectItem>
                <SelectItem value="Digital Marketing">
                  Digital Marketing
                </SelectItem>
                <SelectItem value="Video & Animation">
                  Video & Animation
                </SelectItem>
                <SelectItem value="Writing & Translation">
                  Writing & Translation
                </SelectItem>
                <SelectItem value="Music & Audio">Music & Audio</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="AI Services">AI Services</SelectItem>
                <SelectItem value="Data">Data</SelectItem>
                <SelectItem value="Photography">Photography</SelectItem>
                <SelectItem value="Lifestyle">Lifestyle</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="category" value={category} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              name="description"
              id="description"
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
              placeholder="50"
              required
            />
          </div>

          {/* STANDARD PACKAGE SECTION */}
          <div className="border-t pt-4 space-y-4">
            <h2 className="font-semibold text-gray-700">
              Standard Package Details
            </h2>

            <div className="grid gap-2">
              <Label htmlFor="packageDescription">Package Description</Label>
              <Textarea
                name="packageDescription"
                id="packageDescription"
                placeholder="e.g. I will provide a high-quality service with unlimited revisions."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="deliveryDays">Delivery (days)</Label>
                <Input
                  name="deliveryDays"
                  id="deliveryDays"
                  type="number"
                  min="1"
                  defaultValue="3"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="revisions">Revisions</Label>
                <Input
                  name="revisions"
                  id="revisions"
                  placeholder="e.g. Unlimited or 3"
                  defaultValue="Unlimited"
                  required
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Publish Gig
          </Button>
        </form>
      </div>
    </div>
  );
}
