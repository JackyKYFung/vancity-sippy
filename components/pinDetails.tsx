"use client"

import {
  ChevronLeft,
  MapPin,
  Plug,
  Armchair,
  VolumeX,
  Check,
  Image as ImageIcon,
} from "lucide-react"
import { StarRating } from "@/components/star-rating"
import type { Pin, PinDrink } from "@/lib/sips-data"

export function PinDetails({
  pin,
  onClose,
}: {
  pin: Pin
  onClose: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-4">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to pins
        </button>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MapPin className="size-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight">{pin.name}</h1>
            <div className="mt-0.5 flex items-center gap-2">
              <StarRating value={pin.rating} size={13} />
              <span className="text-[11px] text-muted-foreground">
                {pin.rating.toFixed(1)} · {pin.neighborhood} · {pin.distanceKm} km
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Drinks</h2>
          <span className="text-[11px] text-muted-foreground">
            {pin.details.drinks.length} logged
          </span>
        </div>

        {pin.details.drinks.length > 0 ? (
          pin.details.drinks.map((drink) => (
            <DrinkCard key={`${drink.user}-${drink.name}`} drink={drink} />
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-10 text-center text-xs text-muted-foreground">
            No drinks logged yet for this location.
          </p>
        )}
      </div>
    </div>
  )
}

function DrinkCard({ drink }: { drink: PinDrink }) {
  const amenityIcon: Record<string, React.ElementType> = {
    Outlets: Plug,
    Quiet: VolumeX,
    "Limited seating": Armchair,
    "Ample seating": Armchair,
  }

  return (
    <article className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
            {drink.user.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-semibold">Explored by @{drink.user}</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
              <Check className="size-2.5" />
              {drink.status}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <StarRating value={drink.rating} size={13} />
          <span className="text-[10px] font-medium text-muted-foreground">
            {drink.rating.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          {drink.name}
        </span>
        {drink.amenities.map((a) => {
          const Icon = amenityIcon[a] ?? Check
          return (
            <span
              key={a}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              <Icon className="size-3" />
              {a}
            </span>
          )
        })}
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">{drink.review}</p>

      {drink.hasPhoto && (
        <div className="flex aspect-[2/1] items-center justify-center rounded-xl border border-border bg-muted/50">
          <ImageIcon className="size-6 text-muted-foreground/50" />
        </div>
      )}
    </article>
  )
}
