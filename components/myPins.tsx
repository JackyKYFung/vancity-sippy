"use client"

import { useState } from "react"
import { ChevronDown, MapPin, Plus } from "lucide-react"
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

  const handleDeletePin = (e: React.MouseEvent, pinId: string) => {
    e.stopPropagation()
    setPinToDelete(pinId) 
  }

  const handleConfirmDelete = async () => {
    if (!pinToDelete) return
    
    const pinId = pinToDelete
    setPinToDelete(null)

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
    <>
      <div className="flex h-full flex-col">
        {/* 🟢 SPLIT BODY WRAPPER: 
          - Mobile: Grid layout with 2 columns (Left: Controls, Right: Cards)
          - Desktop (md): Reverts back to standard full-width stack blocks
        */}
        <div className="grid grid-cols-12 md:grid-cols-1 divide-x divide-border md:divide-x-0 h-full min-h-0">
          
          {/* 🟢 LEFT SECTION: CONTROLS & PICKERS */}
          <div className="col-span-5 flex flex-col gap-3 p-4 border-b md:border-b-0 border-border overflow-y-auto">
            
            {/* TOP ROW: Counter & Add Button side-by-side */}
            <div className="col-span-7 grid grid-cols-2 gap-2 w-full items-center">        
              <span 
                className={cn(
                  "inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-muted px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors text-center h-8",
                  isLimitReached && "border-destructive/30 bg-destructive/10 text-destructive font-semibold"
                )}
              >  
                {myPins.length} / {displayLimit} Pins
              </span>
              
              <button
                onClick={onAddClick}
                disabled={isLimitReached}
                className={cn(
                  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-2 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 h-8",
                  "disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground disabled:opacity-40"
                )}
              >
                <Plus className="size-3.5" />
                Add Pin
              </button>
            </div>

            {/* BOTTOM ROW: Full-width Color Button trigger shelf */}
            <button
              onClick={() => setColorPickerOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium transition-colors hover:bg-accent/50"
            >
              <span className="flex items-center gap-2">
                Color
                <span
                  className="size-3.5 rounded-full border border-border"
                  style={{ backgroundColor: myPins[0]?.color || pinColor }}
                />
              </span>
              <ChevronDown
                className={cn(
                  "size-3.5 text-muted-foreground transition-transform",
                  colorPickerOpen && "rotate-180",
                )}
              />
            </button>

            {/* ACCORDION COLOR PICKER DROPDOWN */}
            {colorPickerOpen && (
              <div className="block w-full rounded-xl border border-border bg-card p-3 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorUpdate(color)}
                      className={cn(
                        "size-7 rounded-full border-2 transition-transform hover:scale-110",
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

          {/* 🟢 RIGHT SECTION: SCROLLABLE CARDS CONTAINER */}
          <div className="col-span-7 min-h-0 flex-1 overflow-y-auto p-4 bg-background/30">
            <h2 className="text-xs font-semibold mb-3 text-muted-foreground tracking-tight uppercase">
              My Current Pins
            </h2>
            <div className="flex flex-col gap-2">
              {myPins.map((pin) => (
                <article
                  key={pin.id}
                  onMouseEnter={() => onPinHover(pin)}
                  onMouseLeave={() => onPinHover(null)}
                  className="relative flex items-center gap-3 rounded-xl border border-border bg-card p-3 pr-10 transition-colors hover:border-primary/40"
                >
                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${pin.color || pinColor}20` }}
                  >
                    <MapPin className="size-4" style={{ color: pin.color || pinColor }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-xs font-semibold text-foreground">{pin.name}</h3>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {pin.neighborhood}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDeletePin(e, pin.id)}
                    aria-label={`Delete ${pin.name}`}
                    className="absolute right-2.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-muted text-[10px] font-semibold text-muted-foreground transition-colors hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none"
                  >
                    ✕
                  </button>
                </article>
              ))}
              {myPins.length === 0 && (
                <div className="flex h-32 flex-col items-center justify-center gap-1.5 text-center text-muted-foreground">
                  <MapPin className="size-5 opacity-40" />
                  <p className="text-xs">You haven't saved any spots yet.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* GLOBAL DISMISSAL CONFIRMATION MODAL OVERLAY */}
      {pinToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xs scale-100 rounded-2xl border border-border bg-card p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-semibold text-foreground">Delete Coffee Spot?</h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              This action cannot be undone. Are you sure you want to remove this pin?
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => setPinToDelete(null)}
                className="flex-1 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 rounded-xl bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground hover:opacity-90 transition-opacity"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}