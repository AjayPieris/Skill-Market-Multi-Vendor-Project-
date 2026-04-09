"use client";

import { useState } from "react";

interface GigImageGalleryProps {
  images: string[];
  fallbackImage: string;
  title: string;
}

export default function GigImageGallery({
  images,
  fallbackImage,
  title,
}: GigImageGalleryProps) {
  // Use images array if available, but make sure the fallback image is included or displayed
  const allImages = images?.length > 0 ? images : [fallbackImage];
  const [selectedImage, setSelectedImage] = useState(allImages[0]);

  return (
    <div>
      {/* Main Large Image */}
      <div className="rounded-xl overflow-hidden border bg-gray-100 flex justify-center items-center h-[300px] md:h-[500px]">
        <img
          src={selectedImage}
          alt={title}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Extra Images Grid */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-5 gap-3 mt-4">
          {allImages.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedImage(img)}
              className={`rounded-lg overflow-hidden border bg-gray-100 aspect-video flex justify-center items-center transition-all ${
                selectedImage === img
                  ? "ring-2 ring-blue-600 border-transparent opacity-100"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`${title} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
