"use client"

import { useEffect, useState } from "react"
import { List, PlusSquare, Coffee } from "lucide-react"
import { cn } from "@/lib/utils"
import { AllPins } from "@/components/allPins"
import { MyPins } from "@/components/myPins"
import { AddPin } from "@/components/addPin"
import { PinDetails } from "@/components/pinDetails"
import { MapCanvas } from "@/components/map-canvas"
import { AuthView } from "@/components/auth-view";
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types' // 🟢 Make sure this points to your new file!
import { Pin, VisitStatus } from "@/types/map"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Pass the <Database> type here so the whole app inherits it globally
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

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
  // 1. States & Authenticators
  const [user, setUser] = useState<{ id: string; email: string; username: string; isMaster: boolean } | null>(null)
  const [pins, setPins] = useState<Pin[]>([]) // 🟢 Single, unified pins state
  const [view, setView] = useState<View>("all-pins")
  const [previousTab, setPreviousTab] = useState<Tab>("all-pins")
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null)
  const [hoveredPin, setHoveredPin] = useState<Pin | null>(null)
  const [authMode, setAuthMode] = useState<"guest" | "sign-in" | "register">("guest")
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({
    lat: 49.2827,
    lng: -123.1207,
  })

  // 2. Fetch Pins from Database (🟢 Moved inside the component scope!)
  useEffect(() => {
    async function fetchDatabasePins() {
      const { data, error } = await supabase
        .from("pins")
        .select("*")
        .order("created_at", { ascending: false })
  
      if (error) {
        console.error("Error loading pins: ", error.message)
        return
      }
  
      const formattedPins: Pin[] = (data || []).map((p) => {
        // Safely unpack your JSON details column (fallback to empty object if null)
        const details = (p.details as any) || {}
  
        return {
          id: p.id || "", 
          name: p.name || "Unknown Spot", 
          lat: p.lat ?? 0, 
          lng: p.lng ?? 0, 
          color: p.color || "#6366f1",
          distanceKm: 0, 
          isMine: user ? p.user_id === user.id : false,
  
          // Pull form data out of the jsonb details object
          neighborhood: details.neighborhood || "Vancouver",
          rating: details.rating || 0,
          category: details.drinkTypes || [],
          drink: Array.isArray(details.drinks) ? details.drinks.join(", ") : (details.drinks || "Coffee"),
          createdBy: details.created_by || "anonymous",
  
          // 🟢 FIX: Map the remaining fields your strict frontend Pin interface demands
          status: (p.status || "want-to-go") as VisitStatus,
          owner: details.created_by || "anonymous",
          amenities: details.amenities || [],
          review: details.review || "",
          details: details // Pass the unpacked details object down if required
        }
      })
  
      setPins(formattedPins)
    }
  
    fetchDatabasePins()
  }, [user]) 

  

  // 3. Sync Authentication Session Changes
  useEffect(() => {
    // 1. Helper function to combine Auth data with database profile data
    const handleUserSession = async (session: any) => {
      if (session?.user) {
        // Query your custom table for the master attribute
        const { data: profile, error } = await supabase
          .from("profiles") // 🟢 Change to your exact profiles table name
          .select("is_master")
          .eq("id", session.user.id)
          .single()

          console.log("Supabase Auth User ID:", session.user.id)
    console.log("Supabase Profiles Row Data Found:", profile)
    if (error) console.error("Database query error:", error)
  
        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          username: session.user.user_metadata?.username || "anonymous",
          isMaster: profile?.is_master ?? false // 🟢 Convert string indicator to clean boolean
        })
      } else {
        setUser(null)
        setView("all-pins")
      }
    }
  
    // 2. Run check on initial mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUserSession(session)
    })
  
    // 3. Listen to auth state transitions (Login, Logout, Token refreshes)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleUserSession(session)
    })
  
    return () => subscription.unsubscribe()
  }, [])

  // 4. Action Handlers
  const handleSignIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
  }

  const handleSignUp = async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username } },
    })
    if (error) {
      alert(error.message)
      return
    }
    alert("Check your email for the confirmation link!")
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error("Error logging out:", error.message)
  }

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

  const handleGlobalColorChange = (newColor: string) => {
    setPins((prevPins) =>
      prevPins.map((pin) => ({ ...pin, color: newColor }))
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
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex h-full w-full max-w-md flex-col border-r border-border bg-sidebar md:w-[350px] lg:w-[380px]">
          <header className="shrink-0 border-b border-border bg-sidebar">
            <div className="px-4 py-4 text-center">
              <h1 className="text-xl font-semibold tracking-tight">Vancity Sippy</h1>
              <p className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground max-w-[250px] mx-auto mt-3">
                <span>Share your favourite sipping spots</span>
                <Coffee className="size-3.5 shrink-0" />
              </p>
            </div>
            
            <div className="w-full p-4 border-t border-gray-800">
              {!user ? (
                <>
                  {authMode === "guest" ? (
                    <div className="py-5 text-center space-y-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setAuthMode("sign-in")}
                          className="flex-1 bg-card border border-border py-2 text-xs font-semibold rounded-xl hover:bg-accent transition-colors"
                        >
                          Sign In
                        </button>
                        <button 
                          onClick={() => setAuthMode("register")}
                          className="flex-1 bg-primary hover:bg-amber-400 text-primary-foreground py-2 text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity"
                        >
                          Register
                        </button>
                      </div>
                    </div>
                  ) : (
                    <AuthView 
                      mode={authMode} 
                      onBack={() => setAuthMode("guest")}
                      onSignIn={handleSignIn}
                      onSignUp={handleSignUp}
                    />
                  )}
                </>
              ) : (
                <div className="flex flex-col h-full">
                  <div>
                    <button 
                      onClick={handleSignOut}
                      className="w-full py-2 px-4 bg-[#B80000] hover:bg-[#FF0000] text-white font-medium text-sm rounded-xl text-center transition-all"
                    >
                      Sign Out
                    </button>
                    <nav className="flex items-center gap-1 border-t border-border pt-3">
                      {TABS.map((t) => {
                        const Icon = t.icon
                        const isActive = activeTab === t.id
                        const isDisabled = t.id === "my-pins" && !user

                        return (
                          <button
                            key={t.id}
                            onClick={() => !isDisabled && handleTabChange(t.id)}
                            disabled={isDisabled}
                            className={cn(
                              "inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-1.5 text-[11px] font-medium transition-colors",
                              isDisabled
                                ? "opacity-40 bg-gray-100 text-gray-400 cursor-not-allowed border border-dashed border-gray-200"
                                : isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                            )}
                            title={isDisabled ? "Sign in to track your personal coffee spots" : undefined}
                          >
                            <Icon className="size-3.5" />
                            {t.label}
                          </button>
                        )
                      })}
                    </nav>
                  </div>
                </div>
              )}
            </div>
          </header>

          <div className="min-h-0 flex-1">
            <div className={cn("h-full", view !== "all-pins" && "hidden")}>
              <AllPins
                pins={pins}
                onPinSelect={(pin) => handlePinSelect(pin, "all-pins")}
                onPinHover={setHoveredPin}
              />
            </div>

            <div className={cn("h-full", view !== "my-pins" && "hidden")}>
              <MyPins
                pins={pins}
                setPins={setPins}
                onAddPin={() => setView("add-pin")}
                onPinSelect={(pin) => handlePinSelect(pin, "my-pins")}
                onColorChange={handleGlobalColorChange}
                onPinHover={setHoveredPin}
              />
            </div>

            <div className={cn("h-full", view !== "add-pin" && "hidden")}>
              <AddPin
                onLocationSelect={(coords) => setMapCenter(coords)}
                user={user}
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
          <MapCanvas 
            center={mapCenter} 
            pins={pins} 
            hoveredPin={hoveredPin}
            setHoveredPin={setHoveredPin}
          />
        </div>
      </div>
    </main>
  )
}