<template>
  <div v-if="isOpen" class="modal-overlay animated fadeIn">
    <div class="modal-box animated zoomIn">
      <div class="modal-header">
        <div class="success-icon">⭐</div>
        <h3>Đánh giá dịch vụ</h3>
        <p>Bạn vừa hoàn tất gửi xe. Hãy chia sẻ trải nghiệm của bạn nhé!</p>
      </div>

      <div class="modal-body">
        <div class="stars-container">
          <button
            v-for="star in 5"
            :key="star"
            class="star-btn"
            :class="{ active: star <= rating }"
            @click="rating = star"
          >
            ★
          </button>
        </div>
        <p class="rating-text">{{ ratingLabels[rating - 1] }}</p>

        <textarea
          v-model="comment"
          placeholder="Nhập ý kiến phản hồi của bạn (không bắt buộc)..."
          class="comment-area"
        ></textarea>
      </div>

      <div class="modal-footer">
        <button class="btn-later" @click="close">Để sau</button>
        <button class="btn-submit" :disabled="rating === 0 || isLoading" @click="submit">
          {{ isLoading ? 'Đang gửi...' : 'Gửi đánh giá' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import apiClient from '@/services/api'

const props = defineProps<{
  bookingId: number | null
}>()

const emit = defineEmits(['close', 'success'])

const isOpen = ref(false)
const rating = ref(0)
const comment = ref('')
const isLoading = ref(false)

const ratingLabels = ['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời']

const open = () => {
  rating.value = 0
  comment.value = ''
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
  emit('close')
}

const submit = async () => {
  if (!props.bookingId || rating.value === 0) return

  isLoading.value = true
  try {
    await apiClient.post('/customer/reviews/submit', {
      bookingId: props.bookingId,
      rating: rating.value,
      comment: comment.value
    })
    emit('success')
    close()
  } catch (error) {
    console.error('Lỗi gửi đánh giá:', error)
    alert('Không thể gửi đánh giá lúc này. Vui lòng thử lại sau!')
  } finally {
    isLoading.value = false
  }
}

defineExpose({ open, close })
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000; padding: 20px;
}

.modal-box {
  background: white; width: 100%; max-width: 400px;
  border-radius: 24px; padding: 32px 24px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  text-align: center;
}

.success-icon {
  font-size: 48px; margin-bottom: 16px;
}

.modal-header h3 { margin: 0 0 8px; font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
.modal-header p { margin: 0; font-size: 15px; color: #64748b; line-height: 1.6; font-weight: 500; }

.stars-container {
  display: flex; justify-content: center; gap: 12px; margin: 28px 0 12px;
}
.star-btn {
  background: none; border: none; font-size: 44px; color: #e2e8f0;
  cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
}
.star-btn.active { color: #f59e0b; transform: scale(1.15) rotate(5deg); filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.3)); }
.rating-text { font-size: 16px; font-weight: 800; color: #f59e0b; margin-bottom: 24px; height: 24px; }

.comment-area {
  width: 100%; height: 120px; padding: 16px; border: 2px solid #f1f5f9;
  border-radius: 16px; font-size: 14px; resize: none; outline: none;
  transition: all 0.2s; background-color: #f8fafc;
  color: #1e293b; font-weight: 500;
}
.comment-area:focus { border-color: #2563eb; background-color: white; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }

.modal-footer {
  display: flex; gap: 16px; margin-top: 28px;
}
.btn-later {
  flex: 1; padding: 14px; background: #f1f5f9; color: #64748b;
  border: none; border-radius: 14px; font-weight: 700; cursor: pointer;
  transition: all 0.2s;
}
.btn-later:hover { background: #e2e8f0; color: #475569; }

.btn-submit {
  flex: 2; padding: 14px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white;
  border: none; border-radius: 14px; font-weight: 800; cursor: pointer;
  transition: all 0.2s; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}
.btn-submit:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3); }
.btn-submit:active { transform: translateY(0); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

.animated { animation-duration: 0.4s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes zoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
.fadeIn { animation-name: fadeIn; }
.zoomIn { animation-name: zoomIn; }
</style>
