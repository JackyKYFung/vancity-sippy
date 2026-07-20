// src/components/map/constants.ts
import { DrinkType } from "@/types/map"

export const DRINK_TYPE_COLORS: Record<string, string> = {
  Coffee: "bg-amber-900/20 text-amber-700 border-amber-700",
  Matcha: "bg-emerald-900/20 text-emerald-700 border-emerald-700",
  Tea: "bg-green-900/20 text-green-700 border-green-700",
  Espresso: "bg-orange-900/20 text-orange-700 border-orange-700",
  "Cold Brew": "bg-stone-900/20 text-stone-700 border-stone-700",
  Juice: "bg-lime-900/20 text-lime-700 border-lime-700",
  Milk: "bg-sky-900/20 text-sky-700 border-sky-700",
  Fizzy: "bg-purple-900/20 text-purple-700 border-purple-700",
  Chocolate: "bg-red-900/20 text-red-700 border-red-700",
  Blended: "bg-pink-900/20 text-pink-700 border-pink-700",
}

export const ALL_DRINK_TYPES: DrinkType[] = [
  "Coffee", "Matcha", "Tea", "Juice", "Milk", "Fizzy", "Chocolate", "Blended"
]

export const PIN_LIMIT = 3 as const

export const PRESET_COLORS = [
  "#BFDD2C",
  "#FFB400",
  "#D97706",
  "#00A6ED",
  "#7C3AED",
  "#09BC8A",
  "#F43F5E",
] as const

export type PresetColor = (typeof PRESET_COLORS)[number]