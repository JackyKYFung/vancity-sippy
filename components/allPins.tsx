"use client"

import { useState } from "react"
import {
  ArrowUpDown,
  User,
  MapPin,
  ChevronDown,
  Star
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Pin, DrinkType } from "@/types/map"

const drinkTypeColor: Record<string, string> = {
  Coffee: "bg-amber-900/20 text-amber-700 border-amber-700",
  Matcha: "bg-emerald-900/20 text-emerald-700 border-emerald-700",
  Tea: "bg-green-900/20 text-green-700 border-green-700",
  Espresso: "bg-orange-900/20 text-orange-700 border-orange-700",
  "Cold Brew": "bg-stone-900/20text-stone-700 border-stone-700",
  Juice: "bg-lime-900/20 text-lime-700 border-lime-700",
  Milk: "bg-sky-900/20 text-sky-700 border-sky-700",
  Fizzy: "bg-purple-900/20 text-purple-700 border-purple-700",
  Chocolate: "bg-red-900/20 text-red-700 border-red-700",
  Blended: "bg-pink-900/20 text-pink-700 border-pink-700",
}

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
              {(["Coffee", "Matcha", "Tea", "Juice", "Milk", "Fizzy", "Chocolate", "Blended"] as DrinkType[]).map((d) => (
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
            {filteredPins.map((pin, i) => {
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

function FilterChip({
  icon: Icon,
  label,
  active,
  onClick,
  dropdown,
}: {
  icon: React.ElementType
  label: string
  active: boolean
  onClick: () => void
  dropdown?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-between w-full rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors text-left",
        active
          ? "border-primary/50 bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      <div className="flex items-center gap-1.5">
        <Icon className="size-3.5" />
        <span>{label}</span>
      </div>
      {dropdown && <ChevronDown className="size-3 opacity-70" />}
    </button>
  )
}

function PinCard({
  pin,
  creatorName,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  pin: Pin
  featured?: boolean
  creatorName: string
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  const totalLogs = pin.details?.drinks?.length || 1
  const isToVisit = (pin.status as string) === "to-visit" || (pin.status as string) === "to_visit"

  const getCleanCity = () => {
    const fullAddress = pin.details?.formatted_address || pin.details?.address || ""
    if (!fullAddress) return pin.details?.neighborhood || pin.neighborhood || "Vancouver"

    const parts = fullAddress.split(",")
    const bcIndex = parts.findIndex((part: string) => {
      const cleanPart = part.trim().toUpperCase()
      return cleanPart.startsWith("BC") || cleanPart.includes("BRITISH COLUMBIA")
    })

    if (bcIndex > 0) {
      const cityCandidate = parts[bcIndex - 1].trim()
      if (cityCandidate.length > 0) return cityCandidate
    }

    return pin.details?.neighborhood || pin.neighborhood || "Vancouver"
  }

  const displayCity = getCleanCity()
  const displayCategories = (pin.category || (pin as any).drinkTypes || pin.details?.drinkTypes || []) as string[]


  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
      className={cn(
        "group flex relative cursor-pointer flex-col gap-2 rounded-xl border p-3 transition-colors w-full",
        isToVisit 
          ? "border-muted bg-muted/40 opacity-80 hover:border-muted-foreground/30 hover:bg-muted/60" 
          : "border-border bg-card hover:border-primary/40"
      )}>
      <div className="flex items-start justify-between gap-2 w-full">
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="text-xs font-semibold break-words leading-tight text-foreground truncate group-hover:whitespace-normal">
            {pin.name}
          </h3>
          <div>
            {pin.rating > 0 && (
              <div className="flex items-center gap-0.5 text-amber-500 font-bold text-[11px]">
                <span>{pin.rating.toFixed(1)}</span>
                <Star className="size-3 fill-current stroke-current" />
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end text-right text-[10px]">
          <div className="truncate max-w-[80px]">
            {totalLogs >= 2 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Multiple</span>
            ) : (
              <span style={{ color: pin.color }}>@{creatorName}</span>
            )}   
          </div>
          <p className="text-muted-foreground truncate max-w-[70px]">{displayCity}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {displayCategories.slice(0, 2).map((c) => (
          <span
            key={c}
            className={cn(
              "rounded px-1.5 py-0.5 text-[9px] font-medium border", 
              drinkTypeColor[c] || "bg-secondary text-muted-foreground border-border"
            )}
          >
            {c}
          </span>
        ))}
        {displayCategories.length > 2 && (
          <span className="text-[9px] text-muted-foreground px-0.5 py-0.5">+{displayCategories.length - 2}</span>
        )}
      </div>
    </article>
  )
}