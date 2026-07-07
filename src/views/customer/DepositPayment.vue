<template>
  <div class="customer-mobile-app animated fade-in">
    <header class="app-header-back border-bottom">
      <button class="back-arrow-btn" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="18" height="18">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/>
        </svg>
      </button>
      <h2 class="header-main-title">Thanh toán đặt cọc</h2>
      <div class="header-empty-space"></div>
    </header>

    <main v-if="!isProcessingGateway && !showQRCode" class="app-main padding-top-12">
      <div class="bill-invoice-card">
        <p class="bill-card-title">Thông tin thanh toán</p>
        <div class="bill-data-row">
          <span class="invoice-label">Bãi đỗ xe:</span>
          <span class="invoice-value-text">{{ bookingDetails.lotName }}</span>
        </div>
        <div class="bill-data-row">
          <span class="invoice-label">Biển số xe:</span>
          <span class="mini-license-plate-widget">{{ bookingDetails.plate }}</span>
        </div>
        <div class="bill-data-row">
          <span class="invoice-label">Mã vé:</span>
          <span class="invoice-value-text">{{ bookingDetails.ticketCode }}</span>
        </div>
        <hr class="divider-dashed-line" />
        <div class="bill-data-row total-deposit-row">
          <span class="total-label">Tổng tiền đặt cọc:</span>
          <span class="total-price-number">{{ bookingDetails.depositAmount.toLocaleString() }} đ</span>
        </div>
        <div class="policy-alert-info-box">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="18" height="18">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.376c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
          </svg>
          <p class="note-text">
            Vui lòng hoàn tất thanh toán trong 10 phút. Nếu quá thời gian này, vé sẽ bị hủy tự động.
          </p>
        </div>
      </div>

      <div class="payment-methods-selection-zone">
        <p class="zone-section-title">Vui lòng thanh toán với Payos</p>
        <div
          v-for="m in methods"
          :key="m.id"
          class="method-card"
          :class="{ 'method-card--active': selectedMethod === m.id }"
          @click="selectPaymentMethod(m.id)"
        >
          <img :src="m.icon" :alt="m.name" class="method-icon" />
          <span class="method-name">{{ m.name }}</span>
          <span v-if="selectedMethod === m.id" class="method-check">✓</span>
        </div>
      </div>



      <div class="payment-action-footer-btn">
        <button class="btn-primary-mobile-pay success-btn" :disabled="isLoading" @click="processSubmitPayment">
          <span v-if="isLoading">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="16" height="16" style="animation:spin 1s linear infinite;vertical-align:middle">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/>
            </svg>
            Đang kết nối...
          </span>
          <span v-else>XÁC NHẬN THANH TOÁN: {{ bookingDetails.depositAmount.toLocaleString() }} đ</span>
        </button>
      </div>
    </main>

    <!-- MÀN HÌNH CHỜ THANH TOÁN -->
    <main v-else-if="isProcessingGateway" class="app-main padding-top-12 animated zoom-in">
      <div class="waiting-payment-card">
        <div class="spinner-container">
          <div class="payment-spinner"></div>
          <div class="gateway-icon-float">
            <img :src="methods.find(m => m.id === selectedMethod)?.icon" alt="gateway" />
          </div>
        </div>

        <h3 class="waiting-title">Đang chờ thanh toán</h3>
        <p class="waiting-desc">
          Vui lòng hoàn tất giao dịch trong ứng dụng
          <strong>{{ methods.find(m => m.id === selectedMethod)?.name }}</strong>
        </p>

        <div class="waiting-info-box">
          <div class="info-line">
            <span>Số tiền:</span>
            <strong>{{ bookingDetails.depositAmount.toLocaleString() }} đ</strong>
          </div>
          <div class="info-line">
            <span>Trạng thái:</span>
            <span class="status-tag pulse">Chờ xác nhận...</span>
          </div>
        </div>

        <div class="waiting-actions">
          <button class="btn-cancel-payment" @click="cancelGatewaySession">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
            </svg>
            Hủy & Chọn lại phương thức
          </button>
          <p class="waiting-note">Nếu bạn đã thanh toán thành công, vui lòng đợi trong giây lát!</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '@/services/api'

const router = useRouter()
const route = useRoute()
const isLoading = ref(false)
const isProcessingGateway = ref(false)
const showQRCode = ref(false)
const selectedMethod = ref('payos')

interface PaymentCreateResponse {
  paymentUrl?: string
  qrCode?: string
  orderId?: string
  message?: string
  status?: string
  error?: string
}

const methods = [
  {
    id: 'payos',
    name: 'PayOS (QR)',
    icon: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR.png'
  }
]

const bookingDetails = ref({
  bookingId: '',
  ticketCode: '',
  lotName: 'Bãi đỗ xe hệ thống',
  plate: 'CHƯA CÓ BSX',
  depositAmount: 20000,
  lotId: '' as string | number | undefined
})

let pollingInterval: number | null = null

const parseRouteParameters = () => {
  const query = route.query

  if (query.status === 'CANCELLED') {
    isProcessingGateway.value = false
    showQRCode.value = false
    isLoading.value = false
    localStorage.removeItem('pending_payment')
    console.log('Returned from payment gateway with CANCELLED status.')
  }

  if (query.bookingId) {
    bookingDetails.value = {
      bookingId: String(query.bookingId || ''),
      ticketCode: String(query.ticketCode || ''),
      lotName: String(query.lotName || 'Bãi đỗ xe hệ thống'),
      plate: String(query.plate || 'CHƯA CÓ').toUpperCase(),
      depositAmount: Number(query.deposit) || 20000,
      lotId: String(query.lotId || '')
    }
  }
}

const openPaymentApp = async (amount: number, description: string) => {
  const method = selectedMethod.value
  const baseUrl = window.location.origin

  if (method === 'payos') {
    try {
      const data = await apiClient.post<PaymentCreateResponse>('/payos/create', {
        amount,
        orderInfo: description,
        bookingId: bookingDetails.value.bookingId,
        ticketCode: bookingDetails.value.ticketCode,
        plate: bookingDetails.value.plate,
        lotId: bookingDetails.value.lotId,
        lotName: bookingDetails.value.lotName,
        baseUrl: baseUrl
      }) as unknown as PaymentCreateResponse

      if (data.status === 'success' && data.paymentUrl) {
        const pendingTicket = {
          orderId: data.orderId,
          lotId: bookingDetails.value.lotId,
          lotName: bookingDetails.value.lotName,
          plate: bookingDetails.value.plate,
          depositAmount: amount,
          gateway: 'payos'
        }
        localStorage.setItem('pending_payment', JSON.stringify(pendingTicket))
        window.location.href = data.paymentUrl
        isProcessingGateway.value = true
        startPollingStatus(data.orderId || '', 'payos')
      } else {
        alert('PayOS lỗi: ' + (data.message || 'Không tạo được link thanh toán'))
      }
    } catch (e) {
      alert('Không kết nối được backend PayOS: ' + e)
    } finally {
      isLoading.value = false
    }
    return true
  }





  return false
}

interface PollingStatusResponse {
  status?: string
}

const startPollingStatus = (orderId: string, gateway: string) => {
  pollingInterval = window.setInterval(async () => {
    try {
      const response = await apiClient.get(`/${gateway}/status/${orderId}`) as unknown as PollingStatusResponse
      if (response.status === 'SUCCESS') {
        clearInterval(pollingInterval!)
        router.push('/customer/ticket')
      } else if (response.status === 'FAILED') {
        clearInterval(pollingInterval!)
        alert('Thanh toán thất bại! Vui lòng thử lại.')
        cancelGatewaySession()
      }
    } catch (e) {
      console.error('Lỗi polling:', e)
    }
  }, 3000)
}

const processSubmitPayment = async () => {
  if (isLoading.value) return

  try {
    isLoading.value = true
    const amount = bookingDetails.value.depositAmount
    const desc = `Dat coc SmartPark - ${bookingDetails.value.plate}`
    await openPaymentApp(amount, desc)
  } catch (error) {
    console.error('Lỗi thanh toán:', error)
    alert('Cổng thanh toán phản hồi chậm. Vui lòng thử lại sau!')
    isLoading.value = false
  }
}

const goBack = () => { router.back() }

const selectPaymentMethod = (methodId: string) => {
  console.log('User selected payment method:', methodId)
  selectedMethod.value = methodId
}

const cancelGatewaySession = () => {
  isProcessingGateway.value = false
  isLoading.value = false
  localStorage.removeItem('pending_payment')
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
}

onMounted(() => {
  parseRouteParameters()
})

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
})
</script>

<style scoped>
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.animated { animation-duration: 0.3s; animation-fill-mode: both; }
.fade-in { animation-name: fadeIn; }
.zoom-in { animation-name: zoomIn; }

.customer-mobile-app {
  max-width: 440px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #f8fafc;
  position: relative;
  overflow-x: hidden;
  padding-bottom: 30px;
  box-shadow: 0 0 24px rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  box-sizing: border-box;
}

.padding-top-12 { padding-top: 12px; }

.app-header-back {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: white;
}

.border-bottom { border-bottom: 1px solid #f1f5f9; }

.back-arrow-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  cursor: pointer;
  padding: 4px;
}

.header-main-title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.header-empty-space { width: 26px; }

.app-main { padding-left: 16px; padding-right: 16px; }

.bill-invoice-card {
  background: white;
  border-radius: 16px;
  padding: 18px;
  border: 1px solid #e2e8f0;
  text-align: left;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01);
}

.bill-card-title {
  margin: 0 0 16px 0;
  font-size: 13px;
  color: #94a3b8;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bill-data-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  align-items: flex-start;
  gap: 8px;
}

.invoice-label {
  color: #64748b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.invoice-value-text {
  color: #1e293b;
  font-weight: 700;
  text-align: right;
}

.divider-dashed-line {
  border: none;
  border-top: 2px dashed #cbd5e1;
  margin: 14px 0;
}

.mini-license-plate-widget {
  background: #1e293b;
  color: #facc15;
  font-family: monospace;
  font-weight: 700;
  font-size: 13px;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid #64748b;
}

.total-deposit-row { align-items: center; }
.total-label { font-size: 14px; font-weight: 800; color: #0f172a; }
.total-price-number { font-size: 20px; font-weight: 800; color: #2563eb; }

.policy-alert-info-box {
  background-color: #fef2f2;
  border: 1px solid #fee2e2;
  padding: 12px;
  border-radius: 10px;
  margin-top: 14px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #991b1b;
}

.note-text {
  font-size: 11px;
  color: #991b1b;
  margin: 0;
  line-height: 1.5;
}

.payment-methods-selection-zone { margin-top: 24px; text-align: left; }
.zone-section-title { font-size: 14px; font-weight: 800; color: #334155; margin-bottom: 12px; }

.method-card {
  display: flex;
  align-items: center;
  padding: 14px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.method-card--active {
  border-color: #2563eb;
  background: #eff6ff;
}
.method-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
  border-radius: 6px;
  margin-right: 12px;
}
.method-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}
.method-check {
  font-size: 16px;
  color: #2563eb;
  font-weight: 700;
}

/* Bank Transfer Info */
.bank-transfer-info {
  margin-top: 16px;
}
.bank-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}
.bank-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #e2e8f0;
}
.bank-info-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
.bank-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}
.bank-value {
  font-size: 14px;
  color: #0f172a;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.bank-note {
  font-size: 12px;
  color: #f59e0b;
  margin-top: 12px;
  line-height: 1.5;
}

/* QR Code Card Styles */
.qr-code-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  text-align: center;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}
.qr-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}
.qr-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 20px;
}
.qr-info-box {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}
.qr-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.qr-image-container {
  background: white;
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 250px;
}
.qr-code-image {
  width: 100%;
  max-width: 230px;
  height: auto;
}
.qr-loading {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  color: #64748b;
}
.qr-loading .spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f1f5f9;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.payment-action-footer-btn { margin-top: 28px; }

.btn-primary-mobile-pay {
  width: 100%;
  padding: 15px;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.success-btn {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.success-btn:disabled { background: #94a3b8; box-shadow: none; cursor: not-allowed; }

/* Waiting Payment Card */
.waiting-payment-card {
  background: white;
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}

.spinner-container {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
}

.payment-spinner {
  width: 100%;
  height: 100%;
  border: 4px solid #f1f5f9;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.gateway-icon-float {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.gateway-icon-float img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.waiting-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.waiting-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px;
  line-height: 1.5;
}

.waiting-info-box {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.info-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-line:last-child { margin-bottom: 0; }

.status-tag {
  color: #2563eb;
  font-weight: 700;
}

.pulse {
  animation: pulse-blue 2s infinite;
}

@keyframes pulse-blue {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.waiting-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn-cancel-payment {
  width: 100%;
  padding: 14px;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fee2e2;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: 0.2s;
}

.btn-cancel-payment:hover {
  background: #fee2e2;
}

.waiting-note {
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.4;
  margin: 0;
}
</style>
