"use client"

import React, { useState } from "react"
import {
  ChevronLeft,
  MapPin,
  Clock,
  Phone,
  ExternalLink,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Pin, PinDrink } from '@/types/map'
import Lightbox from "@/components/Lightbox" // 🟢 Make sure this path matches your file structure!

export function PinDetails({
  pin,
  onClose,
}: {
  pin: Pin
  onClose: () => void
}) {
  const rawDrinks = pin.details?.drinks || []
  const mainPhotoUrl = pin.details?.photo_url || pin.photo_url || null

  // 🟢 State variables for managing global Lightbox context strings
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState("")
  const [lightboxAlt, setLightboxAlt] = useState("")

  // Helper trigger handler to open specific file assets instantly
  const handleOpenImage = (src: string, alt: string) => {
    setLightboxSrc(src)
    setLightboxAlt(alt)
    setIsLightboxOpen(true)
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${pin.name}, ${pin.details?.formatted_address || pin.details?.address || pin.neighborhood || "Vancouver, BC"}`
  )}`

  return (
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-12 md:grid-cols-1 items-stretch md:items-start divide-x divide-border md:divide-x-0 h-full min-h-0 w-full content-start">
        
        {/* LEFT COLUMN: NAV & CONTACT INFO BOX */}
        <div className="col-span-6 md:col-span-1 flex flex-col gap-4 p-4 border-b md:border-b-0 border-border h-auto md:h-auto">
          <div>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
              Back to pins
            </button>

            <div className="flex items-center justify-between w-full">  
              <h1 className="text-sm font-bold leading-tight break-words text-foreground">
                {pin.name}
              </h1>

              {/* 🟢 Combined Average Star Rating Pill */}
              {(pin.rating || pin.details?.rating) > 0 && (
                <div className="flex items-center gap-1 shrink-0 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg text-amber-500 font-bold text-[11px]">
                  <span>{(pin.rating || pin.details?.rating).toFixed(1)}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star size-3 fill-current stroke-current" aria-hidden="true">
                    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Contact Details Information Card */}
          <div className="border-[1px] rounded-xl bg-secondary/10 p-3 space-y-3 text-[11px] w-full shadow-sm flex-none md:flex-initial">
            <div className="space-y-2.5 text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="size-3.5 shrink-0 mt-0.5 text-muted-foreground/70" />
                <span className="text-foreground/90 leading-normal">
                  {pin.details?.formatted_address || pin.details?.address || pin.neighborhood || "Address not specified"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="size-3.5 shrink-0 text-muted-foreground/70" />
                <span className="text-foreground/90">
                  {pin.details?.formatted_phone_number || pin.details?.phone || "No phone number available"}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="size-3.5 shrink-0 mt-0.5 text-muted-foreground/70" />
                <div className="w-full min-w-0">
                  {pin.details?.weekday_text && Array.isArray(pin.details.weekday_text) ? (
                    <div className="space-y-1 pl-0.5 mt-1 text-muted-foreground">
                      {pin.details.weekday_text.map((day: string, idx: number) => {
                        const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" })
                        const isToday = day.trim().startsWith(todayName)

                        return (
                          <p 
                            key={idx} 
                            className={cn(
                              "leading-tight transition-colors",
                              isToday ? "text-foreground font-bold" : "text-muted-foreground/80"
                            )}
                          >
                            {day} {isToday && <span className="text-[9px] text-primary ml-0.5 font-semibold">(Today)</span>}
                          </p>
                        )
                      })}
                    </div>
                  ) : pin.details?.opening_hours ? (
                    <p className="text-foreground/90 pl-0.5">{pin.details.opening_hours}</p>
                  ) : (
                    <p className="text-muted-foreground italic pl-0.5">Hours not listed for this spot</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-1">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-input bg-card py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary shadow-sm"
              >
                <ExternalLink className="size-3" />
                Open in Maps
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: COMMUNITY FEEDS */}
        <div className="col-span-6 md:col-span-1 min-h-0 flex-1 overflow-y-auto p-4 bg-background/30 flex flex-col gap-3 h-full">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xs font-semibold text-muted-foreground tracking-tight uppercase">
              Community Logs
            </h2>
            <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-md border border-border font-medium">
              {((pin.status as string) === "to-visit" || (pin.status as string) === "to_visit") ? 0 : rawDrinks.length} shared
            </span>
          </div>

          <div className="space-y-3">
            {((pin.status as string) === "to-visit" || (pin.status as string) === "to_visit") ? (
              <div className="rounded-xl border border-dashed border-border bg-card/40 px-4 py-8 text-center">
                <p className="text-xs font-medium text-foreground">
                  Saved to bucket list by <span style={{ color: pin.color || 'inherit' }} className="font-semibold">@{pin.createdBy || "anonymous"}</span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 max-w-xs mx-auto">
                  This spot hasn't been visited yet. Logs will appear once someone shares their experience here!
                </p>
              </div>
            ) : rawDrinks.length > 0 ? (
              rawDrinks.map((drink: any, index: number) => {
                const standardizedDrink: PinDrink & { userColor?: string; photoUrl?: string | null } = typeof drink === 'string' 
                  ? {
                      name: drink,
                      rating: pin.rating || 5,
                      user: pin.createdBy || pin.details?.created_by || "anonymous",
                      status: "visited",
                      userColor: pin.color,
                      photoUrl: mainPhotoUrl
                    }
                  : {
                      ...drink,
                      userColor: drink.userColor || drink.color || pin.color,
                      photoUrl: drink.photoUrl || drink.photo_url || mainPhotoUrl
                    }

                return (
                  <DrinkCard 
                    key={`${standardizedDrink.user}-${standardizedDrink.name}-${index}`} 
                    drink={standardizedDrink} 
                    onImageClick={handleOpenImage} // 🟢 Pass the image callback down
                  />
                )
              })
            ) : (
              <p className="rounded-xl border border-dashed border-border bg-card/40 px-4 py-8 text-center text-xs text-muted-foreground">
                No drinks logged yet for this location.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* 🟢 GLOBAL PORTAL LIGHTBOX ELEMENT */}
      <Lightbox 
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        src={lightboxSrc}
        alt={lightboxAlt}
      />
    </div>
  )
}

function DrinkCard({ 
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