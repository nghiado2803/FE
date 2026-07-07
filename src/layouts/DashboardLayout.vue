<template>
  <div class="modern-dashboard-layout animated fade-in">
    <Sidebar :isCollapsed="isCollapsed" />

    <div :class="['main-content-wrapper', { 'is-sidebar-collapsed-expanded': isCollapsed }]">

      <DashboardHeader @toggle-sidebar="handleToggleSidebar" />

      <main ref="dashboardContentRef" class="dashboard-core-viewport-content">
        <router-view v-slot="{ Component }">
          <transition name="premium-dashboard-fade" mode="out-in">
            <keep-alive include="ScannerCheckIn">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </main>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
// ĐỒNG BỘ CHUẨN XÁC: Import hít trúng đích vị trí thư mục management ngoài ổ cứng của bác
import Sidebar from '@/components/management/Sidebar.vue'
import DashboardHeader from '@/components/management/DashboardHeader.vue'

const route = useRoute()
const isCollapsed = ref(false)
const dashboardContentRef = ref<HTMLElement | null>(null) // Tạo con trỏ liên kết vùng cuộn chuột

const handleToggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

// KHẮC PHỤC LỖI UX CHÍ TỬ: Tự động reset thanh cuộn mượt lên đỉnh đầu mỗi khi chuyển trang quản trị
watch(() => route.path, () => {
  if (dashboardContentRef.value) {
    dashboardContentRef.value.scrollTo({
      top: 0,
      behavior: 'smooth' // Cuộn lướt êm ái lên đỉnh
    })
  }
})
</script>

<style scoped>
.modern-dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc; /* Đổi sang màu xám Slate nhẹ sang trọng, làm nổi bật các thẻ Card dữ liệu */
  font-family: system-ui, -apple-system, sans-serif;
}

.main-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 260px; /* Khớp khít biên với độ rộng Sidebar bập bùng */
  transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 0; /* Chặn đứng hoàn toàn lỗi tràn vỡ layout con bên trong Flexbox */
}

/* Khi sidebar co lại, vùng nội dung tự động nở rộng mượt mà */
.main-content-wrapper.is-sidebar-collapsed-expanded {
  margin-left: 78px;
}

.dashboard-core-viewport-content {
  flex: 1;
  padding: 28px; /* Tăng khoảng giãn cách cho phom dáng ma trận thông thoáng */
  overflow-x: hidden;
  overflow-y: auto;
  box-sizing: border-box;
}

/* Tinh chỉnh thanh cuộn nội bộ Admin tinh tế, mỏng nhẹ chuẩn SaaS */
.dashboard-core-viewport-content::-webkit-scrollbar {
  width: 6px;
}
.dashboard-core-viewport-content::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}
.dashboard-core-viewport-content::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}

/* --- HOẠT ẢNH CHUYỂN TRANG ADMIN ĐẦM CHẮC, CAO CẤP (FADE & SLIGHT ELEVATION) --- */
.premium-dashboard-fade-enter-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.premium-dashboard-fade-leave-active {
  transition: all 0.15s ease-in-out;
}

/* Thay vì trượt ngang bẻ gãy trục, sử dụng hiệu ứng nâng phom mờ dần lên snappier */
.premium-dashboard-fade-enter-from {
  transform: translateY(6px);
  opacity: 0;
}
.premium-dashboard-fade-leave-to {
  transform: translateY(-4px);
  opacity: 0;
}

.animated { animation-duration: 0.35s; animation-fill-mode: both; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.fade-in { animation-name: fadeIn; }
</style>
