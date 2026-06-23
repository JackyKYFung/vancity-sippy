"use client"

import { useState } from "react"
import { List, PlusSquare, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { ListView } from "@/components/list-view"
import { AddPinView } from "@/components/add-pin-view"
import { DetailView } from "@/components/detail-view"
import { MapCanvas } from "@/components/map-canvas"

type View = "list" | "add" | "detail"

const VIEWS: { id: View; label: string; icon: React.ElementType }[] = [
  { id: "list", label: "List View", icon: List },
  { id: "add", label: "Add Pin", icon: PlusSquare },
  { id: "detail", label: "Detail View", icon: FileText },
]

export default function Page() {
  const [view, setView] = useState<View>("list")

  // 1. Initialize global map center state (Defaulting to downtown Vancouver)
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({
    lat: 49.2827,
    lng: -123.1207,
  })

  return (
    <main className="flex h-dvh w-full overflow-hidden bg-background text-foreground">
      {/* Left sidebar */}
      <div className="flex h-full w-full max-w-md flex-col border-r border-border bg-sidebar md:w-[420px] lg:w-[460px]">
        {/* Mockup view switcher */}
        <div className="flex items-center gap-1 border-b border-border px-3 py-2">
          <span className="mr-1 hidden text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:inline">
            Mockup
          </span>
          {VIEWS.map((v) => {
            const Icon = v.icon
            return (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors",
                  view === v.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {v.label}
              </button>
            )
          })}
        </div>

{/* Active view container with persistent layout channels */}
          <div className="min-h-0 flex-1">
            <div className={cn("h-full", view !== "list" && "hidden")}>
              <ListView onAddLocation={() => setView("add")} />
            </div>
            
            <div className={cn("h-full", view !== "add" && "hidden")}>
              <AddPinView onLocationSelect={(coords) => {
                console.log("Parent component received coordinates:", coords);
                setMapCenter(coords);
              }} />
            </div>
            
            <div className={cn("h-full", view !== "detail" && "hidden")}>
              <DetailView />
            </div>
          </div>
        </div>

      {/* Right map canvas */}
      <div className="relative hidden h-full flex-1 md:block">
        {/* 3. Pass the active center state over to your MapCanvas */}
        <MapCanvas center={mapCenter} />
      </div>
    </main>
  )
}