<template>
  <div class="history-page-container animated fadeIn">
    <div class="history-body-content">

      <div v-if="historyLogs.length === 0" class="history-empty-state">
        <p>Không có lịch sử giao dịch nào.</p>
      </div>
      <div v-else class="history-vertical-timeline-list">
        <div v-for="log in historyLogs" :key="log.id" class="history-card-item">
          <div class="history-card-top-row">
            <span class="history-lot-name">📍 {{ log.lotName }}</span>
            <span :class="['history-status-badge', log.status === 'COMPLETED' ? 'badge-success' : 'badge-danger']">
              {{ log.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Phạt hủy cọc' }}
            </span>
          </div>

          <div class="history-card-middle-details">
            <p>Biển số: <b>{{ log.plate }}</b></p>
            <p class="time-stamp-text">🕒 Vào: {{ log.checkInTime }}</p>
            <p class="time-stamp-text" v-if="log.checkOutTime">🕒 Ra: {{ log.checkOutTime }}</p>
          </div>

          <div class="history-card-bottom-row">
            <div class="fee-info">
              <span class="fee-label">Tổng chi phí tất toán:</span>
              <strong class="fee-amount-number">{{ log.fee.toLocaleString('vi-VN') }}đ</strong>
            </div>

            <button
              v-if="log.status === 'COMPLETED' && !log.isReviewed"
              class="btn-rate-now"
              @click="openRating(log.id)"
            >
              Đánh giá
            </button>
            <span v-else-if="log.isReviewed" class="reviewed-badge">
              ★ Đã đánh giá
            </span>
          </div>
        </div>
      </div>

    </div>

    <!-- Rating Modal -->
    <RatingModal
      ref="ratingModalRef"
      :booking-id="selectedBookingId"
      @success="loadHistory"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CustomerService, type HistoryLog } from '@/services/customer.service'
import RatingModal from '@/components/customer/RatingModal.vue'

const historyLogs = ref<HistoryLog[]>([])
interface RatingModalInstance {
  open: () => void
}
const ratingModalRef = ref<RatingModalInstance | null>(null)
const selectedBookingId = ref<number | null>(null)

const openRating = (id: number) => {
  selectedBookingId.value = id
  ratingModalRef.value?.open()
}

const loadHistory = async () => {
  try {
    const data = await CustomerService.getHistory()
    historyLogs.value = data
  } catch (error) {
    console.error('Lỗi khi tải lịch sử:', error)
  }
}

onMounted(loadHistory)
</script>

<style scoped>
.history-page-container { width: 100%; background-color: #f8fafc; box-sizing: border-box; min-height: 100vh; }
.history-body-content { padding: 16px; }

.history-vertical-timeline-list { display: flex; flex-direction: column; gap: 14px; }
.history-card-item { background: white; border-radius: 16px; padding: 14px; border: 1px solid #f1f5f9; display: flex; flex-direction: column; text-align: left; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.history-card-top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.history-lot-name { font-size: 13px; font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 65%; }
.history-status-badge { font-size: 10.5px; font-weight: 700; padding: 3px 8px; border-radius: 6px; }
.badge-success { background: #e6f4ea; color: #137333; }
.badge-danger { background: #fce8e6; color: #c5221f; }

.history-card-middle-details { font-size: 12.5px; color: #475569; line-height: 1.5; margin-bottom: 10px; }
.text-blue { color: #2563eb; }
.time-stamp-text { font-size: 11.5px; color: #94a3b8; margin: 4px 0 0 0; }

.history-card-bottom-row { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #f1f5f9; padding-top: 10px; }
.fee-info { display: flex; flex-direction: column; }
.history-empty-state { background: white; border-radius: 16px; padding: 32px; text-align: center; border: 1px solid #e2e8f0; color: #475569; font-size: 15px; font-weight: 600; }
.fee-label { font-size: 11px; color: #64748b; font-weight: 500; }
.fee-amount-number { font-size: 14px; color: #0f172a; font-weight: 800; }

.btn-rate-now {
  background: #2563eb; color: white; border: none; padding: 6px 16px;
  border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;
  transition: all 0.2s;
}
.btn-rate-now:hover { background: #1d4ed8; transform: translateY(-1px); }

.reviewed-badge { font-size: 11.5px; color: #f59e0b; font-weight: 700; }

.animated { animation-duration: 0.3s; animation-fill-mode: both; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.fadeIn { animation-name: fadeIn; }
</style>
