"use client"

import { useState } from "react"
import {
  ChevronDown,
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { StarRating } from "@/components/star-rating"

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

export function PinDetails() {
  const [openInfo, setOpenInfo] = useState<string | null>("hours")
  const [state, setState] = useState<DetailState>("unlocked")

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MapPin className="size-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight">Revolver Coffee</h1>
            <div className="mt-0.5 flex items-center gap-2">
              <StarRating value={4.5} size={13} />
              <span className="text-[11px] text-muted-foreground">4.5 · Gastown · 1.2 km</span>
            </div>
          </div>
        </div>

      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
        {/* Google Maps details accordion */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <Accordion
            id="contact"
            icon={Phone}
            title="Contact info"
            open={openInfo === "contact"}
            onToggle={(id) => setOpenInfo(openInfo === id ? null : id)}
          >
            <p>(604) 558-4444</p>
            <p className="text-primary">revolvercoffee.ca</p>
          </Accordion>
          <Accordion
            id="hours"
            icon={Clock}
            title="Hours"
            open={openInfo === "hours"}
            onToggle={(id) => setOpenInfo(openInfo === id ? null : id)}
          >
            <div className="space-y-1">
              <Row k="Mon – Fri" v="7:00 AM – 6:00 PM" />
              <Row k="Saturday" v="9:00 AM – 6:00 PM" />
              <Row k="Sunday" v="9:00 AM – 5:00 PM" />
            </div>
          </Accordion>
          <Accordion
            id="address"
            icon={MapPin}
            title="Address"
            open={openInfo === "address"}
            onToggle={(id) => setOpenInfo(openInfo === id ? null : id)}
            last
          >
            <p>325 Cambie St, Vancouver, BC V6B 2N4</p>
          </Accordion>
        </section>

        <a
          href="#"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-2.5 text-xs font-semibold transition-colors hover:bg-accent"
        >
          <ExternalLink className="size-4" />
          Open in Google Maps
        </a>

        {/* Conditional bottom section */}
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
                This is a gray “To-Visit” pin. Reviews unlock once the spot has been visited and logged.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function Accordion({
  id,
  icon: Icon,
  title,
  open,
  onToggle,
  children,
  last,
}: {
  id: string
  icon: React.ElementType
  title: string
  open: boolean
  onToggle: (id: string) => void
  children: React.ReactNode
  last?: boolean
}) {
  return (
    <div className={cn(!last && "border-b border-border")}>
      <button
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-accent/50"
      >
        <span className="flex items-center gap-2.5">
          <Icon className="size-4 text-muted-foreground" />
          {title}
        </span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="px-4 pb-3 pl-11 text-xs text-muted-foreground">{children}</div>}
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
