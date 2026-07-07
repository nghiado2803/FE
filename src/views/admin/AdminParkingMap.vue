<template>
  <div class="admin-page-container animated fade-in">
    <!-- Header -->
    <div class="page-header-wrapper">
      <div class="header-title-area">
        <h2 class="page-title">Giám sát Bãi đỗ Toàn hệ thống</h2>
      </div>
      <div class="lot-selector-premium">
        <i class="bi bi-geo-alt-fill"></i>
        <select v-model="selectedLotId" @change="fetchMapData" class="premium-select-minimal">
          <option v-for="lot in parkingLots" :key="lot.id" :value="lot.id">
            {{ lot.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- KPI Grid -->
    <div class="kpi-grid margin-bottom-24">
      <div class="kpi-card border-blue">
        <div class="kpi-icon bg-blue-light"><i class="bi bi-grid-3x3"></i></div>
        <div class="kpi-info">
          <p class="kpi-label">Tổng quy mô</p>
          <h3 class="kpi-value text-blue">{{ kpi.total }} <span class="unit">ô đỗ</span></h3>
        </div>
      </div>
      <div class="kpi-card border-emerald">
        <div class="kpi-icon bg-emerald-light"><i class="bi bi-check-circle"></i></div>
        <div class="kpi-info">
          <p class="kpi-label">Sẵn sàng</p>
          <h3 class="kpi-value text-emerald">{{ kpi.available }} <span class="unit">ô trống</span></h3>
        </div>
      </div>
      <div class="kpi-card border-amber">
        <div class="kpi-icon bg-amber-light"><i class="bi bi-clock-history"></i></div>
        <div class="kpi-info">
          <p class="kpi-label">Đang chờ khách</p>
          <h3 class="kpi-value text-amber">{{ kpi.pending }} <span class="unit">xe đặt</span></h3>
        </div>
      </div>
      <div class="kpi-card border-rose">
        <div class="kpi-icon bg-rose-light"><i class="bi bi-car-front-fill"></i></div>
        <div class="kpi-info">
          <p class="kpi-label">Đang lấp đầy</p>
          <h3 class="kpi-value text-rose">{{ kpi.occupied }} <span class="unit">xe đỗ</span></h3>
        </div>
      </div>
    </div>

    <!-- Map Visualization -->
    <div class="main-visual-card margin-bottom-24">
      <div class="card-header-premium">
        <div class="header-left">
          <h3 class="card-title-modern">🗺️ Sơ đồ mặt bằng trực tuyến</h3>
          <div class="occupancy-mini-stats">
            <div class="mini-bar">
              <div class="fill" :style="{ width: occupancyRate + '%' }"></div>
            </div>
            <span>{{ occupancyRate }}% lấp đầy</span>
          </div>
        </div>
        <div class="legend-modern">
          <div class="legend-item"><span class="swatch available"></span> Trống</div>
          <div class="legend-item"><span class="swatch pending"></span> Chờ</div>
          <div class="legend-item"><span class="swatch occupied"></span> Có xe</div>
        </div>
      </div>

      <div class="parking-layout-scroller custom-scrollbar">
        <div class="parking-grid-modern">
          <div
            v-for="spot in mapData?.spots"
            :key="spot.id"
            class="spot-premium"
            :class="spot.status"
            @click="showSpotDetail(spot)"
          >
            <div class="spot-marker"></div>
            <div class="spot-inner-content">
              <span class="spot-id-text">{{ spot.id }}</span>
              <div v-if="spot.status === 'occupied'" class="car-visual animated bounceIn">
                <i class="bi bi-car-front-fill"></i>
                <div class="plate-tag">{{ spot.plate }}</div>
              </div>
              <div v-else-if="spot.status === 'pending'" class="pending-visual">
                <i class="bi bi-hourglass-split"></i>
              </div>
              <div v-else class="available-visual">
                <span>P</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Tables -->
    <div class="tables-layout">
      <!-- Occupied Table -->
      <div class="data-table-card">
        <div class="card-header-simple">
          <h3>🚗 Danh sách xe đang đỗ</h3>
          <span class="badge rose">{{ occupiedSpots.length }}</span>
        </div>
        <div class="table-container custom-scrollbar">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Vị trí</th>
                <th>Biển số</th>
                <th>Thời điểm vào</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="spot in occupiedSpots" :key="spot.id" @click="showSpotDetail(spot)">
                <td class="font-bold">{{ spot.id }}</td>
                <td><span class="plate-label">{{ spot.plate }}</span></td>
                <td class="text-muted">{{ spot.timeIn }}</td>
              </tr>
              <tr v-if="occupiedSpots.length === 0">
                <td colspan="3" class="empty-table">Chưa có xe nào đang đỗ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pending Table -->
      <div class="data-table-card">
        <div class="card-header-simple">
          <h3>⏳ Xe đang chờ (Đã đặt)</h3>
          <span class="badge amber">{{ pendingSpots.length }}</span>
        </div>
        <div class="table-container custom-scrollbar">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Vị trí</th>
                <th>Biển số</th>
                <th>Thời điểm đặt</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="spot in pendingSpots" :key="spot.id" @click="showSpotDetail(spot)">
                <td class="font-bold">{{ spot.id }}</td>
                <td><span class="plate-label">{{ spot.plate }}</span></td>
                <td class="text-muted">{{ spot.timeIn }}</td>
              </tr>
              <tr v-if="pendingSpots.length === 0">
                <td colspan="3" class="empty-table">Không có xe nào đang chờ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <Transition name="modal-scale">
        <div v-if="selectedSpot" class="modal-overlay-premium" @click.self="selectedSpot = null">
          <div class="modal-card-premium animated slideInUp">
            <div class="modal-header-premium" :class="selectedSpot.status">
              <div class="header-top-row">
                <span class="pos-tag">Ô đỗ: {{ selectedSpot.id }}</span>
                <button class="close-btn-circle" @click="selectedSpot = null"><i class="bi bi-x"></i></button>
              </div>
              <div class="header-main-info">
                <i :class="selectedSpot.status === 'occupied' ? 'bi bi-car-front-fill' : 'bi bi-info-circle-fill'"></i>
                <h3>{{ selectedSpot.status === 'available' ? 'Đang trống' : selectedSpot.plate }}</h3>
              </div>
            </div>

            <div class="modal-body-premium">
              <div v-if="selectedSpot.status === 'available'" class="empty-status-content">
                <div class="check-icon-bg"><i class="bi bi-check-lg"></i></div>
                <p>Vị trí này hiện đang trống và sẵn sàng đón khách mới</p>
              </div>
              <div v-else class="detail-grid">
                <div class="detail-item">
                  <label>Trạng thái</label>
                  <span class="status-pill" :class="selectedSpot.status">
                    {{ selectedSpot.status === 'pending' ? 'Đã đặt cọc' : 'Đang đỗ trong bãi' }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>Chủ xe</label>
                  <span class="val-text">{{ selectedSpot.customerName || 'Khách vãng lai' }}</span>
                </div>
                <div class="detail-item">
                  <label>Thời điểm vào</label>
                  <span class="val-text">{{ selectedSpot.timeIn }}</span>
                </div>
                <div class="detail-item">
                  <label>Mã số vé</label>
                  <span class="val-text ticket-code">#{{ selectedSpot.ticketCode }}</span>
                </div>
              </div>
            </div>

            <div class="modal-footer-premium">
              <button class="btn-close-modal" @click="selectedSpot = null">Đóng thông tin</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { AdminService } from '@/services/admin.service'

interface ParkingLot { id: number; name: string; [key: string]: unknown }
interface ParkingSpot { id: string; status: string; plate?: string; timeIn?: string; customerName?: string; ticketCode?: string; [key: string]: unknown }
interface MapData { totalSpots: number; availableCount: number; spots: ParkingSpot[]; [key: string]: unknown }

const parkingLots = ref<ParkingLot[]>([])
const selectedLotId = ref<number | null>(null)
const mapData = ref<MapData | null>(null)
const loading = ref(false)
const selectedSpot = ref<ParkingSpot | null>(null)
let refreshInterval: ReturnType<typeof setInterval> | null = null

const occupancyRate = computed(() => {
  if (!mapData.value) return 0
  const occupied = mapData.value.totalSpots - mapData.value.availableCount
  return Math.round((occupied / mapData.value.totalSpots) * 100)
})

const kpi = computed(() => ({
  total: mapData.value?.totalSpots || 0,
  available: mapData.value?.availableCount || 0,
  pending: mapData.value?.spots.filter(s => s.status === 'pending').length || 0,
  occupied: mapData.value?.spots.filter(s => s.status === 'occupied').length || 0
}))

const occupiedSpots = computed(() =>
  mapData.value?.spots.filter(s => s.status === 'occupied') || []
)

const pendingSpots = computed(() =>
  mapData.value?.spots.filter(s => s.status === 'pending') || []
)

const fetchLots = async () => {
  try {
    const res = await AdminService.getParkingLots() as unknown as ParkingLot[]
    parkingLots.value = res
    if (res.length > 0 && res[0]) {
      selectedLotId.value = res[0].id
      fetchMapData()
    }
  } catch (e) {
    console.error('Lỗi lấy ds bãi đỗ:', e)
  }
}

const fetchMapData = async () => {
  if (!selectedLotId.value) return
  try {
    const res = await AdminService.getMapLive(selectedLotId.value)
    mapData.value = res as unknown as MapData
  } catch (e) {
    console.error('Lỗi lấy sơ đồ:', e)
  }
}

const showSpotDetail = (spot: ParkingSpot) => {
  selectedSpot.value = spot
}

onMounted(async () => {
  loading.value = true
  await fetchLots()
  loading.value = false

  refreshInterval = setInterval(fetchMapData, 15000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<style scoped>
.admin-page-container { padding: 32px; max-width: 1440px; margin: 0 auto; font-family: 'Inter', system-ui, sans-serif; color: #1e293b; background-color: #f8fafc; min-height: 100vh; }

/* Header */
.page-header-wrapper { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; }

@media (max-width: 768px) {
  .page-header-wrapper { flex-direction: column; align-items: flex-start; gap: 20px; }
  .header-title-area { width: 100%; }
  .lot-selector-premium { width: 100%; justify-content: space-between; }
  .admin-page-container { padding: 16px; }
}
.page-title { font-size: 26px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.5px; }
.lot-selector-premium { display: flex; align-items: center; gap: 12px; background: white; padding: 8px 16px; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
.lot-selector-premium i { color: #2563eb; font-size: 18px; }
.premium-select-minimal { border: none; font-weight: 700; color: #1e293b; outline: none; cursor: pointer; font-size: 15px; }

/* KPI Grid */
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
@media (max-width: 1200px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .kpi-grid { grid-template-columns: 1fr; }
}

.kpi-card { background: white; border-radius: 18px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border-left: 5px solid transparent; transition: 0.3s; }
.kpi-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
.kpi-card.border-blue { border-left-color: #3b82f6; }
.kpi-card.border-emerald { border-left-color: #10b981; }
.kpi-card.border-amber { border-left-color: #f59e0b; }
.kpi-card.border-rose { border-left-color: #ef4444; }
.kpi-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
.kpi-label { font-size: 11px; color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0; }
.kpi-value { font-size: 28px; font-weight: 900; margin: 0; color: #0f172a; }
.unit { font-size: 13px; font-weight: 600; color: #94a3b8; margin-left: 2px; }

/* Main Visual Card */
.main-visual-card { background: white; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; overflow: hidden; }
.card-header-premium { padding: 20px 28px; border-bottom: 1px solid #f1f5f9; background: #fafbfc; display: flex; justify-content: space-between; align-items: center; }
.card-title-modern { font-size: 17px; font-weight: 800; color: #0f172a; margin: 0; }

.occupancy-mini-stats { display: flex; align-items: center; gap: 12px; margin-top: 4px; }
.mini-bar { width: 100px; height: 6px; background: #e2e8f0; border-radius: 10px; overflow: hidden; }
.mini-bar .fill { height: 100%; background: #2563eb; border-radius: 10px; transition: 1s ease; }
.occupancy-mini-stats span { font-size: 12px; font-weight: 700; color: #64748b; }

.legend-modern { display: flex; gap: 20px; }
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #475569; }
.swatch { width: 14px; height: 14px; border-radius: 4px; }
.swatch.available { background: #f0fdf4; border: 2px dashed #86efac; }
.swatch.pending { background: #fffbeb; border: 2px solid #fcd34d; }
.swatch.occupied { background: #fef2f2; border: 2px solid #fca5a5; }

/* Grid Modern */
.parking-layout-scroller { max-height: 600px; overflow-y: auto; padding: 30px; background: #f8fafc; }
.parking-grid-modern { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 20px; }
.spot-premium { aspect-ratio: 0.8; border-radius: 16px; background: white; position: relative; border: 2px solid #e2e8f0; cursor: pointer; transition: 0.3s; display: flex; flex-direction: column; }
.spot-premium:hover { transform: translateY(-5px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); border-color: #2563eb; }

.spot-marker { height: 6px; width: 40%; background: #cbd5e1; margin: 8px auto 0; border-radius: 10px; }
.spot-inner-content { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px; }
.spot-id-text { position: absolute; top: 8px; left: 10px; font-size: 10px; font-weight: 800; color: #94a3b8; }

.spot-premium.available { background: #ffffff; border-style: dashed; }
.spot-premium.available .available-visual { font-size: 42px; font-weight: 900; color: #e2e8f0; }

.spot-premium.pending { background: #fffbeb; border-color: #fcd34d; border-style: solid; }
.spot-premium.pending .pending-visual { font-size: 32px; color: #f59e0b; }

.spot-premium.occupied { background: #fef2f2; border-color: #fca5a5; border-style: solid; }
.car-visual { text-align: center; }
.car-visual i { font-size: 48px; color: #1e293b; display: block; }
.plate-tag { background: white; border: 1.5px solid #e2e8f0; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; margin-top: -5px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

/* Tables Layout */
.tables-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
@media (max-width: 1024px) {
  .tables-layout { grid-template-columns: 1fr; }
}
.data-table-card { background: white; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; overflow: hidden; }
.card-header-simple { padding: 18px 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fafbfc; }
.card-header-simple h3 { font-size: 15px; font-weight: 800; margin: 0; color: #1e293b; }
.badge { padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 800; color: white; }
.badge.rose { background: #ef4444; }
.badge.amber { background: #f59e0b; }

.table-container { max-height: 400px; overflow-y: auto; }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { background: #f8fafc; padding: 12px 20px; text-align: left; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; position: sticky; top: 0; }
.modern-table td { padding: 14px 20px; border-bottom: 1px solid #f8fafc; font-size: 14px; cursor: pointer; }
.modern-table tr:hover { background: #f8faff; }
.plate-label { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 13px; }
.empty-table { text-align: center; padding: 40px; color: #94a3b8; font-style: italic; }

/* Modal Premium */
.modal-overlay-premium { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal-card-premium { background: white; width: 100%; max-width: 450px; border-radius: 28px; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.3); }

.modal-header-premium { padding: 35px 30px; color: white; }
.modal-header-premium.available { background: linear-gradient(135deg, #10b981, #059669); }
.modal-header-premium.pending { background: linear-gradient(135deg, #f59e0b, #d97706); }
.modal-header-premium.occupied { background: linear-gradient(135deg, #ef4444, #dc2626); }

.header-top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.pos-tag { background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; }
.close-btn-circle { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.2); border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; }

.header-main-info { display: flex; align-items: center; gap: 20px; }
.header-main-info i { font-size: 48px; }
.header-main-info h3 { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; }

.modal-body-premium { padding: 30px; }
.empty-status-content { text-align: center; padding: 20px 0; }
.check-icon-bg { width: 64px; height: 64px; background: #ecfdf5; color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 16px; }

.detail-grid { display: grid; gap: 20px; }
.detail-item { display: flex; flex-direction: column; gap: 6px; }
.detail-item label { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
.val-text { font-size: 16px; font-weight: 700; color: #1e293b; }
.ticket-code { color: #2563eb; font-family: monospace; font-size: 18px; }

.status-pill { padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 800; width: fit-content; }
.status-pill.pending { background: #fffbeb; color: #b45309; }
.status-pill.occupied { background: #fef2f2; color: #991b1b; }

.modal-footer-premium { padding: 0 30px 30px; }
.btn-close-modal { width: 100%; padding: 14px; border-radius: 14px; border: 2px solid #f1f5f9; background: white; font-weight: 800; color: #64748b; cursor: pointer; transition: 0.2s; }
.btn-close-modal:hover { background: #f8fafc; color: #1e293b; border-color: #e2e8f0; }

/* Utilities */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
.font-bold { font-weight: 800; }
.text-muted { color: #94a3b8; }
.margin-bottom-24 { margin-bottom: 24px; }
.loading-state { height: 600px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; color: #94a3b8; font-weight: 700; }

/* Animations */
.animated { animation-duration: 0.5s; animation-fill-mode: both; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes bounceIn { from, 20%, 40%, 60%, 80%, to { animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); } 0% { opacity: 0; transform: scale3d(0.3, 0.3, 0.3); } 20% { transform: scale3d(1.1, 1.1, 1.1); } 40% { transform: scale3d(0.9, 0.9, 0.9); } 60% { opacity: 1; transform: scale3d(1.03, 1.03, 1.03); } 80% { transform: scale3d(0.97, 0.97, 0.97); } to { opacity: 1; transform: scale3d(1, 1, 1); } }
.fade-in { animation-name: fadeInUp; }
.bounceIn { animation-name: bounceIn; }
</style>
