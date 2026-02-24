"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitReviewAction } from "@/app/actions/review";

interface ReviewFormProps {
  gigId: string;
  orderId: string;
}

export default function ReviewForm({ gigId, orderId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a comment.");
      return;
    }
    setError("");
    const formData = new FormData();
    formData.set("orderId", orderId);
    formData.set("gigId", gigId);
    formData.set("rating", String(rating));
    formData.set("comment", comment.trim());

    startTransition(async () => {
      try {
        await submitReviewAction(formData);
        setSubmitted(true);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to submit review",
        );
      }
    });
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 text-sm font-medium">
        ✓ Your review has been submitted. Thank you!
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-white p-6 space-y-4 shadow-sm"
    >
      <h4 className="font-semibold text-gray-800">Leave a Review</h4>

      {/* Star selector */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none"
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                star <= (hovered || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-gray-500">{rating} / 5</span>
        )}
      </div>

      <Textarea
        placeholder="Share your experience with this service..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        required
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
