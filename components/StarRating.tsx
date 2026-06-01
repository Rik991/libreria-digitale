"use client";

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
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onChange?.(star)}
          className={`border-none bg-transparent p-0 transition-all ${
            interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
          } ${star <= value ? "text-star" : "text-star-empty"}`}
          disabled={!interactive}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={star <= value ? "currentColor" : "none"}
            stroke="currentColor"
            className={sizeClass}
          >
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
            />
          </svg>
        </button>
      ))}
    </div>
  );
}
