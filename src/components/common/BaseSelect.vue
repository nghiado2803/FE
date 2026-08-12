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
  margin-bottom: 4px;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
}

.modern-select-label {
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 800;
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

/* === STYLE NATIVE SELECT ĐỒNG BỘ HỆ THỐNG === */
.modern-core-select {
  width: 100%;
  padding: 14px 44px 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  background-color: #ffffff;
  outline: none;
  transition: all 0.2s ease-in-out;
  box-sizing: border-box;
  cursor: pointer;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  line-height: 1.4;
}

/* Màu nền + chữ cho OPTION (trên các browser hỗ trợ) */
.modern-core-select option {
  background: #ffffff;
  color: #0f172a;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 14px;
  border-bottom: 1px solid #f1f5f9;
}

.modern-core-select option:checked {
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 800;
}

/* Focus xanh dương chuẩn hệ thống */
.modern-core-select:focus:not(.select-has-error) {
  border-color: #2563eb;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12), 0 2px 6px rgba(37, 99, 235, 0.08);
}

.modern-core-select:hover:not(:disabled):not(.select-has-error) {
  border-color: #cbd5e1;
  background-color: #f8fafc;
}

.is-select-disabled {
  background-color: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
  border-color: #e2e8f0;
}

/* Mũi tên thả xuống tối giản, xanh, vị trí chuẩn */
.custom-select-arrow-icon {
  position: absolute;
  right: 16px;
  font-size: 9px;
  color: #64748b;
  pointer-events: none;
  user-select: none;
  transition: transform 0.2s ease, color 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: #f1f5f9;
}

.custom-select-arrow-icon::after {
  content: '';
}

/* Hover select -> đổi màu mũi tên */
.select-relative-container:hover .custom-select-arrow-icon {
  color: #2563eb;
  background: #eff6ff;
}

.modern-core-select:focus ~ .custom-select-arrow-icon {
  color: #1d4ed8;
  background: #dbeafe;
  transform: rotate(180deg);
}

/* Validate báo lỗi hồng đỏ */
.select-has-error {
  border-color: #f43f5e !important;
  background-color: #fff5f5;
  color: #e11d48;
}
.select-has-error:focus {
  box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.14);
}

.modern-error-message-text {
  color: #e11d48;
  font-size: 11.5px;
  font-weight: 700;
  margin-top: 6px;
  display: block;
  line-height: 1.4;
}

/* Transition */
.error-slide-enter-active, .error-slide-leave-active {
  transition: all 0.2s ease;
}
.error-slide-enter-from, .error-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
