<template>
  <div class="home-page-wrapper">

    <!-- === PHẦN BẢN ĐỒ === -->
    <div class="map-section">
      <!-- Search bar nổi trên bản đồ -->
      <div class="search-overlay-bar">
        <div class="search-input-box">
          <svg class="search-icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Bạn muốn đi đến đâu?"
            class="search-text-input"
            @input="onSearchInput"
            @focus="showSuggestions = true"
          />
          <button v-if="searchQuery" class="clear-search-btn" @click.stop="clearSearch">✕</button>
        </div>

        <div v-if="showSuggestions && placeSuggestions.length > 0" class="suggestions-dropdown">
          <div v-for="(s, i) in placeSuggestions" :key="i" class="suggestion-item" @click="selectSuggestion(s)">
            <span class="suggestion-icon">📍</span>
            <div class="suggestion-text">
              <span class="suggestion-main">{{ s.main }}</span>
              <span class="suggestion-sub">{{ s.secondary }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bản đồ OpenLayers -->
      <div ref="mapRef" class="ol-map-container"></div>

      <!-- Banner chỉ đường đang hoạt động -->
      <div v-if="isNavigating" class="nav-banner enhanced-nav">
        <div class="nav-instruction-box" v-if="nextManeuver">
          <div class="nav-direction-icon">
            <svg v-if="nextManeuver.type.includes('right')" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
            </svg>
            <svg v-else-if="nextManeuver.type.includes('left')" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m9 15-6-6m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
            </svg>
          </div>
          <div class="nav-text-group">
            <p class="nav-dist-text">{{ nextManeuver.distance }}m</p>
            <p class="nav-instruction-text">{{ nextManeuver.instruction }}</p>
          </div>
        </div>
        <div class="nav-dest-info">
          <span>Đến: <strong>{{ navDestName }}</strong></span>
          <button class="btn-stop-nav-small" @click="stopNavigation">Dừng</button>
        </div>
      </div>

      <!-- Nút định vị lại -->
      <button class="btn-relocate" @click="recenterToMyLocation">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="18" height="18">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
        </svg>
      </button>

      <div v-if="showSuggestions && placeSuggestions.length > 0" class="suggestions-overlay" @click="showSuggestions = false"></div>
    </div>

    <!-- Bãi xe gần nhất — nằm NGOÀI map, dưới map -->
    <div v-if="nearbyLots.length > 0 && !selectedLot && !isNavigating" class="nearby-panel">
      <h3 class="nearby-title">Bãi xe gần vị trí bạn chọn</h3>
      <div class="nearby-list">
        <div v-for="lot in nearbyLots" :key="lot.id" class="nearby-card" @click="chooseLot(lot)">
          <div class="nearby-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="18" height="18"><path d="M13 3H5v18h4v-6h4v6h4V8l-4-5zm-2 8H9V9h2v2z"/></svg>
          </div>
          <div class="nearby-card-info">
            <h4>{{ lot.name }}</h4>
            <p>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="10" height="10"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
              {{ lot.address }}
            </p>
            <div class="nearby-pills">
              <span class="pill-dist">{{ lot.distanceMeters }}m</span>
              <span :class="['pill-avail', lot.availableSpots > 5 ? 'green' : 'orange']">Còn {{ lot.availableSpots }} ô</span>
            </div>
          </div>
          <div class="nearby-card-price">
            <strong>{{ (lot.pricePerHour / 1000).toFixed(0) }}k</strong>
            <span>/giờ</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Chi tiết bãi đã chọn — nằm NGOÀI map -->
    <div v-if="selectedLot" class="detail-panel">
      <div class="detail-panel-header">
        <div>
          <h3>{{ selectedLot.name }}</h3>
          <p class="detail-address">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="11" height="11"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
            {{ selectedLot.address }}
          </p>
        </div>
        <div class="detail-panel-right">
          <span :class="['spots-badge', selectedLot.availableSpots > 5 ? 'green' : 'orange']">Còn {{ selectedLot.availableSpots }} ô</span>
          <button class="btn-close-detail" @click="selectedLot = null">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
      <div class="detail-meta-row">
        <div class="meta-item">
          <span class="meta-label">Giá/giờ</span>
          <strong class="meta-value blue">{{ selectedLot.pricePerHour.toLocaleString() }}đ</strong>
        </div>
        <div class="meta-item">
          <span class="meta-label">Tiền cọc</span>
          <strong class="meta-value">{{ (selectedLot.depositAmount || 20000).toLocaleString() }}đ</strong>
        </div>
        <div class="meta-item">
          <span class="meta-label">Cách bạn</span>
          <strong class="meta-value">{{ selectedLot.distanceMeters }}m</strong>
        </div>
      </div>
      <button class="btn-book-now" @click="goToBooking">
        Đặt chỗ ngay
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="15" height="15"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
      </button>
    </div>

    <!-- === PHẦN GIỚI THIỆU HỆ THỐNG === -->
    <div class="intro-section">
      <div class="intro-header">
        <h2 class="intro-title">SmartPark <span class="brand-blue">Quy Nhơn</span></h2>
        <p class="intro-sub">Hệ thống đặt chỗ đỗ xe thông minh — nhanh, tiện, an toàn</p>
      </div>

      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">🗺️</div>
          <h4>Tìm bãi xe</h4>
          <p>Bấm vào bản đồ để tìm bãi xe gần nhất theo vị trí thực tế</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💳</div>
          <h4>Đặt cọc online</h4>
          <p>Giữ chỗ trước qua VNPAY, MoMo hoặc ngân hàng nội địa</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📱</div>
          <h4>Mã QR vé</h4>
          <p>Nhận mã QR ngay sau thanh toán, xuất trình tại cổng bãi xe</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🧭</div>
          <h4>Chỉ đường</h4>
          <p>Hệ thống tự động dẫn đường đến bãi xe sau khi đặt chỗ thành công</p>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-item">
          <strong>3+</strong>
          <span>Bãi xe</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <strong>70+</strong>
          <span>Ô đỗ</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <strong>24/7</strong>
          <span>Hoạt động</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { CustomerService, type NearbyParkingLot } from '@/services/customer.service'
import { useAuthStore } from '@/stores/authStore'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import { fromLonLat, toLonLat } from 'ol/proj'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import LineString from 'ol/geom/LineString'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style'
import { defaults as defaultInteractions } from 'ol/interaction'
import 'ol/ol.css'

const TILE_KEY = 'AIzaSyAvfUzF2Nv5NfXInqBw7z6Dt4xBOGI93Uc'
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const mapRef = ref<HTMLDivElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')
const showSuggestions = ref(false)
const placeSuggestions = ref<{ main: string; secondary: string; lat: number; lng: number }[]>([])
const isNavigating = ref(false)
const navDestName = ref('')
const navigationSteps = ref<{ instruction: string; type: string; modifier?: string; location: [number, number]; distance: number }[]>([])
const currentStepIndex = ref(0)
const nextManeuver = ref<{ instruction: string; type: string; distance: number } | null>(null)

type NearbyLot = {
  id: number; name: string; address: string
  distanceMeters: number; availableSpots: number
  pricePerHour: number; depositAmount?: number
  lat: number; lng: number
  latitude?: number; longitude?: number
}

const nearbyLots = ref<NearbyLot[]>([])
const selectedLot = ref<NearbyLot | null>(null)

let olMap: Map | null = null
let myLocSource: VectorSource | null = null
let destSource: VectorSource | null = null
let lotSource: VectorSource | null = null
let routeSource: VectorSource | null = null
let searchTimer: ReturnType<typeof setTimeout> | null = null
let currentLat = 13.7745
let currentLng = 109.2195
let mapClickListener: ((e: { pixel: number[]; coordinate: number[] }) => void) | null = null

const makeLotStyle = (lot: NearbyLot, idx: number) => new Style({
  image: new CircleStyle({
    radius: 18,
    fill: new Fill({ color: idx === 0 ? '#16a34a' : '#2563eb' }),
    stroke: new Stroke({ color: '#ffffff', width: 2 })
  }),
  text: new Text({
    text: `${(lot.pricePerHour / 1000).toFixed(0)}k`,
    fill: new Fill({ color: '#ffffff' }),
    font: 'bold 11px sans-serif',
    offsetY: 1
  })
})

const initMap = async () => {
  await nextTick()
  if (!mapRef.value) return

  myLocSource = new VectorSource()
  destSource = new VectorSource()
  lotSource = new VectorSource()
  routeSource = new VectorSource()

  olMap = new Map({
    target: mapRef.value,
    layers: [
      new TileLayer({
        source: new XYZ({ url: `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi&gl=vn&key=${TILE_KEY}` })
      }),
      // Layer đường chỉ đường (vẽ dưới cùng trong vector layers)
      new VectorLayer({
        source: routeSource, zIndex: 30,
        style: new Style({
          stroke: new Stroke({ color: '#2563eb', width: 5, lineDash: [10, 6] })
        })
      }),
      new VectorLayer({ source: lotSource, zIndex: 50 }),
      new VectorLayer({
        source: destSource, zIndex: 90,
        style: new Style({ image: new CircleStyle({ radius: 10, fill: new Fill({ color: '#dc2626' }), stroke: new Stroke({ color: '#fff', width: 2 }) }) })
      }),
      new VectorLayer({
        source: myLocSource, zIndex: 100,
        style: new Style({ image: new CircleStyle({ radius: 10, fill: new Fill({ color: '#2563eb' }), stroke: new Stroke({ color: '#fff', width: 3 }) }) })
      }),
    ],
    view: new View({ center: fromLonLat([currentLng, currentLat]), zoom: 15 }),
    interactions: defaultInteractions({ doubleClickZoom: false }),
    controls: []
  })

  // Lấy vị trí hiện tại
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      currentLat = pos.coords.latitude
      currentLng = pos.coords.longitude
      if (olMap) {
        olMap.getView().animate({ center: fromLonLat([currentLng, currentLat]), zoom: 15 })
        updateMyLocation(currentLat, currentLng)
        findNearestLots(currentLat, currentLng)
      }
    }, () => {
      // Mặc định Quy Nhơn nếu lỗi định vị
      updateMyLocation(currentLat, currentLng)
      findNearestLots(currentLat, currentLng)
    })
  } else {
    updateMyLocation(currentLat, currentLng)
    findNearestLots(currentLat, currentLng)
  }

  // Kiểm tra query params chỉ đường
  if (route.query.nav === '1') {
    const navLat = parseFloat(route.query.lat as string)
    const navLng = parseFloat(route.query.lng as string)
    const name = route.query.name as string
    if (!isNaN(navLat) && !isNaN(navLng)) {
      startNavigation(navLat, navLng, name)
    }
  }
}

const startNavigation = (destLat: number, destLng: number, name: string) => {
  isNavigating.value = true
  navDestName.value = name || 'Bãi xe'

  // Đặt marker điểm đến
  if (destSource) {
    destSource.clear()
    destSource.addFeature(new Feature({ geometry: new Point(fromLonLat([destLng, destLat])) }))
  }

  // Vẽ route ngay với vị trí hiện tại (có thể là fallback)
  drawRoute(currentLat, currentLng, destLat, destLng)

  // Zoom để thấy cả 2 điểm
  olMap?.getView().animate({ center: fromLonLat([destLng, destLat]), zoom: 14, duration: 600 })
}

const drawRoute = async (fromLat: number, fromLng: number, toLat: number, toLng: number) => {
  if (!routeSource) return
  routeSource.clear()

  try {
    // OSRM public API - thêm steps=true để lấy hướng dẫn rẽ
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&steps=true`
    const res = await fetch(url)
    const data = await res.json()

    if (data.code === 'Ok' && data.routes?.[0]) {
      const route = data.routes[0]
      const coords = route.geometry.coordinates as [number, number][]
      const olCoords = coords.map(([lng, lat]) => fromLonLat([lng, lat]))
      const routeFeature = new Feature({ geometry: new LineString(olCoords) })
      routeSource.addFeature(routeFeature)

      // Xử lý các bước hướng dẫn
      if (route.legs?.[0]?.steps) {
        navigationSteps.value = route.legs[0].steps.map((s: { maneuver: { instruction: string; type: string; modifier?: string; location: [number, number] }; distance: number }) => ({
          instruction: s.maneuver.instruction,
          type: s.maneuver.type,
          modifier: s.maneuver.modifier,
          location: s.maneuver.location,
          distance: s.distance
        }))
        currentStepIndex.value = 0
        updateNextManeuver()
      }

      // Fit view để thấy toàn bộ route
      const extent = routeSource.getExtent()
      if (extent) olMap?.getView().fit(extent, { padding: [80, 40, 200, 40], duration: 600 })
    }
  } catch {
    // Fallback: vẽ đường thẳng nếu OSRM lỗi
    const line = new Feature({
      geometry: new LineString([fromLonLat([fromLng, fromLat]), fromLonLat([toLng, toLat])])
    })
    routeSource.addFeature(line)
  }
}

const updateNextManeuver = () => {
  if (navigationSteps.value.length > 0 && currentStepIndex.value < navigationSteps.value.length) {
    const step = navigationSteps.value[currentStepIndex.value]
    if (!step) return
    nextManeuver.value = {
      instruction: step.instruction,
      type: step.modifier || step.type,
      distance: Math.round(step.distance)
    }
  } else {
    nextManeuver.value = null
  }
}

const stopNavigation = () => {
  isNavigating.value = false
  navDestName.value = ''
  routeSource?.clear()
  destSource?.clear()
  // Xóa query params
  router.replace({ path: '/customer/home' })
}

const registerMapClick = (lots: NearbyLot[]) => {
  if (!olMap) return
  if (mapClickListener) olMap.un('click', mapClickListener)

  mapClickListener = (e: { pixel: number[]; coordinate: number[] }) => {
    if (isNavigating.value) return
    let hitLot = false
    olMap!.forEachFeatureAtPixel(e.pixel, (feature) => {
      const lotId = feature.get('lotId') as number | undefined
      if (lotId !== undefined) {
        const lot = lots.find(l => l.id === lotId)
        if (lot) { chooseLot(lot); hitLot = true }
      }
    })
    if (!hitLot) {
      const coord = toLonLat(e.coordinate)
      placeDestinationMarker(coord[1] ?? 0, coord[0] ?? 0)
    }
  }
  olMap.on('click', mapClickListener)
}

const updateMyLocation = (lat: number, lng: number) => {
  if (!myLocSource) return
  myLocSource.clear()
  myLocSource.addFeature(new Feature({ geometry: new Point(fromLonLat([lng, lat])) }))

  // Nếu đang dẫn đường, kiểm tra xem đã đến điểm rẽ tiếp theo chưa
  if (isNavigating.value && navigationSteps.value.length > 0) {
    const nextStep = navigationSteps.value[currentStepIndex.value]
    if (nextStep) {
      const distToNext = calculateDistance(lat, lng, nextStep.location[1], nextStep.location[0])
      // Nếu cách điểm rẽ < 20m, chuyển sang bước tiếp theo
      if (distToNext < 20) {
        currentStepIndex.value++
        updateNextManeuver()
      } else {
        // Cập nhật khoảng cách còn lại của bước hiện tại
        if (nextManeuver.value) {
          nextManeuver.value.distance = Math.round(distToNext)
        }
      }
    }
  }
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000 // Bán kính trái đất (m)
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const placeDestinationMarker = (lat: number, lng: number) => {
  if (!destSource || !olMap) return
  destSource.clear()
  destSource.addFeature(new Feature({ geometry: new Point(fromLonLat([lng, lat])) }))
  olMap.getView().animate({ center: fromLonLat([lng, lat]), duration: 300 })
  findNearestLots(lat, lng)
}

const findNearestLots = async (lat: number, lng: number) => {
  try {
    const data = await CustomerService.findNearestParking({ lat, lng, radiusKm: 10 })
    nearbyLots.value = data.map((l: NearbyParkingLot) => ({
      id: l.id,
      name: l.name,
      address: l.address,
      distanceMeters: l.distanceMeters,
      availableSpots: l.availableSpots,
      pricePerHour: l.pricePerHour,
      depositAmount: (l as NearbyParkingLot & { depositAmount?: number }).depositAmount || 20000,
      lat: (l as NearbyParkingLot & { latitude?: number }).latitude || (l as NearbyParkingLot & { lat?: number }).lat || 0,
      lng: (l as NearbyParkingLot & { longitude?: number }).longitude || (l as NearbyParkingLot & { lng?: number }).lng || 0
    }))
    selectedLot.value = null
    showLotMarkersOnMap(nearbyLots.value)
    registerMapClick(nearbyLots.value)
  } catch (error) {
    console.error('Lỗi khi tải bãi xe:', error)
  }
}

const showLotMarkersOnMap = (lots: NearbyLot[]) => {
  if (!lotSource) return
  lotSource.clear()
  lots.forEach((lot, idx) => {
    const f = new Feature({ geometry: new Point(fromLonLat([lot.lng, lot.lat])) })
    f.set('lotId', lot.id)
    f.setStyle(makeLotStyle(lot, idx))
    lotSource!.addFeature(f)
  })
}

const onSearchInput = () => {
  if (searchTimer) clearTimeout(searchTimer)
  if (!searchQuery.value.trim()) { placeSuggestions.value = []; return }
  searchTimer = setTimeout(() => fetchPlaceSuggestions(searchQuery.value), 500)
}

const fetchPlaceSuggestions = async (query: string) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=vi&addressdetails=1`,
      { headers: { 'Accept-Language': 'vi' } }
    )
    const data = await res.json()
    placeSuggestions.value = data.map((item: { display_name: string; lat: string; lon: string }) => {
      const parts = item.display_name.split(', ')
      return { main: parts[0], secondary: parts.slice(1, 4).join(', '), lat: parseFloat(item.lat), lng: parseFloat(item.lon) }
    })
  } catch { placeSuggestions.value = [] }
}

const selectSuggestion = (s: { main: string; secondary: string; lat: number; lng: number }) => {
  searchQuery.value = s.main
  showSuggestions.value = false
  placeSuggestions.value = []
  if (s.lat && s.lng) {
    placeDestinationMarker(s.lat, s.lng)
    olMap?.getView().animate({ center: fromLonLat([s.lng, s.lat]), zoom: 16, duration: 400 })
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  placeSuggestions.value = []
  showSuggestions.value = false
  destSource?.clear()
  nearbyLots.value = []
  selectedLot.value = null
  showLotMarkersOnMap([])
  registerMapClick([])
}

const recenterToMyLocation = () => {
  olMap?.getView().animate({ center: fromLonLat([currentLng, currentLat]), zoom: 15, duration: 400 })
}

const chooseLot = (lot: NearbyLot) => {
  selectedLot.value = lot
  olMap?.getView().animate({ center: fromLonLat([lot.lng, lot.lat]), zoom: 16, duration: 300 })
}

const goToBooking = () => {
  if (!selectedLot.value) return
  if (!authStore.isAuthenticated) {
    router.push('/customer/auth')
    return
  }
  router.push({ path: '/customer/map-booking', query: { lotId: selectedLot.value.id } })
}

let watchId: number | null = null

onMounted(() => {
  if (!navigator.geolocation) {
    initMap()
    return
  }

  let mapInitialized = false

  // Bước 1: Thử lấy vị trí NHANH (không cần chính xác tuyệt đối) để hiện bản đồ ngay lập tức
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      if (!mapInitialized) {
        currentLat = pos.coords.latitude
        currentLng = pos.coords.longitude
        mapInitialized = true
        initMap()
      }
    },
    () => {
      if (!mapInitialized) {
        mapInitialized = true
        initMap() // Fallback về Quy Nhơn nếu GPS quá chậm
      }
    },
    { enableHighAccuracy: false, timeout: 3000, maximumAge: 60000 }
  )

  // Bước 2: Theo dõi vị trí chính xác hơn trong background
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      currentLat = pos.coords.latitude
      currentLng = pos.coords.longitude

      if (!mapInitialized) {
        mapInitialized = true
        initMap()
      } else {
        updateMyLocation(currentLat, currentLng)
        // Chỉ tự động recenter nếu độ chính xác cực tốt (tránh bị nhảy map liên tục)
        if (pos.coords.accuracy < 30 && !isNavigating.value) {
          // olMap?.getView().animate({ center: fromLonLat([currentLng, currentLat]), duration: 500 })
        }
      }
    },
    (err) => {
      console.warn('GPS watch error:', err.message)
      if (!mapInitialized) {
        mapInitialized = true
        initMap()
      }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
  )
})

onUnmounted(() => {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId)
  if (olMap) { olMap.setTarget(undefined); olMap = null }
})
</script>

<style scoped>
/* Wrapper toàn trang — scroll dọc bình thường */
.home-page-wrapper {
  width: 100%;
  background: #f8fafc;
}

/* === PHẦN BẢN ĐỒ === */
.map-section {
  position: relative;
  width: 100%;
  height: 420px;
  overflow: hidden;
  background: #e2e8f0;
  flex-shrink: 0;
}

.ol-map-container {
  width: 100%;
  height: 100%;
}

/* Search bar nổi */
.search-overlay-bar {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  z-index: 20;
}

.search-input-box {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 0 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  height: 46px;
  gap: 8px;
}

.search-icon-svg { width: 16px; height: 16px; color: #94a3b8; flex-shrink: 0; }

.search-text-input {
  flex: 1; border: none; outline: none;
  font-size: 14px; font-weight: 600; color: #0f172a; background: transparent;
}
.search-text-input::placeholder { color: #94a3b8; font-weight: 500; }

.clear-search-btn { background: none; border: none; color: #94a3b8; font-size: 13px; cursor: pointer; padding: 2px; }

.suggestions-dropdown {
  background: white; border-radius: 10px; margin-top: 4px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.12); overflow: hidden;
}
.suggestion-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; cursor: pointer; border-bottom: 1px solid #f1f5f9;
}
.suggestion-item:last-child { border-bottom: none; }
.suggestion-item:hover { background: #f8fafc; }
.suggestion-icon { font-size: 14px; flex-shrink: 0; }
.suggestion-text { display: flex; flex-direction: column; min-width: 0; }
.suggestion-main { font-size: 13px; font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.suggestion-sub { font-size: 11px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.suggestions-overlay { position: fixed; inset: 0; z-index: 15; }

/* Nút định vị */
.btn-relocate {
  position: absolute; right: 12px; bottom: 12px; z-index: 20;
  width: 40px; height: 40px; border-radius: 50%; background: white; border: none;
  box-shadow: 0 3px 10px rgba(0,0,0,0.15); display: flex; align-items: center;
  justify-content: center; cursor: pointer; color: #2563eb;
}

/* === PANEL BÃI GẦN NHẤT (ngoài map) === */
.nearby-panel {
  background: white;
  border-top: 1px solid #f1f5f9;
  padding: 14px 16px 16px;
}

.nearby-title {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 10px 0;
}

.nearby-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nearby-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  border: 1.5px solid #f1f5f9;
  transition: border-color 0.15s;
}
.nearby-card:active { border-color: #2563eb; background: #eff6ff; }

.nearby-card-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: #eff6ff; color: #2563eb;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.nearby-card-info { flex: 1; min-width: 0; text-align: left; }
.nearby-card-info h4 { margin: 0 0 2px 0; font-size: 12.5px; font-weight: 800; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nearby-card-info p { margin: 0 0 4px 0; font-size: 10.5px; color: #64748b; display: flex; align-items: center; gap: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.nearby-pills { display: flex; gap: 6px; font-size: 10px; font-weight: 700; }
.pill-dist { color: #94a3b8; }
.pill-avail.green { color: #16a34a; }
.pill-avail.orange { color: #ea580c; }

.nearby-card-price { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; padding-left: 10px; border-left: 1px dashed #e2e8f0; }
.nearby-card-price strong { font-size: 15px; font-weight: 800; color: #0f172a; }
.nearby-card-price span { font-size: 9.5px; color: #64748b; }

/* === PANEL CHI TIẾT BÃI ĐÃ CHỌN (ngoài map) === */
.detail-panel {
  background: white;
  border-top: 1px solid #f1f5f9;
  padding: 14px 16px 16px;
}

.detail-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.detail-panel-header h3 { margin: 0 0 3px 0; font-size: 15px; font-weight: 800; color: #0f172a; }

.detail-address {
  margin: 0;
  font-size: 11.5px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 3px;
}

.detail-panel-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.spots-badge { font-size: 10.5px; font-weight: 700; padding: 3px 8px; border-radius: 20px; }
.spots-badge.green { background: #dcfce7; color: #16a34a; }
.spots-badge.orange { background: #fff7ed; color: #ea580c; }

.btn-close-detail {
  background: #f1f5f9; border: none; width: 26px; height: 26px;
  border-radius: 50%; cursor: pointer; color: #64748b;
  display: flex; align-items: center; justify-content: center;
}

.detail-meta-row {
  display: flex; margin-bottom: 14px;
  background: #f8fafc; border-radius: 10px; overflow: hidden;
}
.meta-item { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 10px 6px; border-right: 1px solid #e2e8f0; }
.meta-item:last-child { border-right: none; }
.meta-label { font-size: 9.5px; color: #94a3b8; font-weight: 600; text-transform: uppercase; margin-bottom: 3px; }
.meta-value { font-size: 13px; font-weight: 800; color: #1e293b; }
.meta-value.blue { color: #2563eb; }

.btn-book-now {
  width: 100%; padding: 13px; display: flex; align-items: center; justify-content: center; gap: 8px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white; border: none; border-radius: 12px;
  font-size: 14px; font-weight: 800; cursor: pointer;
  box-shadow: 0 4px 12px rgba(37,99,235,0.25);
}
.btn-book-now:active { opacity: 0.9; }

/* === PHẦN GIỚI THIỆU === */
.intro-section {
  padding: 20px 16px 24px;
  background: white;
  border-top: 1px solid #f1f5f9;
}

.intro-header { text-align: center; margin-bottom: 18px; }
.intro-title { margin: 0 0 4px 0; font-size: 18px; font-weight: 800; color: #0f172a; }
.brand-blue { color: #2563eb; }
.intro-sub { margin: 0; font-size: 12px; color: #64748b; font-weight: 500; }

.feature-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px;
}
.feature-card {
  background: #f8fafc; border-radius: 12px; padding: 14px 12px;
  text-align: left; border: 1px solid #f1f5f9;
}
.feature-icon { font-size: 22px; margin-bottom: 6px; }
.feature-card h4 { margin: 0 0 4px 0; font-size: 13px; font-weight: 800; color: #1e293b; }
.feature-card p { margin: 0; font-size: 11px; color: #64748b; line-height: 1.5; }

.stats-row {
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-radius: 14px; padding: 16px;
}
.stat-item { flex: 1; text-align: center; color: white; }
.stat-item strong { display: block; font-size: 22px; font-weight: 900; }
.stat-item span { font-size: 11px; opacity: 0.85; font-weight: 600; }
.stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.25); }

/* === BANNER CHỈ ĐƯỜNG (KIỂU GOOGLE MAPS) === */
.enhanced-nav {
  flex-direction: column;
  padding: 0 !important;
  overflow: hidden;
  border: none !important;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
}

.nav-instruction-box {
  width: 100%;
  background: #059669; /* Xanh lá kiểu Maps */
  color: white;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-direction-icon {
  width: 44px;
  height: 44px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-direction-icon svg {
  width: 28px;
  height: 28px;
  color: white;
}

.nav-text-group {
  flex: 1;
}

.nav-dist-text {
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.5px;
}

.nav-instruction-text {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  opacity: 0.9;
}

.nav-dest-info {
  width: 100%;
  padding: 10px 16px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
  border-top: 1px solid #f1f5f9;
}

.btn-stop-nav-small {
  background: #fee2e2;
  color: #dc2626;
  border: none;
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 11px;
  cursor: pointer;
}

.nav-banner {
  position: absolute;
  top: 70px;
  left: 12px;
  right: 12px;
  z-index: 22;
  background: white;
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.2);
  border: 1.5px solid #bfdbfe;
}

.btn-stop-nav {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fee2e2;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
}
</style>
