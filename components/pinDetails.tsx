"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronLeft,
  Phone,
  Clock,
  MapPin,
  ExternalLink,
  Lock,
  Plug,
  Armchair,
  VolumeX,
  Check,
  Image as ImageIcon,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { StarRating } from "@/components/star-rating"
import type { Pin } from "@/lib/sips-data"

type DetailState = "unlocked" | "locked"

const REVIEWS = [
  {
    user: "jacky",
    status: "Visited",
    drink: "Cortado",
    rating: 4.5,
    amenities: ["Outlets", "Quiet"],
    text: "Impeccable pour-over program and the cortado is dialed in. Tight on seats at peak but worth it.",
    hasPhoto: true,
  },
  {
    user: "mara",
    status: "Visited",
    drink: "Flat white",
    rating: 3.5,
    amenities: ["Limited seating"],
    text: "Lovely beans and friendly baristas. Lost half a star because it gets loud and cramped on weekends.",
    hasPhoto: false,
  },
]

export function PinDetails({
  pin,
  onBack,
}: {
  pin: Pin
  onBack: () => void
}) {
  const [contactOpen, setContactOpen] = useState(false)
  const [state] = useState<DetailState>(pin.status === "visited" ? "unlocked" : "locked")
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)

  const handleRemovePin = () => {
    // Placeholder: will delete from Supabase once wired up
    console.log("Removing pin:", pin.id)
    setShowRemoveConfirm(false)
    onBack()
  }

  return (
    <div className="relative flex h-full flex-col">
      {showRemoveConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 px-5 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-2xl border border-border bg-card p-5 shadow-lg">
            <p className="text-center text-sm font-medium">
              Are you sure about removing this pin?
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold transition-colors hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleRemovePin}
                className="flex-1 rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground transition-opacity hover:opacity-90"
              >
                Remove pin
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-border px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to pins
          </button>
          <button
            onClick={() => setShowRemoveConfirm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-2.5 py-1.5 text-[11px] font-semibold text-destructive-foreground transition-opacity hover:opacity-90"
          >
            <Trash2 className="size-3.5" />
            Remove Pin
          </button>
        </div>

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

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <button
            onClick={() => setContactOpen((prev) => !prev)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-accent/50"
          >
            <span className="flex items-center gap-2.5">
              <Phone className="size-4 text-muted-foreground" />
              Contact Information
            </span>
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                contactOpen && "rotate-180",
              )}
            />
          </button>
          {contactOpen && (
            <div className="space-y-4 border-t border-border px-4 py-3 pl-11 text-xs text-muted-foreground">
              <div>
                <p className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
                  <Phone className="size-3.5" />
                  Phone
                </p>
                <p>(604) 558-4444</p>
              </div>
              <div>
                <p className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
                  <Clock className="size-3.5" />
                  Hours
                </p>
                <div className="space-y-1">
                  <Row k="Mon – Fri" v="7:00 AM – 6:00 PM" />
                  <Row k="Saturday" v="9:00 AM – 6:00 PM" />
                  <Row k="Sunday" v="9:00 AM – 5:00 PM" />
                </div>
              </div>
              <div>
                <p className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
                  <MapPin className="size-3.5" />
                  Address
                </p>
                <p>325 Cambie St, Vancouver, BC V6B 2N4</p>
                <p className="mt-1 text-primary">revolvercoffee.ca</p>
              </div>
            </div>
          )}
        </section>

        <a
          href="#"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-2.5 text-xs font-semibold transition-colors hover:bg-accent"
        >
          <ExternalLink className="size-4" />
          Open in Google Maps
        </a>

        {state === "unlocked" ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Community Reviews</h2>
              <span className="text-[11px] text-muted-foreground">{REVIEWS.length} reviews</span>
            </div>
            {REVIEWS.map((r) => (
              <ReviewCard key={r.user} review={r} />
            ))}
          </section>
        ) : (
          <section className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <Lock className="size-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Location not yet unlocked by Jacky</p>
              <p className="max-w-xs text-pretty text-xs text-muted-foreground">
                This is a gray "To-Visit" pin. Reviews unlock once the spot has been visited and logged.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>{k}</span>
      <span className="text-foreground/80">{v}</span>
    </div>
  )
}

function ReviewCard({ review }: { review: (typeof REVIEWS)[number] }) {
  const amenityIcon: Record<string, React.ElementType> = {
    Outlets: Plug,
    Quiet: VolumeX,
    "Limited seating": Armchair,
  }
  return (
    <article className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
            {review.user.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-semibold">Explored by @{review.user}</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
              <Check className="size-2.5" />
              {review.status}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <StarRating value={review.rating} size={13} />
          <span className="text-[10px] font-medium text-muted-foreground">{review.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          {review.drink}
        </span>
        {review.amenities.map((a) => {
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

      <p className="text-xs leading-relaxed text-muted-foreground">{review.text}</p>

      {review.hasPhoto && (
        <div className="flex aspect-[2/1] items-center justify-center rounded-xl border border-border bg-muted/50">
          <ImageIcon className="size-6 text-muted-foreground/50" />
        </div>
      )}
    </article>
  )
}
