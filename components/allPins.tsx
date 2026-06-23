"use client"

import { useState } from "react"
import {
  Plus,
  Lock,
  SlidersHorizontal,
  ArrowUpDown,
  DollarSign,
  User,
  MapPin,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { StarRating } from "@/components/star-rating"
import { PINS, drinkTypeColor, type Pin, type DrinkType } from "@/lib/sips-data"

type ListTab = "mine" | "all" | "to-visit"

const TABS: { id: ListTab; label: string; admin?: boolean }[] = [
  { id: "mine", label: "My Pins" },
  { id: "all", label: "All Pins" },
  { id: "to-visit", label: "To-Visit List", admin: true },
]

export function AllPins({ onAddLocation }: { onAddLocation: () => void }) {
  const [tab, setTab] = useState<ListTab>("mine")
  const [activeFilters, setActiveFilters] = useState<string[]>(["Rating"])
  const [drinkFilters, setDrinkFilters] = useState<DrinkType[]>([])

  const toggleFilter = (f: string) =>
    setActiveFilters((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))
  const toggleDrink = (d: DrinkType) =>
    setDrinkFilters((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))

  let pins: Pin[] = PINS
  if (tab === "mine") pins = PINS.filter((p) => p.isMine)
  if (tab === "to-visit") pins = PINS.filter((p) => p.status === "to-visit")
  if (drinkFilters.length) pins = pins.filter((p) => p.category.some((c) => drinkFilters.includes(c)))

  return (
    <div className="flex h-full flex-col">
      {/* Fixed header */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MapPin className="size-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight">Vancity Sippy</h1>
            <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              2/3 Pins Used
            </span>
          </div>
        </div>
        <button
          onClick={onAddLocation}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          Add Location
        </button>
      </div>

      {/* Secondary tab bar */}
      <div className="flex items-center gap-1 border-b border-border px-3 py-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              tab === t.id ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {t.admin && (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
                <Lock className="size-2.5" />
                Admin
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <FilterChip icon={ArrowUpDown} label="Rating" active={activeFilters.includes("Rating")} onClick={() => toggleFilter("Rating")} dropdown />
        <FilterChip icon={MapPin} label="Distance" active={activeFilters.includes("Distance")} onClick={() => toggleFilter("Distance")} dropdown />
        <FilterChip icon={DollarSign} label="Price" active={activeFilters.includes("Price")} onClick={() => toggleFilter("Price")} dropdown />
        <FilterChip icon={User} label="User" active={activeFilters.includes("User")} onClick={() => toggleFilter("User")} dropdown />
        <div className="mx-1 h-5 w-px bg-border" />
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <SlidersHorizontal className="size-3.5" />
          <span className="text-[11px] font-medium uppercase tracking-wide">Drink</span>
        </div>
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

      {/* Bento grid of cards */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {pins.map((pin, i) => (
            <PinCard key={pin.id} pin={pin} featured={i === 0} />
          ))}
        </div>
        {pins.length === 0 && (
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

function PinCard({ pin, featured }: { pin: Pin; featured?: boolean }) {
  return (
    <article
      className={cn(
        "group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40",
        featured && "sm:col-span-2",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold">{pin.name}</h3>
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                pin.status === "visited"
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {pin.status === "visited" ? "Visited" : "To-Visit"}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {pin.neighborhood} · {pin.distanceKm} km away
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <StarRating value={pin.rating} size={14} />
          <span className="text-[11px] font-medium text-muted-foreground">{pin.rating.toFixed(1)}</span>
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
