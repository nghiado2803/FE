<template>
  <div class="admin-page-container animated fade-in">
    <div class="page-header-wrapper">
      <div class="header-title-area">
        <h2>
          {{ currentScanMode === null ? '🔄 Trạm Kiểm Soát Ra Vào Tự Động' : (currentScanMode === 'IN' ? '📥 Xử lý Check-in (Xe vào)' : '📤 Xử lý Check-out (Xe ra)') }}
        </h2>
        <p class="subtitle">Nhận diện thông minh: Tự động phân luồng Vào/Ra dựa trên lịch sử vé</p>
      </div>
    </div>

    <div class="dual-camera-layout margin-bottom-24">
      <div class="scan-control-card">
        <div class="card-header flex-between bg-slate-50">
          <h3 class="card-title text-blue-dark">📷 Camera 1: Quét QR (Webcam)</h3>
          <span class="status-dot pulsing bg-emerald-500"></span>
        </div>

        <div class="camera-body">
          <div class="camera-placeholder-box">
            <div id="camera-container" class="camera-video-stream"></div>
            <div class="camera-overlay" v-if="!cameraErrorMessage && isScannerInitialized && !qrData">
              <div class="scan-region-box"></div>
              <div class="scanner-laser-line"></div>
            </div>
            <div v-if="cameraErrorMessage" class="camera-error-message">⚠️ {{ cameraErrorMessage }}</div>
            <div v-else-if="!isScannerInitialized && !qrData" class="camera-loading-state">
              <span class="text-2xl opacity-50">📷</span><p>Đang chờ Webcam...</p>
            </div>
          </div>

          <div class="ticket-data-box margin-top-16" v-if="qrData">
            <div class="text-xs text-muted font-bold uppercase margin-bottom-8">Dữ liệu thẻ vừa quét:</div>
            <div class="flex-between">
              <span class="ticket-code">{{ qrData.code }}</span>
              <span class="ticket-type" :class="qrData.type === 'WEB' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'">
                {{ qrData.type === 'WEB' ? 'Khách đặt Web (Có cọc)' : 'Khách vãng lai' }}
              </span>
            </div>
            <p v-if="qrData.type === 'WEB' && currentScanMode === 'IN'" class="text-sm margin-top-8">
              Biển số đăng ký: <b class="text-slate-800">{{ qrData.expectedPlate }}</b>
            </p>
          </div>
          <div class="empty-data-box margin-top-16" v-else>
            Đưa thẻ vé hoặc điện thoại khách vào khu vực quét
          </div>
        </div>
      </div>

      <div class="scan-control-card">
        <div class="card-header flex-between bg-slate-50">
          <h3 class="card-title text-slate-800">📱 Camera 2: AI OCR (iPhone Live)</h3>
          <span :class="['status-dot pulsing', isProcessingAI ? 'bg-amber-500' : (isCameraConnected ? 'bg-emerald-500' : 'bg-rose-500')]"></span>
        </div>

        <div class="camera-body">
          <div class="rtsp-simulation-box live-stream-active">
            <video ref="aiVideoRef" class="actual-ai-stream-video" autoplay playsinline muted v-show="isCameraConnected"></video>

            <div v-if="!isCameraConnected && !cameraStore.isReconnecting" class="webrtc-connect-overlay">
              <span class="text-3xl mb-2">📡</span>
              <p class="text-sm text-slate-300 font-bold mb-4 text-center">Chưa kết nối AI Stream</p>
              <input v-model="cameraStore.iphonePeerId" type="text" placeholder="Dán ID iPhone vào đây..." class="peer-input mb-3" />
              <button class="btn-primary" @click="connectToiPhone" :disabled="isConnecting">
                {{ isConnecting ? 'Đang kết nối...' : 'Kết nối luồng Video' }}
              </button>
            </div>

            <div class="ai-live-scanning-overlay" v-if="isProcessingAI">
              <div class="ai-tracking-box"><span class="ai-tag">YOLOv8: Analyzing...</span></div>
            </div>
            <div class="ai-live-scanning-overlay" v-else-if="aiResult">
              <div class="ai-locked-box" :class="!isMatchSuccess ? 'border-error' : ''">
                <span class="ai-tag success" :class="!isMatchSuccess ? 'bg-rose-600' : ''">
                  {{ isMatchSuccess ? 'MATCHED: ' + aiResult.confidence : 'MISMATCH WARNING' }}
                </span>
              </div>
            </div>
          </div>

          <div class="ticket-data-box margin-top-16 bg-slate-900" v-if="aiResult || manualPlate">
            <div class="text-xs text-slate-400 font-bold uppercase margin-bottom-8">
              {{ manualPlate ? 'Biển số nhập tay:' : 'AI nhận diện thực tế:' }}
            </div>
            <div class="plate-display-large" :class="isMatchSuccess ? 'text-emerald-400' : 'text-rose-400'">
              {{ manualPlate || (aiResult?.plate?.startsWith('OCR:') || aiResult?.plate?.startsWith('LỖI') ? '— Không đọc được —' : aiResult?.plate) }}
            </div>
            <div class="manual-entry-row mt-3" v-if="needsManualConfirm">
              <input
                v-model="manualPlate"
                type="text"
                placeholder="Sửa biển số nếu sai..."
                class="manual-plate-input"
                @keyup.enter="handleManualConfirm"
              />
              <button class="btn-manual-confirm" @click="handleManualConfirm">Xác nhận</button>
            </div>
          </div>
          <div class="empty-data-box margin-top-16" v-else>
            Dữ liệu biển số AI sẽ hiển thị tại đây
          </div>
        </div>
      </div>
    </div>

    <!-- Thông báo trạng thái dưới camera -->
    <Teleport to="body">
      <Transition name="status-fade">
        <div v-if="statusMessage" class="status-overlay-global">
          <div :class="['status-card-modern', statusMessage.type]">
            <div class="status-icon-box">
              <span v-if="statusMessage.type === 'success'">✅</span>
              <span v-else-if="statusMessage.type === 'warning'">⏳</span>
              <span v-else>⚠️</span>
            </div>
            <div class="status-content">
              <p class="status-text-main">{{ statusMessage.text }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <div class="verification-card animated slide-up" v-if="qrData && aiResult">
      <div class="verify-header" :class="isMatchSuccess ? 'bg-emerald-50' : 'bg-rose-50'">
        <div class="verify-status">
          <span class="icon-large">{{ isMatchSuccess ? '✅' : '❌' }}</span>
          <div>
            <h3 :class="isMatchSuccess ? 'text-emerald-700' : 'text-rose-700'">
              {{ !isMatchSuccess ? 'CẢNH BÁO: BIỂN SỐ KHÔNG KHỚP' : (currentScanMode === 'IN' ? 'HỢP LỆ - ĐANG MỞ CỔNG TỰ ĐỘNG...' : 'HỢP LỆ - YÊU CẦU THANH TOÁN') }}
            </h3>
          </div>
        </div>
      </div>

      <div class="verify-body" v-if="isMatchSuccess">
        <div class="grid-3-cols" v-if="currentScanMode === 'IN'">
          <div class="info-block"><label>Loại khách</label><p class="font-bold text-slate-800">{{ qrData.type === 'WEB' ? 'Khách đặt Web' : 'Khách vãng lai' }}</p></div>
          <div class="info-block"><label>Tiền cọc ghi nhận</label><p class="font-bold text-amber-600">{{ qrData.deposit.toLocaleString() }} VNĐ</p></div>
          <div class="info-block"><label>Vị trí ô đỗ cấp</label><p class="font-bold text-blue-700">Hệ thống tự phân bổ</p></div>
        </div>

        <div v-if="currentScanMode === 'OUT'">
          <!-- Đang tính phí từ server -->
          <div v-if="!qrData?.checkoutInfo" class="empty-data-box margin-top-8">
            🔄 Đang tính phí từ máy chủ...
          </div>

          <!-- Đã có dữ liệu phí -->
          <div v-else>
            <div class="grid-3-cols">
              <div class="info-block"><label>Thời gian gửi</label><p class="font-bold text-slate-800">{{ qrData.checkoutInfo.durationStr }}</p></div>
              <div class="info-block"><label>Tổng chi phí</label><p class="font-bold text-rose-600">{{ qrData.checkoutInfo.totalFee.toLocaleString() }} VNĐ</p></div>
              <div class="info-block"><label>Đã cọc trước</label><p class="font-bold text-emerald-600">- {{ qrData.checkoutInfo.depositPaid.toLocaleString() }} VNĐ</p></div>
            </div>

            <div class="checkout-summary margin-top-16">
              <div class="final-price-box">
                <span>Cần thu thêm:</span>
                <strong class="text-rose-600">{{ qrData.checkoutInfo.extraFee.toLocaleString() }} VNĐ</strong>
              </div>
              <p class="text-xs text-muted text-center italic mt-2" v-if="qrData.type === 'WALK_IN'">Nhân viên vui lòng thu lại Thẻ cứng trước khi xác nhận.</p>
            </div>

            <div class="action-buttons-wrapper margin-top-24 border-top padding-top-24">
              <button class="btn-secondary w-full" @click="resetFlow" :disabled="isSubmitting">Hủy (Quét nhầm)</button>
              <button class="btn-primary success-confirm-btn w-full" @click="confirmCheckOut" :disabled="isSubmitting">
                {{ isSubmitting ? '🔄 Đang gửi lệnh mở cổng...' : 'XÁC NHẬN ĐÃ THU TIỀN & MỞ CỔNG' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// oxlint-disable-file no-unsafe-finally
import { ref, computed, watch, onMounted, onActivated, onDeactivated, onUnmounted } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { useCameraStore } from '@/stores/cameraStore'
import { useAuthStore } from '@/stores/authStore'
import { StaffService, type CheckoutResult } from '@/services/staff.service'
import apiClient from '@/services/api'

defineOptions({ name: 'ScannerCheckIn' })

type Mode = 'IN' | 'OUT'
type TicketType = 'WEB' | 'WALK_IN'
type QRData = {
  code: string
  type: TicketType
  expectedPlate?: string
  deposit: number
  bookingId?: string | number
  checkoutInfo?: CheckoutResult
}
type AIScanResponse = {
  plate?: string
  confidence?: number
  raw_texts?: string[]
  message?: string
}
type AIResult = { plate: string; confidence: number }

const currentScanMode = ref<Mode | null>(null)
const isSubmitting = ref(false)
const aiCancel = { flag: false }
let autoResetTimer: ReturnType<typeof setTimeout> | null = null

const clearAutoReset = () => {
  if (autoResetTimer !== null) {
    clearTimeout(autoResetTimer)
    autoResetTimer = null
  }
}

// ── CAMERA IPHONE ──────────────────────────────────────────
const cameraStore = useCameraStore()
const authStore = useAuthStore()
const isCameraConnected = computed(() => cameraStore.isCameraConnected)
const isConnecting = computed(() => cameraStore.isConnecting)
const aiVideoRef = ref<HTMLVideoElement | null>(null)

const connectToiPhone = () => cameraStore.connect(cameraStore.iphonePeerId)

const setVideoStream = (stream: MediaStream) => {
  const video = aiVideoRef.value
  if (!video) return
  video.srcObject = stream
  video.play().catch(() => {})
}

const attachStream = () => {
  if (cameraStore.remoteStream) setVideoStream(cameraStore.remoteStream)
}

watch(() => cameraStore.remoteStream, (stream) => {
  if (stream) setVideoStream(stream)
})

// Gắn lại stream khi video element được mount lại (sau keep-alive)
watch(aiVideoRef, (video) => {
  if (video && cameraStore.remoteStream) setVideoStream(cameraStore.remoteStream)
})

const playBeep = (type: 'success' | 'error' | 'warning') => {
  const AudioCtx = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return
  const ctx = new AudioCtx()
  const osc = ctx.createOscillator(); const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.frequency.value = type === 'success' ? 800 : type === 'warning' ? 500 : 250
  osc.type = type === 'success' ? 'sine' : 'sawtooth'
  gain.gain.setValueAtTime(type === 'success' ? 0.1 : 0.3, ctx.currentTime)
  osc.start(); osc.stop(ctx.currentTime + (type === 'success' ? 0.15 : 0.5))
}

// ── TRẠNG THÁI HỆ THỐNG ───────────────────────────────────
let html5QrCode: Html5Qrcode | null = null
const isScannerInitialized = ref(false)
const cameraErrorMessage = ref('')
const statusMessage = ref<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null)
const qrData = ref<QRData | null>(null)
const aiResult = ref<AIResult | null>(null)
const manualPlate = ref('')
const isProcessingAI = ref(false)
const needsManualConfirm = ref(false) // true khi AI không khớp, chờ nhân viên nhập tay
let isProcessingScan = false

const isMatchSuccess = computed(() => {
  if (!qrData.value) return false

  const currentPlateRaw = manualPlate.value || aiResult.value?.plate
  if (!currentPlateRaw) return false

  const normalize = (p: string) => p.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  const currentPlate = normalize(currentPlateRaw)
  const expectedPlate = normalize(qrData.value.expectedPlate || '')

  // Nếu có BSX đăng ký/check-in → bắt buộc phải khớp (cả WEB lẫn WALK_IN)
  if (expectedPlate) {
    return currentPlate === expectedPlate
  }

  // Không có BSX để so sánh (WALK_IN check-in lần đầu) → chỉ cần BSX hợp lệ
  return currentPlate.length >= 7
})

const handleManualConfirm = () => {
  // Hủy bất kỳ timer reset tự động nào đang chạy
  clearAutoReset()
  // Ẩn form nhập tay ngay khi bấm Xác nhận
  needsManualConfirm.value = false

  // Xóa banner cũ ngay khi nhân viên bấm Xác nhận
  statusMessage.value = null

  // Nếu nhân viên bấm xác nhận mà chưa gõ gì, lấy BSX từ AI đưa vào manualPlate
  if (!manualPlate.value && aiResult.value) {
    manualPlate.value = aiResult.value.plate
  }

  if (manualPlate.value) {
    // Ép kiểu viết hoa cho BSX nhập tay
    manualPlate.value = manualPlate.value.toUpperCase().replace(/\s/g, '')
    // Nếu AI chưa có kết quả, tạo aiResult từ BSX nhập tay để card verification hiện ra
    if (!aiResult.value) {
      aiResult.value = { plate: manualPlate.value, confidence: 0 }
    }
    processFinalVerification()
  }
}

const processFinalVerification = async () => {
  if (!qrData.value) return

  const currentPlate = manualPlate.value || aiResult.value?.plate
  if (!currentPlate) return

  // Xóa banner cũ trước khi xử lý
  statusMessage.value = null

  // Log để debug (sẽ xóa sau)
  console.log('Verifying Plate:', currentPlate, 'Expected:', qrData.value.expectedPlate, 'IsMatch:', isMatchSuccess.value)

  if (isMatchSuccess.value) {
    playBeep('success')
    statusMessage.value = { text: '⏳ Đang xử lý ghi nhận vào hệ thống...', type: 'warning' }

    if (currentScanMode.value === 'IN') {
      try {
        const bId = qrData.value.bookingId
        if (!bId) {
          statusMessage.value = { text: '⚠️ Không tìm thấy mã booking. Vui lòng quét lại.', type: 'error' }
          autoResetTimer = setTimeout(() => { resetFlow() }, 3000)
          return
        }

        // Gọi confirm-checkin để đổi trạng thái sang PARKED
        const confirmRes = await apiClient.post(`/staff/confirm-checkin/${bId}`, {
          plate: currentPlate  // Truyền BSX để backend lưu (quan trọng với WALK_IN)
        }) as { status?: string }
        console.log('confirm-checkin result:', confirmRes)

        statusMessage.value = { text: '✅ ĐÃ CHO XE VÀO BÃI! Cổng đang mở...', type: 'success' }
        autoResetTimer = setTimeout(() => { resetFlow() }, 3000)
      } catch (error: unknown) {
        console.error('Lỗi confirm-checkin:', error)
        const status = (error as { response?: { status?: number } }).response?.status
        if (status === 502 || status === 503 || !status) {
          statusMessage.value = { text: '❌ Lỗi kết nối Server (502/Network). Vui lòng báo kỹ thuật!', type: 'error' }
        } else {
          statusMessage.value = { text: '❌ Lỗi hệ thống: Không thể ghi nhận xe vào.', type: 'error' }
        }
        autoResetTimer = setTimeout(() => { resetFlow() }, 5000)
      }
    } else if (currentScanMode.value === 'OUT') {
      // Nếu đã có checkoutInfo rồi thì không gọi lại /check-out nữa
      if (qrData.value.checkoutInfo) {
        statusMessage.value = null
        return
      }

      let checkoutData: (CheckoutResult & { status?: string; message?: string }) | null = null
      let checkoutError = false
      try {
        checkoutData = await apiClient.post('/staff/check-out', {
          qrCode: qrData.value.code
        }) as CheckoutResult & { status?: string; message?: string }
      } catch {
        checkoutError = true
      }

      if (checkoutError || !checkoutData) {
        statusMessage.value = { text: '❌ Lỗi kết nối khi tính phí checkout. Thử lại?', type: 'error' }
        needsManualConfirm.value = true
      } else if (checkoutData.status === 'INVALID') {
        statusMessage.value = { text: checkoutData.message || '❌ Vé không hợp lệ để checkout', type: 'error' }
        autoResetTimer = setTimeout(() => { resetFlow() }, 3000)
      } else if (qrData.value) {
        statusMessage.value = null
        qrData.value = {
          ...qrData.value,
          checkoutInfo: {
            bookingId: checkoutData.bookingId,
            plate: checkoutData.plate,
            timeIn: checkoutData.timeIn,
            timeOut: checkoutData.timeOut,
            durationStr: checkoutData.durationStr,
            totalFee: checkoutData.totalFee,
            depositPaid: checkoutData.depositPaid,
            extraFee: checkoutData.extraFee
          }
        }
      }
    }
  } else {
    // Nhân viên nhập tay nhưng vẫn không khớp → cho nhập lại
    needsManualConfirm.value = true
    playBeep('error')
    statusMessage.value = {
      text: `⚠️ Biển số không khớp! Đăng ký: ${qrData.value.expectedPlate || '?'} — Hiện tại: ${currentPlate}`,
      type: 'error'
    }
    // Tắt banner sau 5s, KHÔNG reset
    autoResetTimer = setTimeout(() => {
      statusMessage.value = null
      autoResetTimer = null
    }, 5000)
  }
}

// ── SCANNER ────────────────────────────────────────────────
let isInitializing = false

const initializeScanner = async () => {
  if (isScannerInitialized.value || isInitializing) return
  isInitializing = true
  const container = document.getElementById('camera-container')
  if (!container) {
    isInitializing = false
    return
  }
  try {
    html5QrCode = new Html5Qrcode('camera-container')
    const cameras = await Html5Qrcode.getCameras()
    const camId = (cameras.find(c => /back|rear/i.test(c.label)) ?? cameras[0])?.id
    if (!camId) throw new Error('Không tìm thấy camera')
    await html5QrCode.start(camId, { fps: 10, qrbox: 250 }, (text) => handleQRScanned(text), () => {})
    isScannerInitialized.value = true
    cameraErrorMessage.value = ''
    isInitializing = false
  } catch {
    cameraErrorMessage.value = 'Không tìm thấy Webcam'
    html5QrCode = null
    isInitializing = false
  }
}

const stopScanner = async () => {
  try {
    const state = html5QrCode?.getState()
    // State 2 = SCANNING, State 3 = PAUSED
    if (html5QrCode && (state === 2 || state === 3)) {
      await html5QrCode.stop()
    }
  } catch { /* bỏ qua */ }
  html5QrCode = null
  isScannerInitialized.value = false
}

const resumeScanner = () => {
  initializeScanner()
}

// ── BƯỚC 1: QUÉT QR ───────────────────────────────────────
const handleQRScanned = async (text: string) => {
  if (isProcessingScan) return
  isProcessingScan = true
  playBeep('success')

  // Stop scanner ngay — không đọc thêm frame nào
  await stopScanner()

  if (!text.startsWith('SP') && !text.startsWith('VE')) {
    statusMessage.value = { text: '❌ Mã QR không thuộc hệ thống SmartPark!', type: 'error' }
    setTimeout(() => { statusMessage.value = null; isProcessingScan = false; resumeScanner() }, 3000)
    return
  }

  try {
    const lotId = authStore.user?.parkingLotId || 1
    const result = await apiClient.post('/staff/verify-qr', { qrCode: text, lotId: String(lotId) }) as {
      status: string; mode?: string; bookingId?: string | number
      plate?: string; depositPaid?: number
      totalFee?: number; durationStr?: string; extraFee?: number; message?: string
    }

    if (result.status === 'INVALID' || result.status === 'EXPIRED' || result.status === 'NOT_PAID' || result.status === 'WRONG_LOT') {
      statusMessage.value = { text: result.message || 'Mã vé không hợp lệ hoặc chưa thanh toán cọc!', type: 'error' }
      setTimeout(() => { statusMessage.value = null; isProcessingScan = false; resumeScanner() }, 4000)
      return
    }

    if (result.mode === 'IN') {
      currentScanMode.value = 'IN'
      qrData.value = {
        code: text,
        type: text.startsWith('SP') ? 'WEB' : 'WALK_IN',
        deposit: result.depositPaid ?? 0,
        expectedPlate: result.plate || '',
        bookingId: result.bookingId
      }
      await triggerBackendAICamera()
    } else if (result.mode === 'OUT') {
      currentScanMode.value = 'OUT'
      qrData.value = {
        code: text,
        type: text.startsWith('SP') ? 'WEB' : 'WALK_IN',
        deposit: result.depositPaid || 0,
        expectedPlate: result.plate || '',
        bookingId: result.bookingId
        // checkoutInfo sẽ được điền sau khi AI xác nhận biển số
      }
      await triggerBackendAICamera()
    }
  } catch (error) {
    console.error('Lỗi xử lý quét QR:', error)
    statusMessage.value = { text: '❌ Lỗi kết nối máy chủ', type: 'error' }
    setTimeout(() => { statusMessage.value = null; isProcessingScan = false; resumeScanner() }, 3000)
  }
}

// ── BƯỚC 2: AI CAMERA ─────────────────────────────────────
const triggerBackendAICamera = async () => {
  aiCancel.flag = false
  isProcessingAI.value = true

  let success = false
  const video = aiVideoRef.value

  // Không có camera iPhone → bypass AI, dùng biển số từ DB
  if (!video || !isCameraConnected.value) {
    aiResult.value = { plate: qrData.value?.expectedPlate || '', confidence: 100 }
    success = true
  } else {
    if (video.videoWidth === 0) {
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(resolve, 3000)
        video.addEventListener('loadeddata', () => { clearTimeout(timeout); resolve() }, { once: true })
      })
    }

    if (!aiCancel.flag) {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
      const base64Image = canvas.toDataURL('image/jpeg', 0.9)

      let data: AIScanResponse | null = null
      try {
        data = await apiClient.post('/parking/process-scan', {
          qrCode: qrData.value?.code,
          imageBase64: base64Image
        }) as AIScanResponse
      } catch (err: unknown) {
        console.error('❌ Lỗi quét AI:', err)
      }

      if (data === null) {
        aiResult.value = { plate: 'LỖI KẾT NỐI', confidence: 0 }
      } else if (data.plate) {
        aiResult.value = { plate: data.plate, confidence: data.confidence || 0 }
      } else {
        const rawInfo = data.raw_texts ? data.raw_texts.join(' | ') : data.message || 'Không rõ'
        aiResult.value = { plate: `OCR: ${rawInfo}`, confidence: 0 }
      }
      // success = true chỉ khi AI đọc được BSX thực sự (không phải lỗi)
      success = !!(data?.plate) && aiResult.value.plate !== 'LỖI KẾT NỐI'
    }
  }

  isProcessingAI.value = false

  // Bước xử lý kết quả
  if (!aiCancel.flag) {
    // Nếu AI không đọc được gì (Lỗi kết nối hoặc không nhận diện được)
    if (!success) {
      if (!cameraStore.isCameraConnected) {
        playBeep('error')
        statusMessage.value = { text: '❌ Lỗi: Camera AI chưa kết nối! Không thể check-in.', type: 'error' }
        resetFlow()
        return
      }
      playBeep('error')
      statusMessage.value = { text: '⚠️ Không nhận diện được biển số! Vui lòng thử lại hoặc nhập tay.', type: 'error' }
      needsManualConfirm.value = true
      // Không resetFlow để nhân viên có thể gõ tay
      return
    }

    // AI đã đọc được biển số -> Thực hiện đối soát ngay lập tức
    const normalize = (p: string) => (p || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    const currentPlate = normalize(aiResult.value?.plate || '')
    const expectedPlate = normalize(qrData.value?.expectedPlate || '')

    const isWalkIn = qrData.value?.type === 'WALK_IN'
    const isWeb = qrData.value?.type === 'WEB'
    const isOut = currentScanMode.value === 'OUT'

    if (isOut) {
      // CHECKOUT (WEB + WALK_IN): AI khớp → thanh toán luôn, không khớp → nhập tay
      const normalize2 = (p: string) => (p || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
      const aiPlate = normalize2(aiResult.value?.plate || '')
      const registeredPlate = normalize2(qrData.value?.expectedPlate || '')
      const outMatched = aiPlate.length >= 7 && (
        qrData.value?.type === 'WALK_IN'
          ? (registeredPlate ? aiPlate === registeredPlate : true)  // WALK_IN: khớp với BSX check-in nếu có
          : aiPlate === registeredPlate                              // WEB: khớp với BSX đăng ký
      )
      if (outMatched) {
        needsManualConfirm.value = false
        processFinalVerification()
      } else {
        needsManualConfirm.value = true
        statusMessage.value = null
        playBeep('warning')
        statusMessage.value = { text: '⚠️ Biển số không khớp khi ra! Vui lòng kiểm tra hoặc nhập tay.', type: 'warning' }
        setTimeout(() => { if (statusMessage.value?.type === 'warning') statusMessage.value = null }, 5000)
      }
    } else if (isWeb) {
      // CHECK-IN KHÁCH WEB
      if (currentPlate === expectedPlate) {
        // Khớp → tự động
        needsManualConfirm.value = false
        processFinalVerification()
      } else {
        // Không khớp → chờ nhân viên nhập tay
        needsManualConfirm.value = true
        statusMessage.value = null
        playBeep('warning')
        statusMessage.value = { text: '⚠️ Biển số không khớp! Vui lòng kiểm tra hoặc nhập tay.', type: 'warning' }
        setTimeout(() => { if (statusMessage.value?.type === 'warning') statusMessage.value = null }, 5000)
      }
    } else if (isWalkIn) {
      // CHECK-IN KHÁCH VÃNG LAI → AI đọc BSX xong, chờ nhân viên xác nhận
      needsManualConfirm.value = true
      statusMessage.value = null
      playBeep('warning')
      statusMessage.value = { text: '🔔 Khách vãng lai: Vui lòng kiểm tra BSX và bấm Xác nhận', type: 'warning' }
    }
  }
}

// ── BƯỚC 3: CHECKOUT ──────────────────────────────────────
const confirmCheckOut = async () => {
  if (!qrData.value?.bookingId) return
  isSubmitting.value = true
  let result: Record<string, unknown> | null = null
  try {
    result = await StaffService.confirmPaymentAndOpenGate(qrData.value.bookingId.toString())
  } catch (error) {
    console.error('Lỗi xác nhận checkout:', error)
    window.toast?.('Lỗi kết nối hệ thống', 'error')
    isSubmitting.value = false
    return
  }
  isSubmitting.value = false
  if (result?.status === 'SUCCESS') {
    window.toast?.('Thanh toán thành công, cổng đã mở!', 'success')
    resetFlow()
  } else {
    window.toast?.('Lỗi: ' + (result?.message || 'Không thể xác nhận thanh toán'), 'error')
  }
}

// ── RESET ──────────────────────────────────────────────────
const resetFlow = () => {
  aiCancel.flag = true
  clearAutoReset()
  needsManualConfirm.value = false
  qrData.value = null
  aiResult.value = null
  manualPlate.value = ''
  currentScanMode.value = null
  isProcessingAI.value = false
  isSubmitting.value = false
  isProcessingScan = true
  statusMessage.value = null  // Xóa banner ngay lập tức

  // Stop scanner, sau 0.5s start lại việc lắng nghe scan tiếp theo
  stopScanner().then(() => {
    setTimeout(() => {
      isProcessingScan = false
      if (document.getElementById('camera-container')) {
        resumeScanner()
      }
    }, 500)
  })
}

// ── LIFECYCLE ──────────────────────────────────────────────
onMounted(() => {
  initializeScanner()
  cameraStore.autoReconnect()
  attachStream()
})

onActivated(() => {
  // Đảm bảo video stream của iPhone được gắn lại và play
  attachStream()

  // Khởi tạo lại QR Scanner nếu cần hoặc resume
  if (!html5QrCode || !isScannerInitialized.value) {
    initializeScanner()
  } else {
    // Nếu đã có instance, thử resume hoặc restart để tránh "đứng hình"
    const state = html5QrCode.getState()
    if (state === 3) { // 3 = PAUSED
      html5QrCode.resume()
    } else if (state === 1) { // 1 = UNKNOWN / NOT_STARTED
      initializeScanner()
    }
  }
})

// Khi ẩn đi (chuyển sidebar), tạm dừng để tránh tốn CPU nhưng không hủy instance
onDeactivated(() => {
  try {
    if (html5QrCode && html5QrCode.getState() === 2) { // 2 = SCANNING
      html5QrCode.pause()
    }
  } catch (e) {
    console.warn('Không thể tạm dừng camera:', e)
  }
})

onUnmounted(() => {
  stopScanner()
})
</script>

<style scoped>
/* Status Message Modern Global Style */
.status-overlay-global {
  position: fixed; top: 32px; left: 50%; transform: translateX(-50%);
  z-index: 9999; width: 90%; max-width: 450px;
}
.status-card-modern {
  background: white; border-radius: 16px; padding: 16px 20px;
  display: flex; align-items: center; gap: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.12);
  border: 1.5px solid #e2e8f0;
}
.status-card-modern.success { border-color: #10b981; background: #f0fdf4; }
.status-card-modern.error { border-color: #ef4444; background: #fef2f2; }
.status-card-modern.warning { border-color: #f59e0b; background: #fff7ed; }

.status-icon-box { font-size: 24px; }
.status-content { flex: 1; }
.status-text-main { margin: 0; font-size: 15px; font-weight: 800; color: #0f172a; line-height: 1.4; }

.status-fade-enter-active, .status-fade-leave-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.status-fade-enter-from { opacity: 0; transform: translate(-50%, -40px); }
.status-fade-leave-to { opacity: 0; transform: translate(-50%, -20px); }

.checkout-summary { background: #fff1f2; border: 1px dashed #f43f5e; padding: 16px; border-radius: 8px; }
.final-price-box { display: flex; justify-content: space-between; align-items: center; font-size: 18px; }
.final-price-box strong { font-size: 24px; }
.actual-ai-stream-video { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; position: absolute; inset: 0; z-index: 1; }
.webrtc-connect-overlay { display: flex; flex-direction: column; align-items: center; justify-content: center; position: absolute; inset: 0; background: rgba(15, 23, 42, 0.9); padding: 20px; z-index: 10; border-radius: 12px; }
.peer-input { width: 80%; padding: 12px; border-radius: 6px; border: 1px solid #475569; background: #1e293b; color: white; text-align: center; margin-bottom: 12px; }
.btn-primary { background: #2563eb; color: white; padding: 10px 16px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer; width: 80%; }
.ai-live-scanning-overlay { position: absolute; inset: 0; z-index: 5; display: flex; align-items: center; justify-content: center; pointer-events: none; }
.ai-tracking-box { width: 90%; height: 70%; border: 3px dashed #f59e0b; background: rgba(245, 158, 11, 0.15); position: relative; border-radius: 8px; animation: pulseBox 1s infinite alternate; }
.ai-locked-box { width: 90%; height: 70%; border: 3px solid #10b981; position: relative; border-radius: 8px; }
.border-error { border-color: #e11d48 !important; }
.ai-tag { position: absolute; top: -24px; left: -3px; background: #f59e0b; color: white; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
.ai-tag.success { background: #10b981; }
@keyframes pulseBox { from { opacity: 0.4; transform: scale(0.96); } to { opacity: 1; transform: scale(1.02); } }
.admin-page-container { padding: 32px; max-width: 1200px; margin: 0 auto; font-family: 'Inter', system-ui, sans-serif; color: #1e293b; background-color: #f8fafc; min-height: 100vh; }
.page-header-wrapper { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; }
.header-title-area h2 { font-size: 26px; font-weight: 800; margin: 0 0 8px 0; }
.subtitle { color: #64748b; font-size: 14px; margin: 0; }
.dual-camera-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.scan-control-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.03); display: flex; flex-direction: column; }
.card-header { padding: 16px 20px; border-bottom: 1px solid #e2e8f0; }
.card-title { font-size: 15px; font-weight: 700; margin: 0; }
.flex-between { display: flex; justify-content: space-between; align-items: center; }
.status-dot { width: 10px; height: 10px; border-radius: 50%; }
.pulsing { animation: pulseDot 1.5s infinite; }
.bg-emerald-500 { background-color: #10b981; box-shadow: 0 0 0 0 rgba(16,185,129,0.7); }
.bg-amber-500 { background-color: #f59e0b; }
.bg-rose-500 { background-color: #f43f5e; }
.bg-rose-600 { background-color: #e11d48; }
.camera-body { padding: 20px; flex-grow: 1; display: flex; flex-direction: column; }
.camera-placeholder-box, .rtsp-simulation-box { width: 100%; height: 280px; background: #0f172a; border-radius: 12px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
#camera-container { width: 100%; height: 100%; position: relative; }
:deep(#camera-container video) { width: 100% !important; height: 100% !important; object-fit: cover !important; position: absolute !important; inset: 0 !important; }
.camera-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 10; }
.scan-region-box { width: 240px; height: 240px; border: 2px solid rgba(255,255,255,0.5); border-radius: 12px; box-shadow: 0 0 0 4000px rgba(15, 23, 42, 0.6); }
.scanner-laser-line { position: absolute; top: 15%; width: 70%; height: 2px; background: #10b981; animation: laserMove 2s ease-in-out infinite alternate; }
@keyframes laserMove { from { top: 15%; } to { top: 85%; } }
.ticket-data-box { padding: 14px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
.empty-data-box { padding: 14px 16px; border: 1px dashed #cbd5e1; border-radius: 8px; color: #94a3b8; font-size: 13px; text-align: center; }
.ticket-code { font-weight: 800; font-size: 16px; }
.ticket-type { font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 4px; }
.plate-display-large { font-family: monospace; font-weight: 800; font-size: 26px; text-align: center; letter-spacing: 2px; }

/* Manual Entry UI */
.manual-entry-row { display: flex; gap: 8px; align-items: center; }
.manual-plate-input { flex: 1; padding: 10px 12px; border-radius: 8px; border: 1.5px solid #475569; background: #1e293b; color: white; font-weight: 700; font-family: monospace; font-size: 16px; text-transform: uppercase; }
.manual-plate-input:focus { border-color: #2563eb; outline: none; }
.btn-manual-confirm { padding: 10px 16px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: 0.2s; }
.btn-manual-confirm:hover { background: #1d4ed8; transform: translateY(-1px); }

.text-emerald-400 { color: #34d399; } .text-rose-400 { color: #fb7185; }
.grid-3-cols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
.verification-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin-top: 24px; }
.verify-header { padding: 20px 24px; border-bottom: 1px solid #e2e8f0; }
.verify-status { display: flex; align-items: center; gap: 16px; }
.icon-large { font-size: 32px; }
.verify-body { padding: 24px; }
.info-block { display: flex; flex-direction: column; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #f1f5f9; }
.w-full { width: 100%; }
.success-confirm-btn {
  padding: 14px;
  background: linear-gradient(135deg, #10b981, #059669);
  font-weight: 800;
  border-radius: 8px;
  font-size: 15px;
  color: white;
  border: none;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.btn-secondary {
  background: white;
  border: 1px solid #cbd5e1;
  padding: 14px;
  border-radius: 8px;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  color: #1e293b;
}
.margin-top-16 { margin-top: 16px; } .margin-top-24 { margin-top: 24px; } .margin-top-8 { margin-top: 8px; }
.text-slate-800 { color: #1e293b; } .text-emerald-700 { color: #047857; } .text-rose-700 { color: #be123c; } .text-amber-600 { color: #d97706; }
.animated { animation-duration: 0.4s; } .fade-in { animation-name: fadeInUp; } .slide-up { animation-name: slideUp; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.status-banner { padding: 14px 20px; border-radius: 10px; font-size: 15px; font-weight: 700; text-align: center; margin-bottom: 16px; }
.status-banner-error { background: #fff1f2; border: 2px solid #f43f5e; color: #be123c; }
.status-banner-success { background: #f0fdf4; border: 2px solid #22c55e; color: #15803d; }
.camera-error-message { color: #f59e0b; font-size: 13px; font-weight: 600; }
.camera-loading-state { display: flex; flex-direction: column; align-items: center; color: #64748b; gap: 8px; }
.action-buttons-wrapper { display: flex; gap: 12px; }
.border-top { border-top: 1px solid #e2e8f0; }
.padding-top-24 { padding-top: 24px; }
.margin-bottom-24 { margin-bottom: 24px; }
.bg-emerald-50 { background-color: #f0fdf4; } .bg-rose-50 { background-color: #fff1f2; }
.bg-emerald-100 { background-color: #dcfce7; } .bg-blue-100 { background-color: #dbeafe; }
.text-emerald-700 { color: #047857; } .text-blue-700 { color: #1d4ed8; }
.text-rose-600 { color: #e11d48; } .text-emerald-600 { color: #059669; }
.text-sm { font-size: 13px; } .text-xs { font-size: 11px; }
.font-bold { font-weight: 700; } .text-muted { color: #94a3b8; }
.italic { font-style: italic; } .text-center { text-align: center; }
.mt-1 { margin-top: 4px; } .mt-2 { margin-top: 8px; }
.mb-2 { margin-bottom: 8px; } .mb-3 { margin-bottom: 12px; } .mb-4 { margin-bottom: 16px; }
.text-2xl { font-size: 24px; } .text-3xl { font-size: 30px; }
.opacity-50 { opacity: 0.5; }
.live-stream-active { background: #0f172a; }
.bg-slate-900 { background: #0f172a !important; }
.bg-slate-50 { background-color: #f8fafc; }
.text-blue-dark { color: #1e3a8a; }
.text-slate-400 { color: #94a3b8; }
.text-slate-300 { color: #cbd5e1; }
@keyframes pulseDot { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.7); } 70% { box-shadow: 0 0 0 6px rgba(16,185,129,0); } 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); } }
</style>
