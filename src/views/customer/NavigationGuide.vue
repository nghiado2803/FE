<template>
  <div class="customer-mobile-app animated fade-in no-padding">

    <div class="map-full-viewport">
      <iframe
        :src="`https://maps.google.com/maps?q=${navParams.lat},${navParams.lng}&t=&z=16&ie=UTF8&iwloc=&output=embed`"
        width="100%"
        height="100%"
        style="border:0;"
        allowfullscreen="false"
        loading="lazy"
      ></iframe>

      <button class="btn-close-floating-circle" @click="handleExitNavigation">✕</button>
    </div>

    <div class="nav-bottom-panel-card">
      <div class="panel-drag-handle"></div>

      <div class="next-step-instruction-row border-bottom">
        <div class="direction-turn-icon-view">
          {{ navParams.lotId === '2' ? '⬅️' : '⬆️' }}
        </div>
        <div class="step-text-info">
          <h3>{{ navParams.nextStepTitle }}</h3>
          <p class="text-muted text-xs margin-top-2">{{ navParams.nextStepDesc }}</p>
        </div>
      </div>

      <div class="nav-summary-action-bar">
        <div class="navigation-stats-box">
          <strong class="duration-highlight-text">{{ navParams.durationStr }}</strong>
          <span class="distance-sub-text">({{ navParams.distanceStr }})</span>
        </div>

        <button class="btn-open-google-maps-app" @click="openOfficialGoogleMaps">
          MỞ BẰNG GOOGLE MAPS 🧭
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Cấu trúc State hứng thông số định vị động từ trang vé xe truyền sang
const navParams = ref({
  lotId: '1',
  lat: 13.7758,
  lng: 109.2205,
  durationStr: '5 phút',
  distanceStr: '1.2 km',
  nextStepTitle: 'Đi thẳng 200m',
  nextStepDesc: 'Đến ngã tư Nguyễn Tất Thành - Ngô Mây rẽ trái để vào cổng bãi đỗ.'
})

const parseNavigationRouteData = () => {
  const query = route.query
  const lotId = (query.lotId as string) || '1'

  if (lotId === '2' || query.lotName?.toString().includes('Đại học')) {
    // Nếu điểm đến là bãi Đại học Quy Nhơn, đổi context sang đường An Dương Vương
    navParams.value = {
      lotId: '2',
      lat: 13.7634,
      lng: 109.2156,
      durationStr: '8 phút',
      distanceStr: '2.4 km',
      nextStepTitle: 'Rẽ trái sau 100m',
      nextStepDesc: 'Di chuyển dọc trục đường An Dương Vương, rẽ vào cổng phụ Đại học Quy Nhơn.'
    }
  } else {
    // Mặc định bãi Quảng trường Trung tâm Quy Nhơn
    navParams.value = {
      lotId: '1',
      lat: 13.7758,
      lng: 109.2205,
      durationStr: '4 phút',
      distanceStr: '1.1 km',
      nextStepTitle: 'Đi thẳng 200m',
      nextStepDesc: 'Đến ngã tư Nguyễn Tất Thành - Ngô Mây rẽ trái để vào bãi Quảng trường.'
    }
  }
}

// ĐÃ SỬA LỖI CÚ PHÁP: Sử dụng đúng cú pháp URL Scheme chính thức của Google Maps toàn cầu
const openOfficialGoogleMaps = () => {
  const lat = navParams.value.lat
  const lng = navParams.value.lng

  // URL chuẩn mở chỉ đường trên cả máy tính lẫn ứng dụng điện thoại iOS/Android
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  window.open(googleMapsUrl, '_blank')
}

const handleExitNavigation = () => {
  router.push('/customer/home')
}

onMounted(() => {
  // định vị bãi xe từ Query string
  parseNavigationRouteData()
})
</script>

<style scoped>
@import '@/assets/styles/admin-shared.css';

.no-padding { padding: 0 !important; overflow: hidden; }
.customer-mobile-app { max-width: 440px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; position: relative; box-shadow: 0 0 24px rgba(15, 23, 42, 0.1); border-radius: 16px; box-sizing: border-box; background-color: #e2e8f0; }
.margin-top-2 { margin-top: 2px; }
.border-bottom { border-bottom: 1px solid #f1f5f9; }
.text-xs { font-size: 12px; }

/* Viewport Bản đồ chiếm trọn khung nền */
.map-full-viewport { flex: 1; min-height: calc(100vh - 180px); position: relative; z-index: 1; }

.btn-close-floating-circle { position: absolute; top: 16px; right: 16px; width: 38px; height: 38px; border-radius: 50%; border: 1px solid #cbd5e1; background: white; color: #334155; font-size: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15); z-index: 10; transition: 0.2s; }
.btn-close-floating-circle:hover { background-color: #f8fafc; color: #0f172a; }

/* Bảng thông tin lộ trình Bottom Panel bo cong lướt nhẹ phía dưới */
.nav-bottom-panel-card { background: white; border-radius: 24px 24px 0 0; padding: 20px 16px; position: relative; z-index: 5; margin-top: -24px; box-shadow: 0 -8px 25px -5px rgba(0, 0, 0, 0.08); display: flex; flex-direction: column; box-sizing: border-box; }
.panel-drag-handle { width: 36px; height: 4px; background: #cbd5e1; border-radius: 4px; margin: 0 auto 16px; }

/* Khu vực hiển thị icon rẽ/đi thẳng */
.next-step-instruction-row { display: flex; align-items: center; gap: 16px; padding-bottom: 16px; margin-bottom: 16px; text-align: left; }
.direction-turn-icon-view { font-size: 32px; background-color: #f1f5f9; width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; }
.step-text-info { flex: 1; }
.step-text-info h3 { margin: 0; font-size: 16px; color: #0f172a; font-weight: 800; }

/* Thanh tổng kết và nút điều hướng ứng dụng ngoài */
.nav-summary-action-bar { display: flex; justify-content: space-between; align-items: center; }
.navigation-stats-box { display: flex; flex-direction: column; text-align: left; }
.duration-highlight-text { font-size: 22px; color: #10b981; font-weight: 900; }
.distance-sub-text { color: #94a3b8; font-size: 12px; font-weight: 700; margin-top: 1px; }

.btn-open-google-maps-app { background: #0f172a; color: white; border: none; padding: 12px 16px; border-radius: 10px; font-weight: 800; font-size: 12px; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.15); letter-spacing: 0.3px; }
.btn-open-google-maps-app:hover { background-color: #1e293b; }
</style>
