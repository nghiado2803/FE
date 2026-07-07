<template>
  <Teleport to="body">
    <Transition name="alert-fade">
      <div v-if="visible" class="global-alert-overlay" @click.self="close">
        <div :class="['global-alert-box', typeClass]">
          <div class="alert-icon-circle">
            <i :class="['bi', iconClass]"></i>
          </div>
          <p class="alert-message">{{ message }}</p>
          <button class="alert-ok-btn" @click="close" autofocus>OK</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const visible = ref(false)
const message = ref('')

type AlertType = 'info' | 'success' | 'warning' | 'error'
const type = ref<AlertType>('info')

const typeClass = computed(() => `alert-type-${type.value}`)

const iconClass = computed(() => {
  switch (type.value) {
    case 'success': return 'bi-check-circle-fill'
    case 'error':   return 'bi-x-circle-fill'
    case 'warning': return 'bi-exclamation-triangle-fill'
    default:        return 'bi-info-circle-fill'
  }
})

const detectType = (msg: string): AlertType => {
  const m = msg.toLowerCase()
  if (m.includes('thành công') || m.includes('đã lưu') || m.includes('đã tạo') || m.includes('đã cập nhật') || m.includes('đăng nhập') || m.includes('đã gửi') || m.includes('đã xử lý') || m.includes('đã hủy')) return 'success'
  if (m.includes('lỗi') || m.includes('không thể') || m.includes('thất bại') || m.includes('không kết nối') || m.includes('không tìm thấy')) return 'error'
  if (m.includes('vui lòng') || m.includes('cảnh báo') || m.includes('chưa') || m.includes('bảo trì')) return 'warning'
  return 'info'
}

const show = (msg: string) => {
  message.value = msg
  type.value = detectType(msg)
  visible.value = true
}

const close = () => {
  visible.value = false
}

defineExpose({ show })
</script>

<style scoped>
.global-alert-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 20px;
}

.global-alert-box {
  background: white;
  border-radius: 20px;
  padding: 32px 28px 24px;
  max-width: 360px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
  border-top: 4px solid transparent;
  animation: pop-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.alert-type-success { border-top-color: #10b981; }
.alert-type-error   { border-top-color: #ef4444; }
.alert-type-warning { border-top-color: #f59e0b; }
.alert-type-info    { border-top-color: #3b82f6; }

.alert-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 32px;
}

.alert-type-success .alert-icon-circle { background: #f0fdf4; }
.alert-type-error   .alert-icon-circle { background: #fef2f2; }
.alert-type-warning .alert-icon-circle { background: #fffbeb; }
.alert-type-info    .alert-icon-circle { background: #eff6ff; }

.alert-message {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.6;
  margin-bottom: 24px;
  white-space: pre-line;
}

.alert-ok-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  color: white;
}

.alert-type-success .alert-ok-btn { background: #10b981; }
.alert-type-error   .alert-ok-btn { background: #ef4444; }
.alert-type-warning .alert-ok-btn { background: #f59e0b; }
.alert-type-info    .alert-ok-btn { background: #3b82f6; }

.alert-ok-btn:hover { opacity: 0.9; transform: translateY(-1px); }
.alert-ok-btn:active { transform: scale(0.98); }

/* Animations */
@keyframes pop-in {
  from { opacity: 0; transform: scale(0.85) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.alert-fade-enter-active { transition: opacity 0.15s ease; }
.alert-fade-leave-active { transition: opacity 0.2s ease; }
.alert-fade-enter-from,
.alert-fade-leave-to { opacity: 0; }
</style>
