"use client"

import { useState } from "react"
import {
  ArrowUpDown,
  DollarSign,
  User,
  MapPin,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { StarRating } from "@/components/star-rating"
import { drinkTypeColor, type Pin, type DrinkType } from "@/lib/sips-data"

export function AllPins({
  pins,
  onPinSelect,
}: {
  pins: Pin[]
  onPinSelect: (pin: Pin) => void
}) {
  const [activeFilters, setActiveFilters] = useState<string[]>(["Rating"])
  const [drinkFilters, setDrinkFilters] = useState<DrinkType[]>([])

  const toggleFilter = (f: string) =>
    setActiveFilters((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))
  const toggleDrink = (d: DrinkType) =>
    setDrinkFilters((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))

  let filteredPins: Pin[] = pins
  if (drinkFilters.length) filteredPins = filteredPins.filter((p) => p.category.some((c) => drinkFilters.includes(c)))

  return (
    <div className="flex h-full flex-col">
      {/* Sort & filter controls */}
      <div className="space-y-3 border-b border-border px-4 py-3">
        <div>
          <p className="mb-2 text-xs font-semibold text-foreground">Sort By:</p>
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip icon={ArrowUpDown} label="Rating" active={activeFilters.includes("Rating")} onClick={() => toggleFilter("Rating")} dropdown />
            <FilterChip icon={MapPin} label="Distance" active={activeFilters.includes("Distance")} onClick={() => toggleFilter("Distance")} dropdown />
            <FilterChip icon={DollarSign} label="Price" active={activeFilters.includes("Price")} onClick={() => toggleFilter("Price")} dropdown />
            <FilterChip icon={User} label="User" active={activeFilters.includes("User")} onClick={() => toggleFilter("User")} dropdown />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-foreground">Filter Drinks By:</p>
          <div className="flex flex-wrap items-center gap-2">
            {(["Coffee", "Tea", "Matcha", "Fruit"] as DrinkType[]).map((d) => (
              <button
                key={d}
                onClick={() => toggleDrink(d)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                  drinkFilters.includes(d)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bento grid of cards */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filteredPins.map((pin, i) => (
            <PinCard
              key={pin.id}
              pin={pin}
              featured={i === 0}
              onClick={() => onPinSelect(pin)}
            />
          ))}
        </div>
        {filteredPins.length === 0 && (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <MapPin className="size-6 opacity-50" />
            <p className="text-sm">No pins match these filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function FilterChip({
  icon: Icon,
  label,
  active,
  onClick,
  dropdown,
}: {
  icon: React.ElementType
  label: string
  active: boolean
  onClick: () => void
  dropdown?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors",
        active
          ? "border-primary/50 bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-3.5" />
      {label}
      {dropdown && <ChevronDown className="size-3 opacity-70" />}
    </button>
  )
}

function PinCard({
  pin,
  featured,
  onClick,
}: {
  pin: Pin
  featured?: boolean
  onClick: () => void
}) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
      className={cn(
        "group flex cursor-pointer flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40",
        featured && "sm:col-span-2",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{pin.name}</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground mb-1">
            {pin.neighborhood} · {pin.distanceKm} km away
          </p>
          <StarRating value={pin.rating} size={14} />
        </div>

      </div>

      <div className="flex flex-wrap gap-1.5">
        {pin.category.map((c) => (
          <span
            key={c}
            className={cn("rounded-md border px-2 py-0.5 text-[10px] font-medium", drinkTypeColor[c])}
          >
            {c}
          </span>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        <span className="text-foreground/80">Tried:</span> {pin.drink}
      </p>
    </article>
  )
}
