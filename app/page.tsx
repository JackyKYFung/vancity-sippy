"use client"

import { useState } from "react"
import { List, PlusSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { AllPins } from "@/components/allPins"
import { MyPins } from "@/components/myPins"
import { AddPin } from "@/components/addPin"
import { PinDetails } from "@/components/pinDetails"
import { MapCanvas } from "@/components/map-canvas"
import { PINS } from "@/lib/sips-data"
import type { Pin } from "@/lib/sips-data"

type Tab = "all-pins" | "my-pins"
type View = Tab | "add-pin" | "detail"

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "all-pins", label: "All Pins", icon: List },
  { id: "my-pins", label: "My Pins", icon: PlusSquare },
]

function tabForView(view: View, previousTab: Tab): Tab {
  if (view === "all-pins" || view === "my-pins") return view
  if (view === "add-pin") return "my-pins"
  return previousTab
}

export default function Page() {
  const [view, setView] = useState<View>("all-pins")
  const [previousTab, setPreviousTab] = useState<Tab>("all-pins")
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null)

  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({
    lat: 49.2827,
    lng: -123.1207,
  })

  const activeTab = tabForView(view, previousTab)

  const handlePinSelect = (pin: Pin, fromTab: Tab) => {
    setPreviousTab(fromTab)
    setSelectedPin(pin)
    setMapCenter({ lat: pin.lat, lng: pin.lng })
    setView("detail")
  }

  const handleBackFromDetail = () => {
    setView(previousTab)
    setSelectedPin(null)
  }

  const handleTabChange = (tab: Tab) => {
    setView(tab)
    setSelectedPin(null)
  }

  const [pins, setPins] = useState<Pin[]>(PINS);

  // Inside your main Page component function block:
  const handleGlobalColorChange = (newColor: string) => {
    setPins((prevPins) =>
      prevPins.map((pin) => ({
        ...pin,
        color: newColor,
      }))
    );
  };

  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Body: sidebar + map */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex h-full w-full max-w-md flex-col border-r border-border bg-sidebar md:w-[420px] lg:w-[460px]">
          <header className="shrink-0 border-b border-border bg-sidebar">
            <div className="px-4 py-4 text-center">
              <h1 className="text-lg font-semibold tracking-tight">Vancity Sippy</h1>
            </div>
            <nav className="flex items-center gap-1 border-t border-border px-3 py-2">
              {TABS.map((t) => {
                const Icon = t.icon
                const isActive = activeTab === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => handleTabChange(t.id)}
                    className={cn(
                      "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="size-3.5" />
                    {t.label}
                  </button>
                )
              })}
            </nav>
          </header>
          <div className="min-h-0 flex-1">
            <div className={cn("h-full", view !== "all-pins" && "hidden")}>
              <AllPins onPinSelect={(pin) => handlePinSelect(pin, "all-pins")} />
            </div>

            <div className={cn("h-full", view !== "my-pins" && "hidden")}>
              <MyPins
                onAddPin={() => setView("add-pin")}
                onPinSelect={(pin) => handlePinSelect(pin, "my-pins")}
                onColorChange={handleGlobalColorChange}
              />
            </div>

            <div className={cn("h-full", view !== "add-pin" && "hidden")}>
              <AddPin
                onLocationSelect={(coords) => setMapCenter(coords)}
              />
            </div>

            <div className={cn("h-full", view !== "detail" && "hidden")}>
              {selectedPin && (
                <PinDetails pin={selectedPin} onBack={handleBackFromDetail} />
              )}
            </div>
          </div>
        </div>

        <div className="relative hidden h-full flex-1 md:block">
          <MapCanvas center={mapCenter} pins={pins} />
        </div>
      </div>
    </main>
  )
}
