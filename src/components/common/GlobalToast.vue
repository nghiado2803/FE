<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast-fade">
        <div 
          v-for="toast in toasts" 
          :key="toast.id" 
          :class="['global-toast', toast.type]"
        >
          <div class="toast-icon">
            <i :class="['bi', getIcon(toast.type)]"></i>
          </div>
          <div class="toast-content">
            {{ toast.message }}
          </div>
          <button class="toast-close" @click="remove(toast.id)">
            <i class="bi bi-x"></i>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

const toasts = ref<Toast[]>([])
let nextId = 0

const getIcon = (type: ToastType) => {
  switch (type) {
    case 'success': return 'bi-check-circle-fill'
    case 'error':   return 'bi-x-circle-fill'
    case 'warning': return 'bi-exclamation-triangle-fill'
    default:        return 'bi-info-circle-fill'
  }
}

const show = (message: string, type: ToastType = 'success', duration = 3000) => {
  const id = nextId++
  toasts.value.push({ id, message, type })
  
  if (duration > 0) {
    setTimeout(() => {
      remove(id)
    }, duration)
  }
}

const remove = (id: number) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

defineExpose({ show })
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 100000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.global-toast {
  pointer-events: auto;
  min-width: 300px;
  max-width: 450px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #3b82f6;
  animation: slide-in 0.3s ease-out;
}

.global-toast.success { border-left-color: #10b981; }
.global-toast.error   { border-left-color: #ef4444; }
.global-toast.warning { border-left-color: #f59e0b; }
.global-toast.info    { border-left-color: #3b82f6; }

.toast-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.success .toast-icon { color: #10b981; }
.error .toast-icon   { color: #ef4444; }
.warning .toast-icon { color: #f59e0b; }
.info .toast-icon    { color: #3b82f6; }

.toast-content {
  flex: 1;
  color: #1e293b;
  font-size: 0.9375rem;
  font-weight: 500;
}

.toast-close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.toast-close:hover {
  background: #f1f5f9;
  color: #64748b;
}

/* Animations */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

@keyframes slide-in {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>
