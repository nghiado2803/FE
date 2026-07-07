<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, ref } from 'vue'
import { useCameraStore } from '@/stores/cameraStore'
import GlobalAlert from '@/components/common/GlobalAlert.vue'
import GlobalConfirm from '@/components/common/GlobalConfirm.vue'
import GlobalToast from '@/components/common/GlobalToast.vue'

const cameraStore = useCameraStore()

// ── GLOBAL COMPONENTS REFS ────────────────────────────────
interface GlobalAlertInstance {
  show: (msg: string) => void
}
interface GlobalConfirmInstance {
  show: (options: {
    title?: string,
    message: string,
    confirmText?: string,
    cancelText?: string,
    variant?: 'primary' | 'danger'
  }) => Promise<boolean>
}
interface GlobalToastInstance {
  show: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => void
}

const globalAlertRef = ref<GlobalAlertInstance | null>(null)
const globalConfirmRef = ref<GlobalConfirmInstance | null>(null)
const globalToastRef = ref<GlobalToastInstance | null>(null)

type AppGlobals = {
  confirmDialog?: (msg: string) => Promise<boolean>
  toast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void
}

// Override window functions ngay sau khi component mount
onMounted(() => {
  // 1. Override window.alert
  window.alert = (msg: string) => {
    globalAlertRef.value?.show(String(msg))
  }

  // 2. Cung cấp hàm confirm async riêng, không ghi đè window.confirm mặc định
  ;(window as unknown as AppGlobals).confirmDialog = async (msg: string) => {
    if (!globalConfirmRef.value) return false
    return await globalConfirmRef.value.show({
      message: msg,
      title: 'Xác nhận',
      confirmText: 'Đồng ý',
      cancelText: 'Hủy'
    })
  }

  // 3. Cung cấp hàm toast toàn cục
  ;(window as unknown as AppGlobals).toast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    globalToastRef.value?.show(message, type)
  }

  // ── CAMERA WARMUP ──────────────────────────────────────
  cameraStore.autoReconnect()

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        stream.getTracks().forEach(track => track.stop())
        console.log('✅ Đã đánh thức Camera phần cứng thành công!')
      })
      .catch((err) => {
        console.log('⚠️ Khách chưa cấp quyền hoặc không có Camera:', err)
      })
  }
})
</script>

<template>
  <RouterView />
  <GlobalAlert ref="globalAlertRef" />
  <GlobalConfirm ref="globalConfirmRef" />
  <GlobalToast ref="globalToastRef" />
</template>

<style>
/* CSS Reset cơ bản cho toàn bộ ứng dụng */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #f8fafc; /* Màu nền xám sáng mặc định */
  color: #1e293b;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Xóa gạch chân của thẻ a mặc định */
a {
  text-decoration: none;
}

/* Đảm bảo các thành phần form sử dụng cùng font chữ với body */
button, input, select, textarea {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
</style>
