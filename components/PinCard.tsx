// src/components/map/PinCard.tsx
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Pin } from "@/types/map"
import { DRINK_TYPE_COLORS } from "../lib/constants"

interface PinCardProps {
  pin: Pin
  creatorName: string
  featured?: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function PinCard({
  pin,
  creatorName,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: PinCardProps) {
  const totalLogs = pin.details?.drinks?.length || 1
  const isToVisit = (pin.status as string) === "to-visit" || (pin.status as string) === "to_visit"

  const getCleanCity = () => {
    const fullAddress = pin.details?.formatted_address || pin.details?.address || ""
    if (!fullAddress) return pin.details?.neighborhood || pin.neighborhood || "Vancouver"

    const parts = fullAddress.split(",")
    const bcIndex = parts.findIndex((part: string) => {
      const cleanPart = part.trim().toUpperCase()
      return cleanPart.startsWith("BC") || cleanPart.includes("BRITISH COLUMBIA")
    })

    if (bcIndex > 0) {
      const cityCandidate = parts[bcIndex - 1].trim()
      if (cityCandidate.length > 0) return cityCandidate
    }

    return pin.details?.neighborhood || pin.neighborhood || "Vancouver"
  }

  const displayCity = getCleanCity()
  const displayCategories = (pin.category || (pin as any).drinkTypes || pin.details?.drinkTypes || []) as string[]

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
      className={cn(
        "group flex relative cursor-pointer flex-col gap-2 rounded-xl border p-3 transition-colors w-full",
        isToVisit 
          ? "border-muted bg-zinc-800 hover:border-primary/40" 
          : "border-border bg-card hover:border-primary/40"
      )}
    >
      <div className="flex items-start justify-between gap-2 w-full">
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="text-xs font-semibold break-words leading-tight text-foreground truncate group-hover:whitespace-normal">
            {pin.name}
          </h3>
          <div>
            <div className="flex items-center gap-0.5 text-amber-500 font-bold text-[11px]">
              {isToVisit ? (
                <span className="text-muted-foreground font-medium">Not yet visited</span>
              ) : (
                pin.rating > 0 && (
                  <>
                    <span>{pin.rating.toFixed(1)}</span>
                    <Star className="size-3 fill-current stroke-current" />
                  </>
                )
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end text-right text-[10px]">
          <div className="truncate max-w-[80px]">
            {totalLogs >= 2 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Multiple</span>
            ) : (
              <span style={{ color: pin.color }}>@{creatorName}</span>
            )}   
          </div>
          <p className="text-muted-foreground truncate max-w-[70px]">{displayCity}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {displayCategories.slice(0, 2).map((c) => (
          <span
            key={c}
            className={cn(
              "rounded px-1.5 py-0.5 text-[9px] font-medium border", 
              DRINK_TYPE_COLORS[c] || "bg-secondary text-muted-foreground border-border"
            )}
          >
            {c}
          </span>
        ))}
        {displayCategories.length > 2 && (
          <span className="text-[9px] text-muted-foreground px-0.5 py-0.5">+{displayCategories.length - 2}</span>
        )}
      </div>
    </article>
  )
}