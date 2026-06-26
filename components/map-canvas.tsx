"use client"

import { useEffect, useState } from "react"
import { Map, useMap, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps"
import { Navigation, Plus, Minus, Layers, Coffee, MapPin } from "lucide-react"
import type { Pin } from "@/lib/sips-data"


interface MapCanvasProps {
  center: google.maps.LatLngLiteral
  pins: Pin[]
  hoveredPin: Pin | null
  setHoveredPin: (pin: Pin | null) => void
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

export function MapCanvas({ center, pins = [], hoveredPin, setHoveredPin }: MapCanvasProps) { 
  // console.log("MapCanvas received pins data array:", pins)
  // 🟢 2. State hook to track the currently hovered coffee spot marker
  
  return (
    <div className="relative h-full w-full overflow-hidden bg-[oklch(0.13_0.004_286)]">
      <Map
        defaultZoom={13}
        defaultCenter={center}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        mapId="cd6cc0d22db45621f4d852e8"
        colorScheme="DARK"
      >
        {/* Active controls living inside the context pipeline */}
        <MapCameraControl center={center} />
        <MapControlsOverlay fallbackCenter={center} />
        {pins.map((pin) => (
          <AdvancedMarker
            key={`${pin.id}-${pin.color || 'default'}`}
            position={{ lat: Number(pin.lat), lng: Number(pin.lng) }}
            title={pin.name}
          >
            {/* Custom Pin layout without the inner Lucide circle overlap */}
            <div 
              onMouseEnter={() => setHoveredPin(pin)}
              onMouseLeave={() => setHoveredPin(null)}
              className="relative flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-110 group">
              
              {/* 📍 The Main Teardrop Pin Body */}
              <div 
                className="flex size-9 items-center justify-center rounded-full border-2 border-white shadow-xl transition-colors duration-150"
                style={{ backgroundColor: pin.color || '#6366f1' }}
              >
                {/* ☕ The Coffee Icon sits beautifully in the smooth center */}
                <Coffee className="size-4 text-white fill-white/10" />
              </div>

              {/* 📐 The Triangle Point at the bottom of the pin */}
              <div 
                className="size-2.5 -mt-1.5 rotate-45 border-r-2 border-b-2 border-white shadow-sm"
                style={{ backgroundColor: pin.color || '#6366f1' }}
              />
              
              {/* Soft Ground Shadow */}
              <div className="absolute -bottom-2 size-2.5 rounded-full bg-black/30 blur-[1px]" />
            </div>
          </AdvancedMarker>
        ))}

{/* 🟢 Render a completely custom HTML popup using a dedicated AdvancedMarker */}
{hoveredPin && (
          <AdvancedMarker
            position={{ lat: Number(hoveredPin.lat), lng: Number(hoveredPin.lng) }}
            // Keeps the popup stacked cleanly on top of other elements
            zIndex={999}
          >
            {/* Tailwind Absolute positioning handles pushing this up above the 
              coffee pin icon naturally without dealing with Google's pixelOffset arrays.
            */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-none select-none">
              {/* Outer Wrapper: Pure HTML styled with Tailwind */}
              <div className="relative flex flex-col items-center bg-black backdrop-blur-sm border border-zinc-800 text-zinc-100 rounded-xl px-3 py-2 shadow-2xl min-w-[140px] max-w-[200px]">
                
                {/* 📝 Info Content */}
                <h4 className="font-bold text-xs font-sans leading-snug truncate text-white w-full text-center">
                  {hoveredPin.name}
                </h4>
                <p className="text-[10px] font-sans text-zinc-400 mt-0.5 whitespace-nowrap">
                  Created by <span className="font-semibold text-amber-500">@{hoveredPin.createdBy || "anonymous"}</span>
                </p>

                {/* 📐 Custom Dark Triangle Pointer Arrow stem at the bottom */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-2 rotate-45 bg-zinc-950 border-r border-b border-zinc-800" />
              </div>
            </div>
          </AdvancedMarker>
        )}
      </Map>
    </div>
  )
}
