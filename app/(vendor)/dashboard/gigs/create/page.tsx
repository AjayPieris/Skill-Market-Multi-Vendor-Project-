// app/(vendor)/dashboard/gigs/create/page.tsx
"use client"; // This must be a Client Component because it uses forms/state

import { useState } from "react";
import { UploadDropzone } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { Label } from "@/components/ui/label";       
import { createGigAction } from "@/app/actions/gig"; 
import { useRouter } from "next/navigation";

export default function CreateGigPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string>("");

  async function handleSubmit(formData: FormData) {
    // We add the image URL to the form data manually
    if (!imageUrl) {
      alert("Please upload an image first!");
      return;
    }
    
    // Call the server action
    await createGigAction(formData, imageUrl);
    router.push("/dashboard/gigs"); // Redirect back to list
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Create a New Gig</h1>

      <div className="border p-6 rounded-lg bg-white shadow-sm space-y-6">
        
        {/* 1. IMAGE UPLOAD SECTION */}
        <div>
          <Label>Gig Thumbnail</Label>
          {imageUrl ? (
            <div className="relative mt-2">
              <img src={imageUrl} alt="Upload" className="w-full h-48 object-cover rounded-md" />
              <Button 
                variant="destructive" 
                size="sm" 
                className="absolute top-2 right-2"
                onClick={() => setImageUrl("")}
              >
                Remove
              </Button>
            </div>
          ) : (
            <UploadDropzone
              endpoint="gigImage"
              onClientUploadComplete={(res) => {
                setImageUrl(res[0].url);
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
            <Input name="title" id="title" placeholder="e.g. I will design a minimalist logo" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <select name="category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="Design">Design</option>
                <option value="Development">Development</option>
                <option value="Marketing">Marketing</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea name="description" id="description" placeholder="Describe your service..." required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input name="price" id="price" type="number" min="5" placeholder="50" required />
          </div>

          <Button type="submit" className="w-full" size="lg">Publish Gig</Button>
        </form>
      </div>
    </div>
  );
}