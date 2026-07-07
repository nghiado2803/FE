<template>
  <div class="admin-page-container animated fade-in">
    <div class="page-header-wrapper">
      <div class="header-title-area">
        <h2>Quản lý bãi đỗ xe</h2>
      </div>
      <div class="header-action-group">
        <router-link to="/" class="btn-secondary">
          <span class="icon"></span> Trang chủ Portal
        </router-link>
        <button class="btn-primary" @click="openCreateModal">
          <span class="icon">➕</span> Khai báo bãi đỗ mới
        </button>
      </div>
    </div>

    <div class="status-indicator-zone margin-bottom-16">
      <div v-if="isLoading" class="alert-box info">
        ⏳ Hệ thống đang đồng bộ dữ liệu Real-time từ Backend...
      </div>
      <div v-else-if="errorMessage" class="alert-box error">
        ⚠️ {{ errorMessage }} (Đang hiển thị dữ liệu dự phòng)
      </div>
    </div>

    <div v-if="!isLoading" class="main-data-card">
      <div class="table-responsive">
        <table class="modern-admin-table">
          <thead>
            <tr>
              <th>Thông tin Bãi đỗ</th>
              <th>Sức chứa & Trạng thái</th>
              <th>Biểu phí & Đặt cọc</th>
              <th>Cấu hình giữ chỗ (Web)</th>
              <th>Tình trạng</th>
              <th class="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lot in parkingLots" :key="lot.id" class="table-row-interactive">
              <td>
                <div class="primary-text-bold text-blue-dark">{{ lot.name }}</div>
                <div class="text-muted text-xs margin-top-4">📍 {{ lot.address }}</div>
                <div v-if="lot.latitude && lot.longitude" class="text-muted text-xxs margin-top-2">
                  🧭 GPS: {{ lot.latitude }}, {{ lot.longitude }}
                </div>
              </td>

              <td>
                <div class="occupancy-wrapper">
                  <div class="occupancy-stats">
                    <span class="text-success-bold">Trống: {{ lot.totalSpots - (lot.occupiedSpots || 0) }}</span>
                    <span class="text-muted text-xs">/ {{ lot.totalSpots }} ô</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div
                      class="progress-bar-fill"
                      :style="{ width: (((lot.occupiedSpots || 0) / lot.totalSpots) * 100) + '%' }"
                      :class="{ 'warning': ((lot.occupiedSpots || 0) / lot.totalSpots) > 0.8, 'danger': ((lot.occupiedSpots || 0) / lot.totalSpots) >= 1 }"
                    ></div>
                  </div>
                </div>
              </td>

              <td>
                <div class="fee-info-box">
                  <div class="badge-price">Phí: {{ (lot.pricePerHour || 0).toLocaleString() }} đ/h</div>
                  <div class="badge-deposit margin-top-4">Cọc: {{ (lot.depositAmount || 0).toLocaleString() }} đ</div>
                </div>
              </td>

              <td>
                <div class="time-policy-box">
                  <div class="policy-item">
                    <span class="icon"></span> Tối đa: <span class="text-primary-weight">{{ lot.maxHoldMinutes || 30 }} phút</span>
                  </div>
                  <div class="policy-item margin-top-4">
                    <span class="icon"></span> Gia hạn: <span class="text-danger-weight">+{{ lot.graceMinutes || 15 }} phút</span>
                  </div>
                </div>
              </td>

              <td>
                <span :class="['status-badge', lot.status === 'ACTIVE' ? 'success' : 'warning']">
                  {{ lot.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đang bảo trì' }}
                </span>
              </td>

              <td>
                <div class="action-buttons-flex center-content">
                  <button class="btn-action-icon edit" title="Cấu hình tham số bãi đỗ" @click="openConfigModal(lot)">⚙️</button>
                  <button class="btn-action-icon gps" title="Cập nhật tọa độ GPS" @click="openGpsModal(lot)">📍</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="isCreateModalOpen" class="modal-overlay" @click.self="closeCreateModal">
          <div class="modal-content max-width-720 animated slide-up-modal">
            <div class="modal-header">
              <div class="header-text">
                <h3> Thêm bãi đỗ xe mới</h3>
                <p>Thiết lập thông tin cơ bản, biểu phí và vị trí GPS</p>
              </div>
              <button class="close-btn" @click="closeCreateModal">✕</button>
            </div>

            <div class="modal-body modal-scrollable">
              <div class="form-section">
                <h4 class="section-title">Thông tin cơ bản</h4>
                <div class="form-grid-2">
                  <div class="form-group col-span-2">
                    <label>Tên điểm đỗ xe <span class="required">*</span></label>
                    <input type="text" v-model="createForm.name" class="form-control" placeholder="VD: Bãi đỗ xe Ghềnh Ráng" />
                  </div>
                  <div class="form-group">
                    <label>Tổng sức chứa (Ô đỗ)</label>
                    <input type="number" v-model.number="createForm.totalSpots" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label>Trạng thái</label>
                    <select v-model="createForm.status" class="form-control">
                      <option value="ACTIVE">Đang hoạt động</option>
                      <option value="MAINTENANCE">Bảo trì tạm thời</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h4 class="section-title">Cấu hình Biểu phí (Lũy tiến)</h4>
                <div class="form-grid-2">
                  <div class="form-group">
                    <label>Giá 2 giờ đầu (VNĐ)</label>
                    <input type="number" v-model.number="createForm.pricePerHour" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label>Mỗi nấc 4 giờ (+) (VNĐ)</label>
                    <input type="number" v-model.number="createForm.priceExtraHour" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label>Trần phí ban ngày (VNĐ)</label>
                    <input type="number" v-model.number="createForm.priceMaxDaytime" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label>Phí phụ thu qua đêm (VNĐ)</label>
                    <input type="number" v-model.number="createForm.priceOvernight" class="form-control" />
                  </div>
                  <div class="form-group col-span-2">
                    <label>Trần phí gửi xe 24h (VNĐ)</label>
                    <input type="number" v-model.number="createForm.priceCap24h" class="form-control" />
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h4 class="section-title">Cấu hình Web Booking</h4>
                <div class="form-grid-2">
                  <div class="form-group">
                    <label>Mức cọc giữ chỗ (VNĐ)</label>
                    <input type="number" v-model.number="createForm.depositAmount" class="form-control" :max="createForm.pricePerHour" />
                    <small v-if="createForm.depositAmount === createForm.pricePerHour" class="helper-text-warning">
                      Tiền cọc tối đa bằng giá 2 giờ đầu ({{ createForm.pricePerHour.toLocaleString() }} đ).
                    </small>
                  </div>
                  <div class="form-group">
                    <label>Thời gian giữ chỗ tối đa (Phút)</label>
                    <input type="number" v-model.number="createForm.maxHoldMinutes" class="form-control" />
                  </div>
                  <div class="form-group col-span-2">
                    <label>Thời gian gia hạn phạt hủy (Phút)</label>
                    <input type="number" v-model.number="createForm.graceMinutes" class="form-control" />
                  </div>
                </div>
              </div>

              <div class="form-section no-border">
                <h4 class="section-title">Vị trí & Tọa độ GPS</h4>
                <div class="form-group margin-bottom-16">
                  <label>Địa chỉ chi tiết <span class="required">*</span></label>
                  <div class="address-search-wrapper">
                    <div class="input-with-action">
                      <input
                        type="text"
                        v-model="createForm.address"
                        class="form-control"
                        placeholder="VD: 123 Hàn Mặc Tử, Quy Nhơn..."
                        @keyup.enter="searchAddress('CREATE')"
                        @input="onAddressInput('CREATE')"
                        @focus="showSuggestions_CREATE = createSuggestions.length > 0"
                        @blur="hideSuggestionsDelayed('CREATE')"
                        autocomplete="off"
                      />
                      <button class="btn-action-icon search" title="Tìm trên bản đồ" @click="searchAddress('CREATE')">
                        <span v-if="isSearching_CREATE">⏳</span>
                        <span v-else>🔍</span>
                      </button>
                    </div>
                    <ul v-if="showSuggestions_CREATE && createSuggestions.length > 0" class="address-suggestions-dropdown">
                      <li
                        v-for="(s, i) in createSuggestions"
                        :key="i"
                        class="suggestion-item"
                        @mousedown.prevent="selectSuggestion('CREATE', s)"
                      >
                        <span class="suggestion-icon">📍</span>
                        <span class="suggestion-text">{{ s.display_name }}</span>
                      </li>
                    </ul>
                  </div>
                  <p class="helper-text">Nhập địa chỉ để xem gợi ý, hoặc nhấn Enter để tìm kiếm.</p>
                </div>

                <p class="helper-text">Hoặc kéo bản đồ và nháy đúp (Double-click) vào vị trí bãi xe để ghim tọa độ chính xác.</p>
                <div class="gps-inputs margin-bottom-12">
                  <input type="number" v-model.number="createForm.latitude" class="form-control" placeholder="Vĩ độ (Lat)" readonly />
                  <input type="number" v-model.number="createForm.longitude" class="form-control" placeholder="Kinh độ (Lng)" readonly />
                  <button v-if="createForm.latitude" class="btn-danger-outline" @click="clearGpsCoordinates">Xóa ghim</button>
                </div>
                <div ref="mapContainer" class="map-container"></div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-secondary" @click="closeCreateModal">Hủy bỏ</button>
              <button class="btn-primary" @click="saveNewParkingLot">Lưu bãi đỗ mới</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
          <div class="modal-content max-width-500 animated slide-up-modal">
            <div class="modal-header">
              <div class="header-text">
                <h3>⚙️ Cấu hình Tham số</h3>
                <p class="text-blue-dark font-bold">{{ editingLot?.name }}</p>
              </div>
              <button class="close-btn" @click="closeModal">✕</button>
            </div>

            <div class="modal-body modal-scrollable">
               <div class="form-section">
                  <h4 class="section-title">Cấu hình Sức chứa</h4>
                  <div class="form-group">
                    <label>Tổng số ô đỗ (Sức chứa tối đa):</label>
                    <input type="number" v-model.number="form.totalSpots" class="form-control" />
                  </div>
               </div>

               <div class="form-section">
                  <h4 class="section-title">Biểu phí lũy tiến & Qua đêm</h4>
                  <div class="form-grid-2">
                    <div class="form-group">
                      <label>Giá 2 giờ đầu (VNĐ):</label>
                      <input type="number" v-model.number="form.pricePerHour" class="form-control" />
                    </div>
                    <div class="form-group">
                      <label>Phí mỗi nấc 4 giờ (+) (VNĐ):</label>
                      <input type="number" v-model.number="form.priceExtraHour" class="form-control" />
                    </div>
                    <div class="form-group">
                      <label>Trần phí ban ngày (VNĐ):</label>
                      <input type="number" v-model.number="form.priceMaxDaytime" class="form-control" />
                    </div>
                    <div class="form-group">
                      <label>Phí phụ thu qua đêm (VNĐ):</label>
                      <input type="number" v-model.number="form.priceOvernight" class="form-control" />
                    </div>
                    <div class="form-group col-span-2">
                      <label>Trần phí gửi xe 24h (VNĐ):</label>
                      <input type="number" v-model.number="form.priceCap24h" class="form-control" />
                    </div>
                  </div>
               </div>

               <div class="form-section no-border">
                  <h4 class="section-title">Tham số Web & Booking</h4>
                  <div class="form-grid-2">
                    <div class="form-group">
                      <label>Mức tiền cọc giữ chỗ (VNĐ):</label>
                      <input type="number" v-model.number="form.depositAmount" class="form-control" :max="form.pricePerHour" />
                      <small v-if="form.depositAmount === form.pricePerHour" class="helper-text-warning">
                        Tiền cọc tối đa bằng giá 2 giờ đầu ({{ form.pricePerHour.toLocaleString() }} đ).
                      </small>
                    </div>
                    <div class="form-group">
                      <label>Giữ chỗ tối đa (Phút):</label>
                      <input type="number" v-model.number="form.maxHoldMinutes" class="form-control" />
                    </div>
                    <div class="form-group col-span-2">
                      <label>Thời gian gia hạn cảnh báo (Phút):</label>
                      <input type="number" v-model.number="form.graceMinutes" class="form-control" />
                    </div>
                  </div>
               </div>
            </div>

            <div class="modal-footer">
              <button class="btn-secondary" @click="closeModal">Hủy</button>
              <button class="btn-primary" @click="saveConfigParams">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="isGpsModalOpen" class="modal-overlay" @click.self="closeGpsModal">
          <div class="modal-content max-width-720 animated slide-up-modal">
            <div class="modal-header">
              <div class="header-text">
                <h3>📍 Chỉnh sửa Bãi đỗ xe</h3>
                <p class="text-blue-dark font-bold">{{ gpsEditingLot?.name }}</p>
              </div>
              <button class="close-btn" @click="closeGpsModal">✕</button>
            </div>

            <div class="modal-body modal-scrollable">
              <div class="form-section">
                <h4 class="section-title">Thông tin cơ bản</h4>
                <div class="form-grid-2">
                  <div class="form-group col-span-2">
                    <label>Tên bãi đỗ xe <span class="required">*</span></label>
                    <input type="text" v-model="gpsForm.name" class="form-control" placeholder="VD: Bãi đỗ xe Ghềnh Ráng" />
                  </div>
                  <div class="form-group col-span-2">
                    <label>Trạng thái hoạt động</label>
                    <div class="status-toggle-group">
                      <button
                        type="button"
                        :class="['status-toggle-btn', gpsForm.status === 'ACTIVE' ? 'active-selected' : '']"
                        @click="gpsForm.status = 'ACTIVE'"
                      >
                        <span class="toggle-dot green"></span> Đang hoạt động
                      </button>
                      <button
                        type="button"
                        :class="['status-toggle-btn', gpsForm.status === 'MAINTENANCE' ? 'maintenance-selected' : '']"
                        @click="gpsForm.status = 'MAINTENANCE'"
                      >
                        <span class="toggle-dot orange"></span> Bảo trì tạm thời
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-section no-border">
                <h4 class="section-title">Vị trí & Tọa độ GPS</h4>
                <div class="form-group margin-bottom-16">
                  <label>Địa chỉ chi tiết <span class="required">*</span></label>
                  <div class="address-search-wrapper">
                    <div class="input-with-action">
                      <input
                        type="text"
                        v-model="gpsForm.address"
                        class="form-control"
                        placeholder="VD: 123 Hàn Mặc Tử, Quy Nhơn..."
                        @keyup.enter="searchAddress('EDIT')"
                        @input="onAddressInput('EDIT')"
                        @focus="showSuggestions_EDIT = editSuggestions.length > 0"
                        @blur="hideSuggestionsDelayed('EDIT')"
                        autocomplete="off"
                      />
                      <button class="btn-action-icon search" title="Tìm trên bản đồ" @click="searchAddress('EDIT')">
                        <span v-if="isSearching_EDIT">⏳</span>
                        <span v-else>🔍</span>
                      </button>
                    </div>
                    <ul v-if="showSuggestions_EDIT && editSuggestions.length > 0" class="address-suggestions-dropdown">
                      <li
                        v-for="(s, i) in editSuggestions"
                        :key="i"
                        class="suggestion-item"
                        @mousedown.prevent="selectSuggestion('EDIT', s)"
                      >
                        <span class="suggestion-icon">📍</span>
                        <span class="suggestion-text">{{ s.display_name }}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <p class="helper-text">Nháy đúp (Double-click) vào bản đồ để dời vị trí ghim của bãi xe.</p>
                <div class="gps-coord-display margin-bottom-12">
                  <div class="coord-chip">
                    <span class="coord-label">Vĩ độ (Lat)</span>
                    <span class="coord-value">{{ gpsForm.latitude ?? '—' }}</span>
                  </div>
                  <div class="coord-chip">
                    <span class="coord-label">Kinh độ (Lng)</span>
                    <span class="coord-value">{{ gpsForm.longitude ?? '—' }}</span>
                  </div>
                </div>
                <div ref="gpsMapContainer" class="map-container large"></div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-secondary" @click="closeGpsModal">Hủy</button>
              <button class="btn-primary" @click="saveGpsCoordinates">💾 Lưu thay đổi</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch, onMounted } from 'vue'
import { AdminService } from '@/services/admin.service'

// Import OpenLayers (Giữ nguyên logic chuẩn của bạn)
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import { fromLonLat, toLonLat } from 'ol/proj'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Style, Circle, Fill, Stroke } from 'ol/style'
import { defaults as defaultInteractions } from 'ol/interaction'
import 'ol/ol.css'

// Data Types bổ sung pricePerHour
type ParkingLot = {
  id: number
  name: string
  address: string
  totalSpots: number
  occupiedSpots: number
  pricePerHour: number
  priceExtraHour: number
  priceMaxDaytime: number
  priceOvernight: number
  priceCap24h: number
  depositAmount: number
  maxHoldMinutes: number
  graceMinutes: number
  latitude?: number
  longitude?: number
  status: 'ACTIVE' | 'MAINTENANCE'
}

type ParkingLotInput = Omit<ParkingLot, 'id'>
type ParkingLotConfigForm = Pick<ParkingLot, 'totalSpots' | 'pricePerHour' | 'priceExtraHour' | 'priceMaxDaytime' | 'priceOvernight' | 'priceCap24h' | 'depositAmount' | 'maxHoldMinutes' | 'graceMinutes'>
type GpsEditForm = { name: string; address: string; status: 'ACTIVE' | 'MAINTENANCE'; latitude?: number; longitude?: number }

// Refs
const parkingLots = ref<ParkingLot[]>([])
const isLoading = ref<boolean>(true)
const errorMessage = ref<string | null>(null)

// Create Modal Refs
const isCreateModalOpen = ref<boolean>(false)
const createForm = ref<ParkingLotInput>({
  name: '', address: '', totalSpots: 50, occupiedSpots: 0,
  pricePerHour: 15000, priceExtraHour: 5000, priceMaxDaytime: 40000,
  priceOvernight: 20000, priceCap24h: 50000,
  depositAmount: 20000, maxHoldMinutes: 30, graceMinutes: 15,
  status: 'ACTIVE', latitude: undefined, longitude: undefined
})
const mapContainer = ref<HTMLDivElement | null>(null)
let map: Map | null = null
let vectorSource: VectorSource | null = null

// Config Modal Refs
const isModalOpen = ref<boolean>(false)
const editingLot = ref<ParkingLot | null>(null)
const form = ref<ParkingLotConfigForm>({
  totalSpots: 0, pricePerHour: 0, priceExtraHour: 0,
  priceMaxDaytime: 0, priceOvernight: 0, priceCap24h: 0,
  depositAmount: 0, maxHoldMinutes: 0, graceMinutes: 0
})

// GPS Modal Refs
const isGpsModalOpen = ref<boolean>(false)
const gpsEditingLot = ref<ParkingLot | null>(null)
const gpsForm = ref<GpsEditForm>({ name: '', address: '', status: 'ACTIVE', latitude: undefined, longitude: undefined })
const gpsMapContainer = ref<HTMLDivElement | null>(null)
let gpsMap: Map | null = null
let gpsVectorSource: VectorSource | null = null

// Ràng buộc Tiền cọc <= Giá 2 giờ đầu (Tạo mới)
watch([() => createForm.value.pricePerHour, () => createForm.value.depositAmount], ([newPrice, newDeposit]) => {
  if (newDeposit > newPrice) {
    createForm.value.depositAmount = newPrice
  }
})

// Ràng buộc Tiền cọc <= Giá 2 giờ đầu (Chỉnh sửa)
watch([() => form.value.pricePerHour, () => form.value.depositAmount], ([newPrice, newDeposit]) => {
  if (newDeposit > newPrice) {
    form.value.depositAmount = newPrice
  }
})

// Methods
const loadParkingLotsData = async () => {
  try {
    isLoading.value = true
    const response = await AdminService.getParkingLots()
    parkingLots.value = (response as (ParkingLot & { availableSpots?: number })[]).map(lot => ({
      ...lot,
      occupiedSpots: lot.totalSpots - (lot.availableSpots ?? 0)
    }))
  } catch {
    errorMessage.value = 'Mất kết nối với Server API!'
  } finally {
    isLoading.value = false
  }
}

// Logic cho bản đồ tạo mới
const initializeMap = async () => {
  await nextTick()
  if (!mapContainer.value) return
  if (map) { map.updateSize(); return }

  vectorSource = new VectorSource()
  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
      image: new Circle({ radius: 8, fill: new Fill({ color: 'rgba(239, 68, 68, 0.8)' }), stroke: new Stroke({ color: '#b91c1c', width: 2 }) })
    })
  })

  map = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({ source: new XYZ({ url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi&gl=vn' }) }),
      vectorLayer
    ],
    view: new View({ center: fromLonLat([109.2198, 13.7745]), zoom: 13 }), // Default TT Quy Nhơn
    interactions: defaultInteractions({ doubleClickZoom: false })
  })

  map.on('dblclick', (event) => {
    const coords = event.coordinate
    if (!coords) return
    const lonLat = toLonLat(coords)
    createForm.value.longitude = Number((lonLat[0] ?? 0).toFixed(6))
    createForm.value.latitude = Number((lonLat[1] ?? 0).toFixed(6))
  })

  watch([() => createForm.value.latitude, () => createForm.value.longitude], ([lat, lng]) => {
    if (lat && lng && vectorSource) {
      vectorSource.clear()
      vectorSource.addFeature(new Feature({ geometry: new Point(fromLonLat([lng, lat])) }))
    }
  })
}

onMounted(() => {
  loadParkingLotsData()
})

// Logic cho bản đồ cập nhật GPS
const initializeGpsMap = async () => {
  await nextTick()
  if (!gpsMapContainer.value) return
  if (gpsMap) { gpsMap.updateSize(); return }

  gpsVectorSource = new VectorSource()
  const vectorLayer = new VectorLayer({
    source: gpsVectorSource,
    style: new Style({
      image: new Circle({ radius: 8, fill: new Fill({ color: 'rgba(59, 130, 246, 0.8)' }), stroke: new Stroke({ color: '#1d4ed8', width: 2 }) })
    })
  })

  const initialLat = gpsForm.value.latitude || 13.7745
  const initialLng = gpsForm.value.longitude || 109.2198

  gpsMap = new Map({
    target: gpsMapContainer.value,
    layers: [
      new TileLayer({ source: new XYZ({ url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi&gl=vn' }) }),
      vectorLayer
    ],
    view: new View({ center: fromLonLat([initialLng, initialLat]), zoom: 16 }),
    interactions: defaultInteractions({ doubleClickZoom: false })
  })

  if (gpsForm.value.latitude && gpsForm.value.longitude) {
    gpsVectorSource.addFeature(new Feature({ geometry: new Point(fromLonLat([gpsForm.value.longitude, gpsForm.value.latitude])) }))
  }

  gpsMap.on('dblclick', (event) => {
    const coords = event.coordinate
    if (!coords) return
    const lonLat = toLonLat(coords)
    gpsForm.value.longitude = Number((lonLat[0] ?? 0).toFixed(6))
    gpsForm.value.latitude = Number((lonLat[1] ?? 0).toFixed(6))
  })

  watch([() => gpsForm.value.latitude, () => gpsForm.value.longitude], ([lat, lng]) => {
    if (lat && lng && gpsVectorSource) {
      gpsVectorSource.clear()
      gpsVectorSource.addFeature(new Feature({ geometry: new Point(fromLonLat([lng, lat])) }))
    }
  })
}

const clearGpsCoordinates = () => {
  createForm.value.latitude = undefined
  createForm.value.longitude = undefined
  if (vectorSource) vectorSource.clear()
}

// Logic Tìm kiếm địa chỉ tự động
interface NominatimResult {
  display_name: string
  lat: string
  lon: string
}

// Suggestion state
const createSuggestions = ref<NominatimResult[]>([])
const editSuggestions = ref<NominatimResult[]>([])
const showSuggestions_CREATE = ref(false)
const showSuggestions_EDIT = ref(false)
const isSearching_CREATE = ref(false)
const isSearching_EDIT = ref(false)
let suggestTimeout_CREATE: ReturnType<typeof setTimeout> | null = null
let suggestTimeout_EDIT: ReturnType<typeof setTimeout> | null = null

const fetchSuggestions = async (query: string, mode: 'CREATE' | 'EDIT') => {
  if (!query || query.length < 4) {
    if (mode === 'CREATE') { createSuggestions.value = []; showSuggestions_CREATE.value = false }
    else { editSuggestions.value = []; showSuggestions_EDIT.value = false }
    return
  }
  try {
    if (mode === 'CREATE') isSearching_CREATE.value = true
    else isSearching_EDIT.value = true

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=vn&accept-language=vi`,
      { headers: { 'Accept-Language': 'vi' } }
    )
    const data: NominatimResult[] = await res.json()
    if (mode === 'CREATE') {
      createSuggestions.value = data
      showSuggestions_CREATE.value = data.length > 0
    } else {
      editSuggestions.value = data
      showSuggestions_EDIT.value = data.length > 0
    }
  } catch (e) {
    console.error('Lỗi gợi ý địa chỉ:', e)
  } finally {
    if (mode === 'CREATE') isSearching_CREATE.value = false
    else isSearching_EDIT.value = false
  }
}

const onAddressInput = (mode: 'CREATE' | 'EDIT') => {
  const val = mode === 'CREATE' ? createForm.value.address : gpsForm.value.address
  if (mode === 'CREATE') {
    if (suggestTimeout_CREATE) clearTimeout(suggestTimeout_CREATE)
    suggestTimeout_CREATE = setTimeout(() => fetchSuggestions(val, 'CREATE'), 400)
  } else {
    if (suggestTimeout_EDIT) clearTimeout(suggestTimeout_EDIT)
    suggestTimeout_EDIT = setTimeout(() => fetchSuggestions(val, 'EDIT'), 400)
  }
}

const selectSuggestion = (mode: 'CREATE' | 'EDIT', s: NominatimResult) => {
  const lat = Number(parseFloat(s.lat).toFixed(6))
  const lng = Number(parseFloat(s.lon).toFixed(6))

  if (mode === 'CREATE') {
    createForm.value.address = s.display_name
    createForm.value.latitude = lat
    createForm.value.longitude = lng
    showSuggestions_CREATE.value = false
    createSuggestions.value = []
    if (map) map.getView().animate({ center: fromLonLat([lng, lat]), zoom: 18, duration: 600 })
    // Đặt marker
    if (vectorSource) {
      vectorSource.clear()
      vectorSource.addFeature(new Feature({ geometry: new Point(fromLonLat([lng, lat])) }))
    }
  } else {
    gpsForm.value.address = s.display_name
    gpsForm.value.latitude = lat
    gpsForm.value.longitude = lng
    showSuggestions_EDIT.value = false
    editSuggestions.value = []
    if (gpsMap) gpsMap.getView().animate({ center: fromLonLat([lng, lat]), zoom: 18, duration: 600 })
    if (gpsVectorSource) {
      gpsVectorSource.clear()
      gpsVectorSource.addFeature(new Feature({ geometry: new Point(fromLonLat([lng, lat])) }))
    }
  }
}

const hideSuggestionsDelayed = (mode: 'CREATE' | 'EDIT') => {
  setTimeout(() => {
    if (mode === 'CREATE') showSuggestions_CREATE.value = false
    else showSuggestions_EDIT.value = false
  }, 200)
}

const searchAddress = async (mode: 'CREATE' | 'EDIT') => {
  const address = mode === 'CREATE' ? createForm.value.address : gpsForm.value.address
  if (!address || address.length < 4) return

  // Nếu đang có suggestion, dùng cái đầu tiên luôn
  const suggestions = mode === 'CREATE' ? createSuggestions.value : editSuggestions.value
  if (suggestions.length > 0 && suggestions[0]) {
    selectSuggestion(mode, suggestions[0])
    return
  }

  try {
    if (mode === 'CREATE') isSearching_CREATE.value = true
    else isSearching_EDIT.value = true

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&countrycodes=vn&accept-language=vi`,
      { headers: { 'Accept-Language': 'vi' } }
    )
    const data: NominatimResult[] = await response.json()
    if (data && data.length > 0 && data[0]) {
      selectSuggestion(mode, data[0])
    }
  } catch (error) {
    console.error('Lỗi định vị địa chỉ:', error)
  } finally {
    if (mode === 'CREATE') isSearching_CREATE.value = false
    else isSearching_EDIT.value = false
  }
}

// Modal Handlers
const openCreateModal = () => {
  isCreateModalOpen.value = true
  setTimeout(() => initializeMap(), 100)
}
const closeCreateModal = () => {
  isCreateModalOpen.value = false
  if (map) { map.setTarget(undefined); map = null }
  if (vectorSource) { vectorSource = null }
}
const saveNewParkingLot = async () => {
  try {
    await AdminService.createParkingLot(createForm.value as unknown as Parameters<typeof AdminService.createParkingLot>[0])
    alert('Đã khai báo bãi đỗ mới thành công!')
    closeCreateModal()
    loadParkingLotsData()
  } catch {
    alert('Lỗi khi tạo bãi đỗ mới!')
  }
}

const openConfigModal = (lot: ParkingLot) => {
  editingLot.value = lot
  form.value = {
    totalSpots: lot.totalSpots,
    pricePerHour: lot.pricePerHour,
    priceExtraHour: lot.priceExtraHour,
    priceMaxDaytime: lot.priceMaxDaytime,
    priceOvernight: lot.priceOvernight,
    priceCap24h: lot.priceCap24h,
    depositAmount: lot.depositAmount,
    maxHoldMinutes: lot.maxHoldMinutes,
    graceMinutes: lot.graceMinutes
  }
  isModalOpen.value = true
}
const closeModal = () => { isModalOpen.value = false }
const saveConfigParams = async () => {
  if (!editingLot.value) return
  try {
    await AdminService.updateParkingLot(editingLot.value.id, form.value as Partial<Parameters<typeof AdminService.updateParkingLot>[1]>)
    alert('Đã cập nhật cấu hình bãi đỗ!')
    closeModal()
    loadParkingLotsData()
  } catch {
    alert('Lỗi khi cập nhật cấu hình!')
  }
}

const openGpsModal = (lot: ParkingLot) => {
  gpsEditingLot.value = lot
  gpsForm.value = { name: lot.name, address: lot.address, status: lot.status, latitude: lot.latitude, longitude: lot.longitude }
  isGpsModalOpen.value = true
  setTimeout(() => initializeGpsMap(), 100)
}
const closeGpsModal = () => {
  isGpsModalOpen.value = false
  if (gpsMap) { gpsMap.setTarget(undefined); gpsMap = null }
  if (gpsVectorSource) { gpsVectorSource = null }
}
const saveGpsCoordinates = async () => {
  if (!gpsEditingLot.value) return
  try {
    await AdminService.updateParkingLot(gpsEditingLot.value.id, gpsForm.value as Partial<Parameters<typeof AdminService.updateParkingLot>[1]>)
    alert('Đã cập nhật thông tin và vị trí bãi đỗ!')
    closeGpsModal()
    loadParkingLotsData()
  } catch {
    alert('Lỗi khi cập nhật vị trí!')
  }
}

onMounted(() => { loadParkingLotsData() })
</script>

<style scoped>
/* =========================================================
   DESIGN SYSTEM - SMARTPARK ADMIN
   ========================================================= */
.admin-page-container {
  padding: 32px;
  max-width: 1440px;
  margin: 0 auto;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #1e293b;
  background-color: #f8fafc;
  min-height: 100vh;
}

/* Header */
.page-header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.header-title-area h2 {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}
.subtitle {
  color: #64748b;
  font-size: 15px;
  margin: 0;
}
.header-action-group {
  display: flex;
  gap: 12px;
}

/* Buttons */
button, .btn-secondary {
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  padding: 10px 18px;
  text-decoration: none;
}
.btn-primary {
  background-color: #2563eb;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
}
.btn-primary:hover {
  background-color: #1d4ed8;
  transform: translateY(-1px);
}
.btn-secondary {
  background-color: #ffffff;
  color: #475569;
  border: 1px solid #cbd5e1;
}
.btn-secondary:hover {
  background-color: #f1f5f9;
}
.btn-danger-outline {
  background-color: transparent;
  color: #ef4444;
  border: 1px solid #fca5a5;
  padding: 8px 14px;
}
.btn-danger-outline:hover {
  background-color: #fef2f2;
}

/* Alerts */
.alert-box {
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
}
.alert-box.info { background-color: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
.alert-box.error { background-color: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

/* Table Card */
.main-data-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}
.table-responsive {
  overflow-x: auto;
}
.modern-admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.modern-admin-table th {
  background-color: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}
.modern-admin-table td {
  padding: 18px 20px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}
.table-row-interactive:hover {
  background-color: #f8fafc;
}

/* Typo & Utilities */
.primary-text-bold { font-weight: 700; font-size: 15px; }
.text-blue-dark { color: #0f172a; }
.text-muted { color: #64748b; }
.text-xs { font-size: 13px; }
.text-xxs { font-size: 12px; }
.text-success-bold { color: #059669; font-weight: 700; font-size: 15px; }
.text-primary-weight { color: #2563eb; font-weight: 700; }
.text-danger-weight { color: #dc2626; font-weight: 700; }
.margin-top-2 { margin-top: 4px; }
.margin-top-4 { margin-top: 8px; }
.margin-bottom-12 { margin-bottom: 12px; }
.margin-bottom-16 { margin-bottom: 16px; }

/* Progress Bar */
.occupancy-wrapper { width: 100%; max-width: 180px; }
.occupancy-stats { display: flex; justify-content: space-between; margin-bottom: 6px; }
.progress-bar-bg { width: 100%; height: 8px; background-color: #e2e8f0; border-radius: 4px; overflow: hidden; }
.progress-bar-fill { height: 100%; background-color: #10b981; transition: width 0.3s ease; }
.progress-bar-fill.warning { background-color: #f59e0b; }
.progress-bar-fill.danger { background-color: #ef4444; }

/* Badges */
.badge-price { background-color: #eff6ff; color: #1d4ed8; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 13px; display: inline-block; border: 1px solid #bfdbfe; }
.badge-deposit { background-color: #fef3c7; color: #b45309; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 13px; display: inline-block; border: 1px solid #fde68a; }
.status-badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; }
.status-badge.success { background-color: #dcfce7; color: #166534; }
.status-badge.warning { background-color: #fee2e2; color: #991b1b; }

/* Action Buttons */
.action-buttons-flex { display: flex; gap: 8px; }
.btn-action-icon { width: 36px; height: 36px; border-radius: 8px; padding: 0; font-size: 16px; display: flex; align-items: center; justify-content: center; }
.btn-action-icon.edit { background-color: #f1f5f9; border: 1px solid #e2e8f0; }
.btn-action-icon.edit:hover { background-color: #e2e8f0; }
.btn-action-icon.gps { background-color: #eff6ff; border: 1px solid #bfdbfe; }
.btn-action-icon.gps:hover { background-color: #dbeafe; }
.btn-action-icon.search { background-color: #2563eb; color: white; border: none; border-radius: 0 8px 8px 0; width: 44px; height: 100%; position: absolute; right: 0; top: 0; z-index: 2; }
.btn-action-icon.search:hover { background-color: #1d4ed8; }
.btn-action-icon.map { background-color: #fef2f2; border: 1px solid #fecaca; text-decoration: none;}
.btn-action-icon.map:hover { background-color: #fee2e2; }

/* Modal System */
.modal-overlay { position: fixed; inset: 0; background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 50; padding: 20px; }
.modal-content { background: white; border-radius: 16px; width: 100%; display: flex; flex-direction: column; max-height: calc(100vh - 40px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
.max-width-720 { max-width: 720px; }
.max-width-500 { max-width: 500px; }

.modal-header { padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-start; }
.modal-header h3 { margin: 0 0 4px 0; font-size: 20px; color: #0f172a; }
.modal-header p { margin: 0; font-size: 14px; color: #64748b; }
.close-btn { background: none; border: none; font-size: 20px; color: #94a3b8; padding: 4px; box-shadow: none; }
.close-btn:hover { color: #0f172a; transform: none; background: transparent;}

.modal-body { padding: 24px; overflow-y: auto; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px; background-color: #f8fafc; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px; }

/* Form Elements */
.form-section { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e2e8f0; }
.form-section.no-border { border-bottom: none; margin-bottom: 0; padding-bottom: 0;}
.section-title { margin: 0 0 16px 0; font-size: 16px; color: #1e293b; font-weight: 700; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.col-span-2 { grid-column: span 2; }
.form-group label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: #475569; }
.form-group .required { color: #ef4444; }
.helper-text-warning { font-size: 11px; color: #d97706; margin-top: 4px; display: block; font-weight: 600; }
.input-with-action { position: relative; display: flex; align-items: center; }
.input-with-action .form-control { padding-right: 50px; }
.form-control { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; color: #1e293b; transition: border-color 0.2s; box-sizing: border-box; }
.form-control:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.helper-text { font-size: 13px; color: #64748b; margin-top: 4px; margin-bottom: 12px; }

/* Maps */
.gps-inputs { display: flex; gap: 12px; }
.map-container { width: 100%; height: 300px; border-radius: 8px; border: 1px solid #cbd5e1; overflow: hidden; background-color: #f1f5f9; }
.map-container.large { height: 400px; }

/* Animations */
.animated { animation-duration: 0.3s; animation-fill-mode: both; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideUpModal { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
.fade-in { animation-name: fadeInUp; }
.slide-up-modal { animation-name: slideUpModal; }

/* Status Toggle */
.status-toggle-group { display: flex; gap: 10px; }
.status-toggle-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.status-toggle-btn:hover { border-color: #cbd5e1; background: #f1f5f9; }
.status-toggle-btn.active-selected { border-color: #16a34a; background: #f0fdf4; color: #166534; }
.status-toggle-btn.maintenance-selected { border-color: #d97706; background: #fffbeb; color: #92400e; }
.toggle-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.toggle-dot.green { background-color: #16a34a; }
.toggle-dot.orange { background-color: #d97706; }

/* GPS Coord Display */
.gps-coord-display { display: flex; gap: 12px; }
.coord-chip {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 16px;
}
.coord-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; }
.coord-value { font-size: 15px; font-weight: 700; color: #1e293b; font-variant-numeric: tabular-nums; }

/* Address autocomplete dropdown */
.address-search-wrapper { position: relative; }
.address-suggestions-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 9999;
  max-height: 240px;
  overflow-y: auto;
  list-style: none;
  padding: 4px 0;
  margin: 0;
}
.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f1f5f9;
}
.suggestion-item:last-child { border-bottom: none; }
.suggestion-item:hover { background: #eff6ff; }
.suggestion-icon { flex-shrink: 0; font-size: 14px; margin-top: 1px; }
.suggestion-text { font-size: 13px; color: #1e293b; line-height: 1.4; }
</style>
