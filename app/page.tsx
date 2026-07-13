"use client"

import { useEffect, useState } from "react"
import { List, PlusSquare, Coffee } from "lucide-react"
import { cn } from "@/lib/utils"
import { AllPins } from "@/components/allPins"
import { MyPins } from "@/components/myPins"
import { PinDetails } from "@/components/pinDetails"
import { MapCanvas } from "@/components/map-canvas"
import { AuthView } from "@/components/auth-view";
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types' 
import { Pin, VisitStatus } from "@/types/map"
import Image from "next/image"
import dynamic from "next/dynamic"

// supabase related 
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

type Tab = "all-pins" | "my-pins"
type View = Tab | "add-pin" | "detail"

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "all-pins", label: "All Pins", icon: List },
  { id: "my-pins", label: "My Pins", icon: PlusSquare },
]

const AddPin = dynamic(() => import("@/components/addPin").then((mod) => mod.AddPin), {
  ssr: false, // Disables server-side rendering execution for the modal
})

function tabForView(view: View, previousTab: Tab): Tab {
  if (view === "all-pins" || view === "my-pins") return view
  if (view === "add-pin") return "my-pins"
  return previousTab
}

export default function Page() {
  // 1. States & Authenticators
  const [user, setUser] = useState<{ id: string; email: string; username: string; isMaster: boolean } | null>(null)
  const [pins, setPins] = useState<Pin[]>([]) 
  const [view, setView] = useState<View>("all-pins")
  const [previousTab, setPreviousTab] = useState<Tab>("all-pins")
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null)
  const [hoveredPin, setHoveredPin] = useState<Pin | null>(null)
  const [authMode, setAuthMode] = useState<"guest" | "sign-in" | "register">("guest")
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({
    lat: 49.2827,
    lng: -123.1207,
  })

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const handleLocationSelect = (coords: google.maps.LatLngLiteral) => {
    setMapCenter(coords); // Or whatever your current coordinate state updates look like
  };

  const [pinColor, setPinColor] = useState<string>("#6366f1");
  const [sortBy, setSortBy] = useState<"rating-desc" | "rating-asc" | "distance" | "user" | "newest">("newest")

  const aggregatedPins = [...pins].reduce((acc: Pin[], current) => {
    const existingLoc = acc.find(
      (p) => p.lat.toFixed(4) === current.lat.toFixed(4) && p.lng.toFixed(4) === current.lng.toFixed(4)
    )
  
    // 🟢 Cast status to string to satisfy TypeScript's strict zero-overlap rules
    const currentRawRating = typeof current.rating === 'number' ? current.rating : 0;
    const currentStatusStr = String(current.status).toLowerCase();
    
    const isToVisit = 
      currentStatusStr === "to-visit" || 
      currentStatusStr === "to_visit" || 
      currentStatusStr === "want-to-go" ||
      currentStatusStr === "want_to_go";

    if (existingLoc) {
      const existingDrinks = existingLoc.details?.drinks || []
      const incomingDrinks = (current.details?.drinks || []).map((d: any) => ({
        ...(typeof d === 'string' ? { name: d } : d),
        user: current.createdBy || "anonymous",
        userColor: current.color,
        rating: typeof d?.rating === 'number' ? d.rating : (currentRawRating > 0 ? currentRawRating : 5)
      }))
  
      if (existingLoc.details) {
        existingLoc.details.drinks = [...existingDrinks, ...incomingDrinks]
      }

      // 🟢 Filter out bucket list logs using the normalized string check
      const allMergedDrinks = existingLoc.details?.drinks || []
      const visitedDrinks = allMergedDrinks.filter((d: any) => {
        const drinkStatus = String(d?.status || "").toLowerCase();
        return drinkStatus !== "to-visit" && drinkStatus !== "to_visit" && drinkStatus !== "want-to-go";
      });

      if (visitedDrinks.length > 0) {
        const sum = visitedDrinks.reduce((accSum: number, d: any) => accSum + (Number(d.rating) || 0), 0)
        const average = parseFloat((sum / visitedDrinks.length).toFixed(1))
        
        existingLoc.rating = average 
        if (existingLoc.details) {
          existingLoc.details.rating = average 
        }
      } else {
        existingLoc.rating = 0
        if (existingLoc.details) {
          existingLoc.details.rating = 0
        }
      }     

    } else {
      // (The rest of your "else" block code remains exactly the same as before!)
      const initialDrinks = (current.details?.drinks || []).map((d: any) => ({
        ...(typeof d === 'string' ? { name: d } : d),
        user: current.createdBy || "anonymous",
        userColor: current.color,
        rating: typeof d?.rating === 'number' ? d.rating : (currentRawRating > 0 ? currentRawRating : 5)
      }))

      // If it's a bucket list item, baseline is strictly 0
      const baseRating = isToVisit 
        ? 0 
        : initialDrinks.length > 0 
          ? parseFloat((initialDrinks.reduce((s: number, d: any) => s + (Number(d.rating) || 0), 0) / initialDrinks.length).toFixed(1))
          : currentRawRating

      acc.push({
        ...current,
        neighborhood: current.details?.neighborhood || current.neighborhood, 
        details: current.details ? { 
          ...current.details, 
          drinks: (current.details.drinks || []).map((d: any) => ({
            ...(typeof d === 'string' ? { name: d } : d),
            user: current.createdBy || "anonymous",
            userColor: current.color
          }))
        } : {
          drinks: [{
            name: current.drink || "Regular Coffee",
            rating: current.rating || 5,
            user: current.createdBy || "anonymous",
            status: current.status || "visited",
            review: current.review || "Saved entry log.",
            userColor: current.color
          }]
        }
      })
    }
    return acc
  }, [])

  const sortedPins = aggregatedPins.sort((a, b) => {
    if (sortBy === "rating-desc") return (b.details?.rating || b.rating || 0) - (a.details?.rating || a.rating || 0)
    if (sortBy === "rating-asc") return (a.details?.rating || a.rating || 0) - (b.details?.rating || b.rating || 0)
    if (sortBy === "distance") return (a.distanceKm || 0) - (b.distanceKm || 0)
    return String(b.id).localeCompare(String(a.id))
  })

  // 🟢 1. Define the reusable fetcher function outside the hook
  const refreshPins = async () => {
    const { data, error } = await supabase
      .from("pins")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error loading pins: ", error.message)
      return
    }

    let userSavedColor: string | null = null;

    const formattedPins: Pin[] = (data || []).map((p) => {
      const details = (p.details as any) || {}
      const isMine = user ? p.user_id === user.id : false;

      if (isMine && p.color) {
        userSavedColor = p.color;
      }

      return {
        id: p.id || "", 
        name: p.name || "Unknown Spot", 
        lat: p.lat ?? 0, 
        lng: p.lng ?? 0, 
        color: p.color || "#6366f1",
        distanceKm: 0, 
        isMine: isMine,
        created_at: p.created_at,

        neighborhood: details.neighborhood || "Vancouver",
        rating: details.rating || 0,
        category: details.drinkTypes || [],
        drink: Array.isArray(details.drinks) ? details.drinks.join(", ") : (details.drinks || "Coffee"),
        createdBy: details.created_by || "anonymous",

        status: (p.status || "want-to-go") as VisitStatus,
        owner: details.created_by || "anonymous",
        review: details.review || "",
        details: details
      }
    })

    setPins(formattedPins)

    if (userSavedColor) {
      setPinColor(userSavedColor);
    }

    // grabbing the coords of newest created pin to use as default coord for initial loads
    if (formattedPins.length > 0) {
      const mostRecentPin = formattedPins[0]; // Since the DB query is ordered by created_at DESC
      setMapCenter({
        lat: mostRecentPin.lat,
        lng: mostRecentPin.lng
      });
    }
  }

  // 🟢 2. Keep your initial mount fetch hooked up
  useEffect(() => {
    refreshPins()
  }, [user])

  // 3. Sync Authentication Session Changes
  useEffect(() => {
    const handleUserSession = async (session: any) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles") 
          .select("is_master")
          .eq("id", session.user.id)
          .single()
  
        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          username: session.user.user_metadata?.username || "anonymous",
          isMaster: profile?.is_master ?? false 
        })
      } else {
        setUser(null)
        setView("all-pins")
      }
    }
  
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUserSession(session)
    })
  
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
      prevPins.map((pin) => 
        pin.isMine ? { ...pin, color: newColor } : pin
      )
    )
  }

  useEffect(() => {
    if (selectedPin && !pins.some((p) => p.id === selectedPin.id)) {
      setSelectedPin(null)
      setView(previousTab)
    }
  }, [pins, selectedPin, previousTab])

  return (
    <main className="flex h-dvh w-full flex-col md:flex-row overflow-hidden bg-background text-foreground relative">
      
      {/* 🌟 MOBILE ONLY FLOATING PILL */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex md:hidden items-center gap-3 bg-background/80 backdrop-blur-md border border-border px-4 py-2 rounded-2xl shadow-xl max-w-[90vw] pointer-events-auto">
        <div className="flex items-center gap-1.5 border-r border-border pr-3 shrink-0">
          <Image src="/Vancity-Sippy-Logo.svg" alt="Logo" width={11} height={11} priority />
          <h1 className="text-xs font-bold tracking-tight">Vancity Sippy</h1>
        </div>
  
        {user ? (
          <div className="flex flex-row items-center gap-1 whitespace-nowrap min-w-0 text-xs">
            <span className="text-muted-foreground">Welcome back,</span>
            <span className="font-bold truncate max-w-[100px]" style={{ color: pinColor }}>
              {user.username}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Share your favourite spots
          </span>
        )}
      </div>
  
      {/* MAIN CONTENT PIPELINE WRAPPER */}
      <div className="flex flex-col md:flex-row min-h-0 flex-1 overflow-hidden">
  
        {/* 📋 SIDEBAR / BOTTOM SHEET LAYER */}
        <div className={cn(
          "flex flex-col bg-sidebar transition-all duration-300 shrink-0 z-10 shadow-2xl",
          "order-last md:order-first", 
          "h-[52vh] w-full",
          "md:h-full md:w-[350px] lg:w-[380px] md:max-w-md md:border-r border-border"
        )}>  
          
          {/* SIDEBAR HEADER */}
          {/* 🟢 FIXED: Fixed top padding on mobile so navigation items don't hide under the floating pill header */}
          <header className="shrink-0 bg-sidebar border-b border-border p-3 md:p-4">
            
            {/* 🌟 DESKTOP ONLY BRANDING & WELCOME SECTION */}
            <div className="hidden md:flex flex-col items-center justify-center text-center mb-4 w-full">
              <div className="flex items-center gap-1.5 pr-3 shrink-0">
                <Image src="/Vancity-Sippy-Logo.svg" alt="Logo" width={15} height={15} priority />
                <h1 className="text-xl font-semibold tracking-tight">Vancity Sippy</h1>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                {user ? (
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <span>Welcome back,</span>
                    <span className="font-bold" style={{ color: pinColor }}>{user.username}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span>Share your favourite sipping spots</span>
                    <Coffee className="size-3.5 shrink-0" />
                  </div>
                )}
              </div>
            </div>
  
            {!user ? (
              authMode === "guest" ? (
                <div className="flex gap-2 w-full">
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
              ) : (
                <AuthView 
                  mode={authMode} 
                  onBack={() => setAuthMode("guest")}
                  onSignIn={handleSignIn}
                  onSignUp={handleSignUp}
                />
              )
            ) : (
              /* Navigation tabs bar + sign-out anchor */
              <div className="flex flex-row md:flex-col items-center justify-between md:items-stretch gap-3 w-full">
                {/* Tabs */}
                <nav className="flex items-center gap-1 w-auto md:w-full md:border-t md:border-border md:pt-4">
                  {TABS.map((t) => {
                    const Icon = t.icon
                    const isActive = activeTab === t.id
                    const isDisabled = t.id === "my-pins" && !user
  
                    const [firstWord, secondWord] = t.label.split(' ')
  
                    return (
                      <button
                        key={t.id}
                        onClick={() => !isDisabled && handleTabChange(t.id)}
                        disabled={isDisabled}
                        className={cn(
                          "inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors whitespace-nowrap",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        )}
                      >
                        <Icon className="size-3.5" />
                        <span>
                          {firstWord}{' '}
                          <span className="hidden min-[380px]:inline md:inline">{secondWord}</span>
                        </span>
                      </button>
                    )
                  })}
                </nav>
  
                {/* Sign Out */}
                <button 
                  onClick={handleSignOut}
                  className="w-auto md:w-full py-1.5 px-3 md:py-2 md:px-4 bg-[#B80000] hover:bg-[#FF0000] text-white font-medium text-xs md:text-sm rounded-xl text-center transition-all shrink-0"
                >
                  Sign Out
                </button>
              </div>
            )}
          </header>
  
          {/* View lists (AllPins, MyPins, PinDetails) */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className={cn("h-full", view !== "all-pins" && "hidden")}>
              <AllPins
                pins={sortedPins}
                onPinSelect={(pin) => handlePinSelect(pin, "all-pins")}
                onPinHover={setHoveredPin}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            </div>

            <div className={cn("h-full", view !== "my-pins" && "hidden")}>
              <MyPins
                pins={pins}
                setPins={setPins}
                pinColor={pinColor} 
                setPinColor={setPinColor} 
                isMaster={user?.isMaster || false}
                onPinHover={setHoveredPin}
                onColorChange={(newColor) => {
                  handleGlobalColorChange(newColor);
                  setPinColor(newColor); 
                }}
                onAddClick={() => setIsAddModalOpen(true)} // 💻 Wire this callback to flip state!
                onDeleteSuccess={refreshPins}
                 />
            </div>

            <div className={cn("h-full", view !== "detail" && "hidden")}>
              {selectedPin && (
                <PinDetails pin={selectedPin} onClose={handleBackFromDetail} />
              )}
            </div>
          </div>
        </div> {/* 🟢 FIXED: Closed the sidebar block cleanly right here */}
  
        {/* 🗺️ MAP WINDOW LAYER */}
        {/* 🟢 FIXED: Moved it completely outside of the sidebar so it stands side-by-side on desktop */}
        <div className="relative h-[48vh] w-full md:h-full md:flex-1 order-first md:order-none">  
          <MapCanvas 
            center={mapCenter} 
            pins={pins} 
            hoveredPin={hoveredPin}
            setHoveredPin={setHoveredPin}
            onPinSelect={(pin) => {
              handlePinSelect(pin, activeTab)
            }}
          />
        </div>

        <AddPin
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onLocationSelect={handleLocationSelect} 
                user={user}
                pinColor={pinColor}
                setPins={setPins}
                onSuccess={refreshPins}
              />  

      </div>
    </main>
  )
}