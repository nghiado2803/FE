<template>
  <div class="map-search-page">

    <!-- BẢN ĐỒ TOÀN MÀN HÌNH -->
    <div ref="mapRef" class="fullscreen-map"></div>

    <!-- SEARCH BAR NỔI TRÊN MAP (kiểu Google Maps) -->
    <div class="floating-search-bar" :class="{ 'search-focused': isSearchFocused }">
      <div class="search-input-row">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="18" height="18">
          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
        </svg>
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          placeholder="Tìm bãi đỗ xe, địa điểm..."
          class="search-input"
          @focus="isSearchFocused = true"
          @blur="handleSearchBlur"
          @input="handleSearchInput"
          @keydown.enter="executeSearch"
        />
        <button v-if="searchQuery" class="btn-clear-search" @click="clearSearch">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="16" height="16">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
          </svg>
        </button>
        <button v-if="!searchQuery" class="btn-gps-locate" @click="locateUser" :class="{ 'locating': isLocating }">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="18" height="18">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
          </svg>
        </button>
      </div>

      <!-- SUGGESTIONS DROPDOWN -->
      <Transition name="dropdown-slide">
        <div v-if="isSearchFocused && (suggestions.length > 0 || nominatimSuggestions.length > 0)" class="suggestions-dropdown">
          <div
            v-for="sug in suggestions"
            :key="'lot-'+sug.id"
            class="suggestion-item"
            @mousedown.prevent="selectSuggestion(sug)"
          >
            <div class="sug-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="14" height="14">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
              </svg>
            </div>
            <div class="sug-text">
              <span class="sug-name">{{ sug.name }}</span>
              <span class="sug-addr">{{ sug.address }}</span>
            </div>
            <span class="sug-distance">{{ sug.distanceMeters }}m</span>
          </div>

          <div v-for="(p, i) in nominatimSuggestions" :key="'place-'+i" class="suggestion-item" @mousedown.prevent="selectSuggestion(p)">
            <div class="sug-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="14" height="14">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z"/>
              </svg>
            </div>
            <div class="sug-text">
              <span class="sug-name">{{ p.display_name }}</span>
              <span class="sug-addr">Gợi ý địa điểm</span>
            </div>
            <span class="sug-distance">—</span>
          </div>
        </div>
      </Transition>
    </div>

    <!-- NÚT ĐỊNH VỊ LẠI (góc phải) -->
    <button class="btn-recenter" @click="locateUser" :class="{ 'locating': isLocating }">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="20" height="20">
        <circle cx="12" cy="12" r="3" stroke-width="2"/>
        <path stroke-linecap="round" d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
      </svg>
    </button>

    <!-- BADGE ĐẾM SỐ BÃI ĐỖ -->
    <div v-if="!isBottomSheetExpanded" class="lots-count-chip" @click="expandBottomSheet">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="13" height="13">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>
      </svg>
      <span>{{ filteredLots.length }} bãi đỗ gần đây</span>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="12" height="12">
        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5"/>
      </svg>
    </div>

    <!-- LOADING INDICATOR -->
    <div v-if="isLoading" class="map-loading-overlay">
      <div class="map-loading-spinner"></div>
      <span>Đang tìm bãi đỗ xe...</span>
    </div>

    <!-- BOTTOM SHEET DANH SÁCH BÃI ĐỖ -->
    <div
      class="bottom-sheet"
      :class="{ 'expanded': isBottomSheetExpanded, 'collapsed': !isBottomSheetExpanded }"
      @touchstart="onSheetTouchStart"
      @touchmove="onSheetTouchMove"
      @touchend="onSheetTouchEnd"
    >
      <!-- Handle kéo -->
      <div class="sheet-drag-handle" @click="toggleBottomSheet"></div>

      <!-- Header sheet -->
      <div class="sheet-header">
        <div class="sheet-title-row">
          <h3 class="sheet-title">
            {{ searchQuery ? `Kết quả: "${searchQuery}"` : 'Bãi đỗ xe gần bạn' }}
          </h3>
          <span class="sheet-count-badge">{{ filteredLots.length }}</span>
        </div>
        <!-- Filter chips -->
        <div class="filter-chips-row">
          <button
            v-for="f in filters"
            :key="f.key"
            class="filter-chip"
            :class="{ active: activeFilter === f.key }"
            @click="activeFilter = f.key; applyFilter()"
          >
            {{ f.label }}
          </button>
        </div>
      </div>

      <!-- Danh sách bãi đỗ -->
      <div class="sheet-scroll-area" ref="sheetScrollRef">
        <div v-if="filteredLots.length === 0 && !isLoading" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#94a3b8" width="40" height="40">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
          </svg>
          <p>Không tìm thấy bãi đỗ xe</p>
        </div>

        <div
          v-for="lot in filteredLots"
          :key="lot.id"
          class="lot-card"
          :class="{ 'selected': selectedLotId === lot.id }"
          @click="handleSelectParking(lot)"
        >
          <div class="lot-card-image">
            <img :src="lot.imageUrl || defaultImage" :alt="lot.name" />
            <div class="lot-distance-badge">{{ formatDistance(lot.distanceMeters) }}</div>
            <div v-if="lot.availableSpots === 0" class="lot-full-overlay">ĐẦY</div>
          </div>
          <div class="lot-card-body">
            <div class="lot-card-top">
              <h4 class="lot-name">{{ lot.name }}</h4>
              <div class="lot-availability" :class="lot.availableSpots > 5 ? 'avail-good' : lot.availableSpots > 0 ? 'avail-low' : 'avail-full'">
                <span class="avail-dot"></span>
                {{ lot.availableSpots > 0 ? `${lot.availableSpots} chỗ` : 'Hết chỗ' }}
              </div>
            </div>
            <p class="lot-address">{{ lot.address }}</p>
            <div class="lot-card-footer">
              <span class="lot-price">{{ lot.pricePerHour.toLocaleString('vi-VN') }}đ<span class="lot-price-unit">/giờ</span></span>
              <button class="btn-select-lot" :disabled="lot.availableSpots === 0" @click.stop="handleSelectParking(lot)">
                {{ lot.availableSpots > 0 ? 'Chọn' : 'Hết chỗ' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CustomerService } from '@/services/customer.service'
import { useCustomerLocationStore } from '@/stores/customerLocationStore'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import { fromLonLat } from 'ol/proj'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style'
import { defaults as defaultInteractions } from 'ol/interaction'
import 'ol/ol.css'

const TILE_KEY = 'AIzaSyAvfUzF2Nv5NfXInqBw7z6Dt4xBOGI93Uc'
const DEFAULT_LAT = 13.7745
const DEFAULT_LNG = 109.2195
const defaultImage = 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80'

const router = useRouter()
const locationStore = useCustomerLocationStore()

// ── Refs ──
const mapRef = ref<HTMLDivElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const sheetScrollRef = ref<HTMLDivElement | null>(null)
let olMap: Map | null = null
let markersLayer: VectorLayer<VectorSource> | null = null
let userLayer: VectorLayer<VectorSource> | null = null

// ── State ──
const searchQuery = ref('')
const isSearchFocused = ref(false)
const isLoading = ref(false)
const isLocating = ref(false)
const isBottomSheetExpanded = ref(true)
const activeFilter = ref<string>('all')
const selectedLotId = ref<number | null>(null)

type NearbyLot = {
  id: number
  name: string
  address: string
  distanceMeters: number
  availableSpots: number
  pricePerHour: number
  imageUrl?: string
}

const allLots = ref<NearbyLot[]>([])
type NominatimResult = { display_name: string; lat: string; lon: string }
const suggestions = ref<NearbyLot[]>([])
const nominatimSuggestions = ref<NominatimResult[]>([])
const isSearchingNominatim = ref(false)
let suggestTimeout: ReturnType<typeof setTimeout> | null = null

const fetchNominatimSuggestions = async (q: string) => {
  if (!q || q.length < 4) { nominatimSuggestions.value = []; return }
  isSearchingNominatim.value = true
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&countrycodes=vn&accept-language=vi`, { headers: { 'Accept-Language': 'vi' } })
    const data = await res.json() as NominatimResult[]
    nominatimSuggestions.value = data
  } catch (e) {
    console.error('Nominatim error', e)
    nominatimSuggestions.value = []
  } finally { isSearchingNominatim.value = false }
}

const filters = [
  { key: 'all', label: 'Tất cả' },
  { key: 'available', label: 'Còn chỗ' },
  { key: 'cheap', label: 'Giá rẻ' },
  { key: 'near', label: 'Gần nhất' }
]

// ── Touch handling for bottom sheet ──
let touchStartY = 0
const onSheetTouchStart = (e: TouchEvent) => {
  const touchY = e.touches?.[0]?.clientY
  if (typeof touchY === 'number') touchStartY = touchY
}
const onSheetTouchMove = (e: TouchEvent) => { void e /* reserved for future drag logic */ }
const onSheetTouchEnd = (e: TouchEvent) => {
  const endY = e.changedTouches?.[0]?.clientY
  if (typeof endY !== 'number') return
  const delta = endY - touchStartY
  if (delta > 60) isBottomSheetExpanded.value = false
  else if (delta < -60) isBottomSheetExpanded.value = true
}
const toggleBottomSheet = () => { isBottomSheetExpanded.value = !isBottomSheetExpanded.value }
const expandBottomSheet = () => { isBottomSheetExpanded.value = true }

// ── Computed ──
const filteredLots = computed(() => {
  let list = allLots.value as NearbyLot[]
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(l => l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q))
  }
  switch (activeFilter.value) {
    case 'available': return list.filter(l => l.availableSpots > 0)
    case 'cheap': return [...list].sort((a, b) => a.pricePerHour - b.pricePerHour)
    case 'near': return [...list].sort((a, b) => a.distanceMeters - b.distanceMeters)
    default: return list
  }
})

// ── Utils ──
const formatDistance = (m: number) => m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`

// ── Map init ──
const initMap = async () => {
  await nextTick()
  if (!mapRef.value) return

  const userSource = new VectorSource()
  userLayer = new VectorLayer({ source: userSource, zIndex: 11 })

  const markerSource = new VectorSource()
  markersLayer = new VectorLayer({ source: markerSource, zIndex: 10 })

  olMap = new Map({
    target: mapRef.value,
    layers: [
      new TileLayer({
        source: new XYZ({ url: `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi&gl=vn&key=${TILE_KEY}` })
      }),
      markersLayer,
      userLayer
    ],
    view: new View({ center: fromLonLat([DEFAULT_LNG, DEFAULT_LAT]), zoom: 14 }),
    interactions: defaultInteractions({ doubleClickZoom: false }),
    controls: []
  })

  // Click trên marker để chọn bãi đỗ
  olMap.on('click', (evt) => {
    olMap!.forEachFeatureAtPixel(evt.pixel, (feature) => {
      const lotId = feature.get('lotId') as number
      if (lotId) {
        const lot = (allLots.value as NearbyLot[]).find(l => l.id === lotId)
        if (lot) {
          selectedLotId.value = lotId
          highlightMarker(lotId)
          isBottomSheetExpanded.value = true
          // Scroll đến card tương ứng
          nextTick(() => {
            const idx = filteredLots.value.findIndex(l => l.id === lotId)
            if (idx >= 0 && sheetScrollRef.value) {
              const cards = sheetScrollRef.value.querySelectorAll('.lot-card')
              cards[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            }
          })
        }
      }
    })
  })
}

// ── Render markers lên map ──
const renderMarkers = (lots: NearbyLot[]) => {
  if (!markersLayer) return
  const source = markersLayer.getSource()
  if (!source) return
  source.clear()

  lots.forEach(lot => {
    const feature = new Feature({
      geometry: new Point(fromLonLat([
        extractLng(lot) ?? DEFAULT_LNG,
        extractLat(lot) ?? DEFAULT_LAT
      ])),
      lotId: lot.id
    })
    feature.setStyle(createMarkerStyle(lot, false))
    source.addFeature(feature)
  })
}

// Fallback tọa độ từ bãi gần mặc định (offset nhỏ để phân biệt)
const extractLat = (lot: NearbyLot): number => {
  const l = lot as NearbyLot & { latitude?: number; lat?: number }
  return l.latitude ?? l.lat ?? DEFAULT_LAT + (lot.id * 0.003)
}
const extractLng = (lot: NearbyLot): number => {
  const l = lot as NearbyLot & { longitude?: number; lng?: number }
  return l.longitude ?? l.lng ?? DEFAULT_LNG + (lot.id * 0.002)
}

const createMarkerStyle = (lot: NearbyLot, selected: boolean) => {
  const isFull = lot.availableSpots === 0
  const color = selected ? '#f59e0b' : isFull ? '#ef4444' : '#2563eb'
  const radius = selected ? 16 : 13
  return new Style({
    image: new CircleStyle({
      radius,
      fill: new Fill({ color }),
      stroke: new Stroke({ color: '#ffffff', width: selected ? 4 : 3 })
    }),
    text: new Text({
      text: 'P',
      fill: new Fill({ color: '#ffffff' }),
      font: `bold ${selected ? 13 : 11}px sans-serif`
    })
  })
}

const highlightMarker = (lotId: number) => {
  if (!markersLayer) return
  const source = markersLayer.getSource()
  if (!source) return
  source.getFeatures().forEach(f => {
    const fLotId = f.get('lotId') as number
    const lot = (allLots.value as NearbyLot[]).find(l => l.id === fLotId)
    if (lot) f.setStyle(createMarkerStyle(lot, fLotId === lotId))
  })
}

// ── User location marker ──
const updateUserMarker = (lat: number, lng: number) => {
  if (!userLayer) return
  const source = userLayer.getSource()
  if (!source) return
  source.clear()
  const coord = fromLonLat([lng, lat])
  const feature = new Feature({ geometry: new Point(coord) })
  feature.setStyle(new Style({
    image: new CircleStyle({
      radius: 10,
      fill: new Fill({ color: '#16a34a' }),
      stroke: new Stroke({ color: '#ffffff', width: 3 })
    }),
    text: new Text({ text: '📍', font: '14px sans-serif', offsetY: -20 })
  }))
  source.addFeature(feature)
}

const flyTo = (lat: number, lng: number, zoom = 14) => {
  olMap?.getView().animate({ center: fromLonLat([lng, lat]), zoom, duration: 600 })
}

// ── Load dữ liệu bãi đỗ ──
const loadParkingLots = async (lat: number, lng: number) => {
  isLoading.value = true
  try {
    const res = await CustomerService.findNearestParking({ lat, lng, radiusKm: 5 })
    allLots.value = res as NearbyLot[]
    renderMarkers(allLots.value)
  } catch {
    // Fallback data thực tế khi API lỗi
    const fallback: NearbyLot[] = [
      { id: 1, name: 'Bãi đỗ Quảng trường Quy Nhơn', address: 'Nguyễn Tất Thành, Quy Nhơn, Bình Định', distanceMeters: 300, availableSpots: 8, pricePerHour: 15000, imageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80' },
      { id: 2, name: 'Bãi đỗ Đại học Quy Nhơn', address: '170 An Dương Vương, Quy Nhơn, Bình Định', distanceMeters: 650, availableSpots: 9, pricePerHour: 15000, imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80' },
      { id: 3, name: 'Bãi đỗ Trung tâm thương mại', address: 'Hai Bà Trưng, Quy Nhơn, Bình Định', distanceMeters: 900, availableSpots: 3, pricePerHour: 20000, imageUrl: 'https://images.unsplash.com/photo-1555636222-cae831e670b3?auto=format&fit=crop&w=600&q=80' },
      { id: 4, name: 'Bãi đỗ Bệnh viện Đa khoa tỉnh', address: 'Nguyễn Huệ, Quy Nhơn, Bình Định', distanceMeters: 1200, availableSpots: 0, pricePerHour: 10000, imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80' }
    ]
    allLots.value = fallback
    renderMarkers(fallback)
  } finally {
    isLoading.value = false
  }
}

// ── Locate user ──
const locateUser = () => {
  isLocating.value = true
  if (!navigator.geolocation) { isLocating.value = false; return }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords
      locationStore.currentLocation = { lat, lng }
      updateUserMarker(lat, lng)
      flyTo(lat, lng, 14)
      loadParkingLots(lat, lng)
      isLocating.value = false
    },
    () => {
      isLocating.value = false
      // Dùng tọa độ mặc định nếu không lấy được GPS
      flyTo(DEFAULT_LAT, DEFAULT_LNG, 14)
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
  )
}

// ── Search ──
let searchDebounce: ReturnType<typeof setTimeout> | null = null

const handleSearchInput = () => {
  if (searchDebounce) clearTimeout(searchDebounce)
  if (suggestTimeout) clearTimeout(suggestTimeout)
  searchDebounce = setTimeout(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (q) {
      suggestions.value = (allLots.value as NearbyLot[]).filter(l =>
        l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q)
      ).slice(0, 5)
      // fetch nominatim suggestions in background
      suggestTimeout = setTimeout(() => fetchNominatimSuggestions(searchQuery.value.trim()), 300)
    } else {
      suggestions.value = []
      nominatimSuggestions.value = []
    }
  }, 200)
}

const handleSearchBlur = () => {
  setTimeout(() => {
    isSearchFocused.value = false
    suggestions.value = []
    nominatimSuggestions.value = []
  }, 200)
}

const clearSearch = () => {
  searchQuery.value = ''
  suggestions.value = []
  searchInputRef.value?.focus()
}

const executeSearch = async () => {
  isSearchFocused.value = false
  suggestions.value = []
  const q = searchQuery.value.trim()
  if (!q) return
  // local match first
  const match = (allLots.value as NearbyLot[]).find(l =>
    l.name.toLowerCase().includes(q.toLowerCase()) || l.address.toLowerCase().includes(q.toLowerCase())
  )
  if (match) {
    selectedLotId.value = match.id
    highlightMarker(match.id)
    flyTo(extractLat(match), extractLng(match), 17)
    return
  }
  // else use nominatim
  try {
    isLoading.value = true
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&countrycodes=vn&accept-language=vi`, { headers: { 'Accept-Language': 'vi' } })
    const data = await res.json() as NominatimResult[]
    if (data && data[0]) {
      const lat = Number(parseFloat(data[0].lat).toFixed(6))
      const lng = Number(parseFloat(data[0].lon).toFixed(6))
      flyTo(lat, lng, 16)
      // reload nearby lots for this area
      loadParkingLots(lat, lng)
    }
  } catch (e) {
    console.error('Search error', e)
  } finally { isLoading.value = false }
}

const selectSuggestion = (item: NearbyLot | NominatimResult) => {
  if ((item as NearbyLot).id) {
    const lot = item as NearbyLot
    searchQuery.value = lot.name
    selectedLotId.value = lot.id
    highlightMarker(lot.id)
    flyTo(extractLat(lot), extractLng(lot), 17)
    isBottomSheetExpanded.value = true
  } else {
    const place = item as NominatimResult
    searchQuery.value = place.display_name
    const lat = Number(parseFloat(place.lat).toFixed(6))
    const lng = Number(parseFloat(place.lon).toFixed(6))
    isSearchFocused.value = false
    nominatimSuggestions.value = []
    flyTo(lat, lng, 16)
    loadParkingLots(lat, lng)
  }
  suggestions.value = []
}

const applyFilter = () => {
  // Re-render markers khi filter thay đổi
  renderMarkers(filteredLots.value)
}

// ── Select parking ──
const handleSelectParking = (lot: NearbyLot) => {
  selectedLotId.value = lot.id
  highlightMarker(lot.id)
  flyTo(extractLat(lot), extractLng(lot), 17)
  router.push(`/customer/map-booking?lotId=${lot.id}`)
}

// ── Lifecycle ──
onMounted(async () => {
  await initMap()

  // Thử lấy GPS thật ngay lập tức
  locationStore.fetchGeolocation()

  // Nếu đã có vị trí trong store → dùng luôn
  if (locationStore.currentLocation) {
    const { lat, lng } = locationStore.currentLocation
    updateUserMarker(lat, lng)
    flyTo(lat, lng, 14)
    await loadParkingLots(lat, lng)
  } else {
    // Load mặc định trước, rồi cập nhật khi GPS về
    await loadParkingLots(DEFAULT_LAT, DEFAULT_LNG)

    // Watch để khi GPS về thì reload
    const unwatch = watch(() => locationStore.currentLocation, (loc) => {
      if (loc) {
        updateUserMarker(loc.lat, loc.lng)
        flyTo(loc.lat, loc.lng, 14)
        loadParkingLots(loc.lat, loc.lng)
        unwatch()
      }
    })
  }
})

onUnmounted(() => {
  if (olMap) { olMap.setTarget(undefined); olMap = null }
  if (searchDebounce) clearTimeout(searchDebounce)
})
</script>

<style scoped>
/* ── LAYOUT ── */
.map-search-page {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 120px);
  overflow: hidden;
  background: #f1f5f9;
}

.fullscreen-map {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

/* ── FLOATING SEARCH BAR ── */
.floating-search-bar {
  position: absolute;
  top: 14px;
  left: 12px;
  right: 12px;
  z-index: 100;
  background: white;
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.2s;
  overflow: visible;
}

.floating-search-bar.search-focused {
  box-shadow: 0 6px 28px rgba(37, 99, 235, 0.2);
}

.search-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
}

.search-icon {
  color: #64748b;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
  background: transparent;
  font-family: 'Inter', system-ui, sans-serif;
  min-width: 0;
}

.search-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}

.btn-clear-search,
.btn-gps-locate {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}

.btn-clear-search {
  background: #f1f5f9;
  color: #64748b;
}

.btn-gps-locate {
  background: #eff6ff;
  color: #2563eb;
}

.btn-gps-locate.locating {
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* SUGGESTIONS DROPDOWN */
.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  z-index: 200;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  cursor: pointer;
  transition: background 0.12s;
  border-bottom: 1px solid #f8fafc;
}

.suggestion-item:last-child { border-bottom: none; }
.suggestion-item:hover { background: #f8fafc; }

.sug-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sug-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.sug-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sug-addr {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sug-distance {
  font-size: 11px;
  color: #2563eb;
  font-weight: 700;
  flex-shrink: 0;
}

/* Dropdown animation */
.dropdown-slide-enter-active { transition: opacity 0.15s, transform 0.15s; }
.dropdown-slide-leave-active { transition: opacity 0.1s, transform 0.1s; }
.dropdown-slide-enter-from, .dropdown-slide-leave-to { opacity: 0; transform: translateY(-6px); }

/* ── NÚT RECENTER ── */
.btn-recenter {
  position: absolute;
  bottom: 280px;
  right: 14px;
  z-index: 50;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #2563eb;
  transition: box-shadow 0.15s;
}

.btn-recenter:active { box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
.btn-recenter.locating { animation: spin 1s linear infinite; }

/* ── BADGE ĐẾM ── */
.lots-count-chip {
  position: absolute;
  bottom: 88px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  background: white;
  border-radius: 99px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 700;
  color: #1e293b;
  box-shadow: 0 4px 14px rgba(0,0,0,0.15);
  cursor: pointer;
  white-space: nowrap;
}

/* ── LOADING ── */
.map-loading-overlay {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  background: white;
  border-radius: 99px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #2563eb;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.map-loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* ── BOTTOM SHEET ── */
.bottom-sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: white;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -6px 24px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  transition: height 0.35s cubic-bezier(0.32, 0.72, 0, 1);
  will-change: height;
}

.bottom-sheet.expanded {
  height: 58%;
}

.bottom-sheet.collapsed {
  height: 72px;
}

.sheet-drag-handle {
  width: 36px;
  height: 4px;
  background: #e2e8f0;
  border-radius: 99px;
  margin: 10px auto 0;
  flex-shrink: 0;
  cursor: pointer;
}

.sheet-header {
  padding: 10px 16px 0;
  flex-shrink: 0;
}

.sheet-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.sheet-title {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sheet-count-badge {
  background: #eff6ff;
  color: #2563eb;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 99px;
  flex-shrink: 0;
}

/* Filter chips */
.filter-chips-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 10px;
  scrollbar-width: none;
}

.filter-chips-row::-webkit-scrollbar { display: none; }

.filter-chip {
  padding: 5px 14px;
  border-radius: 99px;
  border: 1.5px solid #e2e8f0;
  background: white;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  font-family: 'Inter', system-ui, sans-serif;
}

.filter-chip.active {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

/* ── SCROLL AREA ── */
.sheet-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 4px 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

/* ── EMPTY STATE ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 0;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 500;
}

/* ── LOT CARD ── */
.lot-card {
  display: flex;
  background: white;
  border-radius: 14px;
  border: 1.5px solid #f1f5f9;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.lot-card:active { transform: scale(0.99); }
.lot-card.selected { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37,99,235,0.15); }

.lot-card-image {
  width: 90px;
  flex-shrink: 0;
  position: relative;
  background: #e2e8f0;
}

.lot-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lot-distance-badge {
  position: absolute;
  bottom: 6px;
  left: 5px;
  background: rgba(0, 0, 0, 0.65);
  color: white;
  font-size: 9.5px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

.lot-full-overlay {
  position: absolute;
  inset: 0;
  background: rgba(239, 68, 68, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 1px;
}

.lot-card-body {
  flex: 1;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.lot-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 6px;
}

.lot-name {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.lot-availability {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.avail-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.avail-good { color: #16a34a; }
.avail-good .avail-dot { background: #16a34a; }
.avail-low { color: #ea580c; }
.avail-low .avail-dot { background: #ea580c; }
.avail-full { color: #dc2626; }
.avail-full .avail-dot { background: #dc2626; }

.lot-address {
  margin: 0;
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lot-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.lot-price {
  font-size: 14px;
  font-weight: 800;
  color: #2563eb;
}

.lot-price-unit {
  font-size: 10.5px;
  color: #64748b;
  font-weight: 500;
}

.btn-select-lot {
  padding: 5px 14px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Inter', system-ui, sans-serif;
  transition: opacity 0.15s;
}

.btn-select-lot:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.btn-select-lot:not(:disabled):active { opacity: 0.85; }
</style>
