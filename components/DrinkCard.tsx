import React from "react"
import { Star } from "lucide-react"
import { PinDrink } from "@/types/map"

export interface DrinkCardProps {
  drink: PinDrink & { userColor?: string; photoUrl?: string | null }
  onImageClick: (src: string, alt: string) => void
}

export function DrinkCard({ 
    drink, 
    onImageClick 
  }: { 
    drink: PinDrink & { userColor?: string; photoUrl?: string | null };
    onImageClick: (src: string, alt: string) => void // 🟢 Type safe callback prop
  }) {
    return (
      <article className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          
          {/* LEFT CONTENT COLUMN */}
          <div className="flex-1 min-w-0 space-y-2">
            
            {/* Line 1: Creator Name */}
            <div className="flex items-center gap-1.5">
              <div 
                className="flex size-5 items-center justify-center rounded-full bg-secondary text-[9px] font-bold shrink-0 border"
                style={{ 
                  color: drink.userColor || "var(--primary)",
                  borderColor: drink.userColor ? `${drink.userColor}30` : "transparent"
                }}
              >
                {(drink.user || "??").slice(0, 2).toUpperCase()}
              </div>
              <p 
                className="text-xs font-semibold truncate"
                style={{ color: drink.userColor || "inherit" }}
              >
                @{drink.user || "anonymous"}
              </p>
            </div>
  
            {/* Line 2: Rating Block */}
            <div className="flex items-center gap-0.5 text-amber-500 font-bold text-[10px] pl-0.5">
              <span>{(drink.rating ?? 5).toFixed(1)}</span>
              <Star className="size-2.5 fill-current stroke-current" />
            </div>
  
            {/* Line 3: Drinks Tag Row */}
            <div className="flex flex-wrap items-center gap-1.5 pl-0.5">
              <p className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                Drinks:
              </p>
              <span className="rounded bg-primary/5 border border-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary inline-block truncate max-w-full">
                {drink.name || "No Drinks Yet"}
              </span>
            </div>
  
            {/* Optional Expansion Review Row */}
            {drink.review && (
              <p className="text-xs leading-relaxed text-muted-foreground bg-secondary/30 p-2 rounded-lg border border-border/40 mt-1 pl-0.5">
                {drink.review}
              </p>
            )}
          </div>
  
          {/* RIGHT COLUMN: Compact Image Preview (Clickable to Lightbox) */}
          {drink.photoUrl && (
            <div 
              onClick={() => onImageClick(drink.photoUrl!, `Drink shared by @${drink.user}`)}
              className="relative size-16 sm:size-20 rounded-lg overflow-hidden border border-border bg-muted/50 shrink-0 shadow-sm self-center cursor-zoom-in" // 🟢 Added cursor hint
            >
              <img 
                src={drink.photoUrl} 
                alt="User shared spot log asset" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
  
        </div>
      </article>
    )
  }