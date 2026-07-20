import { createClient } from "@supabase/supabase-js"
import { Database, Json } from "@/lib/database.types" 
import imageCompression from "browser-image-compression"
import type { DrinkType, Pin } from "@/types/map"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

interface CreatePinParams {
  userId: string
  username: string
  name: string
  coords: google.maps.LatLngLiteral
  status: string
  rating: number
  pinColor: string
  neighborhood: string
  drinkTypes: DrinkType[]
  customDrinks: string[]
  googleDetails?: google.maps.places.PlaceResult | null
  searchValue: string
  imageFile: File | null
}

interface DrinkPayloadItem {
    name: string
    rating: number
    status: string
    user: string
    amenities?: string[]
    [key: string]: Json | undefined
  }

export async function uploadPinImage(userId: string, imageFile: File): Promise<string> {
  const options = {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: "image/webp" as const,
  }

  const compressedBlob = await imageCompression(imageFile, options)
  const fileName = `${userId}-${Date.now()}.webp`
  const webpFile = new File([compressedBlob], fileName, { type: "image/webp" })

  const { error: uploadError } = await supabase.storage
    .from("pin-photos")
    .upload(fileName, webpFile, { contentType: "image/webp" })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from("pin-photos").getPublicUrl(fileName)
  return data.publicUrl
}

export async function insertPin(params: CreatePinParams): Promise<Pin> {
  let publicImageUrl: string | null = null

  if (params.imageFile) {
    publicImageUrl = await uploadPinImage(params.userId, params.imageFile)
  }

  const googleAddress = params.googleDetails?.formatted_address || params.searchValue || "Address not specified"
  const googlePhone = params.googleDetails?.formatted_phone_number || "No phone number available"
  const googleHours = params.googleDetails?.opening_hours?.weekday_text || null

  const drinksPayload: DrinkPayloadItem[] = params.customDrinks.length > 0
    ? params.customDrinks.map((d) => ({
        name: d,
        rating: params.rating,
        status: params.status,
        user: params.username,
      }))
    : [
        {
          name: "Regular Coffee",
          rating: params.rating,
          user: params.username,
          status: params.status,
          amenities: [],
        },
      ]

  const detailsPayload: Json = {
    drinks: drinksPayload,
    drinkTypes: params.drinkTypes,
    rating: params.rating,
    neighborhood: params.neighborhood || "Vancouver",
    created_by: params.username,
    formatted_address: googleAddress,
    formatted_phone_number: googlePhone,
    weekday_text: googleHours,
    photo_url: publicImageUrl,
  }

  const { data, error } = await supabase
    .from("pins")
    .insert([
      {
        name: params.name || params.searchValue.split(",")[0],
        lat: params.coords.lat,
        lng: params.coords.lng,
        user_id: params.userId,
        status: params.status,
        color: params.pinColor || "#6366f1",
        details: detailsPayload,
      },
    ])
    .select()

  if (error) throw error
  if (!data || data.length === 0) throw new Error("No data returned from pin creation.")

  const newPin = data[0]
  return {
    ...newPin,
    isMine: true,
    createdBy: params.username,
    color: params.pinColor || "#6366f1",
    pinColor: params.pinColor || "#6366f1",
  } as unknown as Pin
}