<template>
  <div class="page-wrap animated fadeIn">
    <!-- ── Toolbar ── -->
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="icon-box">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="24" height="24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.562 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.562 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.562 0 0 0 .475-.345L11.48 3.5Z" />
          </svg>
        </div>
        <div>
          <h2 class="page-title">Đánh giá & Phản hồi</h2>
          <p class="page-sub">Quản lý và theo dõi ý kiến khách hàng về dịch vụ bãi đỗ</p>
        </div>
      </div>
      <div class="toolbar-right">
        <button class="btn-refresh" @click="fetchReviews" :disabled="isLoading">
          <i :class="['bi bi-arrow-clockwise', { 'spin': isLoading }]"></i>
          <span>Làm mới dữ liệu</span>
        </button>
      </div>
    </div>

    <!-- ── Stats Grid ── -->
    <div class="stats-grid">
      <div class="stat-card primary">
        <div class="stat-icon"><i class="bi bi-stars"></i></div>
        <div class="stat-content">
          <span class="stat-label">Điểm trung bình</span>
          <div class="stat-value-group">
            <h3 class="stat-value text-blue-600">{{ avgRating.toFixed(1) }}</h3>
            <span class="stat-unit">/ 5.0</span>
          </div>
          <div class="mini-stars">
            <span v-for="i in 5" :key="i" :class="['mini-star', { active: i <= Math.round(avgRating) }]">★</span>
          </div>
        </div>
      </div>

      <div class="stat-card success">
        <div class="stat-icon"><i class="bi bi-chat-heart-fill"></i></div>
        <div class="stat-content">
          <span class="stat-label">Tổng lượt đánh giá</span>
          <h3 class="stat-value text-emerald-600">{{ visibleCount }}</h3>
          <p class="stat-desc">Đã ẩn: {{ reviews.length - visibleCount }} phản hồi</p>
        </div>
      </div>

      <div class="stat-card warning">
        <div class="stat-icon"><i class="bi bi-chat-left-dots-fill"></i></div>
        <div class="stat-content">
          <span class="stat-label">Phản hồi mới nhất</span>
          <h3 class="stat-value text-amber-600">{{ latestReviewDays }}</h3>
          <p class="stat-desc">Ngày kể từ lần đánh giá cuối</p>
        </div>
      </div>
    </div>

    <!-- ── Main Data Table ── -->
    <div class="main-data-card">
      <div class="card-header">
        <h3 class="card-title">Danh sách phản hồi</h3>
        <div class="search-filter-box">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Tìm kiếm theo tên hoặc email..." class="search-input" v-model="searchQuery" />
        </div>
      </div>

      <div class="table-responsive custom-scrollbar">
        <table class="data-table">
          <thead>
            <tr>
              <th>Thông tin khách hàng</th>
              <th>Bãi đỗ xe</th>
              <th>Mức độ hài lòng</th>
              <th>Nội dung góp ý</th>
              <th>Thời gian</th>
              <th class="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="review in filteredReviews" :key="review.id" :class="['table-row-hover', { 'row-hidden': review.isHidden }]">
              <td>
                <div class="user-info-cell">
                  <div class="avatar-placeholder">{{ review.user.fullName.charAt(0).toUpperCase() }}</div>
                  <div class="user-details">
                    <span class="user-name">{{ review.user.fullName }}</span>
                    <span class="user-email">{{ review.user.email }}</span>
                    <span v-if="review.isHidden" class="hidden-tag">Đã ẩn</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="lot-badge">
                  <i class="bi bi-geo-alt-fill"></i>
                  {{ review.parkingLot.name }}
                </span>
              </td>
              <td>
                <div class="rating-display-group">
                  <div class="stars-row">
                    <span v-for="i in 5" :key="i" :class="['star', { active: i <= review.rating }]">★</span>
                  </div>
                  <span :class="['rating-label', getRatingClass(review.rating)]">{{ getRatingLabel(review.rating) }}</span>
                </div>
              </td>
              <td class="comment-cell">
                <div class="comment-wrapper">
                  <p class="comment-text" :title="review.comment">{{ review.comment || 'Khách hàng không để lại lời nhắn.' }}</p>
                </div>
              </td>
              <td>
                <div class="date-cell">
                  <span class="time-text">{{ formatTime(review.createdAt) }}</span>
                  <span class="date-text">{{ formatDate(review.createdAt) }}</span>
                </div>
              </td>
              <td class="text-right">
                <button
                  :class="['btn-action', review.isHidden ? 'btn-show' : 'btn-hide']"
                  @click="toggleVisibility(review)"
                  :title="review.isHidden ? 'Hiện đánh giá' : 'Ẩn đánh giá'"
                >
                  <i :class="['bi', review.isHidden ? 'bi-eye-fill' : 'bi-eye-slash-fill']"></i>
                  {{ review.isHidden ? 'Hiện' : 'Ẩn' }}
                </button>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredReviews.length === 0">
              <td colspan="5" class="empty-state-cell">
                <div class="empty-state-content">
                  <div class="empty-icon">🍃</div>
                  <h4>Chưa có dữ liệu đánh giá</h4>
                  <p>Hệ thống hiện tại chưa nhận được phản hồi nào từ khách hàng.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner-box">
          <div class="spinner"></div>
          <p>Đang đồng bộ dữ liệu...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import apiClient from '@/services/api'

interface ReviewUser {
  fullName: string
  email: string
}

interface ReviewParkingLot {
  name: string
}

interface Review {
  id: number
  rating: number
  comment?: string
  isHidden: boolean
  createdAt: string
  user: ReviewUser
  parkingLot: ReviewParkingLot
}

const reviews = ref<Review[]>([])
const isLoading = ref(false)
const searchQuery = ref('')

const filteredReviews = computed(() => {
  if (!searchQuery.value) return reviews.value
  const q = searchQuery.value.toLowerCase()
  return reviews.value.filter(r =>
    r.user.fullName.toLowerCase().includes(q) ||
    r.user.email.toLowerCase().includes(q) ||
    r.parkingLot.name.toLowerCase().includes(q)
  )
})

const avgRating = computed(() => {
  const visibleReviews = reviews.value.filter(r => !r.isHidden)
  if (visibleReviews.length === 0) return 0
  const sum = visibleReviews.reduce((acc, r) => acc + r.rating, 0)
  return sum / visibleReviews.length
})

const visibleCount = computed(() => reviews.value.filter(r => !r.isHidden).length)

const latestReviewDays = computed(() => {
  const visibleReviews = reviews.value.filter(r => !r.isHidden)
  if (visibleReviews.length === 0) return '—'
  const last = new Date(visibleReviews[0]!.createdAt)
  const now = new Date()
  const diff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
  return diff === 0 ? 'Hôm nay' : `${diff} ngày trước`
})

const fetchReviews = async () => {
  isLoading.value = true
  try {
    const res = await apiClient.get('/admin/reviews/all')
    reviews.value = (res as unknown as Review[]).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch (error) {
    console.error('Lỗi tải đánh giá:', error)
  } finally {
    isLoading.value = false
  }
}

const toggleVisibility = async (review: Review) => {
  try {
    const res = await apiClient.put(`/admin/reviews/${review.id}/toggle-visibility`) as { status?: string; isHidden?: boolean }
    if (res.status === 'success') {
      review.isHidden = res.isHidden ?? !review.isHidden
    }
  } catch (error) {
    console.error('Lỗi thay đổi trạng thái hiển thị:', error)
    alert('Không thể thực hiện thao tác này. Vui lòng thử lại!')
  }
}

const getRatingLabel = (rating: number) => {
  const labels = ['Rất tệ', 'Tệ', 'Bình thường', 'Hài lòng', 'Tuyệt vời']
  return labels[rating - 1] || ''
}

const getRatingClass = (rating: number) => {
  if (rating >= 4) return 'positive'
  if (rating === 3) return 'neutral'
  return 'negative'
}

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

onMounted(fetchReviews)
</script>

<style scoped>
.page-wrap {
  padding: 24px 32px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #f8fafc;
}

/* ── Toolbar ── */
.toolbar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 28px; background: white; padding: 18px 24px;
  border-radius: 20px; border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}
.toolbar-left { display: flex; align-items: center; gap: 18px; }
.icon-box {
  width: 50px; height: 50px; border-radius: 14px;
  background: linear-gradient(135deg, #2563eb, #1e4ed8);
  display: flex; align-items: center; justify-content: center;
  color: white; box-shadow: 0 6px 16px rgba(37,99,235,0.25);
}
.page-title { margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
.page-sub { margin: 4px 0 0; font-size: 13px; color: #64748b; font-weight: 500; }

.btn-refresh {
  background: white; color: #2563eb; border: 1.5px solid #e2e8f0;
  padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 700;
  display: flex; align-items: center; gap: 10px; cursor: pointer; transition: all 0.2s;
}
.btn-refresh:hover { background: #f8fafc; border-color: #2563eb; transform: translateY(-1px); }
.btn-refresh:active { transform: translateY(0); }

/* ── Stats Grid ── */
.stats-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px;
}
.stat-card {
  background: white; padding: 24px; border-radius: 20px; border: 1px solid #e2e8f0;
  display: flex; align-items: flex-start; gap: 20px; transition: transform 0.2s;
}
.stat-card:hover { transform: translateY(-4px); }
.stat-icon {
  width: 52px; height: 52px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center; font-size: 24px;
}
.stat-card.primary .stat-icon { background: #eff6ff; color: #2563eb; }
.stat-card.success .stat-icon { background: #ecfdf5; color: #10b981; }
.stat-card.warning .stat-icon { background: #fff7ed; color: #f59e0b; }

.stat-label { font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-value-group { display: flex; align-items: baseline; gap: 6px; margin-top: 6px; }
.stat-value { margin: 0; font-size: 28px; font-weight: 900; line-height: 1.2; }
.stat-unit { font-size: 14px; font-weight: 700; color: #94a3b8; }
.stat-desc { margin: 4px 0 0; font-size: 13px; color: #94a3b8; font-weight: 500; }

.mini-stars { display: flex; gap: 2px; margin-top: 8px; }
.mini-star { color: #e2e8f0; font-size: 14px; }
.mini-star.active { color: #f59e0b; }

/* ── Data Card ── */
.main-data-card {
  background: white; border-radius: 24px; border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(0,0,0,0.02); overflow: hidden; position: relative;
}
.card-header {
  padding: 24px; border-bottom: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;
}
.card-title { margin: 0; font-size: 17px; font-weight: 800; color: #0f172a; }

.search-filter-box {
  position: relative; min-width: 320px;
}
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 16px; }
.search-input {
  width: 100%; padding: 10px 16px 10px 42px; border-radius: 12px;
  border: 1.5px solid #f1f5f9; background: #f8fafc; font-size: 14px;
  outline: none; transition: all 0.2s;
}
.search-input:focus { border-color: #2563eb; background: white; box-shadow: 0 0 0 4px rgba(37,99,235,0.05); }

/* ── Table ── */
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  background: #f8fafc; padding: 16px 24px; text-align: left;
  font-size: 12px; font-weight: 800; color: #64748b;
  text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #f1f5f9;
}
.data-table td { padding: 20px 24px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
.table-row-hover:hover { background-color: #fcfdfe; }

/* ── Hidden State ── */
.row-hidden { background-color: #f8fafc; opacity: 0.7; }
.hidden-tag {
  font-size: 10px; font-weight: 800; background: #94a3b8; color: white;
  padding: 1px 6px; border-radius: 4px; text-transform: uppercase; margin-top: 2px; width: fit-content;
}

/* ── Action Buttons ── */
.btn-action {
  padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 700;
  display: inline-flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;
  border: 1.5px solid transparent;
}
.btn-hide { background: #fff1f2; color: #e11d48; border-color: #fecdd3; }
.btn-hide:hover { background: #ffe4e6; border-color: #e11d48; }
.btn-show { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
.btn-show:hover { background: #dcfce7; border-color: #16a34a; }

.user-info-cell { display: flex; align-items: center; gap: 12px; }
.avatar-placeholder {
  width: 42px; height: 42px; border-radius: 12px; background: #f1f5f9;
  display: flex; align-items: center; justify-content: center;
  color: #2563eb; font-weight: 800; font-size: 16px;
}
.user-details { display: flex; flex-direction: column; }
.user-name { font-weight: 700; color: #1e293b; font-size: 14px; }
.user-email { font-size: 12px; color: #94a3b8; font-weight: 500; }

.lot-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: #f1f5f9; color: #475569; padding: 6px 12px;
  border-radius: 10px; font-size: 12px; font-weight: 700;
}
.lot-badge i { color: #ef4444; font-size: 14px; }

.rating-display-group { display: flex; flex-direction: column; gap: 4px; }
.stars-row { color: #e2e8f0; font-size: 18px; letter-spacing: 2px; }
.stars-row .star.active { color: #f59e0b; }
.rating-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
.rating-label.positive { color: #10b981; }
.rating-label.neutral { color: #f59e0b; }
.rating-label.negative { color: #ef4444; }

.comment-cell { max-width: 350px; }
.comment-wrapper {
  background: #f8fafc; padding: 12px 16px; border-radius: 12px; border: 1px solid #f1f5f9;
}
.comment-text {
  margin: 0; color: #475569; font-size: 13px; line-height: 1.5; font-style: italic;
  display: -webkit-box; line-clamp: 2; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.date-cell { display: flex; flex-direction: column; align-items: flex-end; }
.time-text { font-size: 14px; font-weight: 800; color: #1e293b; }
.date-text { font-size: 12px; color: #94a3b8; font-weight: 600; }

.text-right { text-align: right; }
.text-blue-600 { color: #2563eb; }
.text-emerald-600 { color: #10b981; }
.text-amber-600 { color: #f59e0b; }

/* ── Empty State ── */
.empty-state-cell { padding: 80px 0; }
.empty-state-content { text-align: center; color: #94a3b8; }
.empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
.empty-state-content h4 { margin: 0; font-size: 16px; color: #64748b; font-weight: 800; }
.empty-state-content p { margin: 8px 0 0; font-size: 14px; }

/* ── Loading Overlay ── */
.loading-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.8); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 10;
}
.spinner-box { text-align: center; }
.spinner {
  width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #2563eb;
  border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }

.animated { animation-duration: 0.5s; animation-fill-mode: both; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.fadeIn { animation-name: fadeIn; }

/* ── Responsive ── */
@media (max-width: 1100px) {
  .stats-grid { grid-template-columns: 1fr; }
  .search-filter-box { min-width: 100%; }
}
</style>
