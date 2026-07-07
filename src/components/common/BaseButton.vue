<template>
  <button
    :class="['modern-base-button', variant, size, { 'is-btn-loading': loading }]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="btn-spinner-loader"></span>

    <span :class="['btn-content-slot-wrapper', { 'hidden-text-opacity': loading }]">
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
defineProps({
  // Các biến thể nút: primary (Xanh dương), outline (Viền mảnh), danger (Đỏ hủy cọc), dark (Quản trị)
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },         // Kích thước: sm, md, lg
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
})
defineEmits(['click'])
</script>

<style scoped>
.modern-base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* PHỤC HỒI LOGIC: Bổ sung gap 8px giúp phân tách emoji và chữ thông thoáng */
  gap: 8px;
  border: 1px solid transparent;
  /* ĐỒNG BỘ UI: Bo tròn 10px ăn khớp với phom dáng toàn bộ Portal bãi xe */
  border-radius: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  box-sizing: border-box;
  white-space: nowrap;
  user-select: none;
}

/* Hiệu ứng nén nhẹ nút khi người dùng click bấm chuột thực tế */
.modern-base-button:active:not(:disabled) {
  transform: scale(0.97);
}

.modern-base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none !important;
  transform: none !important;
}

/* --- PHÂN KHU HỆ MÀU VARIANT CAO CẤP --- */
.primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.15);
}
.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.25);
}

/* Sửa lỗi lệch pha đường viền bóp méo nút */
.outline {
  background-color: white;
  border-color: #cbd5e1;
  color: #475569;
}
.outline:hover:not(:disabled) {
  border-color: #2563eb;
  color: #2563eb;
  background-color: #eff6ff;
}

.danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.15);
}
.danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

/* --- ĐỊNH PHOM KÍCH THƯỚC (SIZE SYSTEM) --- */
.sm { padding: 8px 14px; font-size: 12px; border-radius: 8px; }
.md { padding: 12px 20px; font-size: 14px; }
.lg { padding: 15px 28px; font-size: 15px; }

/* --- SỬA LỖI CHÍ TỬ: ĐỘNG HÓA MÀU SẮC SPINNER BẰNG CURRENTCOLOR --- */
.btn-spinner-loader {
  width: 18px;
  height: 18px;
  /* Sử dụng currentColor để tự động hít theo màu chữ của từng Variant */
  border: 2px solid currentColor;
  border-top-color: transparent !important;
  border-radius: 50%;
  animation: spinBtn 0.75s linear infinite;
  position: absolute;
  z-index: 2;
}

.btn-content-slot-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: opacity 0.15s ease;
}

.hidden-text-opacity {
  opacity: 0 !important;
}

@keyframes spinBtn {
  to { transform: rotate(360deg); }
}
</style>
