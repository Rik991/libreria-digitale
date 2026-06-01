"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md";
  interactive?: boolean;
}

export default function StarRating({
  value,
  onChange,
  size = "md",
  interactive = false,
}: StarRatingProps) {
  const sizeClass = size === "sm" ? "h-4 w-4" : "h-7 w-7";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((starIdx) => (
        <button
          key={starIdx}
          type="button"
          onClick={() => interactive && onChange?.(starIdx)}
          className={`border-none bg-transparent p-0 transition-all ${
            interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
          } ${starIdx <= value ? "text-star" : "text-star-empty"}`}
          disabled={!interactive}
        >
          <Star
            className={sizeClass}
            fill={starIdx <= value ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}
