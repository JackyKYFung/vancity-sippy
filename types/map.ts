// types/map.ts
export type VisitStatus = "want-to-go" | "visited"; // or whatever your actual statuses are

// 🟢 Add your DrinkType definition here
export type DrinkType = "Coffee" | "Matcha" | "Tea" | "Juice" | "Milk" | "Fizzy" | "Chocolate" | "Blended";

export const DRINK_TYPES: DrinkType[] = ["Coffee", "Matcha", "Tea", "Juice", "Milk", "Fizzy", "Chocolate", "Blended"];


export interface Pin {
  id: string;
  name: string;
  lat: number;
  lng: number;
  color: string;
  distanceKm: number;
  isMine: boolean;
  neighborhood: string;
  rating: number;
  category: DrinkType[]; // Upgrading string[] to your strict DrinkType[]
  drink: string;
  createdBy: string;
  status: VisitStatus;
  owner: string;
  review: string;
  photo_url?: string | null;
  details: any;
  created_at?: string
}

export type PinDrink = {
  name: string
  rating: number
  user: string
  status: string
  amenities: string[]
  review: string
  hasPhoto?: boolean
}

export type PinDetailsInfo = {
  drinks: PinDrink[]
}

