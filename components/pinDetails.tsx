"use client"

import React, { useState } from "react"
import {
  ChevronLeft,
  MapPin,
  Plug,
  Armchair,
  VolumeX,
  Check,
  Image as ImageIcon,
  ChevronDown,
  Phone,
  Clock,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { StarRating } from "@/components/star-rating"
import { Pin, PinDrink } from '@/types/map'

export function PinDetails({
  pin,
  onClose,
}: {
  pin: Pin
  onClose: () => void
}) {
  const [isContactOpen, setIsContactOpen] = useState(false)
  const rawDrinks = pin.details?.drinks || []

  // Create a clean share/directions query link based on location parameters
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${pin.name}, ${pin.details?.formatted_address || pin.details?.address || pin.neighborhood || "Vancouver, BC"}`
  )}`

  console.log("DEBUG - Clicked Pin Full Payload:", pin)

  return (
    <div className="flex h-full flex-col">
      {/* Header Panel */}
      <div className="border-b border-border px-5 py-4">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to pins
        </button>

        <div className="mt-3 flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0 mt-0.5">
            <MapPin className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold leading-tight break-words">{pin.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <StarRating value={pin.rating ?? pin.details?.rating ?? 5} size={13} />
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                {((pin.rating ?? pin.details?.rating ?? 5)).toFixed(1)} · {pin.neighborhood || pin.details?.neighborhood || "Vancouver"}
                {typeof pin.distanceKm === 'number' && pin.distanceKm > 0 && ` · ${pin.distanceKm.toFixed(1)} km`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Workspace Panel */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
        
        {/* ACCORDION: Contact Information Element */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden transition-all">
          <button
            onClick={() => setIsContactOpen(!isContactOpen)}
            className="flex w-full items-center justify-between p-3.5 text-xs font-semibold text-foreground hover:bg-secondary/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <MapPin className="size-3.5 text-primary" />
              Contact Information
            </span>
            <ChevronDown className={cn("size-4 text-muted-foreground transition-transform duration-200", isContactOpen && "rotate-180")} />
          </button>

          {isContactOpen && (
            <div className="border-t border-border bg-secondary/20 p-3.5 space-y-3 text-xs animate-in slide-in-from-top-2 duration-150">
              <div className="space-y-2.5 text-muted-foreground">
                
                {/* 1. Actual Street Address */}
                <div className="flex items-start gap-2">
                  <MapPin className="size-3.5 shrink-0 mt-0.5 text-muted-foreground/70" />
                  <span className="text-foreground/90 max-w-[220px]">
                    {pin.details?.formatted_address || pin.details?.address || pin.neighborhood || "Address not specified"}
                  </span>
                </div>

                {/* 2. Actual Phone Number */}
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5 shrink-0 text-muted-foreground/70" />
                  <span className="text-foreground/90">
                    {pin.details?.formatted_phone_number || pin.details?.phone || "No phone number available"}
                  </span>
                </div>

                {/* 3. Actual Operating Hours Array */}
                <div className="flex items-start gap-2">
                  <Clock className="size-3.5 shrink-0 mt-0.5 text-muted-foreground/70" />
                  <div className="w-full min-w-0">
                    <p className="font-semibold text-foreground/80 mb-1">Hours of Operation</p>
                    
                    {pin.details?.weekday_text && Array.isArray(pin.details.weekday_text) ? (
                      <div className="space-y-1 pl-0.5 mt-1 text-[11px] text-muted-foreground">
                        {pin.details.weekday_text.map((day: string, idx: number) => {
                          // 🟢 Get today's full name (e.g., "Monday", "Tuesday")
                          const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" })
                          
                          // 🟢 Check if this specific line matches today
                          const isToday = day.trim().startsWith(todayName)

                          return (
                            <p 
                              key={idx} 
                              className={cn(
                                "leading-tight transition-colors",
                                // 🟢 Highlight today's text with brighter text and a bolder weight
                                isToday ? "text-foreground font-bold" : "text-muted-foreground/80"
                              )}
                            >
                              {day} {isToday && <span className="text-[9px] text-primary ml-1 font-semibold">(Today)</span>}
                            </p>
                          )
                        })}
                      </div>
                    ) : pin.details?.opening_hours ? (
                      <p className="text-[11px] text-foreground/90 pl-0.5">{pin.details.opening_hours}</p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground italic pl-0.5">Hours not listed for this spot</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Redirect Action Button Link */}
              <div className="pt-1.5">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-input bg-card py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary shadow-sm"
                >
                  <ExternalLink className="size-3.5" />
                  Open in Google Maps
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Reviews Section Title */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-sm font-semibold">Community Logs</h2>
          <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-md border border-border">
            {/* 🟢 FIXED: If it's a to-visit pin, don't count the default structural placeholders as actual shared logs */}
            {((pin.status as string) === "to-visit" || (pin.status as string) === "to_visit") ? 0 : rawDrinks.length} shared
          </span>
        </div>

        {/* Dynamic Reviews Output Stack */}
        <div className="space-y-3">
          {/* 🟢 CONDITION 1: Check if the parent location is explicitly saved as a "to-visit" bucket list spot */}
          {((pin.status as string) === "to-visit" || (pin.status as string) === "to_visit") ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 px-6 py-8 text-center">
              <p className="text-xs font-medium text-zinc-400">
                Saved to bucket list by <span style={{ color: pin.color || 'inherit' }} className="font-semibold">@{pin.createdBy || "anonymous"}</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                This spot hasn't been visited yet. Logs will appear once someone shares their experience here!
              </p>
            </div>
          ) : rawDrinks.length > 0 ? (
            // 🟢 CONDITION 2: Standard visited pins with valid review arrays
            rawDrinks.map((drink: any, index: number) => {
              const standardizedDrink: PinDrink & { userColor?: string } = typeof drink === 'string' 
                ? {
                    name: drink,
                    rating: pin.rating || 5,
                    user: pin.createdBy || pin.details?.created_by || "anonymous",
                    status: "visited",
                    userColor: pin.color
                  }
                : {
                    ...drink,
                    userColor: drink.userColor || drink.color || pin.color
                  }

              return (
                <DrinkCard 
                  key={`${standardizedDrink.user}-${standardizedDrink.name}-${index}`} 
                  drink={standardizedDrink} 
                />
              )
            })
          ) : (
            // 🟢 CONDITION 3: A visited pin that genuinely has zero items inside its dataset arrays
            <p className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-10 text-center text-xs text-muted-foreground">
              No drinks logged yet for this location.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// 🟢 Accept userColor attached straight to the drink prop payload configuration
function DrinkCard({ drink }: { drink: PinDrink & { userColor?: string } }) {
  return (
    <article className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Avatar colored border accent matching identity setup */}
          <div 
            className="flex size-7 items-center justify-center rounded-full bg-secondary text-[11px] font-bold shrink-0 border"
            style={{ 
              color: drink.userColor || "var(--primary)",
              borderColor: drink.userColor ? `${drink.userColor}30` : "transparent"
            }}
          >
            {(drink.user || "??").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            {/* 🟢 FIXED: Username now cleanly targets its own extracted color safely! */}
            <p 
              className="text-xs font-semibold truncate"
              style={{ color: drink.userColor || "inherit" }}
            >
              @{drink.user || "anonymous"}
            </p>
              {((drink.status as string) === "to-visit" || (drink.status as string) === "to_visit") ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-500 border border-zinc-500/20">
                <span className="size-1.5 rounded-full bg-zinc-400" />
                To Visit
              </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  <Check className="size-2.5" />
                  {drink.status || "visited"}
                </span>
              )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <StarRating value={drink.rating ?? 5} size={11} />
          <span className="text-[10px] font-semibold text-muted-foreground">
            {(drink.rating ?? 5).toFixed(1)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <p className="text-[11px] font-bold">
          Drinks:
        <span className="rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary ml-1">
          {drink.name || "No Drinks Yet"}
        </span>
        </p>
      </div>

      {drink.review && (
        <p className="text-xs leading-relaxed text-muted-foreground bg-secondary/30 p-2.5 rounded-xl border border-border/40">
          {drink.review}
        </p>
      )}

      {drink.hasPhoto && (
        <div className="flex aspect-[2/1] items-center justify-center rounded-xl border border-border bg-muted/50">
          <ImageIcon className="size-6 text-muted-foreground/50" />
        </div>
      )}
    </article>
  )
}