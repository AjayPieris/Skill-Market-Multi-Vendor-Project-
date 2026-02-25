"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteGigAction } from "@/app/actions/gig";
import { useRouter } from "next/navigation";

interface GigCardProps {
  id: string;
  title: string;
  category: string;
  price: number;
  imageUrl: string;
}

export default function GigCardWithDelete({
  id,
  title,
  category,
  price,
  imageUrl,
}: GigCardProps) {
  const [isPending, startTransition] = useTransition();
  const [deleted, setDeleted] = useState(false);
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteGigAction(id);
      setDeleted(true);
      router.refresh();
    });
  };

  if (deleted) return null;

  return (
    <div
      className="relative border rounded-lg overflow-hidden group"
    >
      {/* Delete button — always visible on mobile, hover-only on desktop */}
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="absolute top-2 right-2 z-10 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-lg transition disabled:opacity-60 md:opacity-0 md:group-hover:opacity-100"
        title="Delete gig"
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
      </button>

      <Link href={`/gigs/${id}`} className="block">
        <div className="aspect-square bg-muted overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      <div className="p-2">
        <div className="text-sm font-medium line-clamp-1">{title}</div>
        <div className="text-xs text-muted-foreground line-clamp-1">
          {category} • ${price}
        </div>

        <div className="pt-2 flex items-center gap-2">
          <Link href={`/gigs/${id}`} className="inline-block">
            <Button variant="outline" size="sm" className="h-8">
              View
            </Button>
          </Link>
          <Link href={`/dashboard/gigs/${id}`} className="inline-block">
            <Button size="sm" className="h-8">
              Edit
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
