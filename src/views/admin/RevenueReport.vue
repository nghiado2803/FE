<template>
  <div class="admin-page-container animated fade-in">
    <div class="page-header-wrapper">
      <div class="header-title-area">
        <h2>Báo cáo và thống kê doanh thu</h2>
      </div>
      <div class="header-action-group">
        <router-link to="/" class="btn-secondary">Trang chủ Portal</router-link>

        <select v-model="selectedLot" class="modern-select">
          <option value="ALL">Cả hệ thống</option>
          <option v-for="lot in parkingLots" :key="lot.id" :value="lot.name">{{ lot.name }}</option>
        </select>

        <select v-model="filterType" class="modern-select">
          <option value="DAY">Hôm nay</option>
          <option value="WEEK">7 ngày qua</option>
          <option value="MONTH">30 ngày qua</option>
          <option value="QUARTER">3 tháng qua</option>
          <option value="YEAR">Năm nay</option>
        </select>

        <button class="btn-primary success-btn" @click="exportToExcel">
          Xuất báo cáo (Excel)
        </button>
      </div>
    </div>

    <div class="kpi-dashboard-grid-3cols">
      <div class="kpi-gradient-card blue">
        <div class="kpi-card-content">
          <p class="kpi-title">Doanh thu thống kê</p>
          <h3 class="kpi-main-number">{{ revenueSummary.totalEarned.toLocaleString() }} đ</h3>
        </div>
      </div>

      <div class="kpi-gradient-card green">
        <div class="kpi-card-content">
          <p class="kpi-title">Tổng lượt xe ra vào</p>
          <h3 class="kpi-main-number">{{ revenueSummary.totalVehicles }} lượt</h3>
        </div>
      </div>

      <div class="kpi-gradient-card purple">
        <div class="kpi-card-content">
          <p class="kpi-title">Khách hàng mới</p>
          <h3 class="kpi-main-number">+{{ revenueSummary.newUsers }} thành viên</h3>
        </div>
      </div>
    </div>

    <div class="charts-grid margin-top-24">
      <div class="main-data-card">
        <div class="card-inner-header">
          <h3>Biểu đồ doanh thu {{ selectedLot === 'ALL' ? 'Hệ thống' : 'Bãi đỗ' }}</h3>
          <span class="text-muted text-sm">
            Hiển thị theo:
            <span v-if="filterType === 'DAY'">Hôm nay (6 khung 4h)</span>
            <span v-else-if="filterType === 'WEEK'">7 ngày qua (theo ngày)</span>
            <span v-else-if="filterType === 'QUARTER'">3 tháng qua (theo tháng)</span>
            <span v-else-if="filterType === 'YEAR'">Năm nay (theo quý)</span>
            <span v-else>30 ngày qua (theo tuần)</span>
          </span>
        </div>

        <div class="chart-container-wrapper">
          <div class="chart-y-axis">
            <span>MAX</span>
            <span>MID</span>
            <span>0</span>
          </div>

          <div class="chart-bars-area">
            <div v-for="item in chartData" :key="item.label" class="chart-bar-column">
              <div class="bar-fill-wrapper">
                <div
                  class="bar-actual-fill animated grow-up"
                  :style="{ height: item.percentage + '%' }"
                  :title="item.value.toLocaleString() + ' đ'"
                >
                  <span class="bar-tooltip-value">{{ formatShortMoney(item.value) }}</span>
                </div>
              </div>
              <span class="bar-label-text">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="main-data-card">
        <div class="card-inner-header">
          <h3>{{ selectedLot === 'ALL' ? 'Tỉ trọng Doanh thu các bãi' : 'Cơ cấu khách hàng' }}</h3>
          <span class="text-muted text-sm">{{ selectedLot === 'ALL' ? 'Cơ cấu đóng góp %' : 'Tỉ lệ khách cọc & vãng lai' }}</span>
        </div>

        <div class="pie-chart-container">
          <div class="pie-chart" :style="pieChartStyle"></div>

          <div class="pie-legend">
            <div v-for="item in pieChartData" :key="item.name" class="legend-item">
              <span class="color-box" :style="{ backgroundColor: item.color }"></span>
              <span class="legend-name">{{ item.name }}</span>
              <span class="legend-percent">{{ item.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="main-data-card margin-top-24">
      <div class="card-inner-header flex-between">
        <h3>Nhật ký giao dịch vé thường (Bấm vào dòng để xem chi tiết hóa đơn)</h3>
        <span class="status-badge warning" v-if="isLoading">⏳ Đang đồng bộ tính toán...</span>
        <span class="status-badge success" v-else>✓ Đồng bộ thành công</span>
      </div>

      <div v-if="errorMessage" class="error-text-display">{{ errorMessage }}</div>

      <div class="table-responsive">
        <table class="modern-admin-table">
          <thead>
            <tr>
              <th>Mã hóa đơn</th>
              <th>Biển số xe</th>
              <th>Điểm đỗ xe</th>
              <th>Thời gian ghi nhận</th>
              <th class="text-right">Tổng tiền thu</th>
              <th>Trạng thái nghiệp vụ</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tx in displayedTransactions"
              :key="tx.id"
              class="table-row-interactive clickable-row"
              @click="openTransactionDetail(tx)"
            >
              <td><span class="code-text">{{ tx.ticketCode }}</span></td>
              <td>
                <div v-if="tx.plate" class="license-plate">{{ tx.plate }}</div>
                <span v-else class="text-muted italic text-xs">Không có xe đến</span>
              </td>
              <td><span class="secondary-text">{{ tx.lotName }}</span></td>
              <td><span class="date-text">{{ tx.checkoutTime }}</span></td>
              <td class="text-right text-bold" :class="tx.status === 'COMPLETED' ? 'text-emerald' : tx.status === 'CANCELLED' ? 'text-muted' : 'text-amber'">
                + {{ tx.amount.toLocaleString() }} đ
              </td>
              <td>
                <span :class="['status-badge', tx.status === 'COMPLETED' ? 'success' : tx.status === 'CANCELLED' ? 'neutral' : 'warning']">
                  {{ tx.status === 'COMPLETED' ? 'Tất toán'
                   : tx.status === 'CANCELLED' ? 'Đã hủy'
                   : tx.status === 'NO_SHOW' ? 'Phạt hủy cọc'
                   : tx.status }}
                </span>
              </td>
            </tr>
            <tr v-if="displayedTransactions.length === 0">
              <td colspan="6" class="text-center text-muted" style="padding: 20px;">
                Không có dữ liệu giao dịch vé thường cho bãi đỗ này trong thời gian được chọn.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Monthly Tickets Table -->
    <div class="main-data-card margin-top-24">
      <div class="card-inner-header flex-between">
        <h3>🎫 Nhật ký vé tháng (Đã thanh toán hoặc đã hủy)</h3>
        <span class="badge-count badge-purple">{{ displayedMonthlyTickets.length }} vé</span>
      </div>

      <div class="table-responsive">
        <table class="modern-admin-table">
          <thead>
            <tr>
              <th>Mã vé tháng</th>
              <th>Khách hàng</th>
              <th>Biển số xe</th>
              <th>Điểm đỗ xe</th>
              <th>Thời hạn</th>
              <th>Thời gian thanh toán</th>
              <th class="text-right">Tổng tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in displayedMonthlyTickets" :key="ticket.id" class="table-row-interactive">
              <td><span class="code-text monthly-code">#{{ ticket.ticketCode }}</span></td>
              <td><span class="customer-name-text">{{ ticket.customerName }}</span></td>
              <td>
                <div class="license-plate">{{ ticket.plate }}</div>
              </td>
              <td><span class="secondary-text">{{ ticket.lotName }}</span></td>
              <td>
                <div class="date-range-cell">
                  <div class="date-range-text">{{ ticket.startDate }} → {{ ticket.endDate }}</div>
                </div>
              </td>
              <td><span class="date-text">{{ ticket.paymentTime }}</span></td>
              <td class="text-right text-bold" :class="ticket.status === 'COMPLETED' ? 'text-emerald' : 'text-muted'">
                + {{ ticket.amount.toLocaleString() }} đ
              </td>
              <td>
                <span :class="['status-badge', ticket.status === 'COMPLETED' ? 'success' : 'neutral']">
                  {{ ticket.status === 'COMPLETED' ? 'Đã thanh toán' : 'Đã hủy' }}
                </span>
              </td>
            </tr>
            <tr v-if="displayedMonthlyTickets.length === 0">
              <td colspan="8" class="text-center text-muted" style="padding: 20px;">
                Không có vé tháng nào đã thanh toán hoặc đã hủy trong thời gian được chọn.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="isModalOpen && selectedTx" class="modal-overlay" @click.self="closeModal">
          <div class="modal-content animated slide-up-modal max-width-450">
            <div class="modal-header">
              <h3>Chi tiết hóa đơn giao dịch: {{ selectedTx.ticketCode }}</h3>
              <button class="close-x-btn" @click="closeModal">✕</button>
            </div>

            <div class="modal-body">
              <div class="invoice-box-section border-bottom">
                <div class="invoice-row">
                  <span class="inv-label">Tên tài khoản khách:</span>
                  <span class="inv-value text-bold">{{ selectedTx.customerName }}</span>
                </div>
                <div class="invoice-row">
                  <span class="inv-label">Biển số đăng ký:</span>
                  <span v-if="selectedTx.plate" class="license-plate mini">{{ selectedTx.plate }}</span>
                  <span v-else class="text-danger italic font-sm">Hủy lịch / Xe không tới</span>
                </div>
                <div class="invoice-row">
                  <span class="inv-label">Vị trí bãi đỗ:</span>
                  <span class="inv-value">{{ selectedTx.lotName }}</span>
                </div>
              </div>

              <div class="invoice-box-section border-bottom">
                <div class="invoice-row">
                  <span class="inv-label">Thời gian vào bãi:</span>
                  <span class="inv-value">{{ selectedTx.checkInTime }}</span>
                </div>
                <div class="invoice-row">
                  <span class="inv-label">Thời gian xuất bãi:</span>
                  <span class="inv-value">{{ selectedTx.checkoutTime }}</span>
                </div>
              </div>

              <div class="invoice-box-section money-summary-area">
                <div class="invoice-row">
                  <span class="inv-label">Tiền cọc giữ chỗ trước:</span>
                  <span class="inv-value">{{ selectedTx.deposit.toLocaleString() }} đ</span>
                </div>
                <div class="invoice-row">
                  <span class="inv-label">Phụ phí quá giờ phát sinh:</span>
                  <span class="inv-value">{{ selectedTx.extraFee.toLocaleString() }} đ</span>
                </div>

                <div v-if="selectedTx.status === 'NO_SHOW'" class="no-show-warning-alert">
                  Hệ thống tự động phạt tịch thu 100% tiền cọc do khách quá hạn giờ hẹn 30 phút mà không đưa phương tiện đến bãi.
                </div>

                <div class="invoice-row total-row margin-top-12">
                  <span class="inv-label-total">Tổng doanh thu thực nhận:</span>
                  <span class="inv-value-total">{{ selectedTx.amount.toLocaleString() }} đ</span>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-secondary w-100" @click="closeModal">Đóng biên lai</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { utils, writeFile } from 'xlsx'
import { AdminService } from '@/services/admin.service'

type FilterType = 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR'

type RevenueSummary = {
  totalEarned: number
  totalVehicles: number
  newUsers: number
}

type ChartPoint = {
  label: string
  value: number
  percentage: number
}

type PieSlice = {
  name: string
  percentage: number
  color: string
}

type Transaction = {
  id: string | number
  ticketCode: string
  plate: string
  lotName: string
  checkInTime: string
  checkoutTime: string
  paymentMethod: string
  amount: number
  deposit: number
  extraFee: number
  status: string
  customerName: string
}

type MonthlyTicket = {
  id: string | number
  ticketCode: string
  plate: string
  lotName: string
  startDate: string
  endDate: string
  paymentTime: string
  amount: number
  status: string
  customerName: string
}

const revenueSummary = ref<RevenueSummary>({
  totalEarned: 0,
  totalVehicles: 0,
  newUsers: 0
})

const chartData = ref<ChartPoint[]>([])
const parkingLots = ref<{id: number, name: string}[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const filterType = ref<FilterType>('DAY')
const selectedLot = ref<string>('ALL')
const allRecentTransactions = ref<Transaction[]>([])
const displayedTransactions = ref<Transaction[]>([])
const allMonthlyTickets = ref<MonthlyTicket[]>([])
const displayedMonthlyTickets = ref<MonthlyTicket[]>([])
const pieChartData = ref<PieSlice[]>([])
const isModalOpen = ref(false)
const selectedTx = ref<Transaction | null>(null)

const pieChartStyle = ref<Record<string, string>>({})

const formatShortMoney = (value: number): string => {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M'
  if (value >= 1_000) return (value / 1_000).toFixed(0) + 'K'
  return String(value)
}

const loadRevenueData = async () => {
  try {
    isLoading.value = true
    const [revenueRes, lotsRes] = await Promise.all([
      AdminService.getRevenueSummary(filterType.value, selectedLot.value),
      AdminService.getParkingLots()
    ])
    revenueSummary.value = revenueRes.summary
    chartData.value = revenueRes.chartData
    allRecentTransactions.value = revenueRes.transactions
    allMonthlyTickets.value = revenueRes.monthlyTickets || []
    parkingLots.value = lotsRes.map(l => ({ id: l.id!, name: l.name }))

    updateDisplayedTransactions()
    updateDisplayedMonthlyTickets()
    calculatePieChart()
  } catch (error) {
    errorMessage.value = 'Lỗi khi tải báo cáo doanh thu'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const updateDisplayedTransactions = () => {
  if (selectedLot.value === 'ALL') {
    displayedTransactions.value = allRecentTransactions.value
  } else {
    displayedTransactions.value = allRecentTransactions.value.filter(tx => tx.lotName === selectedLot.value)
  }
}

const updateDisplayedMonthlyTickets = () => {
  if (selectedLot.value === 'ALL') {
    displayedMonthlyTickets.value = allMonthlyTickets.value
  } else {
    displayedMonthlyTickets.value = allMonthlyTickets.value.filter(tx => tx.lotName === selectedLot.value)
  }
}

const calculatePieChart = () => {
  if (displayedTransactions.value.length === 0) {
    pieChartData.value = [
      { name: 'Chưa có dữ liệu', percentage: 100, color: '#e2e8f0' }
    ]
    pieChartStyle.value = { background: '#e2e8f0' }
    return
  }

  const paidCount = displayedTransactions.value.filter(t => t.status === 'COMPLETED').length
  const noShowCount = displayedTransactions.value.filter(t => t.status === 'NO_SHOW').length
  const cancelledCount = displayedTransactions.value.filter(t => t.status === 'CANCELLED').length
  const total = paidCount + noShowCount + cancelledCount

  const paidPercent = total > 0 ? Math.round((paidCount / total) * 100) : 0
  const noShowPercent = total > 0 ? Math.round((noShowCount / total) * 100) : 0
  const cancelledPercent = 100 - paidPercent - noShowPercent

  pieChartData.value = [
    { name: 'Tất toán', percentage: paidPercent, color: '#10b981' },
    { name: 'Phạt hủy cọc', percentage: noShowPercent, color: '#f59e0b' },
    { name: 'Đã hủy', percentage: cancelledPercent, color: '#94a3b8' }
  ]

  pieChartStyle.value = {
    background: `conic-gradient(#10b981 0% ${paidPercent}%, #f59e0b ${paidPercent}% ${paidPercent + noShowPercent}%, #94a3b8 ${paidPercent + noShowPercent}% 100%)`
  }
}

const openTransactionDetail = (tx: Transaction) => {
  selectedTx.value = tx
  isModalOpen.value = true
}

const closeModal = () => { isModalOpen.value = false }

const exportToExcel = () => {
  if (displayedTransactions.value.length === 0) {
    alert('Không có dữ liệu để xuất!')
    return
  }

  // Chuẩn bị dữ liệu cho Excel
  const dataForExcel = displayedTransactions.value.map(tx => ({
    'Mã hóa đơn': tx.ticketCode,
    'Biển số xe': tx.plate || 'Không có',
    'Điểm đỗ xe': tx.lotName,
    'Thời gian ghi nhận': tx.checkoutTime,
    'Tổng tiền (VNĐ)': tx.amount,
    'Tiền cọc (VNĐ)': tx.deposit,
    'Phụ phí (VNĐ)': tx.extraFee,
    'Trạng thái': tx.status === 'PAID' ? 'Đã tất toán' : 'Phạt No-Show',
    'Khách hàng': tx.customerName
  }))

  // Tạo worksheet
  const worksheet = utils.json_to_sheet(dataForExcel)

  // Cài đặt độ rộng cột cơ bản
  const wscols = [
    { wch: 15 }, // Mã hóa đơn
    { wch: 15 }, // Biển số xe
    { wch: 25 }, // Điểm đỗ xe
    { wch: 20 }, // Thời gian ghi nhận
    { wch: 15 }, // Tổng tiền
    { wch: 15 }, // Tiền cọc
    { wch: 15 }, // Phụ phí
    { wch: 20 }, // Trạng thái
    { wch: 20 }  // Khách hàng
  ]
  worksheet['!cols'] = wscols

  // Tạo workbook
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, 'Báo cáo doanh thu')

  // Xuất file
  const fileName = `Bao_cao_doanh_thu_${selectedLot.value === 'ALL' ? 'He_thong' : selectedLot.value.replace(/\s+/g, '_')}_${filterType.value}_${new Date().toISOString().slice(0, 10)}.xlsx`
  writeFile(workbook, fileName)
}

watch([filterType, selectedLot], () => {
  if (filterType.value) loadRevenueData()
})

onMounted(() => {
  loadRevenueData()
})
</script>

<style scoped>
@import '@/assets/styles/admin-shared.css';

/* ... (Giữ nguyên toàn bộ khối style cũ của bạn, không thay đổi) ... */

.margin-top-24 { margin-top: 24px; }
.margin-top-12 { margin-top: 12px; }
.flex-between { display: flex; justify-content: space-between; align-items: center; }
.success-btn { background: linear-gradient(135deg, #10b981, #059669) !important; box-shadow: 0 4px 10px rgba(16,185,129,0.2) !important; }

/* KPI Grid */
.kpi-dashboard-grid-3cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

/* Grid 2 biểu đồ */
.charts-grid { display: grid; grid-template-columns: 2fr 1.2fr; gap: 24px; }

/* Cấu hình biểu đồ Cột */
.chart-container-wrapper { display: flex; gap: 16px; height: 220px; margin-top: 24px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
.chart-y-axis { display: flex; flex-direction: column; justify-content: space-between; color: #94a3b8; font-size: 11px; font-weight: 600; text-align: right; width: 35px; padding-bottom: 24px; }
.chart-bars-area { flex: 1; display: flex; justify-content: space-around; align-items: flex-end; height: 100%; }
.chart-bar-column { display: flex; flex-direction: column; align-items: center; width: 50px; height: 100%; justify-content: flex-end; }
.bar-fill-wrapper { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px; }
.bar-actual-fill { width: 32px; background: linear-gradient(to top, #2563eb, #60a5fa); border-radius: 6px 6px 0 0; position: relative; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.bar-tooltip-value { position: absolute; top: -24px; left: 50%; transform: translateX(-50%); font-size: 11px; font-weight: 700; color: #2563eb; }
.bar-label-text { font-size: 12px; color: #64748b; font-weight: 600; margin-top: 6px; }

/* Cấu hình biểu đồ Tròn (Tỉ trọng bãi đỗ) */
.pie-chart-container { display: flex; align-items: center; gap: 24px; margin-top: 24px; justify-content: center; height: 220px; }
.pie-chart { width: 150px; height: 150px; border-radius: 50%; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); transition: background 0.3s ease; }
.pie-legend { display: flex; flex-direction: column; gap: 12px; }
.legend-item { display: flex; align-items: center; font-size: 13px; font-weight: 600; color: #475569; }
.color-box { width: 14px; height: 14px; border-radius: 4px; margin-right: 8px; display: inline-block; }
.legend-name { flex: 1; min-width: 120px; }
.legend-percent { font-weight: 800; color: #1e293b; }

/* Hoạt ảnh */
@keyframes growUp { from { height: 0; } }
.grow-up { animation: growUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }

/* Các styles khác của Bảng, Thẻ, Nút */
.code-text { font-family: monospace; font-weight: 700; color: #1e293b; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
.license-plate { background: #1e293b; color: #facc15; font-family: monospace; font-weight: 700; padding: 4px 8px; border-radius: 4px; border: 2px solid #cbd5e1; display: inline-block; font-size: 13px; text-align: center; }
.license-plate.mini { font-size: 14px; padding: 2px 8px; border-width: 1px; }
.text-emerald { color: #059669; }
.text-amber { color: #d97706; }
.method-badge { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; color: #475569; }
.clickable-row { cursor: pointer; }
.text-xs { font-size: 12px; }
.font-sm { font-size: 13px; }

/* Modal Styles */
.max-width-450 { max-width: 460px !important; }
.invoice-box-section { padding: 12px 0; display: flex; flex-direction: column; gap: 10px; }
.invoice-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; }
.inv-label { color: #64748b; font-weight: 500; }
.inv-value { color: #1e293b; font-weight: 600; }
.money-summary-area { background-color: #f8fafc; padding: 14px; border-radius: 10px; border: 1px solid #e2e8f0; margin-top: 8px; }
.no-show-warning-alert { background-color: #fffbeb; border: 1px solid #fef08a; color: #b45309; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 600; line-height: 1.5; margin: 8px 0; text-align: left; }
.total-row { border-top: 2px dashed #cbd5e1; padding-top: 12px; }
.inv-label-total { font-size: 15px; font-weight: 800; color: #0f172a; }
.inv-value-total { font-size: 18px; font-weight: 800; color: #10b981; }
.inv-label-sub { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
.badge-gateway { background-color: #e0e7ff; color: #4338ca; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; }

.badge-count { background: #f3f4f6; color: #6b7280; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
.badge-purple { background: #f3e8ff; color: #7c3aed; }

.monthly-code { background: #faf5ff !important; color: #7c3aed !important; border: 1px solid #e9d5ff; }
.customer-name-text { font-weight: 600; color: #1e293b; }
.date-range-cell { display: flex; flex-direction: column; gap: 4px; }
.date-range-text { font-size: 13px; color: #475569; font-weight: 600; }

.status-badge-inline { padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; }
.status-badge-inline.success { background-color: #dcfce7; color: #15803d; }
.status-badge-inline.warning { background-color: #ffedd5; color: #c2410c; }

.modal-overlay { position: fixed; inset: 0; width: 100%; height: 100%; padding: 24px; background-color: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; overflow-y: auto; z-index: 999; }
.modal-content { position: relative; width: min(100%, 460px); max-width: 460px; background-color: white; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); display: flex; flex-direction: column; overflow: hidden; border: 1px solid #e2e8f0; }
.modal-header { padding: 16px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 16px; color: #0f172a; font-weight: 700; }
.close-x-btn { background: none; border: none; font-size: 18px; color: #94a3b8; cursor: pointer; }
.modal-body { padding: 20px 24px; display: flex; flex-direction: column; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #e2e8f0; background-color: #f8fafc; display: flex; justify-content: flex-end; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
@keyframes slideUpModal { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.slide-up-modal { animation: slideUpModal 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.error-text-display { background-color: #fff7ed; color: #c2410c; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 600; text-align: center; margin-bottom: 12px; border: 1px solid #ffedd5; }
</style>
