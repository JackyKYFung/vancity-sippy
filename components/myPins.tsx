"use client"

import { useState } from "react"
import { ChevronDown, MapPin, Palette, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PINS, type Pin } from "@/lib/sips-data"

const PRESET_COLORS = [
  "#BFDD2C", // Lemon Lime
  "#FFB400", // Amber Flame
  "#D97706", // Amber / Milk Tea Gold
  "#DDA7B2", // Soft Blossom
  "#00A6ED", // Fresh Sky
  "#7C3AED", // Royal Purple
  "#09BC8A", // Mint Leaf
  "#F43F5E", // Crisp Rose Tint
]

const MY_PINS = PINS.filter((p) => p.isMine)
const PIN_COUNT = MY_PINS.length
const PIN_LIMIT = 3

export function MyPins({
  onAddPin,
  onPinSelect,
  onColorChange, // 🚀 ADD THIS PROP
}: {
  onAddPin: () => void
  onPinSelect: (pin: Pin) => void
  onColorChange: (color: string) => void // 🚀 ADD THIS TYPE
}) {
  const [pinColor, setPinColor] = useState("#6366f1")
  const [colorPickerOpen, setColorPickerOpen] = useState(false)

  // 2. Create a helper function to handle updating both local state AND parent state
  const handleColorUpdate = (newColor: string) => {
    console.log("1. MyPins component clicked color:", newColor) // 🚀 ADD THIS LOG
    setPinColor(newColor)
    onColorChange(newColor) // Fire the update event upstream to the map data container!
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header row: title, counter, add button */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h1 className="shrink-0 text-sm font-semibold">My Pins</h1>
        <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          {PIN_COUNT}/{PIN_LIMIT} Pins Used
        </span>
        <button
          onClick={onAddPin}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
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
                style={{ backgroundColor: pinColor }}
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
                {/* 3. Update the preset buttons loop */}
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorUpdate(color)} // 🚀 CHANGE THIS LINE
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
          {MY_PINS.map((pin) => (
            <article
              key={pin.id}
              role="button"
              tabIndex={0}
              onClick={() => onPinSelect(pin)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onPinSelect(pin)
                }
              }}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${pinColor}20` }}
              >
                <MapPin className="size-5" style={{ color: pinColor }} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold">{pin.name}</h3>
                <p className="text-[11px] text-muted-foreground">
                  {pin.neighborhood} · {pin.distanceKm} km away
                </p>
              </div>
              <button>
                <X 
                  className="size-5 stroke-3 shrink-0 rounded-full"
                  style={{ color: pinColor }}
                />
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
