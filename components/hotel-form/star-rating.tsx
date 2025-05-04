import { useCallback } from "react";
import { Star } from "lucide-react";
function StarRating({
    value,
    onChange,
  }: {
    value: number;
    onChange: (value: number) => void;
  }) {
    // Handle key events for accessibility (e.g., Arrow keys to change rating)
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLButtonElement>, star: number) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onChange(star);
        }
      },
      [onChange]
    );
  
    return (
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onKeyDown={(e) => handleKeyDown(e, star)}
            className={`h-6 w-6 cursor-pointer focus:outline-none transition-transform duration-150 ${
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
            aria-label={`Set rating to ${star}`}
          >
            <Star />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-500">({value} stars)</span>
      </div>
    );
}

export {StarRating}