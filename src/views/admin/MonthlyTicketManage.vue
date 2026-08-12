<template>
  <div class="admin-page-container monthly-ticket-page">
    <!-- Header -->
    <div class="page-header-wrapper">
      <div class="header-title-area">
        <h2>🎫 Quản Lý Vé Tháng</h2>
        <p class="subtitle">Cấu hình, theo dõi và quản lý toàn bộ vé tháng hệ thống SmartPark</p>
      </div>
      <div class="header-action-group">
        <button @click="refreshData" class="btn-secondary" :disabled="loading">
          <span class="btn-icon">🔄</span>
          Làm mới
        </button>
      </div>
    </div>

    <!-- KPI Gradient Cards -->
    <div class="kpi-dashboard-grid" style="margin-bottom: 28px;">
      <div class="kpi-gradient-card blue">
        <div>
          <div class="kpi-label">Tổng vé tháng</div>
          <div class="kpi-main-number">{{ statistics.totalTickets }}</div>
          <div class="kpi-sub">Tất cả trạng thái</div>
        </div>
        <div class="kpi-icon-box">🎟️</div>
      </div>

      <div class="kpi-gradient-card orange">
        <div>
          <div class="kpi-label">Tổng doanh thu</div>
          <div class="kpi-main-number">{{ formatCurrency(statistics.totalRevenue) }}</div>
          <div class="kpi-sub">{{ filters.period }}</div>
        </div>
        <div class="kpi-icon-box">💰</div>
      </div>
      <div class="kpi-gradient-card purple">
        <div>
          <div class="kpi-label">Giá trung bình</div>
          <div class="kpi-main-number">{{ formatCurrency(statistics.averagePrice) }}</div>
          <div class="kpi-sub">Mỗi vé</div>
        </div>
        <div class="kpi-icon-box">📊</div>
      </div>
    </div>

    <!-- Parking Lot Configuration Section -->
    <div class="main-data-card" style="margin-bottom: 28px;">
      <div class="section-header-row">
        <div>
          <h3 class="section-title">⚙️ Cấu Hình Vé Tháng Theo Bãi Xe</h3>
          <p class="section-subtitle">Chỉnh sửa số chỗ và giá vé tháng cho từng bãi xe</p>
        </div>
        <div class="section-search">
          <div class="mini-search-box">
            <span class="search-icon">🔍</span>
            <input
              v-model="lotSearchTerm"
              type="text"
              placeholder="Tìm tên bãi xe hoặc địa chỉ..."
              class="mini-search-input"
            />
          </div>
        </div>
      </div>

      <div class="lots-grid">
        <div
          v-for="lot in filteredParkingLots"
          :key="lot.id"
          class="lot-config-card"
        >
          <div class="lot-header">
            <div class="lot-name-wrap">
              <h4 class="lot-name">{{ lot.name }}</h4>
              <div class="lot-address">📍 {{ lot.address }}</div>
            </div>
            <div class="lot-status-dot" :class="(lot.status === 'ACTIVE') ? 'active' : 'inactive'"></div>
          </div>

          <div class="capacity-info">
            <div class="capacity-row">
              <span class="cap-label">Tổng số chỗ</span>
              <span class="cap-value">{{ lot.totalSpots }}</span>
            </div>
            <div class="capacity-row">
              <span class="cap-label">Chỗ vé tháng</span>
              <span class="cap-value editable" @click="editMonthlySlots(lot)">
                <span class="highlight-num">{{ lot.monthlySlots || 0 }}</span>
                <span class="edit-pill">✏️ Sửa</span>
              </span>
            </div>
            <div class="capacity-row">
              <span class="cap-label">Chỗ vé thường</span>
              <span class="cap-value">{{ lot.normalSlots || lot.totalSpots }}</span>
            </div>
            <div class="capacity-row price-row">
              <span class="cap-label">Giá vé tháng</span>
              <span class="cap-value editable price-value" @click="editMonthlyPrice(lot)">
                <span class="price-num">{{ formatCurrency(lot.monthlyPrice || 500000) }}</span>
                <span class="edit-pill">✏️ Sửa</span>
              </span>
            </div>
          </div>

          <div class="current-usage">
            <div class="usage-meta">
              <span class="usage-text-left">Sử dụng: {{ getCurrentMonthlyTickets(lot.id) }} / {{ lot.monthlySlots || 0 }}</span>
              <span class="usage-text-right">{{ getUsagePercentage(lot).toFixed(0) }}%</span>
            </div>
            <div class="usage-bar">
              <div
                class="usage-fill"
                :class="getUsageClass(lot)"
                :style="{ width: getUsagePercentage(lot) + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <div v-if="filteredParkingLots.length === 0" class="empty-lot-state">
          <div class="empty-icon">🔎</div>
          <p>Không tìm thấy bãi xe phù hợp với từ khóa "{{ lotSearchTerm }}"</p>
        </div>
      </div>
    </div>

    <!-- Tickets List Section with Filters -->
    <div class="main-data-card">
      <div class="section-header-row">
        <div>
          <h3 class="section-title">📋 Danh Sách Vé Tháng</h3>
          <p class="section-subtitle">Hiển thị {{ filteredDisplayTickets.length }} / {{ monthlyTickets.length }} vé</p>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-item">
          <label class="filter-label">Bãi xe</label>
          <select v-model="ticketFilters.lotName" class="modern-select filter-select" @change="onTicketsFilterChange">
            <option value="ALL">Tất cả bãi xe</option>
            <option v-for="lot in lotOptions" :key="lot.value" :value="lot.value">{{ lot.text }}</option>
          </select>
        </div>

        <div class="filter-item">
          <label class="filter-label">Tìm biển số</label>
          <div class="search-input-wrap">
            <span class="search-icon">🚗</span>
            <input
              v-model="ticketFilters.plate"
              type="text"
              placeholder="VD: 51F1-888.88"
              class="search-text-input"
              @input="onTicketsFilterChange"
            />
          </div>
        </div>

        <div class="filter-item">
          <label class="filter-label">Kỳ hạn</label>
          <select v-model="filters.period" class="modern-select filter-select" @change="fetchStatistics">
            <option value="WEEK">7 ngày qua</option>
            <option value="MONTH">30 ngày qua</option>
            <option value="QUARTER">3 tháng qua</option>
            <option value="ALL">Tất cả</option>
          </select>
        </div>

        <div class="filter-item filter-date">
          <label class="filter-label">Từ ngày</label>
            <input
              v-model="ticketFilters.dateFrom"
              type="date"
              lang="vi"
              class="modern-select filter-select"
              @change="onTicketsFilterChange"
            />
        </div>

        <div class="filter-item filter-date">
          <label class="filter-label">Đến ngày</label>
            <input
              v-model="ticketFilters.dateTo"
              type="date"
              lang="vi"
              class="modern-select filter-select"
              @change="onTicketsFilterChange"
            />
        </div>
      </div>

      <!-- Table -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <div v-else class="tickets-table-container">
        <table class="modern-admin-table tickets-table">
          <thead>
            <tr>
              <th>Mã vé</th>
              <th>Khách hàng</th>
              <th>Bãi xe</th>
              <th>Biển số</th>
              <th>Thời hạn</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredDisplayTickets.length === 0">
              <td colspan="5" class="empty-row">
                <div class="empty-state-box">
                  <div class="empty-big-icon">📭</div>
                  <p class="empty-title">Không tìm thấy vé tháng phù hợp</p>
                  <p class="empty-desc">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
              </td>
            </tr>
            <tr
              v-for="ticket in filteredDisplayTickets"
              :key="ticket.id"
              class="table-row-interactive"
            >
              <td>
                <span class="ticket-code-badge">{{ ticket.ticketCode }}</span>
              </td>
              <td>
                <div class="customer-cell">
                  <div class="avatar-circle">{{ getAvatar(ticket.customerName) }}</div>
                  <div>
                    <div class="customer-name">{{ ticket.customerName || '—' }}</div>
                  </div>
                </div>
              </td>
              <td><span class="lot-name-cell">{{ ticket.lotName }}</span></td>
              <td>
                <span class="plate-number">{{ ticket.plate }}</span>
              </td>
              <td>
                <div class="date-cell">
                  <div class="date-start">Từ: {{ formatDate(ticket.startDate) }}</div>
                  <div class="date-end">Đến: {{ formatDate(ticket.endDate) }}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Modal (BaseModal với nội dung đẹp hơn) -->
    <BaseModal :isOpen="showEditModal" title="Cấu hình vé tháng" @close="showEditModal = false">
      <div class="edit-modal-content">
        <div class="edit-modal-header-info">
          <div class="edit-modal-icon">{{ editMode === 'slots' ? '🅿️' : '💵' }}</div>
          <div>
            <h3>{{ editMode === 'slots' ? 'Cấu Hình Chỗ Vé Tháng' : 'Cấu Hình Giá Vé Tháng' }}</h3>
            <p class="edit-modal-sub">Bãi xe: <strong>{{ selectedLot?.name }}</strong> — {{ selectedLot?.address }}</p>
          </div>
        </div>

        <div class="edit-form">
          <div v-if="editMode === 'slots'" class="modern-form-group">
            <label>Số chỗ vé tháng:</label>
            <input
              type="number"
              v-model.number="editValue"
              :min="0"
              :max="selectedLot?.totalSpots"
              class="modern-input"
            />
            <div class="slot-preview">
              <div class="slot-item slot-item-monthly">
                <span class="slot-label">Vé tháng</span>
                <span class="slot-value">{{ editValue || 0 }} chỗ</span>
              </div>
              <div class="slot-divider"></div>
              <div class="slot-item slot-item-normal">
                <span class="slot-label">Vé thường</span>
                <span class="slot-value">{{ (selectedLot?.totalSpots || 0) - (editValue || 0) }} chỗ</span>
              </div>
            </div>
            <p class="help-text">Tối đa <strong>{{ selectedLot?.totalSpots }}</strong> chỗ (tổng dung tích bãi xe).</p>
          </div>

          <div v-else class="modern-form-group">
            <label>Giá vé tháng (VNĐ):</label>
            <div class="input-with-unit">
              <input
                type="number"
                v-model.number="editValue"
                :min="0"
                class="modern-input"
              />
              <span class="unit-tag">VNĐ</span>
            </div>
            <div class="price-suggest">
              💡 Đề xuất: <strong>{{ formatCurrency((selectedLot?.pricePerHour || 15000) * 200) }}</strong>
              <span class="suggest-sub">(Giá giờ × 200h / tháng)</span>
            </div>
            <div class="price-preview">
              <div class="price-preview-label">Hiển thị:</div>
              <div class="price-preview-value">{{ formatCurrency(editValue || 0) }}</div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="showEditModal = false" class="btn-secondary">Hủy</button>
          <button @click="saveConfig" class="btn-primary" :disabled="saving">
            <span v-if="saving">⏳ Đang lưu...</span>
            <span v-else>💾 Lưu thay đổi</span>
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { AdminService, type ParkingLotDTO } from '@/services/admin.service'
import { formatDateVi, formatDateRangeVi } from '@/utils/date'
import BaseModal from '@/components/common/BaseModal.vue'
import DatePicker from '@/components/DatePicker.vue'
import '@/assets/styles/admin-shared.css'

// State
const loading = ref(false)
const saving = ref(false)
const lotSearchTerm = ref('')

type MonthlyLotConfig = ParkingLotDTO & {
  monthlySlots?: number
  monthlyPrice?: number
  normalSlots?: number
  status?: string
}

interface MonthlyTicketItem {
  id: number
  ticketCode: string
  customerName?: string
  lotName: string
  plate: string
  status: string
  startDate: string
  endDate: string
  pricePaid: number
  createdAt: string
}

const parkingLots = ref<MonthlyLotConfig[]>([])
const monthlyTickets = ref<MonthlyTicketItem[]>([])
const statistics = ref({
  totalTickets: 0,
  activeTickets: 0,
  totalRevenue: 0,
  averagePrice: 0
})
const capacityInfo = ref<Record<number, { currentMonthlyTickets: number }>>({})

// Filters - Lot
const filters = reactive({
  lotName: 'ALL',
  period: 'MONTH'
})

// Filters - Tickets
const ticketFilters = reactive({
  lotName: 'ALL',
  plate: '',
  dateFrom: '',
  dateTo: ''
})

// Edit modal
const showEditModal = ref(false)
const editMode = ref<'slots' | 'price'>('slots')
const selectedLot = ref<MonthlyLotConfig | null>(null)
const editValue = ref(0)

// Computed
const lotOptions = computed(() =>
  parkingLots.value.map(lot => ({
    value: lot.name,
    text: lot.name
  }))
)

const filteredParkingLots = computed(() => {
  const keyword = lotSearchTerm.value.trim().toLowerCase()
  if (!keyword) return parkingLots.value
  return parkingLots.value.filter(
    lot =>
      lot.name.toLowerCase().includes(keyword) ||
      (lot.address || '').toLowerCase().includes(keyword)
  )
})

const filteredDisplayTickets = computed(() => {
  let list = [...monthlyTickets.value]

  if (ticketFilters.lotName && ticketFilters.lotName !== 'ALL') {
    list = list.filter(t => t.lotName === ticketFilters.lotName)
  }

  if (ticketFilters.plate.trim()) {
    const plateKeyword = ticketFilters.plate.trim().toLowerCase().replace(/[\s-]/g, '')
    list = list.filter(t => t.plate.toLowerCase().replace(/[\s-]/g, '').includes(plateKeyword))
  }

  if (ticketFilters.dateFrom) {
    const fromMs = new Date(ticketFilters.dateFrom).getTime()
    list = list.filter(t => new Date(t.startDate).getTime() >= fromMs)
  }

  if (ticketFilters.dateTo) {
    const toMs = new Date(ticketFilters.dateTo).getTime() + 24 * 60 * 60 * 1000 - 1
    list = list.filter(t => new Date(t.endDate).getTime() <= toMs)
  }

  return list
})

// Methods
const fetchParkingLots = async () => {
  try {
    parkingLots.value = await AdminService.getParkingLots()
    for (const lot of parkingLots.value) {
      const capacity = (await AdminService.getMonthlyCapacity(lot.id)) as { currentMonthlyTickets: number }
      capacityInfo.value[lot.id] = capacity
    }
  } catch (error) {
    console.error('Error fetching parking lots:', error)
  }
}

const fetchMonthlyTickets = async () => {
  try {
    loading.value = true
    const overview = (await AdminService.getMonthlyTicketsOverview()) as MonthlyTicketItem[]
    monthlyTickets.value = overview
  } catch (error) {
    console.error('Error fetching monthly tickets:', error)
  } finally {
    loading.value = false
  }
}

const fetchStatistics = async () => {
  try {
    const stats = await AdminService.getMonthlyTicketStatistics(
      filters.lotName,
      filters.period
    )
    statistics.value = stats.summary
    if (Array.isArray(stats.tickets)) {
      monthlyTickets.value = stats.tickets
    }
  } catch (error) {
    console.error('Error fetching statistics:', error)
  }
}

const refreshData = () => {
  fetchParkingLots()
  fetchMonthlyTickets()
  fetchStatistics()
}

const onTicketsFilterChange = () => {
  // reactive computed tự cập nhật
}

const resetTicketFilters = () => {
  ticketFilters.lotName = 'ALL'
  ticketFilters.plate = ''
  ticketFilters.dateFrom = ''
  ticketFilters.dateTo = ''
}

const editMonthlySlots = (lot: MonthlyLotConfig) => {
  selectedLot.value = lot
  editMode.value = 'slots'
  editValue.value = lot.monthlySlots || 0
  showEditModal.value = true
}

const editMonthlyPrice = (lot: MonthlyLotConfig) => {
  selectedLot.value = lot
  editMode.value = 'price'
  editValue.value = lot.monthlyPrice || 500000
  showEditModal.value = true
}

const saveConfig = async () => {
  if (!selectedLot.value) return

  const currentLot = selectedLot.value
  const lotId = currentLot.id

  try {
    saving.value = true
    const config =
      editMode.value === 'slots'
        ? { monthlySlots: editValue.value }
        : { monthlyPrice: editValue.value }

    await AdminService.updateMonthlyConfig(lotId, config)

    const lotIndex = parkingLots.value.findIndex(l => l.id === lotId)
    if (lotIndex !== -1) {
      const existingLot = parkingLots.value[lotIndex]
      if (existingLot) {
        if (editMode.value === 'slots') {
          existingLot.monthlySlots = editValue.value
          existingLot.normalSlots = (existingLot.totalSpots || 0) - editValue.value
        } else {
          existingLot.monthlyPrice = editValue.value
        }
      }
    }
    showEditModal.value = false
  } catch (error) {
    const errorObj = error as { response?: { data?: { message?: string } } }
    alert(errorObj.response?.data?.message || 'Lỗi khi cập nhật cấu hình')
  } finally {
    saving.value = false
  }
}

const getCurrentMonthlyTickets = (lotId: number) =>
  capacityInfo.value[lotId]?.currentMonthlyTickets || 0

const getUsagePercentage = (lot: MonthlyLotConfig) => {
  const used = getCurrentMonthlyTickets(lot.id)
  const total = lot.monthlySlots || 1
  return Math.min(100, (used / total) * 100)
}

const getUsageClass = (lot: MonthlyLotConfig) => {
  const pct = getUsagePercentage(lot)
  if (pct >= 90) return 'danger'
  if (pct >= 70) return 'warning'
  return 'success'
}

const formatCurrency = (amount: number | null | undefined) => {
  // Kiểm tra và xử lý các trường hợp null, undefined, NaN
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return 'Chưa có giá'
  }

  const numAmount = Number(amount)
  if (numAmount === 0) {
    return '0 ₫'
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(numAmount)
}

const formatDate = (dateStr: string) => {
  return formatDateVi(dateStr)
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    PENDING: 'Hoạt động',
    EXPIRED: 'Hết hạn',
    CANCELLED: 'Đã hủy',
    SUSPENDED: 'Tạm ngưng'
  }
  return statusMap[status] || status
}

const getStatusBadgeClass = (status: string) => {
  const map: Record<string, string> = {
    PENDING: 'success',
    EXPIRED: 'danger',
    CANCELLED: 'warning',
    SUSPENDED: 'warning'
  }
  return map[status] || 'warning'
}

const getAvatar = (name?: string) => {
  if (!name) return '👤'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '👤'

  const first = parts[0] || ''
  const last = parts.length > 1 ? parts[parts.length - 1] || first : first

  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
}

const viewTicketDetail = (ticket: MonthlyTicketItem) => {
  console.log('View ticket detail:', ticket)
}

const suspendTicket = async (ticket: MonthlyTicketItem) => {
  if (confirm('Bạn có chắc muốn tạm ngưng vé tháng này?')) {
    console.log('Suspend ticket:', ticket)
  }
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.monthly-ticket-page {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: transparent;
  color: #0f172a;
}

/* ========== KPI CARD ENHANCEMENT ========== */
.kpi-gradient-card .kpi-label {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.9;
  letter-spacing: 0.2px;
}
.kpi-gradient-card .kpi-sub {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
}
.kpi-gradient-card .kpi-icon-box {
  font-size: 42px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

/* ========== SECTION HEADER ROW ========== */
.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.3px;
}
.section-subtitle {
  margin: 6px 0 0 0;
  color: #64748b;
  font-size: 13px;
}
.section-search {
  min-width: 300px;
}

/* Search box - mini */
.mini-search-box {
  position: relative;
  display: flex;
  align-items: center;
}
.mini-search-box .search-icon {
  position: absolute;
  left: 14px;
  font-size: 14px;
  pointer-events: none;
  color: #94a3b8;
}
.mini-search-input {
  width: 100%;
  padding: 11px 14px 11px 40px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
  background: #ffffff;
  transition: all 0.2s;
  outline: none;
  font-family: inherit;
}
.mini-search-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}
.mini-search-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* ========== PARKING LOT CARDS ========== */
.lots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}
.lot-config-card {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 22px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}
.lot-config-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  opacity: 0.85;
}
.lot-config-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
  border-color: #bfdbfe;
}
.lot-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;
}
.lot-name-wrap { flex: 1; min-width: 0; }
.lot-name {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.2px;
}
.lot-address {
  margin-top: 4px;
  font-size: 12.5px;
  color: #64748b;
  line-height: 1.4;
}
.lot-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6px;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
}
.lot-status-dot.active { background: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15); }
.lot-status-dot.inactive { background: #94a3b8; box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.15); }

/* Capacity rows */
.capacity-info {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.capacity-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13.5px;
}
.cap-label { color: #64748b; font-weight: 500; }
.cap-value { color: #0f172a; font-weight: 700; }
.cap-value.highlight-num {
  color: #2563eb;
  font-size: 16px;
  font-weight: 800;
}
.cap-value.price-value .price-num {
  color: #059669;
  font-size: 16px;
  font-weight: 800;
}
.cap-value.editable {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  padding: 3px 4px;
  border-radius: 6px;
}
.cap-value.editable:hover {
  background: #eff6ff;
}
.edit-pill {
  font-size: 11px;
  font-weight: 600;
  background: #f1f5f9;
  color: #475569;
  padding: 3px 8px;
  border-radius: 9999px;
  transition: all 0.2s;
}
.cap-value.editable:hover .edit-pill {
  background: #2563eb;
  color: #fff;
}

/* Usage bar */
.current-usage { }
.usage-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  margin-bottom: 8px;
  font-weight: 600;
}
.usage-text-left { color: #475569; }
.usage-text-right { color: #334155; }
.usage-bar {
  height: 10px;
  background: #f1f5f9;
  border-radius: 9999px;
  overflow: hidden;
}
.usage-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.usage-fill.success { background: linear-gradient(90deg, #10b981, #059669); }
.usage-fill.warning { background: linear-gradient(90deg, #f59e0b, #d97706); }
.usage-fill.danger  { background: linear-gradient(90deg, #ef4444, #dc2626); }

/* Empty lot state */
.empty-lot-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 48px 24px;
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  color: #64748b;
}
.empty-lot-state .empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

/* ========== FILTER BAR (Tickets) ========== */
.filter-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  padding: 20px;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  margin-bottom: 24px;
}
.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.filter-label {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.filter-select {
  width: 100%;
}
.search-input-wrap {
  position: relative;
}
.search-input-wrap .search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  pointer-events: none;
}
.search-text-input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px 10px 40px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  background: #ffffff;
  outline: none;
  font-family: inherit;
  transition: all 0.2s;
}
.search-text-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}
.search-text-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.filter-date input {
  font-family: inherit;
}
.filter-reset .reset-btn {
  width: 100%;
  justify-content: center;
  background: #fef3c7;
  color: #92400e;
  border-color: #fcd34d;
  font-weight: 700;
}
.filter-reset .reset-btn:hover {
  background: #fde68a;
  border-color: #f59e0b;
  transform: translateY(-1px);
}

/* ========== TICKETS TABLE ========== */
.tickets-table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}
.tickets-table .ticket-code-badge {
  display: inline-block;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  color: #1d4ed8;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 800;
  font-size: 12.5px;
  letter-spacing: 0.3px;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  border: 1px solid #bfdbfe;
}
.customer-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
}
.customer-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 14px;
}
.lot-name-cell {
  font-weight: 600;
  color: #1e40af;
  background: #eff6ff;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 13px;
}
.plate-number {
  display: inline-block;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-weight: 800;
  font-size: 14px;
  color: #1e293b;
  background: #f8fafc;
  border: 1.5px solid #cbd5e1;
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}
.date-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 12.5px;
}
.date-start { color: #166534; font-weight: 600; }
.date-end   { color: #991b1b; font-weight: 600; }
.price-cell {
  font-weight: 800;
  color: #059669;
  font-size: 14.5px;
}

/* Empty state */
.empty-row {
  padding: 0 !important;
  background: #fafafa;
}
.empty-state-box {
  padding: 56px 20px;
  text-align: center;
}
.empty-big-icon {
  font-size: 56px;
  margin-bottom: 16px;
}
.empty-title {
  margin: 0 0 8px 0;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
}
.empty-desc {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 20px;
  gap: 16px;
  color: #64748b;
}
.loading-spinner {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 4px solid #e2e8f0;
  border-top-color: #2563eb;
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.loading-container p {
  margin: 0;
  font-weight: 600;
  font-size: 14px;
}

/* ========== MODAL ENHANCEMENT ========== */
.edit-modal-content {
  padding: 12px 4px 4px;
}
.edit-modal-header-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px dashed #e2e8f0;
}
.edit-modal-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border: 1px solid #bfdbfe;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}
.edit-modal-header-info h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.3px;
}
.edit-modal-sub {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}
.edit-modal-sub strong { color: #1e40af; }

/* Slot preview */
.slot-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 16px;
  margin-top: 14px;
}
.slot-item {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.slot-label {
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.slot-value {
  font-size: 17px;
  font-weight: 800;
}
.slot-item-monthly .slot-label { color: #1d4ed8; }
.slot-item-monthly .slot-value { color: #2563eb; }
.slot-item-normal  .slot-label { color: #7c3aed; }
.slot-item-normal  .slot-value { color: #8b5cf6; }
.slot-divider {
  width: 1px;
  height: 36px;
  background: #e2e8f0;
}

/* Price */
.price-suggest {
  margin-top: 12px;
  font-size: 13px;
  color: #475569;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 10px 12px;
  border-radius: 10px;
}
.price-suggest strong { color: #047857; }
.suggest-sub {
  color: #64748b;
  font-size: 12px;
  margin-left: 4px;
}
.price-preview {
  margin-top: 14px;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border: 1px solid #6ee7b7;
  padding: 14px 16px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.price-preview-label {
  font-size: 12.5px;
  font-weight: 700;
  color: #065f46;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.price-preview-value {
  font-size: 22px;
  font-weight: 900;
  color: #047857;
}

/* Modal actions */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

/* Buttons */
.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
}
.btn-icon {
  display: inline-flex;
  align-items: center;
}

/* Responsive */
@media (max-width: 768px) {
  .lots-grid { grid-template-columns: 1fr; }
  .filter-bar { grid-template-columns: 1fr; }
  .section-header-row { flex-direction: column; align-items: stretch; }
  .section-search { min-width: 100%; }
  .edit-modal-header-info { flex-direction: column; align-items: flex-start; }
  .slot-preview { flex-direction: column; }
  .slot-divider { width: 100%; height: 1px; }
}
</style>


/* ========== ACTION BUTTONS ========== */
.action-buttons-flex {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.action-btn.view-btn {
  background: #eff6ff;
  color: #2563eb;
}

.action-btn.view-btn:hover {
  background: #2563eb;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.action-btn.pause-btn {
  background: #fef3c7;
  color: #d97706;
}

.action-btn.pause-btn:hover {
  background: #f59e0b;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.action-btn:active {
  transform: translateY(0);
}

.action-btn i {
  font-size: 14px;
}

/* Plate number styling */
.plate-number {
  background: #0f172a;
  color: #facc15;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  letter-spacing: 0.5px;
  display: inline-block;
}

/* Date cell */
.date-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-start, .date-end {
  font-size: 12px;
  color: #64748b;
}

/* Price cell */
.price-cell {
  font-weight: 800;
  color: #059669;
  font-size: 15px;
}

/* Status badge */
.status-badge {
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  display: inline-block;
}

.status-badge.success {
  background: #d1fae5;
  color: #059669;
}

.status-badge.danger {
  background: #fee2e2;
  color: #dc2626;
}

.status-badge.warning {
  background: #fef3c7;
  color: #d97706;
}
