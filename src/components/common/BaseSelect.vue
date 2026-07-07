<template>
  <div class="modern-select-wrapper">
    <label v-if="label" :for="computedId" class="modern-select-label">
      {{ label }}
    </label>

    <div class="select-relative-container">
      <select
        :id="computedId"
        :value="modelValue"
        :disabled="disabled"
        :class="['modern-core-select', { 'select-has-error': error }, { 'is-select-disabled': disabled }]"
        @change="handleSelectChange"
      >
        <option disabled value="">{{ placeholder || 'Vui lòng chọn...' }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.text }}
        </option>
      </select>

      <span class="custom-select-arrow-icon">▼</span>
    </div>

    <Transition name="error-slide">
      <span v-if="error" class="modern-error-message-text">
        ⚠️ {{ error }}
      </span>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

type SelectOption = { value: string | number; text: string }

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array as PropType<SelectOption[]>, required: true },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  id: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

// Thuật toán tự sinh ID duy nhất chống trùng lặp định danh trên form
const computedId = computed(() => {
  return props.id || `smartpark-select-${Math.floor(Math.random() * 100000)}`
})

// THUẬT TOÁN KIỂM TRA VÀ ÉP KIỂU SỐ TỰ ĐỘNG: Cứu cánh cho luồng dữ liệu Spring Boot
const handleSelectChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const selectedValue = target.value

  // Quét qua mảng options xem giá trị gốc của option đó là Number hay String
  const matchedOption = props.options.find((opt) => opt.value.toString() === selectedValue)

  if (matchedOption) {
    // Trả về đúng kiểu dữ liệu gốc (Number hoặc String), chặn đứng hoàn toàn lỗi ép chuỗi tai hại
    emit('update:modelValue', matchedOption.value)
  } else {
    emit('update:modelValue', selectedValue)
  }
}
</script>

<style scoped>
.modern-select-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
}

.modern-select-label {
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  letter-spacing: 0.2px;
  cursor: pointer;
}

.select-relative-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

/* ĐỒNG BỘ ĐỒ HỌA CAO CẤP VÀ BO GÓC TRÒN 10PX KHỚP KHÍT HỆ THỐNG */
.modern-core-select {
  width: 100%;
  padding: 12px 36px 12px 14px; /* Chừa khoảng trống bên phải cho mũi tên */
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  background-color: #f8fafc;
  outline: none;
  transition: all 0.2s ease-in-out;
  box-sizing: border-box;
  cursor: pointer;
  /* Ẩn mũi tên mặc định xấu xí của OS hệ điều hành */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

/* Bừng sáng xanh dương khi tương tác thả menu */
.modern-core-select:focus:not(.select-has-error) {
  border-color: #2563eb;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.is-select-disabled {
  background-color: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
  border-color: #e2e8f0;
}

/* Mũi tên thả xuống tối giản, thanh lịch */
.custom-select-arrow-icon {
  position: absolute;
  right: 14px;
  font-size: 10px;
  color: #94a3b8;
  pointer-events: none; /* Cho phép click xuyên qua mũi tên vào thẳng select */
  user-select: none;
}

/* Cấu hình trạng thái Validate báo lỗi hồng đỏ */
.select-has-error {
  border-color: #f43f5e !important;
  background-color: #fff5f5;
  color: #e11d48;
}
.select-has-error:focus {
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

/* Hoạt ảnh Transition mượt mắt */
.error-slide-enter-active, .error-slide-leave-active {
  transition: all 0.2s ease;
}
.error-slide-enter-from, .error-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
