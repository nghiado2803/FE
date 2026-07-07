<template>
  <div class="modern-qr-container">
    <div v-if="value && value.trim() !== ''" class="qr-code-render-wrapper animated scale-in">
      <qrcode-vue
        :value="value"
        :size="size"
        :level="level"
        :render-as="'svg'"
        class="qr-code-svg-element"
      />
    </div>

    <div v-else class="qr-code-fallback-placeholder">
      <div class="skeleton-qr-scan-box" :style="{ width: size + 'px', height: size + 'px' }">
        <div class="laser-scanner-line-mini"></div>
        <span class="qr-placeholder-icon">🔐</span>
      </div>
      <p class="qr-fallback-sub-text">Đang mã hóa dữ liệu bảo mật...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Khuyến nghị cài đặt thư viện gốc của nhóm: npm install qrcode.vue
import QrcodeVue from 'qrcode.vue'
import type { PropType } from 'vue'

type QRLevel = 'L' | 'M' | 'Q' | 'H'

defineProps({
  // Chuỗi cần mã hóa (Ví dụ: Mã hóa đơn đặt cọc '#SP-8024' hoặc Biển số xe '77A-124.56')
  value: { type: String, required: true, default: '' },

  // Kích thước chiều rộng/cao của mã QR (px)
  size: { type: Number, default: 170 },

  // Mức độ sửa lỗi của thuật toán QR (Error Correction Level): L, M, Q, H (Mặc định H - Cao nhất)
  level: { type: String as PropType<QRLevel>, default: 'H' }
})
</script>

<style scoped>
.modern-qr-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: fit-content;
  margin: 0 auto;
  box-sizing: border-box;
}

/* Khung bọc mã QR xịn phẳng phiu, bo góc 12px đồng bộ hệ thống */
.qr-code-render-wrapper {
  background: #ffffff;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
}

.qr-code-svg-element {
  display: block;
  max-width: 100%;
  height: auto;
}

/* --- HỆ THỐNG PHÒNG THỦ DỮ LIỆU TRỐNG (MOCKUP PLACEHOLDER KHI API CHẬM) --- */
.qr-code-fallback-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.skeleton-qr-scan-box {
  background-color: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.qr-placeholder-icon {
  font-size: 36px;
  opacity: 0.35;
  animation: pulseLock 1.8s ease-in-out infinite;
}

.qr-fallback-sub-text {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

/* Hiệu ứng tia laser quét nhẹ trong ô trống tạo cảm giác đang xử lý mã hóa */
.laser-scanner-line-mini {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #3b82f6;
  opacity: 0.4;
  box-shadow: 0 0 6px 1px #3b82f6;
  animation: laserMoveMini 2s linear infinite;
}

@keyframes laserMoveMini {
  0% { top: 0; }
  50% { top: 100%; }
  100% { top: 0; }
}

@keyframes pulseLock {
  0%, 100% { transform: scale(1); opacity: 0.35; }
  50% { transform: scale(1.08); opacity: 0.6; }
}

/* Hoạt ảnh bung nảy mã QR khi dữ liệu từ máy chủ Spring Boot cập bến */
.animated { animation-duration: 0.35s; animation-fill-mode: both; }
@keyframes scaleIn {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.scale-in { animation-name: scaleIn; animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); }
</style>
