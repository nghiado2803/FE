<template>
  <div class="customer-global-wrapper">
    <div class="mobile-simulator-container">

      <MobileHeader
        :title="currentTitle"
        :showBack="shouldShowBack"
        :showNotifications="isCustomerAuthenticated"
      >
        <template #right>
          <button
            v-if="!isCustomerAuthenticated"
            class="header-btn-icon-login"
            @click="openCustomerLogin"
            title="Đăng nhập"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15" />
              <path d="M11.25 12H21m-3-3l3 3-3 3" />
            </svg>
          </button>
          <button
            v-else
            class="header-btn-icon-logout"
            @click="handleCustomerLogout"
            title="Đăng xuất"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16.5 12H8.25" />
              <path d="M12.75 15.75l-3-3 3-3" />
              <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </button>
        </template>
      </MobileHeader>

      <main class="mobile-main-content-viewport">
        <router-view v-slot="{ Component }">
          <transition name="mobile-native-slide">
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </router-view>
      </main>

      <BottomNavigation />

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// ĐÃ SỬA LỖI ĐƯỜNG DẪN: Khớp nối chuẩn xác 100% vị trí file trong thư mục customer của bác
import MobileHeader from '@/components/customer/MobileHeader.vue'
import BottomNavigation from '@/components/customer/BottomNavigation.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isCustomerAuthenticated = computed(() => authStore.isCustomer)

// Tự động trích xuất tiêu đề động từ cấu hình meta của file router
const currentTitle = computed(() => (route.meta.title as string) || 'SmartPark')

const openCustomerLogin = () => {
  if (route.path !== '/customer/auth') {
    router.push('/customer/auth')
  }
}

const handleCustomerLogout = () => {
  authStore.logout()
  router.push('/customer/home')
}

// Tự động kiểm tra xem trang con có nhu cầu thắp sáng nút mũi tên quay lại hay không
const shouldShowBack = computed(() => !!route.meta.showBack)
</script>

<style scoped>
/* Khung nền xám bao bọc tạo bối cảnh giả lập Mobile sang trọng trên PC */
.customer-global-wrapper {
  min-height: 100vh;
  background-color: #e2e8f0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  box-sizing: border-box;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* KHUNG GIẢ LẬP ĐIỆN THOẠI CHUẨN ĐỒ HỌA MÁY TITAN */
.mobile-simulator-container {
  width: 100%;
  max-width: 440px;
  height: calc(100vh - 40px);
  min-height: 640px;
  max-height: 880px;
  background-color: #f8fafc;
  position: relative;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 4px solid #1e293b;
}

/* Trên điện thoại thật: bỏ khung giả lập, chiếm toàn màn hình */
@media (max-width: 500px) {
  .customer-global-wrapper {
    padding: 0;
    background-color: #f8fafc;
    align-items: flex-start;
  }

  .mobile-simulator-container {
    max-width: 100%;
    height: 100vh;
    min-height: 100vh;
    max-height: none;
    border-radius: 0;
    border: none;
    box-shadow: none;
  }
}

/* Vùng nội dung lòng ứng dụng */
.mobile-main-content-viewport {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  background-color: #f8fafc;
  /* Chừa không gian khít cho Header đỉnh (56px) và BottomNav đáy (58px + padding) */
  padding-top: 56px;
  padding-bottom: 64px;
  box-sizing: border-box;
}

/* Triệt tiêu thanh scrollbar mặc định của trình duyệt để vuốt chạm như app thật */
.mobile-main-content-viewport::-webkit-scrollbar {
  display: none;
}
.mobile-main-content-viewport {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* --- TOÀN DIỆN THUẬT TOÁN HOẠT ẢNH CHUYỂN TRANG LAYER MƯỢT MÀ KHÔNG GIẬT LẮC --- */
.mobile-native-slide-enter-active,
.mobile-native-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.32, 0.94, 0.6, 1), opacity 0.3s ease-in-out;
}

/* ĐÃ SỬA LOGIC VỊ TRÍ: Trả về top 0 để ăn khớp khít lòng padding-top của hộp cha */
.mobile-native-slide-enter-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}
.mobile-native-slide-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Trang mới: Từ biên phải lướt tịnh tiến sang trái đè lên */
.mobile-native-slide-enter-from {
  transform: translateX(100%);
  opacity: 0.8;
}

/* Trang cũ: Bị đẩy nhẹ sang trái âm và mờ dần đi quý phái */
.mobile-native-slide-leave-to {
  transform: translateX(-24px);
  opacity: 0;
}

.customer-login-action-btn {
  border: 0;
  border-radius: 999px;
  background-color: #2563eb;
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.customer-login-action-btn:hover {
  background-color: #1d4ed8;
}
</style>
