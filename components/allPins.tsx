"use client"

import { useState } from "react"
import { ArrowUpDown, User, MapPin } from "lucide-react"
import { FilterChip } from "./FilterChip"
import { PinCard } from "./PinCard"
import { cn } from "@/lib/utils"
import { Pin, DrinkType } from "@/types/map"
import { ALL_DRINK_TYPES } from "@/lib/constants"


interface AllPinsProps {
  pins: Pin[]
  onPinSelect: (pin: Pin) => void
  onPinHover: (pin: Pin | null) => void
  sortBy: "rating-desc" | "rating-asc" | "distance" | "user" | "newest"
  setSortBy: React.Dispatch<React.SetStateAction<"rating-desc" | "rating-asc" | "distance" | "user" | "newest">>
}

export function AllPins({
  pins,
  onPinSelect,
  onPinHover,
  sortBy,
  setSortBy,
}: AllPinsProps) {
  const [drinkFilters, setDrinkFilters] = useState<DrinkType[]>([])
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [selectedUserFilter, setSelectedUserFilter] = useState<string | null>(null)

  const toggleDrink = (d: DrinkType) =>
    setDrinkFilters((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))

  

  let filteredPins: Pin[] = pins

  if (drinkFilters.length) {
    filteredPins = filteredPins.filter((p) => {
      const pinCategories = p.category || (p as any).drinkTypes || p.details?.drinkTypes || []
      return pinCategories.some((c) => drinkFilters.includes(c as DrinkType))
    })
  }

  if (selectedUserFilter) {
    filteredPins = filteredPins.filter((p) => {
      const creator = p.createdBy || p.details?.created_by || "anonymous"
      return creator === selectedUserFilter
    })
  }
  
  const uniqueUsers = Array.from(
    new Map(
      pins.map((p) => {
        const username = p.createdBy || p.details?.created_by || "anonymous"
        const userColor = p.color || "#6366f1"
        return [username, { username, color: userColor }]
      })
    ).values()
  )

  return (
    <div className="flex h-full flex-col">
      {/* 
        🟢 SPLIT BODY WRAPPER: 
        - Mobile: Grid layout with 2 columns (Left: Controls, Right: Cards)
        - Desktop (md): Reverts back to standard full-width stack blocks
      */}
      <div className="grid grid-cols-12 md:grid-cols-1 divide-x divide-border md:divide-x-0 h-full min-h-0">
        
        {/* 🟢 LEFT SECTION: SORT & FILTERS */}
        <div className="col-span-5 flex flex-col gap-4 overflow-y-auto px-3 py-4 border-b md:border-b-0 border-border">
          <div>
            <p className="mb-2 text-xs font-semibold text-foreground">Sort By:</p>
            <div className="flex flex-col gap-2">
              {/* 🟢 TOP ROW: Rating & Distance side-by-side */}
              <div className="grid grid-cols-2 gap-2 w-full">
                <FilterChip 
                  icon={ArrowUpDown} 
                  label={`Rating ${sortBy === "rating-desc" ? "(H-L)" : sortBy === "rating-asc" ? "(L-H)" : ""}`} 
                  active={sortBy.startsWith("rating")} 
                  onClick={() => {
                    if (sortBy === "rating-desc") setSortBy("rating-asc")
                    else if (sortBy === "rating-asc") setSortBy("newest")
                    else setSortBy("rating-desc")
                  }} 
                />
                <FilterChip 
                  icon={MapPin} 
                  label="Distance" 
                  active={sortBy === "distance"} 
                  onClick={() => setSortBy(sortBy === "distance" ? "newest" : "distance")} 
                />
              </div>

              {/* 🟢 BOTTOM ROW: Full-width User dropdown wrapper */}
              <div className={cn(
                "flex flex-col rounded-xl border border-border bg-card transition-all duration-200 w-full mt-1",
                isUserDropdownOpen ? "gap-1" : "p-0"
              )}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors w-full text-left",
                    selectedUserFilter || isUserDropdownOpen
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <User className="size-3.5 shrink-0" />
                    <span className="truncate">
                      {selectedUserFilter ? `${selectedUserFilter}` : "User"}
                    </span>
                  </div>
                  <span className={cn(
                    "text-[10px] transition-transform duration-200 font-mono ml-2 shrink-0",
                    isUserDropdownOpen ? "rotate-180" : ""
                  )}>
                    ▼
                  </span>
                </button>

                {isUserDropdownOpen && (
                  <div className="flex flex-col max-h-40 overflow-y-auto px-1 pb-1 animate-in slide-in-from-top-2 duration-150">
                    <button 
                      onClick={() => {
                        setSelectedUserFilter(null)
                        setIsUserDropdownOpen(false)
                      }}
                      className={cn(
                        "w-full text-left rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground",
                        !selectedUserFilter && "bg-secondary text-foreground font-semibold"
                      )}
                    >
                      All Users
                    </button>
                    
                    {uniqueUsers.map((u) => (
                      <button
                        key={u.username}
                        onClick={() => {
                          setSelectedUserFilter(u.username)
                          setIsUserDropdownOpen(false)
                        }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors text-foreground hover:bg-secondary",
                          selectedUserFilter === u.username && "bg-secondary font-semibold"
                        )}
                      >
                        <span className="truncate mr-2">{u.username}</span>
                        <span 
                          className="size-2 rounded-full border border-white/10 shadow-sm shrink-0" 
                          style={{ backgroundColor: u.color }} 
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-foreground">Filter Drinks By:</p>
            <div className="flex flex-wrap items-center gap-1.5">
              {ALL_DRINK_TYPES.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDrink(d)}
                  className={cn(
                    "rounded-full border px-2 py-1 text-[10px] font-medium transition-colors",
                    drinkFilters.includes(d)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 🟢 RIGHT SECTION: SCROLLABLE CARDS GRID */}
        <div className="col-span-7 min-h-0 flex-1 overflow-y-auto p-4 bg-background/100">
          <div className="flex flex-col gap-2">
          {[...filteredPins]
            .sort((a, b) => {
              const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
              const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
              
              if (dateA && dateB) return dateB - dateA
              return String(b.id).localeCompare(String(a.id))
            })
            .map((pin, i) => {
              const creatorName = pin.createdBy || pin.details?.created_by || "anonymous"
              return (
                <PinCard
                  key={pin.id}
                  pin={pin}
                  creatorName={creatorName}
                  featured={i === 0}
                  onClick={() => onPinSelect(pin)}
                  onMouseEnter={() => onPinHover(pin)}
                  onMouseLeave={() => onPinHover(null)}
                />
              )
            })}
          </div>
          {filteredPins.length === 0 && (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <MapPin className="size-6 opacity-50" />
              <p className="text-sm">No spots match.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
