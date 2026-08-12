<template>
  <div class="booking-page">

    <!-- BẢN ĐỒ TOÀN MÀN HÌNH -->
    <div ref="mapRef" class="ol-map"></div>

    <!-- NÚT BACK -->
    <button class="btn-back" @click="handleGoBack">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="18" height="18">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/>
      </svg>
    </button>

    <!-- SEARCH BAR NỔI TRÊN MAP -->
    <div class="floating-search-wrap" :class="{ focused: isSearchFocused }">
      <div class="search-row">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="16" height="16" class="search-ico">
          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
        </svg>
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          placeholder="Tìm địa điểm hoặc bãi đỗ khác..."
          class="search-inp"
          @focus="onSearchFocus"
          @blur="onSearchBlur"
          @input="onSearchInput"
          @keydown.enter="onSearchEnter"
        />
        <button v-if="searchQuery" class="btn-clr" @click="clearSearch">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="14" height="14">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- SUGGESTIONS -->
      <Transition name="drop">
        <div v-if="isSearchFocused && suggestions.length > 0" class="suggestions-box">
          <div
            v-for="(sug, i) in suggestions"
            :key="i"
            class="sug-row"
            @mousedown.prevent="pickSuggestion(sug)"
          >
            <div class="sug-ico">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="13" height="13">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
              </svg>
            </div>
            <div class="sug-info">
              <span class="sug-name">{{ sug.name }}</span>
              <span class="sug-addr">{{ sug.address }}</span>
            </div>
            <span class="sug-dist">{{ formatDist(sug.distanceMeters) }}</span>
          </div>
        </div>
      </Transition>
    </div>

    <!-- NÚT RECENTER GPS -->
    <button class="btn-gps" @click="recenterGPS" :class="{ spinning: isLocating }">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="18" height="18">
        <circle cx="12" cy="12" r="3" stroke-width="2"/>
        <path stroke-linecap="round" d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
      </svg>
    </button>

    <!-- BADGE TÊN BÃI ĐANG XEM -->
    <div v-if="!isSearchFocused" class="lot-name-chip">
      <span class="chip-dot"></span>
      <span>{{ lotInfo.name }}</span>
    </div>

    <!-- BOTTOM SHEET CHI TIẾT BÃI -->
    <div class="bottom-sheet" :class="{ expanded: isSheetExpanded, collapsed: !isSheetExpanded }">
      <div class="drag-handle" @click="isSheetExpanded = !isSheetExpanded"></div>

      <!-- Header bãi xe -->
      <div class="lot-header">
        <div class="lot-header-left">
          <h2>{{ lotInfo.name }}</h2>
          <p class="lot-address">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="12" height="12">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
            </svg>
            {{ lotInfo.address }}
          </p>
        </div>
        <span class="open-badge">Mở cửa</span>
      </div>

      <!-- Số chỗ trống / tổng -->
      <div class="availability-section">
        <div class="availability-numbers">
          <div class="avail-count-block">
            <span class="avail-big-number" :class="lotInfo.availableSpots === 0 ? 'text-red' : 'text-green'">
              {{ lotInfo.availableSpots }}
            </span>
            <span class="avail-separator">/</span>
            <span class="avail-total">{{ lotInfo.totalSpots }}</span>
            <span class="avail-label">chỗ trống</span>
          </div>
          <div class="lot-split-info">
            <div class="slot-detail">
              <span class="slot-label">Chỗ vé tháng</span>
              <strong>{{ lotInfo.monthlyAvailableSpots ?? 0 }}</strong>
            </div>
            <div class="slot-detail">
              <span class="slot-label">Chỗ vé lẻ</span>
              <strong>{{ lotInfo.normalAvailableSpots ?? 0 }}</strong>
            </div>
          </div>
          <div v-if="lotInfo.availableSpots === 0" class="full-badge">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="12" height="12">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"/>
            </svg>
            Bãi xe đã đầy
          </div>
        </div>

        <!-- Progress bar -->
        <div class="fill-progress-wrap">
          <div class="fill-progress-bar">
            <div
              class="fill-progress-inner"
              :style="{ width: fillPercent + '%' }"
              :class="fillPercent >= 100 ? 'bar-red' : fillPercent >= 80 ? 'bar-orange' : 'bar-green'"
            ></div>
          </div>
          <span class="fill-percent-label">{{ fillPercent }}% lấp đầy</span>
        </div>

        <!-- Giá theo giờ -->
        <div class="price-row">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="13" height="13">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
          </svg>
          <span>{{ lotInfo.pricePerHour.toLocaleString() }}đ / giờ</span>
        </div>
      </div>

      <!-- Khoảng cách đến bãi (nếu có GPS) -->
      <div v-if="distanceToLot" class="distance-row">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="13" height="13">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"/>
        </svg>
        <span>Cách bạn <strong>{{ formatDist(distanceToLot) }}</strong></span>
        <button class="btn-navigate" @click="openNavigation">Chỉ đường</button>
      </div>

      <!-- Chọn xe -->
      <div class="vehicle-row">
        <label class="vehicle-label">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="14" height="14">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>
          </svg>
          Phương tiện
        </label>
        <template v-if="userVehicles.length > 0">
          <select v-model="selectedVehicleIndex" class="vehicle-select">
            <option v-for="(car, idx) in userVehicles" :key="idx" :value="idx">
              {{ car.brand }} · {{ car.plate }}
            </option>
          </select>
        </template>
        <template v-else>
          <button class="btn-add-vehicle-link" @click="goToAddVehicle">
            + Thêm phương tiện mới
          </button>
        </template>
      </div>

      <!-- Footer đặt chỗ -->
      <div class="footer-bar">
        <div class="deposit-info">
          <span class="deposit-label">Tiền cọc</span>
          <strong class="deposit-amount">{{ lotInfo.depositAmount.toLocaleString() }}đ</strong>
        </div>
        <button
          class="btn-book"
          :class="{ 'btn-book-disabled': lotInfo.availableSpots === 0 }"
          :disabled="lotInfo.availableSpots === 0"
          @click="navigateToPaymentScreen"
        >
          <template v-if="lotInfo.availableSpots > 0">
            Đặt chỗ ngay
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/>
            </svg>
          </template>
          <template v-else>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
            </svg>
            Hết chỗ
          </template>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCustomerLocationStore } from '@/stores/customerLocationStore'
import { CustomerService, type ParkingDetailResponse } from '@/services/customer.service'
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

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const locationStore = useCustomerLocationStore()

const mapRef = ref<HTMLDivElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
let olMap: Map | null = null
let markerLayer: VectorLayer<VectorSource> | null = null
let userLayer: VectorLayer<VectorSource> | null = null

// ── Search state ──
const searchQuery = ref('')
const isSearchFocused = ref(false)
const isLocating = ref(false)
const isSheetExpanded = ref(true)
const suggestions = ref<{ id: number; name: string; address: string; distanceMeters: number; lat: number; lng: number }[]>([])
let allNearbyLots: typeof suggestions.value = []

// ── Lot & booking state ──
const selectedVehicleIndex = ref(0)
type ParkingLotInfo = {
  id: string; name: string; address: string; depositAmount: number
  totalSpots: number; availableSpots: number; pricePerHour: number
  lat: number; lng: number
  monthlySlots?: number
  normalSlots?: number
  monthlyAvailableSpots?: number
  normalAvailableSpots?: number
}
const lotInfo = ref<ParkingLotInfo>({
  id: '1', name: 'Đang tải...', address: '', depositAmount: 0,
  totalSpots: 1, availableSpots: 0, pricePerHour: 0,
  lat: DEFAULT_LAT, lng: DEFAULT_LNG
})
const userVehicles = ref<{ brand: string; plate: string }[]>([])
const userPos = ref<{ lat: number; lng: number } | null>(null)

const fillPercent = computed(() => {
  const used = lotInfo.value.totalSpots - lotInfo.value.availableSpots
  return Math.round((used / lotInfo.value.totalSpots) * 100)
})

const distanceToLot = computed(() => {
  if (!userPos.value) return null
  return calcDistanceMeters(userPos.value.lat, userPos.value.lng, lotInfo.value.lat, lotInfo.value.lng)
})

// ── Utils ──
const formatDist = (m: number) => m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`

const calcDistanceMeters = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

// ── Map init ──
const initMap = async () => {
  await nextTick()
  if (!mapRef.value) return
  const { lat, lng } = lotInfo.value

  const markerSource = new VectorSource()
  markerLayer = new VectorLayer({ source: markerSource, zIndex: 10 })

  const userSource = new VectorSource()
  userLayer = new VectorLayer({ source: userSource, zIndex: 11 })

  olMap = new Map({
    target: mapRef.value,
    layers: [
      new TileLayer({
        source: new XYZ({ url: `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi&gl=vn&key=${TILE_KEY}` })
      }),
      markerLayer,
      userLayer
    ],
    view: new View({ center: fromLonLat([lng, lat]), zoom: 16 }),
    interactions: defaultInteractions({ doubleClickZoom: false }),
    controls: []
  })
}

const placeLotMarker = (lat: number, lng: number) => {
  if (!markerLayer) return
  const source = markerLayer.getSource()
  if (!source) return
  source.clear()
  const feature = new Feature({ geometry: new Point(fromLonLat([lng, lat])) })
  feature.setStyle(new Style({
    image: new CircleStyle({ radius: 14, fill: new Fill({ color: '#2563eb' }), stroke: new Stroke({ color: '#ffffff', width: 3 }) }),
    text: new Text({ text: 'P', fill: new Fill({ color: '#ffffff' }), font: 'bold 12px sans-serif' })
  }))
  source.addFeature(feature)
}

const placeUserMarker = (lat: number, lng: number) => {
  if (!userLayer) return
  const source = userLayer.getSource()
  if (!source) return
  source.clear()
  const feature = new Feature({ geometry: new Point(fromLonLat([lng, lat])) })
  feature.setStyle(new Style({
    image: new CircleStyle({ radius: 10, fill: new Fill({ color: '#16a34a' }), stroke: new Stroke({ color: '#ffffff', width: 3 }) }),
    text: new Text({ text: '📍', font: '14px sans-serif', offsetY: -18 })
  }))
  source.addFeature(feature)
}

const flyTo = (lat: number, lng: number, zoom = 16) => {
  olMap?.getView().animate({ center: fromLonLat([lng, lat]), zoom, duration: 700 })
}

const fitBothMarkers = (lotLat: number, lotLng: number, userLat: number, userLng: number) => {
  if (!olMap) return
  const coords = [fromLonLat([lotLng, lotLat]), fromLonLat([userLng, userLat])]
  const xs = coords.map(c => Number(c[0]))
  const ys = coords.map(c => Number(c[1]))
  if (xs.length === 0 || ys.length === 0) return
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const maxX = Math.max(...xs)
  const maxY = Math.max(...ys)
  olMap.getView().fit([minX, minY, maxX, maxY], { padding: [80, 40, 220, 40], maxZoom: 16, duration: 800 })
}

// ── Load data ──
const initializeData = async () => {
  const lotId = Number(route.query.lotId || '1')
  try {
    const [lotData, vehicles] = await Promise.all([
      CustomerService.getParkingDetail(lotId),
      CustomerService.getMyVehicles()
    ])

    const latVal = (lotData as ParkingDetailResponse & { latitude?: number; lat?: number }).latitude
      ?? (lotData as ParkingDetailResponse & { lat?: number }).lat ?? DEFAULT_LAT
    const lngVal = (lotData as ParkingDetailResponse & { longitude?: number; lng?: number }).longitude
      ?? (lotData as ParkingDetailResponse & { lng?: number }).lng ?? DEFAULT_LNG

    lotInfo.value = {
      id: String(lotData.id),
      name: lotData.name,
      address: lotData.address,
      depositAmount: (lotData as ParkingDetailResponse & { depositAmount?: number }).depositAmount || 20000,
      totalSpots: lotData.totalSpots,
      availableSpots: lotData.availableSpots,
      pricePerHour: lotData.pricePerHour,
      lat: latVal,
      lng: lngVal,
      monthlySlots: (lotData as ParkingDetailResponse).monthlySlots ?? 0,
      normalSlots: (lotData as ParkingDetailResponse).normalSlots ?? Math.max(0, lotData.totalSpots - ((lotData as ParkingDetailResponse).monthlySlots ?? 0)),
      monthlyAvailableSpots: (lotData as ParkingDetailResponse & { monthlyAvailableSpots?: number }).monthlyAvailableSpots ?? 0,
      normalAvailableSpots: (lotData as ParkingDetailResponse & { normalAvailableSpots?: number }).normalAvailableSpots ?? 0
    }
    userVehicles.value = vehicles.map(v => ({ brand: v.model, plate: v.plate }))

    placeLotMarker(latVal, lngVal)
    flyTo(latVal, lngVal, 16)
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu:', error)
  }
}

// ── GPS locate ──
const recenterGPS = () => {
  isLocating.value = true
  if (!navigator.geolocation) { isLocating.value = false; return }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords
      userPos.value = { lat, lng }
      locationStore.currentLocation = { lat, lng }
      placeUserMarker(lat, lng)
      fitBothMarkers(lotInfo.value.lat, lotInfo.value.lng, lat, lng)
      isLocating.value = false
    },
    () => { isLocating.value = false },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
  )
}

// ── Khởi động GPS ngay khi mount ──
const startGPS = () => {
  // Nhanh từ cache
  navigator.geolocation?.getCurrentPosition(
    (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords
      userPos.value = { lat, lng }
      placeUserMarker(lat, lng)
    },
    null,
    { enableHighAccuracy: false, timeout: 2000, maximumAge: 60000 }
  )
  // Chính xác sau
  navigator.geolocation?.getCurrentPosition(
    (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords
      userPos.value = { lat, lng }
      placeUserMarker(lat, lng)
      fitBothMarkers(lotInfo.value.lat, lotInfo.value.lng, lat, lng)
    },
    null,
    { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
  )
}

// ── Load nearby lots để search ──
const loadNearbyForSearch = async () => {
  try {
    const lat = userPos.value?.lat ?? DEFAULT_LAT
    const lng = userPos.value?.lng ?? DEFAULT_LNG
    const res = await CustomerService.findNearestParking({ lat, lng, radiusKm: 10 })
    allNearbyLots = res.map(l => ({
      id: l.id,
      name: l.name,
      address: l.address,
      distanceMeters: l.distanceMeters,
      lat: (l as typeof l & { latitude?: number; lat?: number }).latitude
        ?? (l as typeof l & { lat?: number }).lat ?? DEFAULT_LAT + l.id * 0.003,
      lng: (l as typeof l & { longitude?: number; lng?: number }).longitude
        ?? (l as typeof l & { lng?: number }).lng ?? DEFAULT_LNG + l.id * 0.002
    }))
  } catch {
    allNearbyLots = [
      { id: 1, name: 'Bãi đỗ Quảng trường Quy Nhơn', address: 'Nguyễn Tất Thành, Quy Nhơn', distanceMeters: 300, lat: DEFAULT_LAT + 0.003, lng: DEFAULT_LNG + 0.002 },
      { id: 2, name: 'Bãi đỗ Đại học Quy Nhơn', address: '170 An Dương Vương, Quy Nhơn', distanceMeters: 650, lat: DEFAULT_LAT + 0.006, lng: DEFAULT_LNG + 0.004 },
      { id: 3, name: 'Bãi đỗ Trung tâm thương mại', address: 'Hai Bà Trưng, Quy Nhơn', distanceMeters: 900, lat: DEFAULT_LAT - 0.003, lng: DEFAULT_LNG + 0.005 }
    ]
  }
}

// ── Search handlers ──
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const onSearchFocus = () => { isSearchFocused.value = true }
const onSearchBlur = () => {
  setTimeout(() => {
    isSearchFocused.value = false
    suggestions.value = []
  }, 200)
}

const onSearchInput = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) { suggestions.value = []; return }
    suggestions.value = allNearbyLots.filter(l =>
      l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q)
    ).slice(0, 5)
  }, 180)
}

const onSearchEnter = () => {
  isSearchFocused.value = false
  suggestions.value = []
  if (!searchQuery.value.trim()) return
  const match = allNearbyLots.find(l =>
    l.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    l.address.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
  if (match) pickSuggestion(match)
}

const clearSearch = () => {
  searchQuery.value = ''
  suggestions.value = []
  // Fly back về bãi gốc
  flyTo(lotInfo.value.lat, lotInfo.value.lng, 16)
  placeLotMarker(lotInfo.value.lat, lotInfo.value.lng)
  searchInputRef.value?.focus()
}

const pickSuggestion = (sug: typeof suggestions.value[0]) => {
  searchQuery.value = sug.name
  isSearchFocused.value = false
  suggestions.value = []
  // Fly đến bãi được tìm, đặt marker tạm
  flyTo(sug.lat, sug.lng, 17)
  placeLotMarker(sug.lat, sug.lng)
  // Navigate sang trang đó
  router.push(`/customer/map-booking?lotId=${sug.id}`)
}

// ── Navigate to destination ──
const openNavigation = () => {
  if (!userPos.value) return
  const { lat, lng } = lotInfo.value
  window.open(`https://www.google.com/maps/dir/?api=1&origin=${userPos.value.lat},${userPos.value.lng}&destination=${lat},${lng}&travelmode=driving`, '_blank')
}

// ── Payment / Booking ──
const goToAddVehicle = () => {
  router.push({
    path: '/customer/vehicles',
    query: { redirect: `/customer/map-booking?lotId=${lotInfo.value.id}` }
  })
}

const navigateToPaymentScreen = async () => {
  if (!authStore.isCustomer) {
    window.alert('Vui lòng đăng nhập để thực hiện đặt chỗ!')
    router.push('/customer/auth')
    return
  }
  const vehicle = userVehicles.value[selectedVehicleIndex.value]
  if (!vehicle) {
    const confirmAdd = await (window.confirmDialog?.(
      'Bạn chưa có phương tiện nào. Bạn có muốn thêm phương tiện ngay bây giờ không?'
    ) ?? false)
    if (confirmAdd) {
      goToAddVehicle()
    } else {
      window.toast?.('Vui lòng thêm phương tiện để tiếp tục!', 'warning')
    }
    return
  }

  try {
    const res = await CustomerService.bookSpot({
      parkingId: Number(lotInfo.value.id),
      plate: vehicle.plate
    })
    if (res.status === 'success') {
      router.push({
        path: '/customer/deposit',
        query: {
          bookingId: String(res.bookingId),
          ticketCode: String(res.ticketCode),
          lotName: lotInfo.value.name,
          lotId: String(lotInfo.value.id),
          plate: vehicle.plate,
          deposit: String(lotInfo.value.depositAmount)
        }
      })
    }
  } catch (error) {
    const err = error as { response?: { data?: { message?: string }; status?: number } }
    const msg = err.response?.data?.message || ''
    if (err.response?.status === 400 && msg.includes('đặt chỗ')) {
      const ticket = await CustomerService.getCurrentTicket()
      if (ticket.status === 'PAYING') {
        const choice = await (window.confirmDialog?.(
          '⚠️ Bạn đang có một vé đặt chỗ chưa thanh toán.\n\n• Bấm Đồng ý → Tiếp tục thanh toán vé cũ\n• Bấm Hủy → Hủy vé cũ và đặt mới'
        ) ?? false)
        if (choice) {
          router.push({ path: '/customer/deposit', query: { bookingId: String(ticket.bookingId), ticketCode: String(ticket.ticketCode), lotName: ticket.lotName || lotInfo.value.name, lotId: String(lotInfo.value.id), plate: ticket.plate || vehicle.plate, deposit: String(ticket.depositPaid || lotInfo.value.depositAmount) } })
        } else {
          try {
            await CustomerService.cancelPayingBooking()
            const newRes = await CustomerService.bookSpot({ parkingId: Number(lotInfo.value.id), plate: vehicle.plate })
            if (newRes.status === 'success') {
              router.push({ path: '/customer/deposit', query: { bookingId: String(newRes.bookingId), ticketCode: String(newRes.ticketCode), lotName: lotInfo.value.name, lotId: String(lotInfo.value.id), plate: vehicle.plate, deposit: String(lotInfo.value.depositAmount) } })
            }
          } catch {
            window.toast?.('Không thể hủy vé cũ. Vui lòng thử lại sau!', 'error')
          }
        }
        return
      }
      window.toast?.('Bạn đang có một vé đang hoạt động. Vui lòng hoàn thành trước khi đặt mới!', 'warning')
      return
    }
    window.toast?.(msg || 'Lỗi khi đặt chỗ!', 'error')
  }
}

const handleGoBack = () => router.back()

// ── Lifecycle ──
onMounted(async () => {
  await initializeData()
  await initMap()
  placeLotMarker(lotInfo.value.lat, lotInfo.value.lng)
  startGPS()
  await loadNearbyForSearch()
})

onUnmounted(() => {
  if (olMap) { olMap.setTarget(undefined); olMap = null }
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<style scoped>
.booking-page {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 120px);
  overflow: hidden;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.ol-map {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

/* ── NÚT BACK ── */
.btn-back {
  position: absolute;
  top: 14px;
  left: 12px;
  z-index: 100;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: none;
  box-shadow: 0 2px 10px rgba(0,0,0,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #334155;
}

/* ── SEARCH BAR ── */
.floating-search-wrap {
  position: absolute;
  top: 14px;
  left: 58px;
  right: 12px;
  z-index: 100;
  background: white;
  border-radius: 14px;
  box-shadow: 0 4px 18px rgba(0,0,0,0.14);
  transition: box-shadow 0.2s;
  overflow: visible;
}

.floating-search-wrap.focused {
  box-shadow: 0 6px 24px rgba(37,99,235,0.2);
}

.search-row {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 11px;
}

.search-ico { color: #64748b; flex-shrink: 0; }

.search-inp {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13.5px;
  font-weight: 500;
  color: #0f172a;
  background: transparent;
  min-width: 0;
}

.search-inp::placeholder { color: #94a3b8; font-weight: 400; }

.btn-clr {
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

/* SUGGESTIONS */
.suggestions-box {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  overflow: hidden;
  z-index: 200;
}

.sug-row {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 13px;
  cursor: pointer;
  border-bottom: 1px solid #f8fafc;
  transition: background 0.12s;
}

.sug-row:last-child { border-bottom: none; }
.sug-row:hover { background: #f8fafc; }

.sug-ico {
  width: 26px; height: 26px;
  border-radius: 8px;
  background: #eff6ff;
  color: #2563eb;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.sug-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.sug-name { font-size: 12.5px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sug-addr { font-size: 10.5px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sug-dist { font-size: 11px; color: #2563eb; font-weight: 700; flex-shrink: 0; }

.drop-enter-active { transition: opacity 0.15s, transform 0.15s; }
.drop-leave-active { transition: opacity 0.1s, transform 0.1s; }
.drop-enter-from, .drop-leave-to { opacity: 0; transform: translateY(-5px); }

/* ── GPS BUTTON ── */
.btn-gps {
  position: absolute;
  bottom: 340px;
  right: 14px;
  z-index: 50;
  width: 42px; height: 42px;
  border-radius: 12px;
  background: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #2563eb;
}

.btn-gps.spinning { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── BADGE TÊN BÃI ── */
.lot-name-chip {
  position: absolute;
  top: 62px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  background: white;
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  box-shadow: 0 2px 10px rgba(0,0,0,0.12);
  display: flex; align-items: center; gap: 6px;
  white-space: nowrap;
  max-width: calc(100% - 28px);
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #16a34a;
  flex-shrink: 0;
}

/* ── BOTTOM SHEET ── */
.bottom-sheet {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  z-index: 50;
  background: white;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -6px 24px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: height 0.32s cubic-bezier(0.32, 0.72, 0, 1);
  overflow: hidden;
}

.bottom-sheet.expanded { height: 64%; }
.bottom-sheet.collapsed { height: 60px; }

.bottom-sheet.expanded > *:not(.drag-handle) { opacity: 1; transition: opacity 0.2s 0.1s; }
.bottom-sheet.collapsed > *:not(.drag-handle) { opacity: 0; pointer-events: none; }

.drag-handle {
  width: 36px; height: 4px;
  background: #e2e8f0;
  border-radius: 99px;
  margin: 10px auto 0;
  flex-shrink: 0;
  cursor: pointer;
}

/* inner content scroll */
.bottom-sheet.expanded {
  overflow-y: auto;
  padding-bottom: 16px;
}

/* ── LOT HEADER ── */
.lot-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2px 16px 10px;
  border-bottom: 1px solid #f1f5f9;
}

.lot-header-left h2 { margin: 0 0 4px 0; font-size: 16px; font-weight: 800; color: #0f172a; }
.lot-address { margin: 0; font-size: 11.5px; color: #64748b; font-weight: 500; display: flex; align-items: center; gap: 3px; }

.open-badge { background: #dcfce7; color: #16a34a; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; flex-shrink: 0; }

/* ── AVAILABILITY ── */
.availability-section {
  background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 12px; padding: 12px 14px;
  display: flex; flex-direction: column; gap: 9px;
  margin: 0 16px;
}

.availability-numbers { display: flex; align-items: center; justify-content: space-between; }
.avail-count-block { display: flex; align-items: baseline; gap: 4px; }
.avail-big-number { font-size: 32px; font-weight: 900; line-height: 1; }
.text-green { color: #16a34a; }
.text-red { color: #dc2626; }
.avail-separator { font-size: 20px; color: #94a3b8; }
.avail-total { font-size: 20px; font-weight: 700; color: #475569; }
.avail-label { font-size: 12px; color: #64748b; font-weight: 600; margin-left: 4px; }

.full-badge { display: flex; align-items: center; gap: 5px; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 20px; padding: 4px 11px; font-size: 11.5px; font-weight: 700; }

.fill-progress-wrap { display: flex; align-items: center; gap: 10px; }
.fill-progress-bar { flex: 1; height: 8px; background: #e2e8f0; border-radius: 99px; overflow: hidden; }
.fill-progress-inner { height: 100%; border-radius: 99px; transition: width 0.4s ease; }
.bar-green { background: #16a34a; }
.bar-orange { background: #f59e0b; }
.bar-red { background: #dc2626; }
.fill-percent-label { font-size: 11px; font-weight: 700; color: #64748b; white-space: nowrap; }

.lot-split-info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.slot-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

.slot-label {
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.bar-orange { background: #f59e0b; }
.bar-red { background: #dc2626; }
.fill-percent-label { font-size: 11px; font-weight: 700; color: #64748b; white-space: nowrap; }

.price-row { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #64748b; font-weight: 600; }

/* ── DISTANCE ROW ── */
.distance-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  font-size: 12px;
  color: #475569;
  font-weight: 500;
}

.distance-row strong { color: #0f172a; }

.btn-navigate {
  margin-left: auto;
  padding: 5px 12px;
  background: #eff6ff;
  color: #2563eb;
  border: none;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
}

/* ── VEHICLE ROW ── */
.vehicle-row { display: flex; flex-direction: column; gap: 5px; padding: 0 16px; }
.vehicle-label { font-size: 11px; font-weight: 700; color: #64748b; display: flex; align-items: center; gap: 5px; text-transform: uppercase; letter-spacing: 0.3px; }

.vehicle-select {
  width: 100%; padding: 9px 12px;
  border-radius: 10px; border: 1.5px solid #e2e8f0;
  font-size: 13.5px; font-weight: 600; color: #1e293b;
  background: white; outline: none; cursor: pointer; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 12px center; background-size: 16px;
  padding-right: 36px;
}

.btn-add-vehicle-link {
  width: 100%; padding: 10px;
  background: #f1f5f9; color: #2563eb;
  border: 1.5px dashed #cbd5e1; border-radius: 10px;
  font-size: 13px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.btn-add-vehicle-link:hover { background: #eff6ff; border-color: #2563eb; }

/* ── FOOTER ── */
.footer-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px 0;
  border-top: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.deposit-info { display: flex; flex-direction: column; }
.deposit-label { font-size: 10.5px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
.deposit-amount { font-size: 20px; font-weight: 900; color: #2563eb; }

.btn-book {
  display: flex; align-items: center; gap: 8px;
  padding: 13px 22px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white; border: none; border-radius: 12px;
  font-size: 14px; font-weight: 800; cursor: pointer;
  box-shadow: 0 4px 12px rgba(37,99,235,0.25);
  transition: opacity 0.15s;
}

.btn-book:active { opacity: 0.9; transform: scale(0.98); }
.btn-book-disabled { background: #94a3b8 !important; box-shadow: none !important; cursor: not-allowed !important; opacity: 0.7; }
</style>
