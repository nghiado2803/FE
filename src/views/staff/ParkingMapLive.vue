<template>
  <div class="admin-page-container animated fade-in">
    <div class="page-header-wrapper">
      <div class="header-title-area">
        <h2>Giám sát Vận hành Trực tuyến</h2>
        <p class="subtitle">
          Bãi đỗ: <strong>{{ currentLot.name }}</strong>
        </p>
      </div>
    </div>

    <!-- KPI -->
    <div v-if="loadError" class="error-banner">
      ⚠️ Không thể kết nối tới server{{ retryCount >= 3 ? ' — đang thử lại sau 30 giây' : ' — đang thử lại...' }}
      <button @click="retryNow" style="margin-left:12px;padding:4px 12px;border-radius:6px;border:1px solid #f97316;background:white;color:#c2410c;font-weight:600;cursor:pointer;">Thử lại ngay</button>
    </div>
    <div class="kpi-grid margin-bottom-24">
      <div class="kpi-card border-blue">
        <div class="kpi-icon bg-blue-light">🏢</div>
        <div class="kpi-info">
          <p class="kpi-label">Sức chứa (Vé thường)</p>
          <h3 class="kpi-value text-blue">{{ kpi.total }} <span class="unit">ô</span></h3>
        </div>
      </div>
      <div class="kpi-card border-emerald">
        <div class="kpi-icon bg-emerald-light">✅</div>
        <div class="kpi-info">
          <p class="kpi-label">Đang trống (Xanh)</p>
          <h3 class="kpi-value text-emerald">{{ kpi.available }} <span class="unit">ô</span></h3>
        </div>
      </div>
      <div class="kpi-card border-amber">
        <div class="kpi-icon bg-amber-light">⏳</div>
        <div class="kpi-info">
          <p class="kpi-label">Giữ cọc (Vàng)</p>
          <h3 class="kpi-value text-amber">{{ kpi.pending }} <span class="unit">ô</span></h3>
        </div>
      </div>
      <div class="kpi-card border-rose">
        <div class="kpi-icon bg-rose-light">🚗</div>
        <div class="kpi-info">
          <p class="kpi-label">Đang đỗ (Đỏ)</p>
          <h3 class="kpi-value text-rose">{{ kpi.occupied }} <span class="unit">ô</span></h3>
        </div>
      </div>
    </div>

    <div class="main-data-card margin-bottom-24">
        <div class="card-header flex-between">
          <h3 class="card-title">🗺️ Sơ đồ bãi xe</h3>
          <div class="legend-group">
            <span class="legend-item"><span class="dot dot-emerald"></span>Trống</span>
            <span class="legend-item"><span class="dot dot-amber"></span>Giữ cọc</span>
            <span class="legend-item"><span class="dot dot-rose"></span>Đang đỗ</span>
          </div>
        </div>

        <!-- Thanh tỉ lệ tổng quan -->
        <div class="occupancy-bar-wrapper">
          <div class="occupancy-bar">
            <div class="bar-seg occupied" :style="{ width: (kpi.occupied / kpi.total * 100) + '%' }" title="Đang đỗ"></div>
            <div class="bar-seg pending" :style="{ width: (kpi.pending / kpi.total * 100) + '%' }" title="Giữ cọc"></div>
          </div>
          <span class="occupancy-label">{{ Math.round((kpi.occupied + kpi.pending) / kpi.total * 100) }}% lấp đầy</span>
        </div>

        <!-- Grid ô đỗ không đánh số -->
        <div class="spot-grid">
          <div
            v-for="spot in spots"
            :key="spot.id"
            :class="['spot-cell', spot.status]"
            :title="spot.status === 'available' ? 'Trống' : spot.plate"
            @click="showSpotDetails(spot)"
          >
            <span v-if="spot.status === 'occupied'" class="spot-car-icon">🚗</span>
            <span v-else-if="spot.status === 'pending'" class="spot-car-icon">⏳</span>
          </div>
        </div>

        <div class="spot-grid-footer">
          Nhấn vào ô để xem chi tiết phương tiện
        </div>
      </div>

    <!-- 2 bảng bên dưới -->
    <div class="tables-grid">
      <!-- Xe đang trong bãi -->
      <div class="main-data-card">
        <div class="card-header flex-between">
          <h3 class="card-title">🚗 Xe đang trong bãi (Vé thường)</h3>
          <span class="badge-count badge-rose">{{ occupiedSpots.length }} xe</span>
        </div>
        <div class="table-scroll custom-scrollbar">
          <table class="compact-table" v-if="occupiedSpots.length > 0">
            <thead>
              <tr>
                <th>Biển số</th>
                <th>Vào lúc</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="spot in occupiedSpots" :key="spot.id" class="table-row-interactive" @click="showSpotDetails(spot)">
                <td><span class="plate-text">{{ spot.plate }}</span></td>
                <td class="text-xs text-muted">{{ spot.timeIn }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty-state-box">
            <span class="empty-icon">🌬️</span>
            <p>Chưa có xe nào trong bãi.</p>
          </div>
        </div>
      </div>

      <!-- Xe đang giữ cọc -->
      <div class="main-data-card">
        <div class="card-header flex-between">
          <h3 class="card-title">⏳ Xe đang giữ cọc (Vé thường)</h3>
          <span class="badge-count badge-amber">{{ pendingSpots.length }} xe</span>
        </div>
        <div class="table-scroll custom-scrollbar">
          <table class="compact-table" v-if="pendingSpots.length > 0">
            <thead>
              <tr>
                <th>Biển số</th>
                <th>Giữ lúc</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="spot in pendingSpots" :key="spot.id" class="table-row-interactive" @click="showSpotDetails(spot)">
                <td><span class="plate-text">{{ spot.plate }}</span></td>
                <td class="text-xs text-muted">{{ spot.timeIn }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty-state-box">
            <span class="empty-icon">✅</span>
            <p>Không có xe nào đang giữ cọc.</p>
          </div>
        </div>
      </div>

    </div>

    <!-- KPI VÉ THÁNG -->
    <div class="monthly-kpi-section margin-bottom-24">
      <h3 class="section-title">🎫 Thông tin vé tháng</h3>
      <div class="monthly-kpi-grid">
        <div class="monthly-kpi-card">
          <div class="monthly-kpi-icon blue">🏢</div>
          <div class="monthly-kpi-info">
            <p class="monthly-kpi-label">Sức chứa</p>
            <h3 class="monthly-kpi-value">{{ monthlySlots }}</h3>
          </div>
        </div>
        <div class="monthly-kpi-card">
          <div class="monthly-kpi-icon purple">📋</div>
          <div class="monthly-kpi-info">
            <p class="monthly-kpi-label">Tổng vé tháng</p>
            <h3 class="monthly-kpi-value">{{ kpi.monthlyTotal }}</h3>
          </div>
        </div>
        <div class="monthly-kpi-card">
          <div class="monthly-kpi-icon amber">⏳</div>
          <div class="monthly-kpi-info">
            <p class="monthly-kpi-label">Chưa vào bãi</p>
            <h3 class="monthly-kpi-value">{{ kpi.monthlyPending }}</h3>
          </div>
        </div>
        <div class="monthly-kpi-card">
          <div class="monthly-kpi-icon green">🚗</div>
          <div class="monthly-kpi-info">
            <p class="monthly-kpi-label">Đang trong bãi</p>
            <h3 class="monthly-kpi-value">{{ kpi.monthlyParked }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Sơ đồ vé tháng -->
    <div class="main-data-card margin-bottom-24">
      <div class="card-header flex-between">
        <h3 class="card-title">🎫 Sơ đồ vé tháng</h3>
        <div class="legend-group">
          <span class="legend-item"><span class="dot dot-amber"></span>Chưa vào</span>
          <span class="legend-item"><span class="dot dot-emerald"></span>Đang đỗ</span>
          <span class="legend-item"><span class="dot dot-gray"></span>Trống</span>
        </div>
      </div>

      <div class="spot-grid">
        <!-- Hiển thị tất cả các ô vé tháng (bao gồm cả ô trống) -->
        <template v-for="index in monthlySlots" :key="'monthly-' + index">
          <div
            v-if="monthlyTicketsArray[index - 1]"
            :class="['spot-cell', 'monthly', monthlyTicketsArray[index - 1].status === 'PARKED' ? 'parked' : 'pending']"
            :title="monthlyTicketsArray[index - 1].plate"
            @click="showMonthlyTicketDetail(monthlyTicketsArray[index - 1])"
          >
            <div class="spot-plate">{{ monthlyTicketsArray[index - 1].plate }}</div>
            <span v-if="monthlyTicketsArray[index - 1].status === 'PARKED'" class="spot-car-icon">🚗</span>
            <span v-else class="spot-car-icon">⏳</span>
          </div>
          <div
            v-else
            class="spot-cell monthly available"
            title="Chưa có vé tháng"
          >
            <span class="spot-empty-icon">📋</span>
          </div>
        </template>
      </div>

      <div class="spot-grid-footer">
        Nhấn vào ô để xem chi tiết vé tháng
      </div>
    </div>

    <!-- Modal chi tiết ô -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="isDetailOpen && selectedSpot" class="modal-overlay" @click.self="closeDetail">
          <div class="modal-content animated slide-up-modal">
            <div class="modal-header">
              <h3>Chi tiết phương tiện</h3>
              <button class="close-btn" @click="closeDetail">✕</button>
            </div>
            <div class="modal-body">
              <div v-if="selectedSpot.status === 'available'" class="status-empty-alert">
                <div class="icon-circle bg-emerald-light">✅</div>
                <h4>Ô đỗ đang trống</h4>
                <p>Chưa có phương tiện nào.</p>
              </div>
              <div v-else-if="selectedSpot.status === 'monthly'" class="detail-info-list">
                <div class="info-group">
                  <label>Loại vé</label>
                  <span class="status-badge monthly-type">Vé tháng</span>
                </div>
                <div class="info-group">
                  <label>Mã vé tháng</label>
                  <div class="plate-display-large">{{ selectedSpot.id }}</div>
                </div>
                <div class="info-group">
                  <label>Biển số xe</label>
                  <div class="plate-display-large">{{ selectedSpot.plate }}</div>
                </div>
                <div class="info-group">
                  <label>Trạng thái</label>
                  <span :class="['status-badge', 'monthly-status', (selectedSpot as any).monthlyStatus?.toLowerCase()]">
                    {{ getMonthlyStatusText((selectedSpot as any).monthlyStatus || 'PENDING') }}
                  </span>
                </div>
                <div class="info-group">
                  <label>Ngày bắt đầu</label>
                  <span class="font-bold">{{ (selectedSpot as any).startDate }}</span>
                </div>
                <div class="info-group">
                  <label>Ngày kết thúc</label>
                  <span class="font-bold">{{ (selectedSpot as any).endDate }}</span>
                </div>
              </div>
              <div v-else class="detail-info-list">
                <div class="info-group">
                  <label>Loại vé</label>
                  <span class="status-badge normal-type">Vé thường</span>
                </div>
                <div class="info-group">
                  <label>Tình trạng</label>
                  <span :class="['status-badge', selectedSpot.status]">
                    {{ selectedSpot.status === 'pending' ? 'Khách đặt cọc — đang trên đường tới' : 'Xe đang đỗ trong bãi' }}
                  </span>
                </div>
                <div class="info-group">
                  <label>Biển số (AI OCR)</label>
                  <div class="plate-display-large">{{ selectedSpot.plate }}</div>
                </div>
                <div class="info-group">
                  <label>Thời điểm vào</label>
                  <span class="font-bold">{{ selectedSpot.timeIn }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

defineOptions({
  name: 'ParkingMapLive'
})
import { useAuthStore } from '@/stores/authStore'
import apiClient from '@/services/api'

type SpotStatus = 'available' | 'pending' | 'occupied'

type SpotInfo = {
  id: string
  status: SpotStatus
  plate?: string
  timeIn?: string
}

type MonthlyTicketInfo = {
  id: number
  ticketCode: string
  plate: string
  status: string
  startDate: string
  endDate: string
}

const authStore = useAuthStore()

const currentLot = computed(() => ({
  id: authStore.user?.parkingLotId || 1,
  name: authStore.user?.parkingLotName || 'Bãi đỗ đang trực'
}))

const spots = ref<SpotInfo[]>([])
const monthlyTickets = ref<MonthlyTicketInfo[]>([])
const monthlySlots = ref<number>(0)
const normalAvailableCount = ref<number>(0)
const normalSlots = ref<number>(0)
const isDetailOpen = ref<boolean>(false)
const selectedSpot = ref<SpotInfo | null>(null)
let intervalId: ReturnType<typeof setInterval> | null = null

const monthlyTicketsArray = computed(() => {
  const arr: (MonthlyTicketInfo | null)[] = []
  monthlyTickets.value.forEach(ticket => {
    arr.push(ticket)
  })
  return arr
})

const kpi = computed(() => ({
  total: normalSlots.value,
  available: normalAvailableCount.value,
  pending: spots.value.filter(s => s.status === 'pending').length,
  occupied: spots.value.filter(s => s.status === 'occupied').length,
  monthlyTotal: monthlyTickets.value.length,
  monthlyPending: monthlyTickets.value.filter(t => t.status === 'PENDING').length,
  monthlyParked: monthlyTickets.value.filter(t => t.status === 'PARKED').length
}))

const occupiedSpots = computed(() =>
  spots.value.filter(s => s.status === 'occupied')
)

const pendingSpots = computed(() =>
  spots.value.filter(s => s.status === 'pending')
)

const loadError = ref(false)
const retryCount = ref(0)
const MAX_RETRY_INTERVAL = 30000 // Tối đa 30s khi có lỗi liên tiếp

const loadData = async () => {
  const lotId = authStore.user?.parkingLotId
  if (!lotId) {
    console.warn('⚠️ Chưa có thông tin bãi đỗ, bỏ qua lần tải này.')
    return
  }
  try {
    const data = await apiClient.get(`/staff/map-live/${lotId}`) as {
      spots: SpotInfo[]
      monthlyTickets?: MonthlyTicketInfo[]
      monthlySlots?: number
      normalSlots?: number
      availableCount?: number
    }
    if (!data || !Array.isArray(data.spots)) {
      throw new Error('Dữ liệu trả về không hợp lệ')
    }
    spots.value = data.spots.map((s: SpotInfo) => ({
      id: s.id,
      status: s.status as SpotStatus,
      plate: s.plate || '',
      timeIn: s.timeIn || ''
    }))
    monthlyTickets.value = (data.monthlyTickets || []).map((t: MonthlyTicketInfo) => ({
      id: t.id,
      ticketCode: t.ticketCode,
      plate: t.plate,
      status: t.status,
      startDate: t.startDate,
      endDate: t.endDate
    }))
    monthlySlots.value = data.monthlySlots || 0
    normalSlots.value = data.normalSlots || 0
    normalAvailableCount.value = data.availableCount || 0
    loadError.value = false
    retryCount.value = 0
    // Khôi phục interval bình thường sau khi thành công
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = setInterval(loadData, 10000)
    }
  } catch (error) {
    const err = error as { response?: { status?: number } }
    const status = err.response?.status

    // 502/503/Network Error = backend đang khởi động hoặc chưa chạy
    if (status === 502 || status === 503 || !status || status === 0) {
      retryCount.value++
      if (retryCount.value === 1) {
        console.warn(`⚠️ Backend không phản hồi (${status ?? 'Network Error'}). Vui lòng kiểm tra Server Spring Boot (Port 8080).`)
      }
      // Tăng dần interval khi lỗi nhiều lần liên tiếp
      if (retryCount.value >= 3 && intervalId) {
        clearInterval(intervalId)
        intervalId = setInterval(loadData, MAX_RETRY_INTERVAL)
      }
    } else {
      console.error('Lỗi khi tải sơ đồ live:', error)
    }
    loadError.value = true
  }
}

const showSpotDetails = (spot: SpotInfo) => {
  selectedSpot.value = spot
  isDetailOpen.value = true
}

const showMonthlyTicketDetail = (ticket: MonthlyTicketInfo) => {
  selectedSpot.value = {
    id: ticket.ticketCode,
    status: 'monthly' as SpotStatus,
    plate: ticket.plate,
    timeIn: ticket.startDate,
    ticketCode: ticket.ticketCode,
    startDate: ticket.startDate,
    endDate: ticket.endDate,
    monthlyStatus: ticket.status
  } as any
  isDetailOpen.value = true
}

const getMonthlyStatusText = (status: string) => {
  // Chỉ có 2 trạng thái: Đang đỗ hoặc Chưa vào
  return status === 'PARKED' ? 'Đang đỗ' : 'Chưa vào'
}
const closeDetail = () => { isDetailOpen.value = false }
const retryNow = () => {
  retryCount.value = 0
  // Reset về interval nhanh khi user bấm retry thủ công
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = setInterval(loadData, 10000)
  }
  loadData()
}

onMounted(() => {
  loadData()
  intervalId = setInterval(loadData, 10000) // Cập nhật mỗi 10 giây
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.admin-page-container { padding: 32px; max-width: 1440px; margin: 0 auto; color: #1e293b; background-color: #f8fafc; min-height: 100vh; }

.error-banner { background: #fff7ed; border: 1px solid #fed7aa; color: #c2410c; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; }

/* Header */
.page-header-wrapper { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }
.header-title-area h2 { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; }
.subtitle { color: #64748b; font-size: 14px; margin: 0; }
.live-indicator { display: flex; align-items: center; gap: 8px; background: #ecfdf5; padding: 6px 14px; border-radius: 20px; border: 1px solid #a7f3d0; }
.pulse-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 1.5s infinite; }
.live-text { font-size: 13px; font-weight: 700; color: #065f46; }
@keyframes pulse { to { box-shadow: 0 0 0 8px rgba(16,185,129,0); } }

/* KPI */
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.kpi-card { background: white; border-radius: 14px; padding: 18px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border-left: 4px solid transparent; }
.kpi-card.border-blue { border-left-color: #3b82f6; }
.kpi-card.border-emerald { border-left-color: #10b981; }
.kpi-card.border-amber { border-left-color: #f59e0b; }
.kpi-card.border-rose { border-left-color: #ef4444; }
.kpi-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
.kpi-label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0; }
.kpi-value { font-size: 26px; font-weight: 800; margin: 0; }
.unit { font-size: 13px; font-weight: 600; color: #94a3b8; }

/* Layout */
.tables-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
@media (max-width: 768px) { .tables-grid { grid-template-columns: 1fr; } }

/* Card */
.main-data-card { background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; overflow: hidden; }
.card-header { padding: 16px 20px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
.card-title { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; }
.flex-between { display: flex; justify-content: space-between; align-items: center; }

/* Legend */
.legend-group { display: flex; gap: 14px; }
.legend-item { display: flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; color: #475569; }
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.dot-emerald { background: #10b981; }
.dot-amber { background: #f59e0b; }
.dot-rose { background: #ef4444; }
.dot-purple { background: #a855f7; }
.dot-purple-light { background: #d8b4fe; }
.dot-gray { background: #cbd5e1; }

/* Occupancy bar */
.occupancy-bar-wrapper { padding: 14px 20px 0; display: flex; align-items: center; gap: 12px; }
.occupancy-bar { flex: 1; height: 10px; background: #e2e8f0; border-radius: 6px; overflow: hidden; display: flex; }
.bar-seg { height: 100%; transition: width 0.4s ease; }
.bar-seg.occupied { background: #ef4444; }
.bar-seg.pending { background: #f59e0b; }
.occupancy-label { font-size: 13px; font-weight: 700; color: #475569; white-space: nowrap; }

/* Spot Grid — không đánh số, hiển thị dạng ô vuông trực quan */
.spot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 12px; padding: 20px; background: #f8fafc; }
.spot-cell { height: 80px; border-radius: 8px; border: 2px solid; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s ease; font-size: 20px; position: relative; gap: 4px; padding: 8px; }
.spot-cell:hover { transform: scale(1.08); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
.spot-cell.available { background: #f0fdf4; border-color: #86efac; }
.spot-cell.available:hover { background: #dcfce7; }
.spot-cell.pending { background: #fffbeb; border-color: #fcd34d; }
.spot-cell.occupied { background: #fef2f2; border-color: #fca5a5; }
.spot-car-icon { line-height: 1; font-size: 24px; }

/* Vé tháng styling */
.spot-cell.monthly.pending {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #f59e0b;
  border-width: 3px;
}
.spot-cell.monthly.parked {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-color: #10b981;
  border-width: 3px;
}
.spot-cell.monthly.available {
  background: #f8fafc;
  border-color: #cbd5e1;
  border-style: dashed;
}
.spot-empty-icon { font-size: 28px; opacity: 0.3; }
.spot-plate {
  font-size: 11px;
  font-weight: 800;
  font-family: monospace;
  background: #0f172a;
  color: #facc15;
  padding: 4px 8px;
  border-radius: 4px;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  text-align: center;
}

.spot-grid-footer { text-align: center; padding: 10px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }

/* Table section */
.table-section { max-height: 600px; display: flex; flex-direction: column; }
.badge-count { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; color: white; }
.badge-count.badge-rose { background: #ef4444; }
.badge-count.badge-amber { background: #f59e0b; }
.table-scroll { overflow-y: auto; flex: 1; }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.compact-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.compact-table th { background: #f8fafc; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; text-align: left; }
.compact-table td { padding: 13px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; text-align: left; }
.compact-table th:first-child, .compact-table td:first-child { width: 45%; }
.compact-table th:last-child, .compact-table td:last-child { width: 55%; }
.table-row-interactive { cursor: pointer; }
.table-row-interactive:hover { background: #f8fafc; }
.plate-text { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 4px; font-family: monospace; font-weight: 700; font-size: 13px; }
.status-badge { padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; display: inline-block; }
.status-badge.pending { background: #fef9c3; color: #a16207; border: 1px solid #fde047; }
.status-badge.occupied { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
.empty-state-box { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: #94a3b8; font-size: 14px; }
.empty-icon { font-size: 32px; margin-bottom: 8px; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 50; padding: 20px; }
.modal-content { background: white; border-radius: 16px; width: 100%; max-width: 400px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
.modal-header { padding: 18px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 17px; font-weight: 700; color: #0f172a; }
.close-btn { background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; padding: 2px; }
.modal-body { padding: 24px; }
.status-empty-alert { text-align: center; padding: 12px 0; }
.icon-circle { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 12px; }
.status-empty-alert h4 { margin: 0 0 6px; font-size: 17px; }
.status-empty-alert p { color: #64748b; font-size: 14px; margin: 0; }
.detail-info-list { display: flex; flex-direction: column; gap: 18px; }
.info-group { display: flex; flex-direction: column; gap: 6px; }
.info-group label { font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
.plate-display-large { background: #0f172a; color: #facc15; font-family: monospace; font-weight: 800; font-size: 22px; padding: 12px 20px; border-radius: 8px; text-align: center; letter-spacing: 2px; }
.font-bold { font-weight: 700; }

/* Utilities */
.text-blue { color: #2563eb; } .bg-blue-light { background: #eff6ff; }
.text-emerald { color: #10b981; } .bg-emerald-light { background: #ecfdf5; }
.text-amber { color: #f59e0b; } .bg-amber-light { background: #fffbeb; }
.text-rose { color: #ef4444; } .bg-rose-light { background: #fef2f2; }
.text-muted { color: #64748b; }
.text-xs { font-size: 12px; }
.margin-bottom-24 { margin-bottom: 24px; }

/* Monthly KPI Section */
.monthly-kpi-section { background: linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%); border-radius: 16px; padding: 20px; border: 1px solid #e9d5ff; }
.section-title { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; }
.monthly-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
@media (max-width: 1024px) { .monthly-kpi-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .monthly-kpi-grid { grid-template-columns: 1fr; } }
.monthly-kpi-card { background: white; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.04); }
.monthly-kpi-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.monthly-kpi-icon.blue { background: #eff6ff; color: #2563eb; }
.monthly-kpi-icon.purple { background: #f3e8ff; color: #7c3aed; }
.monthly-kpi-icon.amber { background: #fffbeb; color: #f59e0b; }
.monthly-kpi-icon.green { background: #ecfdf5; color: #10b981; }
.monthly-kpi-label { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 2px 0; }
.monthly-kpi-value { font-size: 24px; font-weight: 800; margin: 0; color: #0f172a; }

/* Monthly Ticket Badges */
.badge-count.badge-purple { background: #9333ea; }
.full-width-card { grid-column: 1 / -1; }
.ticket-code-badge { background: #f3e8ff; border: 1px solid #d8b4fe; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-weight: 700; font-size: 12px; color: #7c3aed; }
.status-badge.parked { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
.status-badge.checkout { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
.status-badge.paying { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
.status-badge.monthly-type { background: linear-gradient(135deg, #a855f7, #7c3aed); color: white; border: none; padding: 6px 14px; font-size: 12px; }
.status-badge.normal-type { background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; border: none; padding: 6px 14px; font-size: 12px; }

.status-badge.monthly-status.pending { background: #fef3c7; color: #a16207; border: 1px solid #fde047; }
.status-badge.monthly-status.parked { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
.status-badge.monthly-status.checkout { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
.status-badge.monthly-status.paying { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }

/* Animations */
.animated { animation-duration: 0.3s; animation-fill-mode: both; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideUpModal { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
.fade-in { animation-name: fadeInUp; }
.slide-up-modal { animation-name: slideUpModal; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
