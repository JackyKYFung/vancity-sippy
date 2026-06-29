"use client"

import { useState } from "react"
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
  onColorChange,
  onPinHover,
  isMaster,
  pinColor,
  setPinColor,
  onAddClick
}: {
  pins: Pin[]
  setPins: React.Dispatch<React.SetStateAction<Pin[]>>
  onColorChange: (color: string) => void
  onPinHover: (pin: Pin | null) => void
  isMaster: boolean
  pinColor: string
  setPinColor: React.Dispatch<React.SetStateAction<string>>
  onAddClick?: () => void
}) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  
  const myPins = pins.filter((p) => p.isMine)
  const displayLimit = isMaster ? "∞" : PIN_LIMIT;
  const isLimitReached = !isMaster && myPins.length >= PIN_LIMIT;

  const [pinToDelete, setPinToDelete] = useState<string | null>(null)

  const handleColorUpdate = async (newColor: string) => {
    setPinColor(newColor)
    
    setPins((prevPins) =>
      prevPins.map((pin) =>
        pin.isMine ? { ...pin, color: newColor } : pin
      )
    )
  
    onColorChange(newColor)
  
    if (!myPins.length) return
  
    try {
      const currentUserId = (await supabase.auth.getUser()).data.user?.id
      if (!currentUserId) return
  
      const { error } = await (supabase.from("pins") as any)
        .update({ color: newColor })
        .eq("user_id", currentUserId)
  
      if (error) console.error("Error saving color to pins:", error.message)
    } catch (err) {
      console.error("Failed to update pin colors:", err)
    }
  }
  // 🟢 2. The trigger button opens the modal instead of running window.confirm
  const handleDeletePin = (e: React.MouseEvent, pinId: string) => {
    e.stopPropagation()
    setPinToDelete(pinId) 
  }

  // 🟢 3. Your exact database code running only after they confirm in the modal
  const handleConfirmDelete = async () => {
    if (!pinToDelete) return
    
    const pinId = pinToDelete
    setPinToDelete(null) // Close the modal immediately for an instant snappy feel

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
            {myPins.length} / {displayLimit} Pins Used
          </span>
          
          <button
            onClick={onAddClick}
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
              className="relative flex items-center gap-3 rounded-2xl border border-border bg-card p-4 pr-12 transition-colors hover:border-primary/40"
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
                  {pin.neighborhood}
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

      {pinToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xs scale-100 rounded-2xl border border-border bg-card p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-semibold text-foreground">Delete Coffee Spot?</h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              This action cannot be undone. Are you sure you want to remove this pin?
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => setPinToDelete(null)} // Cancel clears state and closes modal
                className="flex-1 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete} // 👈 Executes your exact Supabase delete logic!
                className="flex-1 rounded-xl bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground hover:opacity-90 transition-opacity"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}