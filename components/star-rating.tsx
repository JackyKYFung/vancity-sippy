import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

type StarRatingProps = {
  value: number
  max?: number
  size?: number
  className?: string
}

export function StarRating({ value, max = 5, size = 16, className }: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`Rated ${value} out of ${max}`}>
      {Array.from({ length: max }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, value - i)) // 0, 0.5, or 1
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} className="absolute inset-0 text-muted-foreground/40" strokeWidth={2} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={size} className="text-primary fill-primary" strokeWidth={2} />
            </span>
          </span>
        )
      })}
    </div>
  )
}
