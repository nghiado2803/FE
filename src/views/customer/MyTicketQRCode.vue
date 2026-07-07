<template>
  <div class="ticket-page-wrapper">

    <!-- Refresh Button (Top Right) -->
    <button v-if="authStore.isAuthenticated" class="btn-refresh-top" @click="loadTicketData" :disabled="isLoading">
      <svg :class="{ 'spin': isLoading }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="20" height="20">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    </button>

    <!-- Trạng thái: Chưa đăng nhập -->
    <div v-if="!authStore.isAuthenticated" class="no-ticket-state">
      <div class="lock-icon-box">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="56" height="56" style="opacity:0.5;margin-bottom:16px">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      </div>
      <h3>Bạn cần đăng nhập</h3>
      <p>Vui lòng đăng nhập để xem thông tin vé và mã QR của bạn.</p>
      <button class="btn-go-home" @click="router.push('/customer/auth')">Đăng nhập ngay</button>
    </div>

    <!-- Trạng thái: Đang chờ xác nhận thanh toán (NEW) -->
    <div v-else-if="ticketStatus === 'CHECKING_PAYMENT'" class="checking-payment-state">
      <div class="loading-spinner-momo"></div>
      <h3>Đang xác thực thanh toán...</h3>
      <p>Hệ thống đang chờ phản hồi từ máy chủ. Vui lòng không thoát trang.</p>
      <div class="pending-info-box">
        <p>Biển số: <strong>{{ pendingData?.plate }}</strong></p>
        <p>Số tiền: <strong>{{ pendingData?.depositAmount?.toLocaleString() }}đ</strong></p>
      </div>
    </div>

    <!-- Trạng thái: Đã tạo vé nhưng CHƯA thanh toán cọc (PAYING) -->
    <div v-else-if="ticketStatus === 'PAYING'" class="paying-state">
      <div class="paying-icon-box">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#d97706" width="52" height="52">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
        </svg>
      </div>
      <h3 class="paying-title">Vé chờ thanh toán cọc</h3>
      <p class="paying-desc">Bạn có một vé đã đặt nhưng chưa hoàn tất thanh toán đặt cọc.</p>

      <div class="paying-info-box">
        <div class="paying-row">
          <span>Bãi xe</span>
          <strong>{{ ticketData.lotName }}</strong>
        </div>
        <div class="paying-row">
          <span>Biển số</span>
          <strong class="plate-badge-sm">{{ ticketData.plate }}</strong>
        </div>
        <div class="paying-row">
          <span>Tiền cọc</span>
          <strong class="paying-amount">{{ ticketData.depositPaid.toLocaleString() }}đ</strong>
        </div>
      </div>

      <div class="paying-actions">
        <button class="btn-continue-payment" @click="continuePayment">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="16" height="16">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"/>
          </svg>
          Tiếp tục thanh toán cọc
        </button>
        <button class="btn-cancel-paying" @click="cancelPayingTicket" :disabled="isCancellingPaying">
          <span v-if="isCancellingPaying">Đang hủy...</span>
          <span v-else>Hủy vé này</span>
        </button>
      </div>
      <p class="paying-note">⏱ Vé sẽ tự động hủy sau 15 phút nếu không thanh toán.</p>
    </div>

    <!-- Không có vé nào -->
    <div v-else-if="ticketStatus === 'NONE'" class="no-ticket-state">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="56" height="56" style="opacity:0.5;margin-bottom:16px">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z"/>
      </svg>
      <h3>Không có vé nào</h3>
      <p>Bạn chưa có vé đặt chỗ nào đang hoạt động.</p>
      <button class="btn-go-home" @click="router.push('/customer/home')">Đặt chỗ ngay</button>
    </div>

    <!-- Trạng thái: Đang đến bãi (PENDING) -->
    <div v-else-if="ticketStatus === 'PENDING'" class="ticket-card-container status-pending">
      <div class="status-header">
        <div class="status-icon-circle pending-bg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#a16207" width="22" height="22">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>
          </svg>
        </div>
        <div>
          <h3 class="status-title">Đang trên đường đến bãi</h3>
          <p class="status-sub">Xuất trình mã QR tại cổng để check-in</p>
        </div>
      </div>

      <div class="countdown-bar" :class="{ 'warning-mode': isGracePeriod }">
        <span class="countdown-label">{{ isGracePeriod ? 'Thời gian gia hạn còn' : 'Giữ chỗ còn lại' }}</span>
        <strong class="countdown-timer">{{ countdownString }}</strong>
      </div>

      <div class="qr-center-zone">
        <div class="qr-border-box">
          <QrCodeGenerator :value="ticketData.ticketCode" :size="160" />
        </div>
        <p class="ticket-code-text">Mã vé: <strong>#{{ ticketData.ticketCode }}</strong></p>

        <!-- Nút xem trạng thái -->
        <button class="btn-status-checker" @click="toggleStatusDetail">
          <span class="pulse-icon"></span>
          Bấm vào đây để xem trạng thái: <strong>{{ currentStatusLabel }}</strong>
        </button>

        <!-- Box chi tiết trạng thái (hiện khi bấm) -->
        <div v-if="showStatusDetail" class="status-detail-box animated fadeIn">
          <div class="status-step" :class="{ active: ticketStatusStr === 'PENDING' || ticketStatusStr === 'PARKED' || ticketStatusStr === 'CHECKOUT' }">
            <div class="step-icon">💰</div>
            <div class="step-info">
              <div class="step-title">Đã đặt cọc</div>
              <div class="step-time">{{ formatTime(ticketData.bookingTime || '') }}</div>
            </div>
          </div>
          <div class="status-step-line" :class="{ active: ticketStatusStr === 'PARKED' || ticketStatusStr === 'CHECKOUT' }"></div>
          <div class="status-step" :class="{ active: ticketStatusStr === 'PARKED' || ticketStatusStr === 'CHECKOUT' }">
            <div class="step-icon">🚗</div>
            <div class="step-info">
              <div class="step-title">Đang đỗ xe</div>
              <div class="step-time" v-if="ticketData.checkInTime">{{ formatTime(ticketData.checkInTime) }}</div>
            </div>
          </div>
          <div class="status-step-line" :class="{ active: ticketStatusStr === 'CHECKOUT' }"></div>
          <div class="status-step" :class="{ active: ticketStatusStr === 'CHECKOUT' }">
            <div class="step-icon">🧾</div>
            <div class="step-info">
              <div class="step-title">Chờ thanh toán</div>
              <div class="step-time" v-if="ticketData.checkOutTime">{{ formatTime(ticketData.checkOutTime) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="ticket-divider">
        <div class="notch left"></div>
        <div class="dashed-line"></div>
        <div class="notch right"></div>
      </div>

      <!-- PENDING: chỉ hiện Bãi xe, Biển số, Tiền cọc — KHÔNG có spotCode -->
      <div class="ticket-info-grid">
        <div class="info-item full-width">
          <span class="info-label">Bãi xe</span>
          <strong class="info-value">{{ ticketData.lotName }}</strong>
        </div>
        <div class="info-item">
          <span class="info-label">Biển số</span>
          <div class="plate-selection-box">
            <div class="plate-badge">{{ ticketData.plate }}</div>
            <button v-if="ticketStatus === 'PENDING'" class="btn-change-plate" @click="openPlateSelector">
              Thay đổi
            </button>
          </div>
        </div>

        <!-- Modal Chọn biển số xe -->
        <div v-if="isPlateSelectorOpen" class="plate-modal-overlay animated fadeIn" @click.self="isPlateSelectorOpen = false">
          <div class="plate-modal-box animated slideUp">
            <div class="modal-header">
              <h3>Chọn biển số xe</h3>
              <button class="btn-close-modal" @click="isPlateSelectorOpen = false">✕</button>
            </div>
            <div class="modal-body">
              <p class="modal-sub">Chọn xe bạn sẽ sử dụng để vào bãi</p>
              <div v-if="myVehicles.length === 0" class="no-vehicle-prompt">
                Bạn chưa có xe nào. <router-link to="/customer/vehicles">Thêm xe mới</router-link>
              </div>
              <div v-for="v in myVehicles" :key="v.id"
                   class="vehicle-select-item"
                   :class="{ selected: v.plate === ticketData.plate }"
                   @click="selectNewPlate(v.plate)">
                <div class="vehicle-icon">🚗</div>
                <div class="vehicle-info">
                  <div class="v-plate">{{ v.plate }}</div>
                  <div class="v-model">{{ v.model }}</div>
                </div>
                <div v-if="v.plate === ticketData.plate" class="check-icon">✓</div>
              </div>
            </div>
          </div>
        </div>
        <div class="info-item">
          <span class="info-label">Tiền cọc</span>
          <strong class="info-value">{{ ticketData.depositPaid.toLocaleString() }}đ</strong>
        </div>
      </div>

      <button class="btn-navigate" @click="openNavigation">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="16" height="16">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"/>
        </svg>
        Chỉ đường đến bãi xe
      </button>
    </div>

    <!-- Trạng thái: Đang đậu xe (PARKED) -->
    <div v-else-if="ticketStatus === 'PARKED'" class="ticket-card-container status-parked">
      <div class="status-header">
        <div class="status-icon-circle parked-bg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#15803d" width="22" height="22">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
          </svg>
        </div>
        <div>
          <h3 class="status-title">Xe đang đậu an toàn</h3>
          <p class="status-sub">{{ ticketData.lotName }}</p>
        </div>
      </div>

      <div class="live-timer-box">
        <span class="timer-label">Thời gian đã đỗ</span>
        <strong class="live-timer-text">{{ liveDurationString }}</strong>
      </div>

      <div class="qr-center-zone">
        <div class="qr-border-box">
          <QrCodeGenerator :value="ticketData.ticketCode" :size="160" />
        </div>
        <p class="ticket-code-text">Mã vé: <strong>#{{ ticketData.ticketCode }}</strong></p>

        <!-- Nút xem trạng thái -->
        <button class="btn-status-checker" @click="toggleStatusDetail">
          <span class="pulse-icon"></span>
          Bấm vào đây để xem trạng thái: <strong>{{ currentStatusLabel }}</strong>
        </button>

        <!-- Box chi tiết trạng thái (hiện khi bấm) -->
        <div v-if="showStatusDetail" class="status-detail-box animated fadeIn">
          <div class="status-step" :class="{ active: ticketStatusStr === 'PENDING' || ticketStatusStr === 'PARKED' || ticketStatusStr === 'CHECKOUT' }">
            <div class="step-icon">💰</div>
            <div class="step-info">
              <div class="step-title">Đã đặt cọc</div>
              <div class="step-time">{{ formatTime(ticketData.bookingTime || '') }}</div>
            </div>
          </div>
          <div class="status-step-line" :class="{ active: ticketStatusStr === 'PARKED' || ticketStatusStr === 'CHECKOUT' }"></div>
          <div class="status-step" :class="{ active: ticketStatusStr === 'PARKED' || ticketStatusStr === 'CHECKOUT' }">
            <div class="step-icon">🚗</div>
            <div class="step-info">
              <div class="step-title">Đang đỗ xe</div>
              <div class="step-time" v-if="ticketData.checkInTime">{{ formatTime(ticketData.checkInTime) }}</div>
            </div>
          </div>
          <div class="status-step-line" :class="{ active: ticketStatusStr === 'CHECKOUT' }"></div>
          <div class="status-step" :class="{ active: ticketStatusStr === 'CHECKOUT' }">
            <div class="step-icon">🧾</div>
            <div class="step-info">
              <div class="step-title">Chờ thanh toán</div>
              <div class="step-time" v-if="ticketData.checkOutTime">{{ formatTime(ticketData.checkOutTime) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="ticket-divider">
        <div class="notch left"></div>
        <div class="dashed-line"></div>
        <div class="notch right"></div>
      </div>

      <div class="ticket-info-grid">
        <div class="info-item">
          <span class="info-label">Biển số</span>
          <div class="plate-badge">{{ ticketData.plate }}</div>
        </div>
        <div class="info-item">
          <span class="info-label">Check-in lúc</span>
          <strong class="info-value">{{ formatTime(ticketData.checkInTime) }}</strong>
          <span class="info-date">{{ formatDate(ticketData.checkInTime) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Tiền cọc</span>
          <strong class="info-value">{{ ticketData.depositPaid.toLocaleString() }}đ</strong>
        </div>
      </div>
    </div>

    <!-- Trạng thái: Đang thanh toán (CHECKOUT) -->
    <div v-else-if="ticketStatusStr === 'CHECKOUT'" class="ticket-card-container status-checkout">
      <div class="checkout-header">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2563eb" width="40" height="40" style="margin-bottom:8px">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"/>
        </svg>
        <h3>Thanh toán phí đỗ xe</h3>
        <p>{{ ticketData.lotName }}</p>
      </div>

      <div class="bill-summary-card">
        <div class="bill-row">
          <span>Thời gian đỗ</span>
          <strong>{{ checkoutData.duration }}</strong>
        </div>
        <div class="bill-row">
          <span>Phí đỗ xe</span>
          <strong>{{ checkoutData.parkingFee.toLocaleString() }}đ</strong>
        </div>
        <div class="bill-row deduct">
          <span>Trừ tiền cọc</span>
          <strong>- {{ ticketData.depositPaid.toLocaleString() }}đ</strong>
        </div>
        <div class="bill-divider"></div>
        <div class="bill-row total">
          <span>Còn lại cần trả</span>
          <strong class="total-amount">{{ Math.max(0, checkoutData.parkingFee - ticketData.depositPaid).toLocaleString() }}đ</strong>
        </div>
      </div>

      <div class="info-item full-width" style="margin: 0 0 16px 0;">
        <span class="info-label">Biển số</span>
        <div class="plate-badge">{{ ticketData.plate }}</div>
      </div>

      <button class="btn-pay-now" @click="processCheckoutPayment" :disabled="isPayingOut">
        <span v-if="isPayingOut">Đang xử lý...</span>
        <span v-else>XÁC NHẬN THANH TOÁN {{ Math.max(0, checkoutData.parkingFee - ticketData.depositPaid).toLocaleString() }}đ</span>
      </button>

      <button class="btn-cancel-checkout" @click="cancelCheckout" :disabled="isPayingOut">
        Hủy — Xe vẫn còn trong bãi
      </button>
    </div>

    <!-- Rating Modal -->
    <RatingModal
      ref="ratingModalRef"
      :booking-id="lastBookingId"
      @success="loadTicketData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import QrCodeGenerator from '@/components/common/QrCodeGenerator.vue'
import apiClient from '@/services/api'
import { useTicketStore } from '@/stores/ticketStore'
import { useAuthStore } from '@/stores/authStore'
import { CustomerService, type VehicleResponse } from '@/services/customer.service'
import { useNotificationStore } from '@/stores/notificationStore'
import RatingModal from '@/components/customer/RatingModal.vue'

interface MomoStatusResponse {
  orderId: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
}

const router = useRouter()
const ticketStore = useTicketStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// Rating Modal
interface RatingModalInstance {
  open: () => void
}
const ratingModalRef = ref<RatingModalInstance | null>(null)
const lastBookingId = ref<number | null>(null)

type TicketStatus = 'NONE' | 'PAYING' | 'PENDING' | 'PARKED' | 'CHECKOUT' | 'PAID' | 'CHECKING_PAYMENT'

interface PendingPaymentData {
  orderId: string
  lotId: string
  lotName: string
  plate: string
  depositAmount: number
  gateway?: 'momo' | 'payos'
}

const ticketStatus = ref<TicketStatus>('NONE')
const isGracePeriod = ref(false)
const isPayingOut = ref(false)
const isLoading = ref(false)
const isCancellingPaying = ref(false)

// Logic Chọn biển số
const isPlateSelectorOpen = ref(false)
const myVehicles = ref<VehicleResponse[]>([])

const openPlateSelector = async () => {
  try {
    myVehicles.value = await CustomerService.getMyVehicles()
    isPlateSelectorOpen.value = true
  } catch (error) {
    console.error('Lỗi lấy danh sách xe:', error)
  }
}

// ── XỬ LÝ VÉ PAYING ────────────────────────────────────────

const continuePayment = () => {
  // Điều hướng sang trang thanh toán với thông tin vé hiện có
  router.push({
    path: '/customer/deposit',
    query: {
      bookingId: String(ticketData.value.bookingId || ''),
      ticketCode: ticketData.value.ticketCode,
      lotName: ticketData.value.lotName,
      plate: ticketData.value.plate,
      deposit: String(ticketData.value.depositPaid)
    }
  })
}

const cancelPayingTicket = async () => {
  const isConfirmed = await (window.confirmDialog?.('Bạn có chắc muốn hủy vé này không?') ?? false)
  if (!isConfirmed) return

  try {
    isCancellingPaying.value = true
    await CustomerService.cancelPayingBooking()
    ticketStatus.value = 'NONE'
    ticketStore.clearTicket()
    window.toast?.('Đã hủy vé thành công', 'success')
  } catch {
    window.toast?.('Không thể hủy vé. Vui lòng thử lại!', 'error')
  } finally {
    isCancellingPaying.value = false
  }
}

const selectNewPlate = async (plate: string) => {
  if (plate === ticketData.value.plate) {
    isPlateSelectorOpen.value = false
    return
  }

  try {
    isLoading.value = true
    await CustomerService.updateTicketPlate(plate)
    ticketData.value.plate = plate
    isPlateSelectorOpen.value = false
    // Tải lại dữ liệu để đảm bảo đồng bộ
    await loadTicketData()
  } catch (error) {
    console.error('Lỗi đổi biển số:', error)
    window.toast?.('Không thể thay đổi biển số. Vui lòng thử lại!', 'error')
  } finally {
    isLoading.value = false
  }
}

const pendingData = ref<PendingPaymentData | null>(null)

// Lắng nghe thông báo realtime
interface AppNotificationEvent extends Event {
  detail: { type: string }
}
const handleAppNotification = async (e: Event) => {
  const notif = (e as AppNotificationEvent).detail
  if (notif.type === 'CHECK_IN' || notif.type === 'CHECK_OUT_REQUEST' || notif.type === 'CHECK_OUT_COMPLETE') {
    if (notif.type === 'CHECK_OUT_COMPLETE') {
      // Lưu lại bookingId trước khi loadTicketData làm mất dữ liệu
      lastBookingId.value = ticketData.value.bookingId
    }

    await loadTicketData() // Tự động cập nhật giao diện khi có trạng thái mới

    if (notif.type === 'CHECK_OUT_COMPLETE') {
      // Hiển thị modal đánh giá sau khi thanh toán thành công
      setTimeout(() => {
        ratingModalRef.value?.open()
      }, 1500)
    }
  }
}

let pollingInterval: ReturnType<typeof setInterval> | undefined = undefined
const liveDurationString = ref('00:00:00')
let timerInterval: ReturnType<typeof setInterval> | null = null

const ticketData = ref({
  ticketCode: '',
  lotName: '',
  plate: '',
  depositPaid: 0,
  checkInTime: '',
  checkOutTime: '',
  bookingTime: '',
  lotLat: 13.7745,
  lotLng: 109.2195,
  holdExpireAt: '',
  graceMinutes: 15,
  parkingFee: 0,
  extraFee: 0,
  totalPaid: 0,
  bookingId: null as number | null
})

const checkoutData = ref({
  duration: '',
  parkingFee: 0,
  extraFee: 0,
  totalPaid: 0
})

const currentStatusLabel = computed(() => {
  switch (ticketStatus.value) {
    case 'PENDING': return 'Đã đặt cọc'
    case 'PARKED': return 'Đang đỗ xe'
    case 'CHECKOUT': return 'Chờ thanh toán'
    case 'PAID': return 'Đã thanh toán'
    case 'CHECKING_PAYMENT': return 'Đang xác thực'
    default: return 'Không xác định'
  }
})

const ticketStatusStr = computed(() => ticketStatus.value as string)

const showStatusDetail = ref(false)
const toggleStatusDetail = async () => {
  showStatusDetail.value = !showStatusDetail.value
  if (showStatusDetail.value) {
    // Làm mới dữ liệu khi người dùng muốn xem trạng thái chi tiết
    await loadTicketData()
  }
}

const countdownString = ref('30:00')
let countdownInterval: ReturnType<typeof setInterval> | null = null

const checkPaymentStatus = () => {
  const pending = localStorage.getItem('pending_payment')
  if (!pending) return

  const data = JSON.parse(pending)
  pendingData.value = data

  ticketStatus.value = 'CHECKING_PAYMENT'

  // Polling mỗi 2 giây
  pollingInterval = setInterval(async () => {
    try {
      const gatewayPath = data.gateway === 'payos' ? 'payos' : 'momo'
      const statusData = await apiClient.get(`/` + gatewayPath + `/status/${data.orderId}`) as unknown as MomoStatusResponse

      if (statusData.status === 'SUCCESS') {
        clearInterval(pollingInterval)
        localStorage.removeItem('pending_payment')
        // Chờ backend xử lý IPN và tạo booking (tối đa 10 giây, retry mỗi 2 giây)
        ticketStatus.value = 'CHECKING_PAYMENT'
        let retries = 0
        const retryInterval = setInterval(async () => {
          retries++
          try {
            const ticket = await apiClient.get('/customer/ticket/current') as { status?: string }
            if (ticket && ticket.status && ticket.status !== 'NONE') {
              clearInterval(retryInterval)
              await loadTicketData()
            } else if (retries >= 5) {
              clearInterval(retryInterval)
              await loadTicketData()
            }
          } catch {
            if (retries >= 5) {
              clearInterval(retryInterval)
              await loadTicketData()
            }
          }
        }, 2000)
      } else if (statusData.status === 'FAILED') {
        clearInterval(pollingInterval)
        alert('Thanh toán thất bại hoặc đã bị hủy!')
        localStorage.removeItem('pending_payment')
        ticketStatus.value = 'NONE'
      }
    } catch (e) {
      console.error('Lỗi kiểm tra trạng thái:', e)
    }
  }, 2000)
}

const loadTicketData = async () => {
  try {
    isLoading.value = true

    // Luôn ưu tiên lấy dữ liệu mới nhất từ Backend
    const currentTicket = await apiClient.get('/customer/ticket/current') as {
      status: TicketStatus; ticketCode: string; lotName: string; plate: string
      depositPaid: number; checkInTime?: string; lotLat?: number; lotLng?: number
      latitude?: number; longitude?: number; spotCode?: string
      bookingTime?: string; checkOutTime?: string; pricePerHour?: number
      holdExpireAt?: string; graceMinutes?: number
      parkingFee?: number; extraFee?: number; totalPaid?: number
      bookingId?: number
    }

    if (currentTicket && currentTicket.status && currentTicket.status !== 'NONE' && currentTicket.status !== 'PAID') {
      // KIỂM TRA HẾT HẠN NGAY KHI LOAD (Dự phòng cho Backend Scheduler chạy trễ)
      if (currentTicket.status === 'PENDING' && currentTicket.holdExpireAt) {
        const expireAt = new Date(currentTicket.holdExpireAt.replace(' ', 'T')).getTime()
        const graceMs = (currentTicket.graceMinutes || 15) * 60 * 1000
        if (Date.now() > (expireAt + graceMs)) {
          ticketStatus.value = 'NONE'
          ticketStore.clearTicket()
          return
        }
      }

      ticketData.value = {
        ticketCode: currentTicket.ticketCode,
        lotName: currentTicket.lotName,
        plate: currentTicket.plate,
        depositPaid: currentTicket.depositPaid,
        checkInTime: currentTicket.checkInTime || '',
        checkOutTime: currentTicket.checkOutTime || '',
        bookingTime: currentTicket.bookingTime || '',
        lotLat: currentTicket.latitude || currentTicket.lotLat || 13.7745,
        lotLng: currentTicket.longitude || currentTicket.lotLng || 109.2195,
        holdExpireAt: currentTicket.holdExpireAt || '',
        graceMinutes: currentTicket.graceMinutes || 15,
        parkingFee: currentTicket.parkingFee || 0,
        extraFee: currentTicket.extraFee || 0,
        totalPaid: currentTicket.totalPaid || 0,
        bookingId: currentTicket.bookingId || null
      }
      ticketStatus.value = currentTicket.status

      // Đồng bộ vào store (chỉ khi status hợp lệ với store)
      if ((currentTicket.status as string) !== 'NONE') {
        ticketStore.setTicket({
          ...currentTicket,
          status: currentTicket.status as import('@/stores/ticketStore').TicketStatus,
          spotCode: currentTicket.spotCode || ''
        })
      }

      if (ticketStatus.value === 'PENDING' && ticketData.value.holdExpireAt) {
        startCountdown(ticketData.value.holdExpireAt, ticketData.value.graceMinutes)
      }
      if (ticketStatus.value === 'PARKED' && currentTicket.checkInTime) {
        startLiveTimer(currentTicket.checkInTime)
      }
      if (ticketStatus.value === 'CHECKOUT' && currentTicket.checkInTime) {
        // Parse format "HH:mm:ss dd/MM/yyyy"
        const parseDate = (str: string) => {
          const match = str.match(/^(\d{2}):(\d{2}):(\d{2}) (\d{2})\/(\d{2})\/(\d{4})$/)
          if (match) {
            const [, hh, mm, ss, dd, mo, yyyy] = match
            return new Date(Number(yyyy), Number(mo) - 1, Number(dd), Number(hh), Number(mm), Number(ss)).getTime()
          }
          return new Date(str.replace(' ', 'T')).getTime()
        }

        const checkIn = parseDate(currentTicket.checkInTime)
        const checkOut = currentTicket.checkOutTime ? parseDate(currentTicket.checkOutTime) : Date.now()

        if (!isNaN(checkIn)) {
          const diffMs = checkOut - checkIn
          const hours = Math.floor(diffMs / 3600000)
          const minutes = Math.floor((diffMs % 3600000) / 60000)
          const fee = Math.max(15000, Math.ceil((diffMs / 3600000)) * (currentTicket.pricePerHour || 15000))
          checkoutData.value = {
            duration: (hours > 0 ? hours + 'h ' : '') + minutes + 'p',
            parkingFee: currentTicket.parkingFee || fee,
            extraFee: currentTicket.extraFee || 0,
            totalPaid: currentTicket.totalPaid || 0
          }
        }
      }
    } else {
      // Nếu trạng thái là PAID hoặc NONE, coi như không có vé hoạt động
      ticketStatus.value = 'NONE'
      ticketStore.clearTicket()
    }
  } catch (error) {
    console.error('Lỗi tải dữ liệu vé:', error)
    // Nếu lỗi API, dùng dữ liệu cũ trong store làm dự phòng
    const stored = ticketStore.activeTicket
    if (stored) {
      ticketData.value = {
        ticketCode: stored.ticketCode,
        lotName: stored.lotName,
        plate: stored.plate,
        depositPaid: stored.depositPaid,
        checkInTime: stored.checkInTime || '',
        checkOutTime: '',
        bookingTime: stored.bookingTime || '',
        lotLat: stored.lotLat || 13.7745,
        lotLng: stored.lotLng || 109.2195,
        holdExpireAt: '',
        graceMinutes: 15,
        parkingFee: 0,
        extraFee: 0,
        totalPaid: 0,
        bookingId: null
      }
      ticketStatus.value = (stored.status as TicketStatus)
      if (stored.status === 'PENDING' && stored.holdExpireAt) startCountdown(stored.holdExpireAt, stored.graceMinutes || 15)
      if (stored.status === 'PARKED' && stored.checkInTime) startLiveTimer(stored.checkInTime)
    } else {
      ticketStatus.value = 'NONE'
    }
  } finally {
    isLoading.value = false
  }
}

const startCountdown = (expireAtStr: string, graceMinutes: number) => {
  if (countdownInterval) clearInterval(countdownInterval)

  // Xử lý expireAtStr an toàn cho nhiều trình duyệt
  const expireAt = new Date(expireAtStr.replace(' ', 'T')).getTime()
  if (isNaN(expireAt)) {
    console.error('Invalid expireAt date:', expireAtStr)
    countdownString.value = '--:--'
    return
  }

  const graceMs = graceMinutes * 60 * 1000
  let retryCount = 0

  countdownInterval = setInterval(() => {
    const now = Date.now()

    // TỔNG THỜI GIAN = Thời gian chờ + Thời gian gia hạn
    const totalLimit = expireAt + graceMs
    const remainingTotal = totalLimit - now

    if (remainingTotal <= 0) {
      countdownString.value = '00:00'
      isGracePeriod.value = false
      if (countdownInterval) clearInterval(countdownInterval)

      // CHUYỂN TRẠNG THÁI NGAY LẬP TỨC TRÊN UI
      ticketStatus.value = 'NONE'
      ticketStore.clearTicket()

      if (retryCount < 1) {
        retryCount++
        // Thử tải lại sau 3 giây để đồng bộ với Backend
        setTimeout(() => loadTicketData(), 3000)
      }
      return
    }

    // Nếu đã quá expireAt nhưng chưa quá totalLimit thì là trong thời gian gia hạn
    isGracePeriod.value = now > expireAt

    const m = Math.floor(remainingTotal / 60000)
    const s = Math.floor((remainingTotal % 60000) / 1000)
    countdownString.value = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }, 1000)
}

const startLiveTimer = (checkInTimeStr: string) => {
  if (timerInterval) clearInterval(timerInterval)

  // Parse format "HH:mm:ss dd/MM/yyyy" từ backend
  let checkIn: number
  const match = checkInTimeStr.match(/^(\d{2}):(\d{2}):(\d{2}) (\d{2})\/(\d{2})\/(\d{4})$/)
  if (match) {
    const [, hh, mm, ss, dd, mo, yyyy] = match
    checkIn = new Date(Number(yyyy), Number(mo) - 1, Number(dd), Number(hh), Number(mm), Number(ss)).getTime()
  } else {
    // Fallback: thử parse ISO
    checkIn = new Date(checkInTimeStr.replace(' ', 'T')).getTime()
  }

  if (isNaN(checkIn)) {
    console.error('Invalid checkIn date:', checkInTimeStr)
    liveDurationString.value = '--:--:--'
    return
  }

  timerInterval = setInterval(() => {
    const diff = Date.now() - checkIn
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    liveDurationString.value = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
  }, 1000)
}

const formatTime = (isoStr: string) => {
  if (!isoStr) return '--'
  // Parse format "HH:mm:ss dd/MM/yyyy"
  const match = isoStr.match(/^(\d{2}):(\d{2}):(\d{2}) (\d{2})\/(\d{2})\/(\d{4})$/)
  if (match) {
    return `${match[1]}:${match[2]}`
  }
  const d = new Date(isoStr.replace(' ', 'T'))
  if (isNaN(d.getTime())) return '--:--'
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

const formatDate = (isoStr: string) => {
  if (!isoStr) return '--'
  // Parse format "HH:mm:ss dd/MM/yyyy"
  const match = isoStr.match(/^(\d{2}):(\d{2}):(\d{2}) (\d{2})\/(\d{2})\/(\d{4})$/)
  if (match) {
    return `${match[4]}/${match[5]}/${match[6]}`
  }
  const d = new Date(isoStr.replace(' ', 'T'))
  if (isNaN(d.getTime())) return '--'
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`
}

const openNavigation = () => {
  router.push({
    path: '/customer/home',
    query: {
      nav: '1',
      lat: ticketData.value.lotLat,
      lng: ticketData.value.lotLng,
      name: ticketData.value.lotName
    }
  })
}

const processCheckoutPayment = async () => {
  isPayingOut.value = true
  try {
    // Gọi API checkout thực tế (StaffController.checkOut)
    const response = await apiClient.post('/staff/check-out', {
      qrCode: ticketData.value.ticketCode
    }) as unknown as { status: string; parkingFee: number; extraFee: number; bookingId?: number }

    if (response.status === 'VALID') {
      ticketStore.addToHistory({
        id: Date.now(),
        lotName: ticketData.value.lotName,
        plate: ticketData.value.plate,
        spotCode: '',
        timeString: `${formatTime(ticketData.value.checkInTime)} - ${formatTime(new Date().toISOString())}`,
        fee: response.parkingFee || checkoutData.value.parkingFee,
        duration: checkoutData.value.duration,
        status: 'COMPLETED'
      })

      lastBookingId.value = response.bookingId || ticketData.value.bookingId
      ticketStore.clearTicket()
      ticketStatus.value = 'NONE'

      // Hiển thị modal đánh giá ngay sau khi bấm thanh toán xong (nếu không dùng notification realtime)
      setTimeout(() => {
        ratingModalRef.value?.open()
      }, 1000)
    } else {
      alert('Thanh toán thất bại: ' + (response as unknown as { message?: string }).message)
    }
  } catch (error) {
    console.error('Lỗi thanh toán:', error)
    alert('Có lỗi xảy ra khi thanh toán. Vui lòng thử lại!')
  } finally {
    isPayingOut.value = false
  }
}

// Hủy checkout — rollback CHECKOUT → PARKED (staff quét nhầm)
const cancelCheckout = async () => {
  if (!ticketData.value.bookingId) {
    await loadTicketData()
    return
  }
  try {
    isPayingOut.value = true
    await apiClient.post(`/staff/cancel-checkout/${ticketData.value.bookingId}`, {})
    await loadTicketData()
  } catch (error) {
    console.error('Lỗi hủy checkout:', error)
    // Dù API lỗi vẫn reload để đồng bộ trạng thái
    await loadTicketData()
  } finally {
    isPayingOut.value = false
  }
}

onMounted(async () => {
  if (authStore.isAuthenticated) {
    notificationStore.connectRealtime()
    window.addEventListener('app-notification', handleAppNotification)
  }

  const pending = localStorage.getItem('pending_payment')
  if (pending) {
    // Luôn ưu tiên kiểm tra payment đang chờ, bất kể store có data cũ hay không
    checkPaymentStatus()
  } else {
    // Không có payment pending → load vé từ backend
    await loadTicketData()
  }
})

onUnmounted(() => {
  window.removeEventListener('app-notification', handleAppNotification)
  if (pollingInterval) clearInterval(pollingInterval)
  if (timerInterval) clearInterval(timerInterval)
  if (countdownInterval) clearInterval(countdownInterval)
})
</script>

<style scoped>
.ticket-page-wrapper {
  width: 100%;
  min-height: 100%;
  background: linear-gradient(160deg, #1e3a8a 0%, #2563eb 60%, #06b6d4 100%);
  padding: 24px 16px 32px;
  box-sizing: border-box;
}

/* Refresh Top Button */
.btn-refresh-top {
  position: absolute;
  top: 24px;
  right: 16px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
}
.btn-refresh-top:hover {
  background: rgba(255, 255, 255, 0.3);
}
.btn-refresh-top:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.spin {
  animation: spin 1s linear infinite;
}

/* Không có vé */
.no-ticket-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  color: white;
}

.lock-icon-box {
  background: rgba(255, 255, 255, 0.1);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.no-ticket-state h3 { font-size: 20px; font-weight: 800; margin: 0 0 8px 0; }
.no-ticket-state p { font-size: 13px; opacity: 0.8; margin: 0 0 24px 0; }

.btn-go-home {
  padding: 13px 28px;
  background: white;
  color: #2563eb;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
}

/* Plate selection */
.plate-selection-box {
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-change-plate {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #2563eb;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
}
.btn-change-plate:hover {
  background: #e2e8f0;
}

/* Plate Modal */
.plate-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}
.plate-modal-box {
  background: white;
  width: 100%;
  border-radius: 24px 24px 0 0;
  padding: 24px 20px 40px;
  max-height: 80vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.modal-header h3 { margin: 0; font-size: 18px; font-weight: 800; color: #0f172a; }
.btn-close-modal {
  background: #f1f5f9; border: none; width: 32px; height: 32px;
  border-radius: 50%; font-size: 14px; cursor: pointer;
}
.modal-sub { font-size: 13px; color: #64748b; margin: 0 0 20px 0; }

.vehicle-select-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1.5px solid #f1f5f9;
  border-radius: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.vehicle-select-item:hover {
  background: #f8fafc;
}
.vehicle-select-item.selected {
  border-color: #2563eb;
  background: #eff6ff;
}
.vehicle-icon { font-size: 24px; }
.v-plate { font-size: 16px; font-weight: 800; color: #0f172a; font-family: monospace; }
.v-model { font-size: 12px; color: #64748b; }
.check-icon { margin-left: auto; color: #2563eb; font-weight: 900; }

.no-vehicle-prompt {
  text-align: center;
  padding: 30px;
  color: #64748b;
  font-size: 14px;
}
.no-vehicle-prompt a { color: #2563eb; font-weight: 700; text-decoration: none; }

/* Animations */
.animated { animation-duration: 0.3s; animation-fill-mode: both; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.fadeIn { animation-name: fadeIn; }
.slideUp { animation-name: slideUp; }

/* Checking payment state */
.checking-payment-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.1);
}

/* PAYING state */
.paying-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 36px 20px 28px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.1);
}
.paying-icon-box {
  background: #fef3c7;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.paying-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 800;
  color: #92400e;
}
.paying-desc {
  margin: 0 0 20px;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}
.paying-info-box {
  width: 100%;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 20px;
  text-align: left;
}
.paying-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  padding: 5px 0;
  color: #475569;
}
.plate-badge-sm {
  background: #1e293b;
  color: #facc15;
  font-family: monospace;
  font-weight: 700;
  font-size: 13px;
  padding: 2px 8px;
  border-radius: 4px;
}
.paying-amount {
  color: #2563eb;
  font-size: 16px;
  font-weight: 800;
}
.paying-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-bottom: 14px;
}
.btn-continue-payment {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}
.btn-cancel-paying {
  width: 100%;
  padding: 12px;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.btn-cancel-paying:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.paying-note {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

.loading-spinner-momo {
  width: 50px;
  height: 50px;
  border: 4px solid #f1f5f9;
  border-top: 4px solid #a50064; /* MoMo Pink */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.pending-info-box {
  margin-top: 20px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 12px;
  width: 100%;
  text-align: left;
}

.pending-info-box p {
  margin: 5px 0;
  font-size: 14px;
  color: #475569;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Card vé chung */
.ticket-card-container {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.2);
}

/* Header trạng thái */
.status-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.status-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pending-bg { background: #fef9c3; }
.parked-bg { background: #dcfce7; }

.status-title { margin: 0 0 3px 0; font-size: 15px; font-weight: 800; color: #0f172a; }
.status-sub { margin: 0; font-size: 12px; color: #64748b; font-weight: 500; }

/* Countdown */
.countdown-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 16px;
}

.countdown-label { font-size: 12px; color: #dc2626; font-weight: 600; }
.countdown-timer { font-size: 18px; font-weight: 800; color: #dc2626; font-family: monospace; }

/* Live timer */
.live-timer-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 16px;
}

.timer-label { font-size: 12px; color: #16a34a; font-weight: 600; }
.live-timer-text { font-size: 20px; font-weight: 800; color: #16a34a; font-family: monospace; }

/* QR zone */
.countdown-bar.warning-mode {
  background: #fef2f2;
  border: 1px solid #fee2e2;
}
.countdown-bar.warning-mode .countdown-label {
  color: #991b1b;
}
.countdown-bar.warning-mode .countdown-timer {
  color: #dc2626;
}

.qr-center-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
}

.qr-border-box {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
}

.ticket-code-text {
  margin: 8px 0 0 0;
  font-size: 12.5px;
  color: #64748b;
  font-family: monospace;
}

/* Divider coupon */
.btn-status-checker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 20px;
  margin: 12px auto;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-status-checker:hover {
  background: #f1f5f9;
}
.btn-status-checker strong {
  color: #2563eb;
}

.pulse-icon {
  width: 8px;
  height: 8px;
  background: #2563eb;
  border-radius: 50%;
  animation: pulse-blue 1.5s infinite;
}

@keyframes pulse-blue {
  0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); }
  100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
}

.status-detail-box {
  background: #fdfdfd;
  border-radius: 12px;
  padding: 16px;
  margin: 12px 16px;
  border: 1px dashed #cbd5e1;
}

.status-step {
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0.4;
}
.status-step.active {
  opacity: 1;
}
.step-icon {
  font-size: 18px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 50%;
}
.status-step.active .step-icon {
  background: #dcfce7;
}
.step-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}
.step-time {
  font-size: 11px;
  color: #64748b;
}

.status-step-line {
  width: 2px;
  height: 16px;
  background: #e2e8f0;
  margin-left: 15px;
}
.status-step-line.active {
  background: #22c55e;
}

.ticket-divider {
  position: relative;
  height: 20px;
  display: flex;
  align-items: center;
  margin: 8px -20px;
  overflow: hidden;
}

.dashed-line { flex: 1; border-top: 2px dashed #e2e8f0; }
.notch { width: 16px; height: 16px; background: #2563eb; border-radius: 50%; position: absolute; }
.notch.left { left: -8px; }
.notch.right { right: -8px; }

/* Info grid */
.ticket-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-align: left;
}

.full-width { grid-column: span 2; }

.info-label {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
}

.info-value {
  font-size: 13.5px;
  color: #1e293b;
  font-weight: 700;
}

.info-date {
  font-size: 11.5px;
  color: #64748b;
  margin-top: 2px;
}

.plate-badge {
  background: #1e293b;
  color: #facc15;
  font-family: monospace;
  font-weight: 700;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  width: fit-content;
}

.btn-navigate {
  width: 100%;
  margin-top: 18px;
  padding: 13px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 13.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Checkout */
.checkout-header {
  text-align: center;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.checkout-header h3 { margin: 0 0 4px 0; font-size: 18px; font-weight: 800; color: #0f172a; }
.checkout-header p { margin: 0; font-size: 12px; color: #64748b; }

.bill-summary-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 16px;
}

.bill-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 13.5px;
  color: #475569;
}

.bill-row strong { color: #1e293b; font-weight: 700; }
.bill-row.deduct strong { color: #16a34a; }
.bill-row.total { padding-top: 10px; }
.bill-row.total span { font-weight: 800; color: #0f172a; font-size: 14px; }
.bill-divider { border-top: 1px dashed #cbd5e1; margin: 6px 0; }
.total-amount { font-size: 20px; font-weight: 900; color: #2563eb; }

.btn-pay-now {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 13.5px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
}

.btn-pay-now:disabled { background: #94a3b8; box-shadow: none; cursor: not-allowed; }

.btn-cancel-checkout {
  width: 100%;
  margin-top: 10px;
  padding: 12px;
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  background: white;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel-checkout:hover:not(:disabled) { background: #f1f5f9; color: #475569; }
.btn-cancel-checkout:disabled { opacity: 0.5; cursor: not-allowed; }

/* Paid success */
.paid-success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: white;
  padding-top: 40px;
}

.paid-check-circle {
  width: 64px;
  height: 64px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.paid-success-state h3 { font-size: 22px; font-weight: 800; margin: 0 0 6px 0; }
.paid-success-state > p { font-size: 13px; opacity: 0.85; margin: 0 0 24px 0; }

.paid-summary {
  background: rgba(255,255,255,0.15);
  border-radius: 14px;
  padding: 16px;
  width: 100%;
  margin-bottom: 24px;
}

.paid-row {
  display: flex;
  justify-content: space-between;
  padding: 7px 0;
  font-size: 13.5px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.paid-row:last-child { border-bottom: none; }
.paid-row span { opacity: 0.8; }
.paid-row strong { font-weight: 700; }
.paid-row strong.blue { color: #bfdbfe; }
</style>
