<template>
  <div class="mtp-wrapper">

    <form @submit.prevent="handlePurchase" class="mtp-form">

      <!-- 1. CHỌN BẢI XE -->
      <div class="mtp-section">
        <div class="mtp-label-wrap">
          <span class="mtp-icon-pill blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </span>
          <div class="mtp-label-text">
            <span class="mtp-label">Bãi đỗ xe <span class="req">*</span></span>
            <span class="mtp-label-hint">Chọn nơi bạn muốn gửi xe</span>
          </div>
        </div>

        <BaseSelect
          v-model="form.lotId"
          :options="lotOptions"
          placeholder="Chọn bãi xe..."
          @update:modelValue="handleLotChange"
          :disabled="loading"
        />

        <transition name="pop">
          <div v-if="selectedLot" class="mtp-lot-card">
            <div class="lot-card-left">
              <div class="lot-avatar">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M13 3H5v18h4v-6h4v6h4V8l-4-5zm-2 8H9V9h2v2z"/></svg>
              </div>
              <div class="lot-meta">
                <span class="lot-name">{{ selectedLot.name }}</span>
                <span class="lot-addr">{{ selectedLot.address }}</span>
              </div>
            </div>
            <div class="lot-card-right">
              <span class="lot-price-label">Giá vé</span>
              <span class="lot-price">{{ formatCurrency(selectedLot?.monthlyPrice) }}</span>
              <span class="lot-price-period">/ tháng</span>
            </div>
          </div>
        </transition>
      </div>

      <!-- 2. THỜI GIAN SỬ DỤNG -->
      <div class="mtp-section">
        <div class="mtp-label-wrap">
          <span class="mtp-icon-pill cyan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </span>
          <div class="mtp-label-text">
            <span class="mtp-label">Thời gian sử dụng <span class="req">*</span></span>
            <span class="mtp-label-hint">Chọn ngày bắt đầu & kết thúc</span>
          </div>
        </div>

        <div class="mtp-date-range">
          <div class="date-field">
            <label class="date-field-label">Từ ngày</label>
            <div class="date-input-wrap">
              <svg class="date-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
              </svg>
              <DatePicker v-model="form.startDate" :min="minDate" :disabled="loading" class="mtp-date-input" />
            </div>
          </div>

          <div class="date-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>

          <div class="date-field">
            <label class="date-field-label">Đến ngày</label>
            <div class="date-input-wrap">
              <svg class="date-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
              </svg>
              <DatePicker v-model="form.endDate" :min="form.startDate" :disabled="true" class="mtp-date-input" />
            </div>
          </div>
        </div>

        <transition name="pop">
          <div v-if="dateDuration" class="mtp-duration">
            <span class="duration-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <strong>{{ dateDuration }}</strong>
              <span>ngày</span>
              <span v-if="monthsCount > 0" class="months-hint">
                · ~ {{ monthsCount }} tháng {{ leftoverDays > 0 ? leftoverDays + ' ngày' : '' }}
              </span>
            </span>
          </div>
        </transition>
      </div>

      <!-- 3. CHỌN XE -->
      <div class="mtp-section">
        <div class="mtp-label-wrap">
          <span class="mtp-icon-pill green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"></path>
              <circle cx="6.5" cy="16.5" r="2.5"></circle>
              <circle cx="16.5" cy="16.5" r="2.5"></circle>
            </svg>
          </span>
          <div class="mtp-label-text">
            <span class="mtp-label">Phương tiện <span class="req">*</span></span>
            <span class="mtp-label-hint">Xe sẽ sử dụng vé tháng này</span>
          </div>
        </div>

        <BaseSelect
          v-model="form.plate"
          :options="vehicleOptions"
          placeholder="Chọn biển số xe..."
          :disabled="loading"
        />
      </div>

      <!-- 4. KIỂM TRA CHỖ TRỐNG -->
      <transition name="pop">
        <div v-if="capacityInfo" class="mtp-section">
          <div class="capacity-card" :class="{ 'unavailable': !capacityInfo.canPurchase }">

            <div class="cap-header" :class="{ ok: capacityInfo.canPurchase, no: !capacityInfo.canPurchase }">
              <span class="cap-icon-pill">
                <svg v-if="capacityInfo.canPurchase" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </span>
              <span class="cap-status">
                {{ capacityInfo.canPurchase ? 'Còn chỗ trống — đặt ngay' : 'Đã hết chỗ trống' }}
              </span>
            </div>

            <div class="cap-grid">
              <div class="cap-item">
                <span class="cap-k">Tổng chỗ</span>
                <span class="cap-v">{{ capacityInfo.totalMonthlySlots }}</span>
              </div>
              <div class="cap-item">
                <span class="cap-k">Đã đặt</span>
                <span class="cap-v used">{{ capacityInfo.existingTickets }}</span>
              </div>
              <div class="cap-item highlight">
                <span class="cap-k">Còn trống</span>
                <span class="cap-v free">{{ capacityInfo.availableSlots }}</span>
              </div>
            </div>

            <div class="cap-footer">
              <span class="cap-footer-label">Thành tiền</span>
              <span class="cap-total-price">{{ formatCurrency(capacityInfo.monthlyPrice) }}</span>
            </div>

            <transition name="pop">
              <div v-if="!capacityInfo.canPurchase" class="cap-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{{ capacityInfo.message || 'Vui lòng chọn bãi xe khác để đặt vé tháng' }}</span>
              </div>
            </transition>
          </div>
        </div>
      </transition>

      <!-- ERROR -->
      <transition name="pop">
        <div v-if="error" class="mtp-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ error }}</span>
        </div>
      </transition>

      <!-- NÚT HÀNH ĐỘNG -->
      <div class="mtp-actions">
        <button type="button" @click="$emit('cancel')" class="mtp-btn ghost" :disabled="loading">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Hủy bỏ
        </button>
        <button
          type="submit"
          class="mtp-btn primary"
          :disabled="!isFormValid || loading || !!(capacityInfo && !capacityInfo.canPurchase)"
        >
          <LoadingSpinner v-if="loading" size="small" />
          <template v-else>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <path d="M20 6L9 17l-5-5"></path>
            </svg>
            Xác nhận mua
            <span v-if="totalPrice" class="price-inline">{{ formatCurrency(totalPrice) }}</span>
          </template>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { CustomerService, type VehicleResponse } from '@/services/customer.service'
import { AdminService } from '@/services/admin.service'
import BaseSelect from '@/components/common/BaseSelect.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import DatePicker from '@/components/DatePicker.vue'

const emit = defineEmits(['success', 'cancel'])
const loading = ref(false)
const error = ref<string | null>(null)

type ParkingLot = { id: number; name: string; address: string; monthlyPrice?: number }

const form = ref({
  lotId: '' as string | number,
  startDate: '',
  endDate: '',
  plate: ''
})

const parkingLots = ref<ParkingLot[]>([])
const vehicles = ref<VehicleResponse[]>([])
const capacityInfo = ref<{
  canPurchase: boolean
  monthlyPrice: number
  totalMonthlySlots: number
  existingTickets: number
  availableSlots: number
  message?: string
} | null>(null)

const minDate = computed<string>(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const selectedLot = computed(() => {
  return parkingLots.value.find(lot => lot.id === Number(form.value.lotId))
})

const lotOptions = computed(() => {
  return parkingLots.value.map(lot => {
    const nameTrim = (lot.name || '').trim() || 'Bãi xe không tên'
    const shortName = nameTrim.length > 52 ? nameTrim.slice(0, 49).trimEnd() + '...' : nameTrim
    return {
      value: lot.id,
      text: shortName,
      data: lot
    }
  })
})

const vehicleOptions = computed(() => {
  return vehicles.value.map(vehicle => {
    const plate = (vehicle.plate || '').trim()
    const model = (vehicle.model || 'Xe cá nhân').trim()
    const label = `${plate}  ·  ${model}`
    return {
      value: plate,
      text: label.length > 55 ? label.slice(0, 52).trimEnd() + '...' : label
    }
  })
})

const dateDuration = computed(() => {
  if (!form.value.startDate || !form.value.endDate) return null
  const start = new Date(form.value.startDate)
  const end = new Date(form.value.endDate)
  const diffTime = end.getTime() - start.getTime()
  if (isNaN(diffTime) || diffTime <= 0) return null
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const monthsCount = computed(() => dateDuration.value ? Math.floor(dateDuration.value / 30) : 0)
const leftoverDays = computed(() => dateDuration.value ? dateDuration.value % 30 : 0)

const totalPrice = computed(() => capacityInfo.value?.monthlyPrice || 0)

const isFormValid = computed(() => {
  return form.value.lotId
    && form.value.startDate
    && form.value.endDate
    && form.value.plate
    && new Date(form.value.endDate) > new Date(form.value.startDate)
})

const fetchParkingLots = async () => {
  try {
    const response = await AdminService.getParkingLots()
    parkingLots.value = (response || []) as ParkingLot[]
  } catch (err) {
    console.error('Error fetching parking lots:', err)
  }
}

const fetchVehicles = async () => {
  try {
    vehicles.value = await CustomerService.getVehicles()
  } catch (err) {
    console.error('Error fetching vehicles:', err)
  }
}

const handleLotChange = () => {
  capacityInfo.value = null
  checkCapacity()
}

const handleDateChange = () => {
  capacityInfo.value = null
  checkCapacity()
}

const checkCapacity = async () => {
  if (!form.value.lotId || !form.value.startDate || !form.value.endDate) return
  try {
    loading.value = true
    error.value = null
    const res = await CustomerService.checkMonthlyCapacity(Number(form.value.lotId), form.value.startDate, form.value.endDate)
    capacityInfo.value = res as unknown as typeof capacityInfo.value
  } catch (err) {
    const errorObj = err as { response?: { data?: { message?: string } } }
    error.value = errorObj.response?.data?.message || 'Lỗi khi kiểm tra chỗ trống'
  } finally {
    loading.value = false
  }
}

const handlePurchase = async () => {
  if (!isFormValid.value || !capacityInfo.value?.canPurchase) return
  try {
    loading.value = true
    error.value = null

    const res = await CustomerService.purchaseMonthlyTicket({
      lotId: Number(form.value.lotId),
      plate: form.value.plate,
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      paymentGateway: 'PAYOS'
    })

    const result = res as unknown as {
      success?: boolean
      message?: string
      status?: string
      bookingId?: number
      ticketCode?: string
      amount?: number
    }

    if (!result.success) {
      error.value = result.message || 'Lỗi khi mua vé tháng'
      return
    }

    if (result.status && result.status.toUpperCase() === 'PAYING' && result.bookingId && result.ticketCode) {
      const paymentResponse = await CustomerService.createMonthlyTicketPayosPayment({
        amount: result.amount || capacityInfo.value?.monthlyPrice || 0,
        bookingId: result.bookingId,
        ticketCode: result.ticketCode,
        plate: form.value.plate,
        lotId: Number(form.value.lotId),
        lotName: selectedLot.value?.name || '',
        baseUrl: window.location.origin,
        returnUrl: window.location.origin + '/customer/monthly-tickets',
        cancelUrl: window.location.origin + '/customer/monthly-tickets?status=CANCELLED'
      })

      if (paymentResponse.paymentUrl && paymentResponse.orderId) {
        localStorage.setItem('pending_monthly_payment', JSON.stringify({
          orderId: paymentResponse.orderId,
          gateway: 'payos',
          bookingId: result.bookingId,
          ticketCode: result.ticketCode,
          lotId: Number(form.value.lotId),
          lotName: selectedLot.value?.name || '',
          plate: form.value.plate,
          amount: paymentResponse.amount || result.amount || capacityInfo.value?.monthlyPrice || 0
        }))
        window.location.href = paymentResponse.paymentUrl
        return
      }

      error.value = paymentResponse.message || 'Không tạo được liên kết thanh toán PayOS'
      return
    }

    // Nếu không cần thanh toán PayOS trực tiếp, xử lý hoàn tất ngay
    emit('success')
  } catch (err) {
    const errorObj = err as { response?: { data?: { message?: string } } }
    error.value = errorObj.response?.data?.message || 'Lỗi khi mua vé tháng'
  } finally {
    loading.value = false
  }
}

const formatCurrency = (amount: number | null | undefined) => {
  // Kiểm tra và xử lý các trường hợp null, undefined, NaN
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(500000) // Giá mặc định 500,000 VND
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

watch([() => form.value.lotId, () => form.value.startDate, () => form.value.endDate], () => checkCapacity())

// Watch startDate để tự động set endDate = startDate + 30 ngày
watch(() => form.value.startDate, (newStartDate) => {
  if (newStartDate) {
    const start = new Date(newStartDate)
    start.setDate(start.getDate() + 30)
    form.value.endDate = start.toISOString().split('T')[0]
  }
})

onMounted(() => {
  fetchParkingLots()
  fetchVehicles()
  form.value.startDate = minDate.value!
  const nextMonth = new Date()
  nextMonth.setDate(nextMonth.getDate() + 30)
  form.value.endDate = nextMonth.toISOString().split('T')[0]
})
</script>

<style scoped>
.mtp-wrapper {
  width: 100%;
  padding: 6px 4px 8px;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: #0f172a;
}

.mtp-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* === SECTION === */
.mtp-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mtp-label-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mtp-icon-pill {
  width: 40px; height: 40px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mtp-icon-pill svg { width: 18px; height: 18px; }
.mtp-icon-pill.blue {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #1d4ed8;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.12);
}
.mtp-icon-pill.cyan {
  background: linear-gradient(135deg, #ecfeff 0%, #cffafe 100%);
  color: #0e7490;
  box-shadow: 0 2px 6px rgba(6, 182, 212, 0.12);
}
.mtp-icon-pill.green {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  color: #15803d;
  box-shadow: 0 2px 6px rgba(34, 197, 94, 0.12);
}

.mtp-label-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.2;
}
.mtp-label {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: 0.05px;
}
.mtp-label .req { color: #ef4444; }
.mtp-label-hint {
  font-size: 11.5px;
  color: #64748b;
  font-weight: 500;
}

/* === LOT CARD === */
.mtp-lot-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
  border: 1.5px solid #bfdbfe;
  box-shadow: 0 3px 10px rgba(37, 99, 235, 0.08);
  margin-top: 2px;
}
.lot-card-left { display: flex; gap: 12px; align-items: center; min-width: 0; flex: 1; }
.lot-avatar {
  width: 44px; height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
}
.lot-meta { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
.lot-name {
  font-size: 14px; font-weight: 800; color: #0f172a;
  line-height: 1.3;
  word-break: break-word;
  line-break: anywhere;
}
.lot-addr {
  font-size: 11.5px; color: #64748b; font-weight: 500;
  line-height: 1.4;
  word-break: break-word;
  line-break: anywhere;
}
.lot-card-right {
  display: flex; flex-direction: column; align-items: flex-end; gap: 1px;
  flex-shrink: 0;
  padding-left: 10px; border-left: 1px dashed #bfdbfe;
}
.lot-price-label { font-size: 10.5px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; }
.lot-price { font-size: 16px; font-weight: 900; color: #059669; letter-spacing: -0.3px; }
.lot-price-period { font-size: 10.5px; color: #94a3b8; font-weight: 600; }

/* === DATE RANGE === */
.mtp-date-range {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  gap: 10px;
}

.date-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.date-field-label {
  font-size: 12px; font-weight: 700; color: #475569; letter-spacing: 0.1px;
}
.date-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.date-input-icon {
  position: absolute;
  left: 14px; top: 50%;
  transform: translateY(-50%);
  width: 16px; height: 16px;
  color: #2563eb;
  pointer-events: none;
}
.mtp-date-input {
  width: 100%;
  padding: 14px 14px 14px 40px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  background: #ffffff;
  font-family: inherit;
  transition: all 0.2s ease;
  outline: none;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  box-sizing: border-box;
  cursor: pointer;
}
.mtp-date-input:hover:not(:disabled) {
  border-color: #cbd5e1;
  background: #f8fafc;
}
.mtp-date-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
  background: #ffffff;
}
.mtp-date-input:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
  border-color: #e2e8f0;
}

.date-arrow {
  padding: 0 2px 15px;
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Duration pill */
.mtp-duration { display: flex; }
.duration-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%);
  border: 1px solid #99f6e4;
  border-radius: 999px;
  color: #0f766e;
  font-size: 13px;
  font-weight: 600;
}
.duration-pill svg { color: #0d9488; }
.duration-pill strong { font-size: 14px; font-weight: 900; color: #0f172a; }
.duration-pill span { font-weight: 600; }
.months-hint {
  color: #64748b;
  font-weight: 500;
  font-size: 12px;
  margin-left: 2px;
}

/* === CAPACITY CARD === */
.capacity-card {
  border-radius: 16px;
  padding: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%);
  border: 2px solid #86efac;
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.1);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.capacity-card.unavailable {
  background: linear-gradient(180deg, #ffffff 0%, #fef2f2 100%);
  border-color: #fca5a5;
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.1);
}

.cap-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgba(15, 23, 42, 0.08);
}
.cap-icon-pill {
  width: 38px; height: 38px;
  border-radius: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cap-header.ok .cap-icon-pill { background: #bbf7d0; color: #15803d; }
.cap-header.no .cap-icon-pill { background: #fecaca; color: #b91c1c; }
.cap-icon-pill svg { width: 18px; height: 18px; }
.cap-status {
  font-size: 14.5px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: 0.05px;
}
.cap-header.no .cap-status { color: #7f1d1d; }

.cap-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.cap-item {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  border: 1px solid rgba(0,0,0,0.04);
}
.cap-item.highlight {
  background: linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%);
  border-color: #bbf7d0;
}
.cap-k {
  font-size: 10.5px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.cap-v {
  font-size: 17px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.3px;
}
.cap-v.used { color: #b91c1c; }
.cap-v.free { color: #15803d; font-size: 19px; }

.cap-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 12px;
  color: white;
}
.cap-footer-label {
  font-size: 12px;
  font-weight: 700;
  color: #cbd5e1;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.cap-total-price {
  font-size: 18px;
  font-weight: 900;
  color: #34d399;
  letter-spacing: -0.2px;
}

.cap-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
}

/* === ERROR === */
.mtp-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #fef2f2;
  border: 1.5px solid #fecaca;
  color: #991b1b;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

/* === ACTIONS === */
.mtp-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 6px;
  border-top: 1px solid #f1f5f9;
  margin-top: 2px;
  padding-top: 18px;
}
.mtp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 20px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
  border: none;
  transition: all 0.18s ease;
}
.mtp-btn.primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.28);
  min-width: 220px;
}
.mtp-btn.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.38);
}
.mtp-btn.primary:disabled {
  background: #d1d5db;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}
.price-inline {
  background: rgba(255,255,255,0.18);
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #dbeafe;
  margin-left: 4px;
}

.mtp-btn.ghost {
  background: #f8fafc;
  color: #334155;
  border: 1.5px solid #e2e8f0;
}
.mtp-btn.ghost:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
}
.mtp-btn.ghost:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* === TRANSITIONS === */
.pop-enter-active, .pop-leave-active {
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.pop-enter-from {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
.pop-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.98);
}

/* === RESPONSIVE === */
@media (max-width: 540px) {
  .mtp-wrapper { padding: 2px 0px 4px; }
  .mtp-form { gap: 20px; }
  .mtp-date-range { grid-template-columns: 1fr; gap: 14px; }
  .date-arrow { display: none; }
  .cap-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .cap-item { padding: 9px 10px; }
  .cap-v { font-size: 15px; }
  .cap-v.free { font-size: 16px; }
  .mtp-actions { flex-direction: column-reverse; padding-top: 16px; }
  .mtp-btn { width: 100%; min-width: 0 !important; padding: 14px 18px; }
  .mtp-lot-card { flex-direction: column; align-items: stretch; gap: 12px; }
  .lot-card-right { align-items: flex-start; border-left: none; padding-left: 0; border-top: 1px dashed #bfdbfe; padding-top: 10px; }
}

/* Đặc biệt: loại bỏ style xấu mặc định của input[type=date] trên Chrome/Safari */
.mtp-date-input::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 0; top: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>
