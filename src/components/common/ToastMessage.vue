<template>
  <Transition name="toast-premium-slide">
    <div v-if="show" :class="['modern-toast-notification', type]">
      <div class="toast-inner-content-wrapper">

        <span class="toast-context-emoji-icon">
          <span v-if="type === 'success'">🟢</span>
          <span v-else-if="type === 'error'">🔴</span>
          <span v-else-if="type === 'warning'">⚠️</span>
          <span v-else>ℹ️</span>
        </span>

        <p class="toast-core-message-text">{{ message }}</p>

      </div>

      <button class="toast-dismiss-inline-x-btn" @click="handleManualClose">✕</button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  message: { type: String, required: true },
  type: { type: String, default: 'success' }, // Phom: success (Xanh), error (Đỏ), warning (Vàng), info (Xanh dương)
  duration: { type: Number, default: 3000 }    // Thời gian tự động ẩn thông báo (ms) - Mặc định 3 giây
})

const emit = defineEmits(['close', 'update:show'])

let autoDismissTimeoutId: ReturnType<typeof setTimeout> | null = null

// NÂNG CẤP LUỒNG LOGIC: Tự kích hoạt bộ đếm giờ tự hủy thông minh khi bật thông báo
watch(() => props.show, (isTriggered) => {
  if (isTriggered) {
    // Nếu có bộ đếm cũ đang chạy dở, xóa ngay để reset lại thời gian từ đầu
    if (autoDismissTimeoutId) clearTimeout(autoDismissTimeoutId)

    // Tự động kích hoạt lệnh đóng sau 3 giây
    autoDismissTimeoutId = setTimeout(() => {
      executeDismissFlow()
    }, props.duration)
  }
}, { immediate: true })

const handleManualClose = () => {
  executeDismissFlow()
}

// Hàm gộp tất toán luồng đóng, đẩy ngược trạng thái đồng bộ v-model ra ngoài view cha
const executeDismissFlow = () => {
  emit('update:show', false)
  emit('close')
}

// Dọn dẹp sạch sẽ luồng tiến trình chạy ngầm khi chuyển trang để chống Memory Leak
onUnmounted(() => {
  if (autoDismissTimeoutId) clearTimeout(autoDismissTimeoutId)
})
</script>

<style scoped>
/* Khung bọc Toast định vị thả nổi ở đỉnh góc phải màn hình */
.modern-toast-notification {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999; /* Đẩy vượt đỉnh tuyệt đối */
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  /* ĐỒNG BỘ UI: Bo góc tròn 12px mịn màng ăn khớp phom dáng hệ thống */
  border-radius: 12px;
  width: calc(100% - 48px);
  max-width: 360px;
  box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04);
  box-sizing: border-box;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid transparent;
}

.toast-inner-content-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.toast-context-emoji-icon {
  font-size: 16px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.toast-core-message-text {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13.5px;
  font-weight: 700;
  line-height: 1.4;
  text-align: left;
  white-space: normal;
  word-break: break-word;
}

.toast-dismiss-inline-x-btn {
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.15s ease;
  padding: 4px;
  flex-shrink: 0;
}
.toast-dismiss-inline-x-btn:hover {
  opacity: 0.9;
}

/* --- PHÂN KHU BẢNG MÀU PREMIUM HIỆN ĐẠI --- */
.success {
  background-color: #ecfdf5;
  border-color: #a7f3d0;
  color: #065f46;
}
.success .toast-dismiss-inline-x-btn { color: #065f46; }

.error {
  background-color: #fff5f5;
  border-color: #fca5a5;
  color: #991b1b;
}
.error .toast-dismiss-inline-x-btn { color: #991b1b; }

.warning {
  background-color: #fffbeb;
  border-color: #fef08a;
  color: #854d0e;
}
.warning .toast-dismiss-inline-x-btn { color: #854d0e; }

.info {
  background-color: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
}
.info .toast-dismiss-inline-x-btn { color: #1e40af; }

/* --- HOẠT ẢNH TRƯỢT NẢY TRÊN XUỐNG (CUBIC BEZIER SNAPPIER) --- */
.toast-premium-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-premium-slide-leave-active {
  transition: all 0.2s ease-in-out;
}

.toast-premium-slide-enter-from,
.toast-premium-slide-leave-to {
  opacity: 0;
  transform: translateY(-24px) scale(0.95);
}

/* Định vị responsive khi chạy trên màn hình Mobile hẹp của khách hàng */
@media (max-width: 480px) {
  .modern-toast-notification {
    top: 16px;
    right: 50%;
    transform: translateX(50%);
    width: calc(100% - 32px);
  }
  .toast-premium-slide-enter-from,
  .toast-premium-slide-leave-to {
    opacity: 0;
    transform: translate(50%, -20px) scale(0.95);
  }
}
</style>
