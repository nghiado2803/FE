<template>
  <input ref="inputRef" :placeholder="placeholder" :disabled="disabled" class="flatpickr-input" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'

const props = defineProps({
  modelValue: { type: String, default: '' }, // ISO yyyy-mm-dd
  dateFormat: { type: String, default: 'd/m/Y' },
  min: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  placeholder: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])
const inputRef = ref<HTMLInputElement | null>(null)
let fp: any = null

// Vietnamese locale data for flatpickr
const viLocale = {
  weekdays: {
    shorthand: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    longhand: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  },
  months: {
    shorthand: ['Thg 1','Thg 2','Thg 3','Thg 4','Thg 5','Thg 6','Thg 7','Thg 8','Thg 9','Thg 10','Thg 11','Thg 12'],
    longhand: ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']
  }
}

onMounted(() => {
  fp = flatpickr(inputRef.value as HTMLInputElement, {
    dateFormat: props.dateFormat,
    defaultDate: props.modelValue || null,
    minDate: props.min || null,
    allowInput: true,
    locale: viLocale as any,
    onChange(selectedDates: Date[]) {
      if (!selectedDates || selectedDates.length === 0) {
        emit('update:modelValue', '')
        return
      }
      const d = selectedDates[0]
      const iso = d.toISOString().split('T')[0]
      emit('update:modelValue', iso)
    }
  })
})

watch(() => props.modelValue, (v) => {
  if (fp) {
    try {
      fp.setDate(v || null, false, 'Y-m-d')
    } catch (e) {
      // ignore
    }
  }
})

onBeforeUnmount(() => {
  if (fp) fp.destroy()
})
</script>

<style scoped>
.flatpickr-input {
  width: 100%;
  padding: 14px 14px 14px 40px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}
</style>
