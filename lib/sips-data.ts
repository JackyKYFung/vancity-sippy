export type DrinkType = "Coffee" | "Tea" | "Matcha" | "Fruit" | "Blended"

export type VisitStatus = "visited" | "to-visit"

export type Amenities = {
  outlets: boolean
  ampleSeating: boolean
  quiet: boolean
}

export type Pin = {
  id: string
  name: string
  lat: number
  lng: number
  rating: number
  distanceKm: number
  category: DrinkType[]
  drink: string
  neighborhood: string
  status: VisitStatus
  owner: string
  isMine: boolean
  amenities: Amenities
  review: string
  color?: string
}

export const PINS: Pin[] = [
  {
    id: "1",
    name: "Revolver Coffee",
    lat: 49.2834,
    lng: -123.1089,
    rating: 4.5,
    distanceKm: 1.2,
    category: ["Coffee"],
    drink: "Cortado, single origin",
    neighborhood: "Gastown",
    status: "visited",
    owner: "jacky",
    isMine: true,
    amenities: { outlets: true, ampleSeating: false, quiet: true },
    review: "Impeccable pour-over program. Tight on seats during the lunch rush but the espresso is worth the wait.",
  },
  {
    id: "2",
    name: "Matchstick Riley Park",
    lat: 49.2456,
    lng: -123.1012,
    rating: 4.0,
    distanceKm: 2.8,
    category: ["Coffee", "Matcha"],
    drink: "Ceremonial matcha latte",
    neighborhood: "Riley Park",
    status: "visited",
    owner: "jacky",
    isMine: true,
    amenities: { outlets: true, ampleSeating: true, quiet: false },
    review: "Bright, airy room with tons of tables and outlets. Great spot to camp with a laptop for a few hours.",
  },
  {
    id: "3",
    name: "O5 Tea Bar",
    lat: 49.2689,
    lng: -123.1543,
    rating: 5.0,
    distanceKm: 3.4,
    category: ["Tea"],
    drink: "Aged white peony",
    neighborhood: "Kitsilano",
    status: "to-visit",
    owner: "mara",
    isMine: false,
    amenities: { outlets: false, ampleSeating: true, quiet: true },
    review: "Curated loose-leaf selection from small farms. A meditative, quiet experience.",
  },
  {
    id: "4",
    name: "Nemesis Coffee",
    lat: 49.2831,
    lng: -123.0994,
    rating: 3.5,
    distanceKm: 0.8,
    category: ["Coffee", "Blended"],
    drink: "Iced shaken espresso",
    neighborhood: "Railtown",
    status: "visited",
    owner: "devon",
    isMine: false,
    amenities: { outlets: false, ampleSeating: false, quiet: false },
    review: "Gorgeous space and lively energy, but loud and hard to find a seat on weekends.",
  },
  {
    id: "5",
    name: "Sago & Co.",
    lat: 49.1666,
    lng: -123.1336,
    rating: 4.5,
    distanceKm: 5.1,
    category: ["Fruit", "Blended"],
    drink: "Mango pomelo sago",
    neighborhood: "Richmond",
    status: "to-visit",
    owner: "jacky",
    isMine: true,
    amenities: { outlets: true, ampleSeating: true, quiet: false },
    review: "On the list — heard the mango pomelo sago is the best in the Lower Mainland.",
  },
]

export const DRINK_TYPES: DrinkType[] = ["Coffee", "Tea", "Matcha", "Fruit", "Blended"]

export const drinkTypeColor: Record<DrinkType, string> = {
  Coffee: "bg-[oklch(0.7_0.12_60)]/15 text-[oklch(0.82_0.12_70)] border-[oklch(0.7_0.12_60)]/30",
  Tea: "bg-[oklch(0.7_0.14_140)]/15 text-[oklch(0.82_0.14_150)] border-[oklch(0.7_0.14_140)]/30",
  Matcha: "bg-[oklch(0.7_0.16_150)]/15 text-[oklch(0.84_0.16_155)] border-[oklch(0.7_0.16_150)]/30",
  Fruit: "bg-[oklch(0.7_0.18_20)]/15 text-[oklch(0.82_0.16_30)] border-[oklch(0.7_0.18_20)]/30",
  Blended: "bg-[oklch(0.66_0.16_300)]/15 text-[oklch(0.8_0.14_310)] border-[oklch(0.66_0.16_300)]/30",
}
