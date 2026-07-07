<template>
  <div class="modern-input-wrapper">
    <label v-if="label" :for="computedId" class="modern-input-label">
      {{ label }}
    </label>

    <div class="input-field-relative-container">
      <input
        :id="computedId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="['modern-core-input', { 'input-has-error': error }, { 'is-input-disabled': disabled }]"
        @input="handleInputValueChange"
      />
    </div>

    <Transition name="error-slide">
      <span v-if="error" class="modern-error-message-text">
        ⚠️ {{ error }}
      </span>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  id: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

// THUẬT TOÁN TỰ SINH ID DUY NHẤT: Tránh trùng lặp trên form và kích hoạt trúng đích focus nhãn chữ
const computedId = computed(() => {
  return props.id || `smartpark-input-${Math.floor(Math.random() * 100000)}`
})

// XỬ LÝ LOGIC ÉP KIỂU SỐ: Chống sập luồng API của bạn làm Backend Spring Boot
const handleInputValueChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  let rawValue: string | number = target.value

  // Nếu trường nhập liệu quy định là Number, tự động chuyển về kiểu số thật trước khi gửi đi
  if (props.type === 'number' && rawValue !== '') {
    rawValue = Number(rawValue)
  }

  emit('update:modelValue', rawValue)
}
</script>

<style scoped>
.modern-input-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
}

.modern-input-label {
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #334155; /* Màu xám Slate đậm chuẩn UI */
  letter-spacing: 0.2px;
  cursor: pointer;
}

.input-field-relative-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

/* NÂNG CẤP ĐỒ HỌA CAO CẤP VÀ CHỐNG TRÀN LAYOUT BẰNG BOX-SIZING */
.modern-core-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  /* ĐỒNG BỘ UI: Bo tròn góc 10px khớp khít ma trận phom dáng toàn bãi xe */
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  background-color: #f8fafc; /* Nền xám nhạt dịu mắt khi ở trạng thái chờ */
  outline: none;
  transition: all 0.2s ease-in-out;
  box-sizing: border-box;
}

.modern-core-input::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

/* Hiệu ứng bừng sáng xanh dương khi người dùng click chuột gõ phím */
.modern-core-input:focus:not(.input-has-error) {
  border-color: #2563eb;
  background-color: #ffffff; /* Đổi sang nền trắng tinh khi đang gõ */
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.is-input-disabled {
  background-color: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
  border-color: #e2e8f0;
}

/* Cấu hình trạng thái báo lỗi đỏ hồng sắc nét */
.input-has-error {
  border-color: #f43f5e !important;
  background-color: #fff5f5;
  color: #e11d48;
}
.input-has-error:focus {
  box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.15);
}

.modern-error-message-text {
  color: #e11d48;
  font-size: 11.5px;
  font-weight: 700;
  margin-top: 5px;
  display: block;
  line-height: 1.4;
}

/* Hiệu ứng chuyển động mượt mà cho dòng chữ thông báo lỗi */
.error-slide-enter-active, .error-slide-leave-active {
  transition: all 0.2s ease;
}
.error-slide-enter-from, .error-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
