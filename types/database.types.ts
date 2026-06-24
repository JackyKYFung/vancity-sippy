export type Pin = {
  id: string
  created_at: string
  name: string
  lat: number
  lng: number
  color: string
  user_id: string
}

export type Database = {
  public: {
    Tables: {
      pins: {
        Row: Pin
        Insert: Omit<Pin, "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Pin, "id">>
      }
    }
  }
}
