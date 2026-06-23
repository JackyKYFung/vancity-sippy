"use client"

import { useEffect } from "react"
import { Map, useMap } from "@vis.gl/react-google-maps"
import { Navigation, Plus, Minus, Layers } from "lucide-react"

interface MapCanvasProps {
  center: google.maps.LatLngLiteral
}

// 1. This component sits INSIDE the Map provider, safely executing the camera pan
function MapCameraControl({ center }: { center: google.maps.LatLngLiteral }) {
  const map = useMap()

  useEffect(() => {
    console.log("MapCameraControl detected a center change:", center)
    console.log("Is map instance ready?", !!map)

    if (map && center) {
      // Force pan executing on Google's native instance thread
      map.panTo(center)
      map.setZoom(15)
    }
  }, [center, map])

  return null
}

// 2. This component sits INSIDE the Map provider to power the floating buttons
function MapControlsOverlay({ fallbackCenter }: { fallbackCenter: google.maps.LatLngLiteral }) {
  const map = useMap()

  return (
    <>
      {/* Zoom Controls */}
      <div className="absolute right-4 top-4 flex flex-col overflow-hidden rounded-xl border border-border bg-card/80 backdrop-blur">
        <button 
          onClick={() => map && map.setZoom((map.getZoom() || 13) + 1)}
          className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Plus className="size-4" />
        </button>
        <div className="h-px bg-border" />
        <button 
          onClick={() => map && map.setZoom((map.getZoom() || 13) - 1)}
          className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Minus className="size-4" />
        </button>
      </div>
      
      {/* Target/Layers Panel Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button className="flex size-9 items-center justify-center rounded-xl border border-border bg-card/80 text-muted-foreground backdrop-blur transition-colors hover:bg-accent hover:text-foreground">
          <Layers className="size-4" />
        </button>
        <button 
          onClick={() => map && map.panTo(fallbackCenter)}
          className="flex size-9 items-center justify-center rounded-xl border border-border bg-card/80 text-muted-foreground backdrop-blur transition-colors hover:bg-accent hover:text-foreground"
        >
          <Navigation className="size-4" />
        </button>
      </div>
    </>
  )
}

export function MapCanvas({ center }: MapCanvasProps) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[oklch(0.13_0.004_286)]">
      <Map
        defaultZoom={13}
        defaultCenter={center}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
      >
        {/* Active controls living inside the context pipeline */}
        <MapCameraControl center={center} />
        <MapControlsOverlay fallbackCenter={center} />
      </Map>
    </div>
  )
}