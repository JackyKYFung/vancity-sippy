"use client"

import { useState, useEffect } from "react"
import { ChevronDown, MapPin, Palette, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { Pin } from '@/types/map'

const PRESET_COLORS = [
  "#BFDD2C",
  "#FFB400",
  "#D97706",
  "#00A6ED",
  "#7C3AED",
  "#09BC8A",
  "#F43F5E",
]

const PIN_LIMIT = 3

export function MyPins({
  pins,
  setPins,
  onAddPin,
  onPinSelect,
  onColorChange,
  onPinHover,
}: {
  pins: Pin[]
  setPins: React.Dispatch<React.SetStateAction<Pin[]>>
  onAddPin: () => void
  onPinSelect: (pin: Pin) => void
  onColorChange: (color: string) => void
  onPinHover: (pin: Pin | null) => void
}) {
  const [pinColor, setPinColor] = useState("#6366f1")
  const [colorPickerOpen, setColorPickerOpen] = useState(false)



  const myPins = pins.filter((p) => p.isMine)
  const isLimitReached = myPins.length >= PIN_LIMIT

  const handleColorUpdate = async (newColor: string) => {
    setPinColor(newColor)
    
    // 🟢 1. Update ONLY your pins in the frontend state instantly
    // This prevents the map from overriding other accounts' pins
    setPins((prevPins) =>
      prevPins.map((pin) =>
        pin.isMine ? { ...pin, color: newColor } : pin
      )
    )
  
    // 🟢 2. Pass the new color up, but ensure your map component is 
    // reading `pin.color` per marker instead of a single global tracking variable!
    onColorChange(newColor)
  
    if (!myPins.length) return
  
    try {
      const currentUserId = (await supabase.auth.getUser()).data.user?.id
      if (!currentUserId) return
  
      const { error } = await (supabase.from("pins") as any)
        .update({ color: newColor })
        .eq("user_id", currentUserId) // Cleaned up syntax target
  
      if (error) console.error("Error saving color to pins:", error.message)
    } catch (err) {
      console.error("Failed to update pin colors:", err)
    }
  }

  const handleDeletePin = async (e: React.MouseEvent, pinId: string) => {
    e.stopPropagation()

    const confirmed = window.confirm("Are you sure you want to delete this pin?")
    if (!confirmed) return

    const previousPins = pins
    setPins((prev) => prev.filter((p) => p.id !== pinId))

    try {
      const { error } = await supabase.from("pins").delete().eq("id", pinId)
      if (error) {
        console.error("Failed to delete pin:", error.message)
        setPins(previousPins)
      }
    } catch (err) {
      console.error("Failed to delete pin:", err)
      setPins(previousPins)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h1 className="shrink-0 text-sm font-semibold">My Pins</h1>
        <span 
          className={cn(
            "inline-flex shrink-0 items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors",
            isLimitReached && "border-destructive/30 bg-destructive/10 text-destructive font-semibold"
          )}
        >  
          {myPins.length}/{PIN_LIMIT} Pins Used
        </span>
        <button
          onClick={onAddPin}
          disabled={isLimitReached}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90",
            "disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground disabled:opacity-40"
          )}
        >
          <Plus className="size-4" />
          Add Pin
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="space-y-2">
          <button
            onClick={() => setColorPickerOpen((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-accent/50"
          >
            <span className="flex items-center gap-2.5">
              <Palette className="size-4 text-muted-foreground" />
              Pin Color
              <span
                className="size-4 rounded-full border border-border"
                // 🟢 Uses the active pin's color first, falling back to the picker state
                style={{ backgroundColor: myPins[0]?.color || pinColor }}
              />
            </span>
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                colorPickerOpen && "rotate-180",
              )}
            />
          </button>

          {colorPickerOpen && (
            <div className="rounded-xl border border-border bg-card p-4">
              <label className="mb-3 block text-xs font-medium text-muted-foreground">
                Choose a color for your pins on the map
              </label>
              <div className="mb-3 flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorUpdate(color)}
                    className={cn(
                      "size-8 rounded-full border-2 transition-transform hover:scale-110",
                      pinColor === color ? "border-foreground" : "border-transparent",
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <h2 className="mb-3 mt-6 text-sm font-semibold">My Current Pins</h2>

        <div className="space-y-3">
          {myPins.map((pin) => (
            <article
              key={pin.id}
              role="button"
              tabIndex={0}
              onClick={() => onPinSelect(pin)}
              onMouseEnter={() => onPinHover(pin)}
              onMouseLeave={() => onPinHover(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onPinSelect(pin)
                }
              }}
              className="relative flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card p-4 pr-12 transition-colors hover:border-primary/40"
            >
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${pin.color || pinColor}20` }}
              >
                <MapPin className="size-5" style={{ color: pin.color || pinColor }} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold">{pin.name}</h3>
                <p className="text-[11px] text-muted-foreground">
                  {pin.neighborhood} · {pin.distanceKm} km away
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => handleDeletePin(e, pin.id)}
                aria-label={`Delete ${pin.name}`}
                className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-muted-foreground transition-colors hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50"
              >
                ✕
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
