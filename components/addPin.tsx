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
import { DRINK_TYPES, type DrinkType, type Pin } from "@/types/map"
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete"
import { useApiIsLoaded } from "@vis.gl/react-google-maps" 

import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/database.types" 

import imageCompression from "browser-image-compression"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export function AddPin({
  isOpen,
  onClose,
  onLocationSelect,
  user,
  pinColor,
  setPins,
  onSuccess
}: {
  isOpen: boolean
  onClose: () => void
  onLocationSelect: (coords: google.maps.LatLngLiteral) => void
  user: any
  pinColor: string
  setPins: React.Dispatch<React.SetStateAction<Pin[]>>
  onSuccess: () => Promise<void>
}) {
  const apiIsLoaded = useApiIsLoaded() 
  
  // 🟢 Form Flow States
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Form values
  const [name, setName] = useState("")
  const [rating, setRating] = useState(5)
  const [categories, setCategories] = useState<string[]>([])
  const [neighborhood, setNeighborhood] = useState("Downtown")
  const [customDrinks, setCustomDrinks] = useState<string[]>([])
  const [status, setStatus] = useState("visited")
  const [drinkTypes, setDrinkTypes] = useState<DrinkType[]>(["Coffee"])
  const [customInput, setCustomInput] = useState("")
  const [selectedCoords, setSelectedCoords] = useState<google.maps.LatLngLiteral | null>(null)
  const [googlePlaceDetails, setGooglePlaceDetails] = useState<google.maps.places.PlaceResult | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const resetFormFields = () => {
    setName("")
    setRating(5)  
    setNeighborhood("Vancouver")
    setDrinkTypes([])
    setCustomDrinks([]) 
    setStatus("visited") 
    setSelectedCoords(null)
    setGooglePlaceDetails(null)
    setSearchValue("") 
    setErrorMessage(null)
    setIsSubmittedSuccessfully(false)
    setImageFile(null)
  }

  const handleCloseModal = async () => {
    resetFormFields()
    await onSuccess()
    onClose()
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

  const handlePlaceSelect = async (address: string) => {
    setSearchValue(address, false)
    clearSuggestions()
  
    try {
      const results = await getGeocode({ address })
      const { lat, lng } = await getLatLng(results[0])
      const coords = { lat, lng }
      setSelectedCoords(coords)
      onLocationSelect?.(coords)
  
      const placeId = results[0]?.place_id
      if (placeId && typeof window !== "undefined" && window.google) {
        const dummyDiv = document.createElement("div")
        const service = new window.google.maps.places.PlacesService(dummyDiv)
  
        service.getDetails(
          {
            placeId: placeId,
            fields: ["formatted_address", "formatted_phone_number", "opening_hours", "name"]
          },
          (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
              setGooglePlaceDetails(place)
              if (!name) setName(place.name || "")
            }
          }
        )
      }
    } catch (error) {
      console.error("Error retrieving coordinates from Google:", error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  }

  const handleFormSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
  
    if (!selectedCoords) {
      setErrorMessage("Please search for and select a location from the search bar first!")
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setErrorMessage("Please log in to save your custom coffee spots!")
        return
      }
    
      const currentUserId = session.user.id
      const creatorUsername = session.user.user_metadata?.username || "anonymous"
      let chosenColor = pinColor || "#6366f1";

      const googleAddress = googlePlaceDetails?.formatted_address || searchValue || "Address not specified"
      const googlePhone = googlePlaceDetails?.formatted_phone_number || "No phone number available"
      const googleHours = googlePlaceDetails?.opening_hours?.weekday_text || null

      let publicImageUrl: string | null = null

      // 🟢 Handles Image Upload Phase
      if (imageFile) {
        setIsUploading(true)
        
        const options = {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
          fileType: "image/webp" as const
        }

        const compressedBlob = await imageCompression(imageFile, options)
        const fileName = `${currentUserId}-${Date.now()}.webp`
        const filePath = fileName

        const webpFile = new File([compressedBlob], fileName, { 
          type: "image/webp" 
        })

        const { error: uploadError } = await supabase.storage
          .from("pin-photos")
          .upload(filePath, webpFile, {
            contentType: 'image/webp'
            //upsert: true
          })
        
        // If storage fails, this throws straight down to our master catch block below!
        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from("pin-photos")
          .getPublicUrl(filePath)

        publicImageUrl = publicUrl
      }

      // 🟢 Handles Database Entry Phase
      const { data, error } = await supabase
        .from("pins")
        .insert([
          {
            name: name || searchValue.split(",")[0],        
            lat: selectedCoords.lat, 
            lng: selectedCoords.lng,
            user_id: currentUserId,
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
              weekday_text: googleHours,
              photo_url: publicImageUrl
            }
          }
        ]) // 🟢 FIXED: Safely closed the insert array arrays
        .select()

      if (error) throw error
    
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
    
      setIsSubmittedSuccessfully(true)

    } catch (err: any) {
      // 🟢 Master Catch-all Safety Net handles everything beautifully now!
      console.error("❌ SUBMIT HANDLER FAILURE:", err)
      
      const descriptiveMessage = err.message || (typeof err === 'string' ? err : JSON.stringify(err))
      setErrorMessage(`Failed to save spot: ${descriptiveMessage}`)
      
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    if (user && !user.isMaster) {
      setStatus("visited")
    }
  }, [user])

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-200",
        isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      )}
    >
      <div 
        className={cn(
          "relative w-full max-w-lg flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] transition-all duration-200",
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        )}
      >
        
        {/* Close Button Anchor */}
        <button 
          type="button"
          onClick={handleCloseModal}
          className="absolute top-4 right-4 z-50 p-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close panel"
        >
          <X className="size-4" />
        </button>

        {/* 🟢 VIEW A: THE SUCCESS STATE WINDOW */}
        {isSubmittedSuccessfully ? (
          <div className="flex flex-col items-center justify-center text-center p-8 my-auto space-y-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 text-2xl font-bold">
              ✓
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Pin added!</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed max-w-sm">
                Your new custom pin has been published successfully and is live on your mapping interface dashboard.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCloseModal}
              className="w-full max-w-xs rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              Got it!
            </button>
          </div>
        ) : (
          /* 🟢 VIEW B: THE FORM ENTRY WINDOW */
          <>
            <div className="flex items-center gap-3 border-b border-border px-5 py-4 bg-secondary/30">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Plus className="size-5" />
              </div>
              <div>
                <h1 className="text-sm font-semibold leading-tight">Add a new pin</h1>
                <p className="text-[11px] text-muted-foreground">Share your favourite sips location</p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 text-left">
              
              {errorMessage && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-destructive text-white text-[10px]">✕</span>
                  <p>{errorMessage}</p>
                </div>
              )}

              {/* Places search */}
              <Field label="Location Search">
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
                    <ul className="absolute z-[110] mt-1.5 w-full rounded-xl border border-border bg-card shadow-2xl max-h-48 overflow-y-auto p-1">
                      {suggestionsData.map(({ place_id, description }) => (
                        <li
                          key={place_id}
                          onClick={() => handlePlaceSelect(description)}
                          className="rounded-lg px-3 py-2 hover:bg-secondary text-xs text-foreground cursor-pointer transition-colors"
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
                    <SegBtn type="button" active={status === "visited"} onClick={() => setStatus("visited")} icon={Check} label="Visited" />
                    <SegBtn type="button" active={status === "to-visit"} onClick={() => setStatus("to-visit")} icon={Clock} label="To-Visit" />
                  </div>
                  {status === "to-visit" && (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      This place renders as a gray marker on the map until you visit it.
                    </p>
                  )}
                </Field>
              )}

              {/* Rating slider */}
              <Field label="Your rating">
                <div className="rounded-xl border border-border bg-card p-3.5">
                  <div className="mb-2 flex items-center justify-between">
                    <StarRating value={rating} size={22} />
                    <span className="font-mono text-xs font-semibold text-primary">{rating.toFixed(1)} / 5</span>
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
                  
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {DRINK_TYPES.map((d) => {
                      const active = drinkTypes.includes(d)
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleDrinkType(d)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
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

                  <div className="pt-2">
                    <button 
                      type="button"
                      onClick={addCustomDrink}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-input bg-secondary py-2 text-xs font-semibold text-foreground transition-colors hover:bg-accent">
                      <Coffee className="size-3.5" />
                      Add Drink
                    </button>
                  </div>

                  {customDrinks.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {customDrinks.map((d) => (
                        <span
                          key={d}
                          className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 py-0.5 pl-2.5 pr-1.5 text-[11px] font-medium text-primary"
                        >
                          {d}
                          <button
                            type="button"
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
                <label className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border px-4 py-4 text-center transition-colors",
                  imageFile ? "border-emerald-500/40 bg-emerald-500/5" : "bg-secondary/30 hover:border-primary/40"
                )}>
                  <div className={cn(
                    "flex size-8 items-center justify-center rounded-full",
                    imageFile ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                  )}>
                    <Upload className="size-3.5" />
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {imageFile ? "Photo attached!" : "Upload an image"}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                    {imageFile ? imageFile.name : "PNG or JPG, automatically compressed"}
                  </span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </label>
              </Field>
            </form>

            {/* Submit Action Tray Footer */}
            <div className="border-t border-border px-5 py-4 bg-secondary/10 flex gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 rounded-xl border border-input bg-card py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isUploading}
                onClick={handleFormSubmit} 
                className="flex-[2] flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 shadow-md disabled:opacity-50"
              >
                <MapPin className="size-4" />
                {isUploading ? "Uploading Image..." : "Add Pin"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function SegBtn({
  active,
  onClick,
  icon: Icon,
  label,
  type = "button"
}: {
  active: boolean
  onClick: () => void
  icon: React.ElementType
  label: string
  type?: "button" | "submit" | "reset"
}) {
  return (
    <button
      type={type}
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