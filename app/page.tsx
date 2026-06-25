"use client"

import { useEffect, useState } from "react"
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

  const [user, setUser] = useState<any>(null)
  const handleTestLogin = () => setUser({ email: "test@vancitysips.com" })
  const handleTestLogout = () => {
    setUser(null)           // 1. Wipe the user session state
    setView("all-pins")     // 2. Force the sidebar view back to the public tab
    setSelectedPin(null)    // 3. Clear out any open pin details pane just in case
  }

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

  const [pins, setPins] = useState<Pin[]>(PINS)

  const handleGlobalColorChange = (newColor: string) => {
    setPins((prevPins) =>
      prevPins.map((pin) => ({
        ...pin,
        color: newColor,
      })),
    )
  }

  useEffect(() => {
    if (selectedPin && !pins.some((p) => p.id === selectedPin.id)) {
      setSelectedPin(null)
      setView(previousTab)
    }
  }, [pins, selectedPin, previousTab])

  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Body: sidebar + map */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex h-full w-full max-w-md flex-col border-r border-border bg-sidebar md:w-[350px] lg:w-[380px]">
          <header className="shrink-0 border-b border-border bg-sidebar">
            <div className="px-4 py-4 text-center">
              <h1 className="text-lg font-semibold tracking-tight">Vancity Sippy</h1>
            </div>
            {/* Container under Vancity Sips header */}
            <div className="w-full p-4 border-t border-gray-800">
              {/* Replace !user with real auth state later */}
              {!user ? (
                <div className="flex items-center gap-2 w-full">
                  <button 
                    onClick={handleTestLogin}
                    className="flex-1 py-2 px-4 bg-white border border-gray-200 text-gray-700 font-medium text-sm rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={handleTestLogin}
                    className="flex-1 py-2 px-4 bg-amber-600 text-white font-medium text-sm rounded-xl hover:bg-amber-700 transition-colors shadow-sm"
                  >
                    Register
                  </button>
                </div>
              ) : (
                <div>
                  <button 
                    onClick={handleTestLogout}
                    className="w-full py-2 px-4 bg-[#B80000] hover:bg-[#FF0000] text-white font-medium text-sm rounded-xl text-center transition-all"
                  >
                    Sign Out
                  </button>
                  <nav className="flex items-center gap-1 border-t border-border pt-3">
                      {TABS.map((t) => {
                        const Icon = t.icon
                        const isActive = activeTab === t.id
                        
                        // 🟢 1. Check if this is the "My Pins" tab and if the user is signed out
                        const isDisabled = t.id === "my-pins" && !user

                        return (
                          <button
                            key={t.id}
                            // 🟢 2. Prevent clicking if disabled, otherwise switch tabs normally
                            onClick={() => !isDisabled && handleTabChange(t.id)}
                            // 🟢 3. Apply standard HTML disabled attribute
                            disabled={isDisabled}
                            className={cn(
                              "inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-1.5 text-[11px] font-medium transition-colors",
                              // 🟢 4. Dynamic styling based on state
                              isDisabled
                                ? "opacity-40 bg-gray-100 text-gray-400 cursor-not-allowed border border-dashed border-gray-200"
                                : isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                            )}
                            // 🟢 5. Add a helpful tooltip text when hovering over the locked tab
                            title={isDisabled ? "Sign in to track your personal coffee spots" : undefined}
                          >
                            <Icon className="size-3.5" />
                            {t.label}
                          </button>
                        )
                      })}
                    </nav>
                </div>
                
              )}
            </div>
            

          </header>
          <div className="min-h-0 flex-1">
            <div className={cn("h-full", view !== "all-pins" && "hidden")}>
              <AllPins
                pins={pins}
                onPinSelect={(pin) => handlePinSelect(pin, "all-pins")}
              />
            </div>

            <div className={cn("h-full", view !== "my-pins" && "hidden")}>
              <MyPins
                pins={pins}
                setPins={setPins}
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
                <PinDetails pin={selectedPin} onClose={handleBackFromDetail} />
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
