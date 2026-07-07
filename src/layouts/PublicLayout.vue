<template>
  <div class="public-portal-layout animated fade-in">
    <PortalHeader />

    <main class="public-main-content-viewport">
      <router-view v-slot="{ Component }">
        <transition name="premium-portal-fade" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
    </main>

    <PortalFooter />
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
// LƯU Ý BÁC: Hãy đảm bảo hai file PortalHeader và PortalFooter đã nằm đúng trong thư mục 'components/public' này nhé!
import PortalHeader from '@/components/public/PortalHeader.vue'
import PortalFooter from '@/components/public/PortalFooter.vue'

const route = useRoute()

// KHẮC PHỤC LỖI UX CHÍ TỬ: Tự động ép trình duyệt cuộn mượt về đỉnh đầu (Top 0) mỗi khi chuyển trang công cộng
watch(() => route.path, () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Tạo xung lực cuộn lướt êm ái lên đỉnh đầu
  })
})
</script>

<style scoped>
.public-portal-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
}

.public-main-content-viewport {
  flex: 1;
  /* Cách đỉnh một khoảng 72px bằng đúng chiều cao thu gọn của rèm mờ kính PortalHeader xịn */
  padding-top: 72px;
  box-sizing: border-box;
  background-color: #ffffff;
}

/* --- HOẠT ẢNH TRANSITION FADE-SLIDE CAO CẤP CHUẨN PORTAL QUỐC TẾ --- */
.premium-portal-fade-enter-active {
  transition: all 0.28s cubic-bezier(0.215, 0.610, 0.355, 1); /* Sử dụng Cubic Bezier snappier */
}
.premium-portal-fade-leave-active {
  transition: all 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Hiệu ứng trượt lướt mờ dần cực kỳ nhẹ nhàng dịu mắt, không bị giật nảy thô kệch */
.premium-portal-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.premium-portal-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Hoạt ảnh fade-in nhẹ khi load layout lần đầu */
.animated { animation-duration: 0.35s; animation-fill-mode: both; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.fade-in { animation-name: fadeIn; }
</style>
