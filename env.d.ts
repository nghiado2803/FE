/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare global {
  interface Window {
    toast: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => void
    confirmDialog?: (message: string) => Promise<boolean>
  }
}

export {}
// Google Maps JS API types (loaded dynamically via script tag)
declare namespace google {
  namespace maps {
    class Map {
      constructor(el: HTMLElement, options: MapOptions)
      setCenter(latlng: LatLngLiteral): void
      panTo(latlng: LatLngLiteral): void
      setZoom(zoom: number): void
      addListener(event: string, handler: (e: MapMouseEvent) => void): void
    }
    class Marker {
      constructor(options: MarkerOptions)
      setMap(map: Map | null): void
      setPosition(latlng: LatLngLiteral): void
      getPosition(): LatLng | null
      addListener(event: string, handler: () => void): void
    }
    class LatLng {
      constructor(lat: number, lng: number)
      lat(): number
      lng(): number
    }
    class Geocoder {
      geocode(request: { placeId?: string; address?: string }, callback: (results: GeocoderResult[] | null, status: string) => void): void
    }
    interface GeocoderResult {
      geometry: { location: LatLng }
    }
    interface MapOptions {
      center: LatLngLiteral
      zoom: number
      disableDefaultUI?: boolean
      zoomControl?: boolean
      mapTypeControl?: boolean
      streetViewControl?: boolean
      fullscreenControl?: boolean
      gestureHandling?: string
      styles?: object[]
      mapId?: string
    }
    interface MarkerOptions {
      position: LatLngLiteral
      map?: Map
      draggable?: boolean
      icon?: string | symbol | MarkerIcon
      label?: MarkerLabel
      title?: string
      zIndex?: number
    }
    interface MarkerIcon {
      path: number | string
      scale?: number
      fillColor?: string
      fillOpacity?: number
      strokeColor?: string
      strokeWeight?: number
      url?: string
    }
    interface MarkerLabel {
      text: string
      color?: string
      fontWeight?: string
      fontSize?: string
    }
    interface LatLngLiteral { lat: number; lng: number }
    interface MapMouseEvent { latLng: LatLng | null }
    enum SymbolPath { CIRCLE = 0, FORWARD_CLOSED_ARROW = 1, FORWARD_OPEN_ARROW = 2, BACKWARD_CLOSED_ARROW = 3, BACKWARD_OPEN_ARROW = 4 }
    namespace marker {
      class AdvancedMarkerElement {
        constructor(options: AdvancedMarkerElementOptions)
        position: LatLngLiteral | LatLng | null
        map: Map | null
        title: string
        addListener(event: string, handler: () => void): void
      }
      interface AdvancedMarkerElementOptions {
        position?: LatLngLiteral | LatLng
        map?: Map
        title?: string
        content?: HTMLElement
        zIndex?: number
      }
      class PinElement {
        constructor(options?: PinElementOptions)
        element: HTMLElement
      }
      interface PinElementOptions {
        background?: string
        borderColor?: string
        glyphColor?: string
        glyph?: string | HTMLElement
        scale?: number
      }
    }
    namespace places {
      class AutocompleteService {
        getPlacePredictions(request: AutocompletionRequest, callback: (predictions: AutocompletePrediction[] | null, status: string) => void): void
      }
      interface AutocompletionRequest {
        input: string
        componentRestrictions?: { country: string }
        location?: LatLng
        radius?: number
      }
      interface AutocompletePrediction {
        place_id: string
        structured_formatting: { main_text: string; secondary_text: string }
      }
      enum PlacesServiceStatus { OK = 'OK' }
    }
  }
}
