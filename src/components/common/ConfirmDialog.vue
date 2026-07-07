<template>
  <BaseModal :isOpen="isOpen" :title="title" @close="handleCancel">

    <div class="confirm-modal-body-wrapper">
      <div :class="['confirm-visual-icon-zone', confirmVariant]">
        <span v-if="confirmVariant === 'danger'">⚠️</span>
        <span v-else-if="confirmVariant === 'primary'">💡</span>
        <span v-else>📋</span>
      </div>

      <p class="confirm-core-message-text">{{ message }}</p>
    </div>

    <template #footer>
      <BaseButton
        variant="outline"
        size="md"
        :disabled="isLoading"
        @click="handleCancel"
      >
        {{ cancelText }}
      </BaseButton>

      <BaseButton
        :variant="confirmVariant"
        size="md"
        :loading="isLoading"
        @click="handleConfirm"
      >
        {{ confirmText }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

// NÂNG CẤP LUỒNG PROPS: Động hóa toàn diện nhãn chữ và tính chất màu sắc hộp thoại
defineProps({
  isOpen: { type: Boolean, required: true },
  title: { type: String, default: 'Xác nhận thao tác nghiệp vụ' },
  message: { type: String, required: true },

  // Tùy biến chữ hiển thị trên mặt nút theo bối cảnh đồ án
  confirmText: { type: String, default: 'Xác nhận' },
  cancelText: { type: String, default: 'Hủy bỏ' },

  // Biến thể màu sắc: 'danger' (Đỏ phạt/hủy cọc), 'primary' (Xanh dương lưu/vào bãi)
  confirmVariant: { type: String, default: 'danger' },

  // Trạng thái quay tròn đợi Backend phản hồi dữ liệu ngầm
  isLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'cancel'])

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.confirm-modal-body-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 8px 4px;
  text-align: left;
}

/* Khu vực icon tròn nhận diện cảnh báo nghiệp vụ */
.confirm-visual-icon-zone {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

/* Phối màu sắc thái icon theo tính chất hành động truyền từ ngoài vào */
.confirm-visual-icon-zone.danger {
  background-color: #fff5f5;
  border: 1px solid #fee2e2;
}
.confirm-visual-icon-zone.primary {
  background-color: #eff6ff;
  border: 1px solid #dbeafe;
}

/* Font chữ thông điệp căn chỉnh thông thoáng chuẩn Slate UI */
.confirm-core-message-text {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  line-height: 1.6;
  padding-top: 4px;
}
</style>
