"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export interface HoverImageCarouselProps {
  images: string[];
  fallbackImage: string;
  alt: string;
  className?: string;
  imageClassName?: string;
}

export default function HoverImageCarousel({
  images,
  fallbackImage,
  alt,
  className = "",
  imageClassName = "object-cover",
}: HoverImageCarouselProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Create a combined array of images starting with the fallback (thumbnail)
  // But actually, `images` array from the DB should already include the thumbnail as the first item if created that way.
  // We'll prepare an array that starts with the fallback, appending the rest, and making sure unique things are displayed.
  const displayImages = images?.length > 0 ? images : [fallbackImage];

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isHovered && displayImages.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % displayImages.length);
      }, 1000); // changes image every 1 second
    } else {
      setCurrentIndex(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHovered, displayImages.length]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={displayImages[currentIndex]}
        alt={alt}
        className={`w-full h-full transition-transform duration-500 group-hover:scale-105 bg-gray-100 ${imageClassName}`}
      />

      {/* Optional: Show progress dots if there are multiple images */}
      {displayImages.length > 1 && isHovered && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
          {displayImages.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full ${
                idx === currentIndex ? "w-3 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
