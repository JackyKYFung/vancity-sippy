"use client"

import { useState } from "react"
import {
  Search,
  Check,
  Clock,
  Plug,
  PlugZap,
  Armchair,
  Volume2,
  VolumeX,
  Upload,
  X,
  Plus,
  MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { StarRating } from "@/components/star-rating"
import { DRINK_TYPES, type DrinkType } from "@/lib/sips-data"
// Added hook imports right here
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete"
import { useApiIsLoaded } from "@vis.gl/react-google-maps" // Add this line

interface AddPinViewProps {
  onLocationSelect: (coords: google.maps.LatLngLiteral) => void
}

export function AddPin({ onLocationSelect }: AddPinViewProps) {
  const apiIsLoaded = useApiIsLoaded() // 1. Check if the global Google script is loaded

  const [status, setStatus] = useState<"visited" | "to-visit">("visited")
  const [rating, setRating] = useState(3.5)
  const [outlets, setOutlets] = useState<boolean | null>(true)
  const [seating, setSeating] = useState<"ample" | "limited" | null>("ample")
  const [noise, setNoise] = useState<"quiet" | "lively" | null>("quiet")
  const [drinkTypes, setDrinkTypes] = useState<DrinkType[]>(["Coffee"])
  const [customInput, setCustomInput] = useState("")
  const [customDrinks, setCustomDrinks] = useState<string[]>(["Cortado"])

  const toggleDrinkType = (d: DrinkType) =>
    setDrinkTypes((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))

  const addCustomDrink = () => {
    const v = customInput.trim()
    if (v && !customDrinks.includes(v)) setCustomDrinks((p) => [...p, v])
    setCustomInput("")
  }

  // Google Places Autocomplete Hook
  const {
    ready,
    value: searchValue,
    suggestions: { status: autocompleteStatus, data: suggestionsData },
    setValue: setSearchValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "ca" },
      // Use a plain object literal instead of the LatLng constructor
      locationBias: { lat: 49.2827, lng: -123.1207 },
    },
    debounce: 300,
    initOnMount: apiIsLoaded,
  })

  // Track the lat/lng coordinates of the selected place to send back to your main map later
  const [selectedCoords, setSelectedCoords] = useState<google.maps.LatLngLiteral | null>(null)

  const handlePlaceSelect = async (address: string) => {
    setSearchValue(address, false)
    clearSuggestions()

    try {
      const results = await getGeocode({ address })
      const { lat, lng } = await getLatLng(results[0])

      const coords = {lat, lng};

      setSelectedCoords(coords)

      onLocationSelect(coords);
      
      console.log("Selected Location Coordinates:", coords)
    } catch (error) {
      console.error("Error retrieving coordinates from Google:", error)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Plus className="size-5" />
        </div>
        <div>
          <h1 className="text-sm font-semibold leading-tight">Add a new pin</h1>
          <p className="text-[11px] text-muted-foreground">Drop a spot on your Vancity Sips map</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
        {/* Places search */}
        <Field label="Location">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              disabled={!ready}
              placeholder="Search Google Places… e.g. Revolver Coffee"
              className="w-full rounded-xl border border-input bg-secondary py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 disabled:opacity-50"
            />

            {/* Dropdown Results Box */}
            {autocompleteStatus === "OK" && (
              <ul className="absolute z-50 mt-1.5 w-full rounded-xl border border-border bg-card shadow-2xl max-h-60 overflow-y-auto p-1">
                {suggestionsData.map(({ place_id, description }) => (
                  <li
                    key={place_id}
                    onClick={() => handlePlaceSelect(description)}
                    className="rounded-lg px-3 py-2.5 hover:bg-secondary text-sm text-foreground cursor-pointer transition-colors"
                  >
                    {description}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Field>

        {/* Visited status segmented control */}
        <Field label="Visited status">
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-secondary p-1">
            <SegBtn active={status === "visited"} onClick={() => setStatus("visited")} icon={Check} label="Visited" />
            <SegBtn active={status === "to-visit"} onClick={() => setStatus("to-visit")} icon={Clock} label="To-Visit" />
          </div>
          {status === "to-visit" && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              This place renders as a gray marker on the map until you visit it.
            </p>
          )}
        </Field>

        {/* Rating slider — Option 1 */}
        <Field label="Your rating">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <StarRating value={rating} size={26} />
              <span className="font-mono text-sm font-semibold text-primary">{rating.toFixed(1)} / 5.0</span>
            </div>
            <input
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="sips-slider w-full"
              style={{ ["--pct" as string]: `${(rating / 5) * 100}%` }}
              aria-label="Rating"
            />
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              <span>0.0</span>
              <span>2.5</span>
              <span>5.0</span>
            </div>
          </div>
        </Field>

        {/* Review */}
        <Field label="Review">
          <textarea
            rows={3}
            placeholder="What stood out? Service, vibe, the drink itself…"
            className="w-full resize-none rounded-xl border border-input bg-secondary px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
          />
        </Field>

        {/* Amenities & Vibe grid */}
        <Field label="Amenities & vibe">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <AmenityGroup
              title="Power outlets"
              options={[
                { key: true, label: "Outlets", icon: PlugZap },
                { key: false, label: "None", icon: Plug },
              ]}
              value={outlets}
              onChange={setOutlets}
            />
            <AmenityGroup
              title="Seating"
              options={[
                { key: "ample", label: "Ample", icon: Armchair },
                { key: "limited", label: "Limited", icon: Armchair },
              ]}
              value={seating}
              onChange={setSeating}
            />
            <AmenityGroup
              title="Noise level"
              options={[
                { key: "quiet", label: "Quiet", icon: VolumeX },
                { key: "lively", label: "Lively", icon: Volume2 },
              ]}
              value={noise}
              onChange={setNoise}
            />
          </div>
        </Field>

        {/* Drink type checkboxes */}
        <Field label="Drink type">
          <div className="flex flex-wrap gap-2">
            {DRINK_TYPES.map((d) => {
              const active = drinkTypes.includes(d)
              return (
                <button
                  key={d}
                  onClick={() => toggleDrinkType(d)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded border",
                      active ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40",
                    )}
                  >
                    {active && <Check className="size-3" />}
                  </span>
                  {d}
                </button>
              )
            })}
          </div>
        </Field>

        {/* Custom drink input */}
        <Field label="What specific drink did you have?">
          <div className="flex gap-2">
            <input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addCustomDrink()
                }
              }}
              placeholder="e.g., Mango Pomelo Sago"
              className="flex-1 rounded-xl border border-input bg-secondary px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
            />
            <button
              onClick={addCustomDrink}
              className="inline-flex items-center gap-1 rounded-xl border border-border bg-secondary px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              <Plus className="size-4" />
              Add
            </button>
          </div>
          {customDrinks.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {customDrinks.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 py-1 pl-2.5 pr-1.5 text-[11px] font-medium text-primary"
                >
                  {d}
                  <button
                    onClick={() => setCustomDrinks((p) => p.filter((x) => x !== d))}
                    className="flex size-4 items-center justify-center rounded-full hover:bg-primary/20"
                    aria-label={`Remove ${d}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>

        {/* File upload */}
        <Field label="Review photo (optional)">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/50 px-4 py-6 text-center transition-colors hover:border-primary/40">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <Upload className="size-4 text-muted-foreground" />
            </div>
            <span className="text-xs font-medium text-foreground">Upload an image</span>
            <span className="text-[11px] text-muted-foreground">PNG or JPG, up to 5MB</span>
            <input type="file" accept="image/*" className="hidden" />
          </label>
        </Field>
      </div>

      {/* Submit */}
      <div className="border-t border-border px-5 py-4">
        <button className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
          <MapPin className="size-4" />
          Add Location
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

// ... Subcomponents (SegBtn, AmenityGroup) remain unchanged below

function SegBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ElementType
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}

function AmenityGroup<T extends string | boolean>({
  title,
  options,
  value,
  onChange,
}: {
  title: string
  options: { key: T; label: string; icon: React.ElementType }[]
  value: T | null
  onChange: (v: T) => void
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="flex flex-col gap-1.5">
        {options.map((o) => {
          const active = value === o.key
          const Icon = o.icon
          return (
            <button
              key={String(o.key)}
              onClick={() => onChange(o.key)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
