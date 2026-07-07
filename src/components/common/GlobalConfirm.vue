<template>
  <Teleport to="body">
    <Transition name="confirm-fade">
      <div v-if="visible" class="global-confirm-overlay" @click.self="cancel">
        <div :class="['global-confirm-box', variant]">
          <div class="confirm-icon-circle">
            <i :class="['bi', iconClass]"></i>
          </div>
          <h3 class="confirm-title">{{ title }}</h3>
          <p class="confirm-message">{{ message }}</p>
          
          <div class="confirm-actions">
            <button class="btn-cancel" @click="cancel">{{ cancelText }}</button>
            <button class="btn-confirm" @click="confirm">{{ confirmText }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const visible = ref(false)
const title = ref('')
const message = ref('')
const confirmText = ref('Xác nhận')
const cancelText = ref('Hủy')
const variant = ref<'primary' | 'danger'>('primary')

let resolvePromise: (val: boolean) => void

const iconClass = computed(() => {
  return variant.value === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-question-circle-fill'
})

const show = (options: { 
  title?: string, 
  message: string, 
  confirmText?: string, 
  cancelText?: string,
  variant?: 'primary' | 'danger'
}) => {
  title.value = options.title || 'Xác nhận'
  message.value = options.message
  confirmText.value = options.confirmText || 'Xác nhận'
  cancelText.value = options.cancelText || 'Hủy'
  variant.value = options.variant || 'primary'
  visible.value = true
  
  return new Promise<boolean>((resolve) => {
    resolvePromise = resolve
  })
}

const confirm = () => {
  visible.value = false
  resolvePromise(true)
}

const cancel = () => {
  visible.value = false
  resolvePromise(false)
}

defineExpose({ show })
</script>

<style scoped>
.global-confirm-overlay {
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

.global-confirm-box {
  background: white;
  border-radius: 24px;
  padding: 32px 24px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
  animation: confirm-pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.confirm-icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 28px;
}

.primary .confirm-icon-circle { background: #eff6ff; }
.danger .confirm-icon-circle { background: #fef2f2; }

.confirm-title {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 10px;
}

.confirm-message {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 28px;
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.confirm-actions button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-cancel:hover { background: #e2e8f0; }

.btn-confirm {
  color: white;
}

.primary .btn-confirm { background: #2563eb; }
.danger .btn-confirm { background: #ef4444; }

.btn-confirm:hover { transform: translateY(-1px); opacity: 0.95; }

@keyframes confirm-pop {
  from { opacity: 0; transform: scale(0.9) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.confirm-fade-enter-active, .confirm-fade-leave-active { transition: opacity 0.2s; }
.confirm-fade-enter-from, .confirm-fade-leave-to { opacity: 0; }
</style>
