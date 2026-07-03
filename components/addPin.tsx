"use client"

import React, { useState, useEffect } from "react"
import {
  Search,
  Check,
  Clock,
  X,
  Plus,
  MapPin,
  Coffee,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { StarRating } from "@/components/star-rating"
import { DRINK_TYPES, VisitStatus, type DrinkType , type Pin } from "@/types/map"
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete"
import { useApiIsLoaded } from "@vis.gl/react-google-maps" 

import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/database.types" 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export function AddPin({
  onLocationSelect,
  user,
  pinColor,
  setPins,
}: {
  onLocationSelect: (coords: google.maps.LatLngLiteral) => void
  user: any
  pinColor: string
  setPins: React.Dispatch<React.SetStateAction<Pin[]>>
}) {
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error";
  } | null>(null); 
  
  const apiIsLoaded = useApiIsLoaded() 
  
  const [name, setName] = useState("")
  const [rating, setRating] = useState(2.5)
  const [categories, setCategories] = useState<string[]>([])
  const [neighborhood, setNeighborhood] = useState("Downtown")
  const [customDrinks, setCustomDrinks] = useState<string[]>([])

  const [status, setStatus] = useState("visited")
  const [drinkTypes, setDrinkTypes] = useState<DrinkType[]>(["Coffee"])
  const [customInput, setCustomInput] = useState("")

  const [googlePlaceDetails, setGooglePlaceDetails] = useState<google.maps.places.PlaceResult | null>(null)

  const resetFormFields = () => {
    setName("")
    setRating(5)  
    setNeighborhood("Vancouver")
    setDrinkTypes([])
    setCustomDrinks([]) 
    setStatus("to-visit") 
    setSelectedCoords(null)
    setSearchValue("") 
  }
  
  const addCustomDrink = () => {
    const v = customInput.trim()
    if (v && !customDrinks.includes(v)) setCustomDrinks((p) => [...p, v])
    setCustomInput("")
  }

  const toggleDrinkType = (d: DrinkType) =>
    setDrinkTypes((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
  
  const {
    ready,
    value: searchValue,
    suggestions: { status: autocompleteStatus, data: suggestionsData },
    setValue: setSearchValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "ca" },
      locationBias: { lat: 49.2827, lng: -123.1207 },
    },
    debounce: 300,
    initOnMount: apiIsLoaded,
  })

  const [selectedCoords, setSelectedCoords] = useState<google.maps.LatLngLiteral | null>(null)

  const handlePlaceSelect = async (address: string) => {
    setSearchValue(address, false)
    clearSuggestions()
  
    try {
      const results = await getGeocode({ address })
      const { lat, lng } = await getLatLng(results[0])
      const coords = { lat, lng }
      setSelectedCoords(coords)
      onLocationSelect?.(coords)
  
      // 🟢 FETCH EXTRA BUSINESS METADATA VIA PLACE_ID
      const placeId = results[0]?.place_id
      if (placeId && typeof window !== "undefined" && window.google) {
        // Create a dummy element or map instance to hook into the Places Service
        const dummyDiv = document.createElement("div")
        const service = new window.google.maps.places.PlacesService(dummyDiv)
  
        service.getDetails(
          {
            placeId: placeId,
            // Specifying fields keeps the API response fast and budget-friendly!
            fields: ["formatted_address", "formatted_phone_number", "opening_hours", "name"]
          },
          (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
              // 🟢 Save it to your state so handleFormSubmit can grab it!
              setGooglePlaceDetails(place)
            } else {
              console.warn("Google Places Service could not find details for this Place ID.")
            }
          }
        )
      }
    } catch (error) {
      console.error("Error retrieving coordinates from Google:", error)
    }
  }

  const handleFormSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
  
    if (!selectedCoords) {
      setNotification({
        isOpen: true,
        title: "Location Required",
        message: "Please search for and select a location from the search bar first!",
        type: "error"
      })
      return
    }
  
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      setNotification({
        isOpen: true,
        title: "Authentication Required",
        message: "Please log in to save your custom coffee spots!",
        type: "error"
      })
      return
    }
  
    const creatorUsername = session.user.user_metadata?.username || "anonymous"
    let chosenColor = pinColor || "#6366f1";

    const googleAddress = googlePlaceDetails?.formatted_address || searchValue || "Address not specified"
    const googlePhone = googlePlaceDetails?.formatted_phone_number || "No phone number available"
    const googleHours = googlePlaceDetails?.opening_hours?.weekday_text || null

    const { data, error } = await supabase
      .from("pins")
      .insert([
        {
          name: name || searchValue.split(",")[0],        
          lat: selectedCoords.lat, 
          lng: selectedCoords.lng,
          user_id: session.user.id,
          status: status,
          color: chosenColor, 
          details: {
            drinks: customDrinks.length > 0 ? customDrinks : [
              {
                name: "Regular Coffee",
                rating: 5,
                user: creatorUsername,
                status: "visited",
                amenities: [],
              }
            ],
            drinkTypes: drinkTypes,
            rating: Number(rating),
            neighborhood: neighborhood || "Vancouver",
            created_by: creatorUsername,
            formatted_address: googleAddress,
            formatted_phone_number: googlePhone,
            weekday_text: googleHours
          }
        }
      ])
      .select()
  
    if (error) {
      setNotification({
        isOpen: true,
        title: "Database Error",
        message: `Could not save pin: ${error.message}`,
        type: "error"
      })
      return
    }
  
    if (data && data.length > 0) {
      const newPinFromServer = data[0]
      
      const formattedPin: Pin = {
        ...newPinFromServer,
        isMine: true,
        createdBy: creatorUsername,
        category: categories || [],
        color: chosenColor,
        pinColor: chosenColor, 
      } as unknown as Pin
  
      setPins((prevPins) => [...prevPins, formattedPin])
    }
  
    setNotification({
      isOpen: true,
      title: "Spot Saved! ☕",
      message: "Your new pin has been added to the map!",
      type: "success"
    })

    resetFormFields()
  }

  useEffect(() => {
    if (user && !user.isMaster) {
      setStatus("visited")
    }
  }, [user])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Plus className="size-5" />
        </div>
        <div>
          <h1 className="text-sm font-semibold leading-tight">Add a new pin</h1>
          <p className="text-[11px] text-muted-foreground">Share your favourite sips location</p>
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
        {user?.isMaster && (
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
        )}

        {/* Rating slider */}
        <Field label="Your rating">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <StarRating value={rating} size={26} />
              <span className="font-mono text-sm font-semibold text-primary">{rating.toFixed(1)} / 5</span>
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
          </div>
        </Field>

        {/* Custom drink input */}
        <Field label="What drink did you have?">
          <div className="flex flex-col gap-2">
            <div className="flex w-full gap-2">
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
                className="min-w-0 flex-1 rounded-xl border border-input bg-secondary px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
              />
            </div>
            <div className="flex gap-3 text-xs font-medium text-muted-foreground">
              <span className="flex-1">Drink Type</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {DRINK_TYPES.map((d) => {
                const active = drinkTypes.includes(d)
                return (
                  <button
                    key={d}
                    onClick={() => toggleDrinkType(d)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {d}
                  </button>
                )
              })}
            </div>

            <div className="pt-4">
              <button 
                onClick={addCustomDrink}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                <Coffee className="size-4" />
                Add Drink
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
          </div>
        </Field>

        {/* File upload */}
        <Field label="Upload a photo (optional)">
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

      {/* Submit Section */}
      <div className="border-t border-border px-5 py-4">
        <button 
          onClick={handleFormSubmit} 
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <MapPin className="size-4" />
          Add Pin
        </button>
      </div>

      {/* 🟢 FIXED: Modal is now correctly inside the return statement of AddPin! */}
      {notification?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xs scale-100 rounded-2xl border border-border bg-card p-5 shadow-2xl animate-in zoom-in-95 duration-150 text-center">
            
            <div className={cn(
              "mx-auto mb-3 flex size-12 items-center justify-center rounded-full text-xl",
              notification.type === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
            )}>
              {notification.type === "success" ? "✓" : "✕"}
            </div>

            <h3 className="text-sm font-semibold text-foreground">{notification.title}</h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              {notification.message}
            </p>
            
            <div className="mt-4">
              <button
                onClick={() => setNotification(null)} 
                className={cn(
                  "w-full rounded-xl px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90",
                  notification.type === "success" ? "bg-emerald-600" : "bg-destructive"
                )}
              >
               Got it 
              </button>
            </div>
          </div>
        </div>
      )}
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