<template>
  <Teleport to="body">
    <Transition name="modal-premium-fade">
      <div v-if="isOpen" class="modern-modal-overlay" @click.self="$emit('close')">

        <div class="modern-modal-container animated-slide-up-box">

          <div class="modern-modal-header">
            <h3>{{ title }}</h3>
            <button class="modal-close-x-btn" @click="$emit('close')">✕</button>
          </div>

          <div class="modern-modal-body">
            <slot></slot>
          </div>

          <div v-if="$slots.footer" class="modern-modal-footer">
            <slot name="footer"></slot>
          </div>

        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  title: { type: String, default: '' }
})

const emit = defineEmits(['close'])

// LẮNG NGHE LỆNH PHÍM ESCAPE ĐỂ ĐÓNG POPUP NHANH (khai báo trước watch để tránh temporal dead zone khi immediate:true)
const handleEscKeyClose = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('close')
  }
}

// KHÓA CHẶT CUỘN NỀN (SCROLL LEAKING) KHI BẬT MODAL
watch(() => props.isOpen, (newStatus) => {
  if (newStatus) {
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscKeyClose)
  } else {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', handleEscKeyClose)
  }
}, { immediate: true })

// Đảm bảo dọn dẹp sạch sẽ bộ nhớ nếu trang bị hủy bất ngờ (Chống Memory Leak)
onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleEscKeyClose)
})
</script>

<style scoped>
/* Thiết kế lớp nền mờ tối có hiệu ứng làm nhòe Backdrop cao cấp */
.modern-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.4); /* Màu xám Slate tối sang trọng */
  backdrop-filter: blur(4px); /* Làm mờ cảnh nền bãi xe phía sau */
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* Đẩy vượt đỉnh mọi phân hệ */
}

/* Khung bọc Container phẳng bo cong 16px đồng bộ phom dáng hệ thống */
.modern-modal-container {
  background: #ffffff;
  border-radius: 16px;
  width: 92%;
  max-width: 480px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.modern-modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modern-modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.3px;
}

.modal-close-x-btn {
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 700;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.15s ease;
  padding: 4px;
}
.modal-close-x-btn:hover {
  color: #64748b;
}

.modern-modal-body {
  padding: 20px;
  max-height: calc(100vh - 200px);
  overflow-y: auto; /* Tự động xuất hiện thanh cuộn nội bộ nếu nội dung form quá dài */
  box-sizing: border-box;
}

.modern-modal-footer {
  padding: 14px 20px;
  border-top: 1px solid #f1f5f9;
  background-color: #f8fafc; /* Nền xám nhạt phân tách rõ khu vực nút hành động */
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* --- THUẬT TOÁN TRANSITION HAI CHIỀU MƯỢT MÀ KHÔNG BỊ GIẬT CỤC UI --- */
.modal-premium-fade-enter-active,
.modal-premium-fade-leave-active {
  transition: opacity 0.25s ease-in-out;
}

/* Định nghĩa hiệu ứng mờ dần của lớp nền overlay */
.modal-premium-fade-enter-from,
.modal-premium-fade-leave-to {
  opacity: 0;
}

/* Tạo xung lực trượt nhẹ hộp thoại từ dưới lên snappier bằng Cubic Bezier */
.modal-premium-fade-enter-active .animated-slide-up-box {
  animation: modalSlideIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.modal-premium-fade-leave-active .animated-slide-up-box {
  animation: modalSlideOut 0.2s ease-in-out both;
}

@keyframes modalSlideIn {
  from { transform: translateY(24px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes modalSlideOut {
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(16px); opacity: 0; }
}
</style>
