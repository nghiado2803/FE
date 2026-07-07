<template>
  <header class="modern-mobile-header">
    <div class="header-inner-flex-container">

      <div class="header-left-action-zone">
        <button v-if="showBack" class="header-btn-back-arrow" @click="handleBackClick" aria-label="Quay lại">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div v-else class="header-logo-brand animate-fade-in">
          <span class="logo-main-text">Smart<span class="text-blue-brand-color">Park</span></span>
        </div>
      </div>

      <h1 v-if="title" class="header-page-center-title animate-fade-in">
        {{ title }}
      </h1>

      <div class="header-right-action-zone">
        <div class="header-action-group">
          <button
            v-if="showNotifications"
            class="header-btn-icon-bell"
            @click="handleNotificationClick"
            aria-label="Thông báo"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span v-if="hasUnread" class="notification-pulse-badge-dot"></span>
          </button>

          <router-link
            v-if="showAvatar"
            to="/customer/profile"
            class="header-avatar-link"
            aria-label="Hồ sơ"
          >
            <div class="header-avatar-circle">
              <img
                v-if="userAvatar"
                :src="userAvatar"
                alt="Avatar"
                class="avatar-image"
              />
              <span v-else class="avatar-initial">
                {{ userInitial }}
              </span>
            </div>
          </router-link>

          <slot name="right"></slot>
        </div>
      </div>

    </div>

    <Transition name="alert-bounce">
      <div v-if="showCustomAlert" class="custom-alert-blur-overlay" @click="closeCustomAlert">
        <div class="custom-alert-card-box" @click.stop>
          <div class="alert-header-bell-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <h3 class="alert-core-title">Thông báo hệ thống</h3>
          <p class="alert-core-message-text">{{ customAlertMessage }}</p>
          <button class="alert-core-confirm-action-btn" @click="closeCustomAlert">Xác nhận</button>
        </div>
      </div>
    </Transition>

  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'
import { useAuthStore } from '@/stores/authStore'

defineProps({
  title: { type: String, default: '' },
  showBack: { type: Boolean, default: false },
  showNotifications: { type: Boolean, default: false },
  showAvatar: { type: Boolean, default: false }
})

const emit = defineEmits(['back'])
const router = useRouter()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()

// Các biến quản lý trạng thái hiển thị thông báo tùy biến
const showCustomAlert = ref(false)
const customAlertMessage = ref('')
const hasUnread = computed(() => notificationStore.unreadCount > 0)

// Avatar và initial
const userAvatar = computed(() => authStore.user?.avatarUrl || '')
const userInitial = computed(() => {
  const name = authStore.user?.fullName || 'K'
  return name.charAt(0).toUpperCase()
})

const handleBackClick = () => {
  emit('back')
  router.back()
}

// Chuyển đổi từ alert() nguyên bản sang cấu trúc modal in-app
const handleNotificationClick = async () => {
  await notificationStore.fetchNotifications()
  const notifications = notificationStore.notifications
  if (notifications && notifications.length > 0) {
    const latest = notifications[0]!
    customAlertMessage.value = latest.content
    showCustomAlert.value = true

    // Đánh dấu đã đọc
    if (!latest.isRead) {
      await notificationStore.markAsRead(latest.id)
    }
  } else {
    customAlertMessage.value = 'Bạn không có thông báo mới nào.'
    showCustomAlert.value = true
  }
}

const closeCustomAlert = () => {
  showCustomAlert.value = false
}

// Lắng nghe sự kiện notification để hiện thông báo nhanh (Toast)
const handleFastNotif = (e: Event) => {
  const notif = (e as CustomEvent<{ type: string }>).detail
  // Có thể hiện một thông báo nhỏ ở đây hoặc rung máy
  console.log('Realtime Notif:', notif)
}

onMounted(() => {
  if (notificationStore.unreadCount === 0) {
    notificationStore.fetchUnreadCount()
  }
  window.addEventListener('app-notification', handleFastNotif)
})

onUnmounted(() => {
  window.removeEventListener('app-notification', handleFastNotif)
})
</script>

<style scoped>
.modern-mobile-header {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 56px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #f1f5f9;
  z-index: 100;
  box-sizing: border-box;
  padding-top: env(safe-area-inset-top);
}

.header-inner-flex-container {
  display: flex; justify-content: space-between; align-items: center;
  height: 100%; padding: 0 16px; position: relative; width: 100%; box-sizing: border-box;
}

.header-left-action-zone, .header-right-action-zone {
  display: flex; align-items: center; min-width: 60px; z-index: 5;
}
.header-right-action-zone { justify-content: flex-end; }

.header-btn-back-arrow {
  background: none; border: none; padding: 6px; margin-left: -6px;
  color: #334155; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: color 0.15s ease;
}
.header-btn-back-arrow:hover { color: #2563eb; }

.header-logo-brand { display: flex; align-items: center; }
.logo-main-text {
  font-family: 'Montserrat', system-ui, sans-serif;
  font-size: 17px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;
}
.text-blue-brand-color { color: #2563eb; }

.header-page-center-title {
  position: absolute; left: 0; top: 0; width: 100%; height: 100%; margin: 0;
  font-size: 15px; font-weight: 800; color: #0f172a;
  display: flex; align-items: center; justify-content: center;
  padding: 0 76px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  box-sizing: border-box; z-index: 1;
}

.header-btn-icon-bell {
  background: none; border: none; padding: 6px; position: relative;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.notification-pulse-badge-dot {
  position: absolute; top: 4px; right: 5px; width: 6px; height: 6px;
  background-color: #ef4444; border-radius: 50%; border: 1.5px solid white;
}

.header-action-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-btn-icon-login,
.header-btn-icon-logout {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 12px;
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.header-btn-icon-login:hover,
.header-btn-icon-logout:hover {
  background: rgba(37, 99, 235, 0.14);
}

/* --- HỆ THỐNG CSS ĐỒ HỌA CHO HỘP THOẠI THÔNG BÁO MỚI (CHẮN CHỮ LOCALHOST) --- */
.custom-alert-blur-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: calc(100vh + 200px); /* Phủ tràn toàn màn hình viewport */
  background: rgba(15, 23, 42, 0.25); /* Lớp rèm tối nhẹ mờ kính */
  backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center;
  padding: 0 24px; box-sizing: border-box;
  z-index: 99999; /* Đảm bảo đè bẹp dí mọi tầng hoạt ảnh lướt trang con */
}

.custom-alert-card-box {
  background: #ffffff;
  width: 100%; max-width: 320px; /* Khóa chặt phom dáng vừa khít lòng điện thoại */
  border-radius: 20px; padding: 24px 20px;
  box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.15), 0 10px 10px -5px rgba(15, 23, 42, 0.04);
  display: flex; flex-direction: column; align-items: center; text-align: center;
  box-sizing: border-box;
}

.alert-header-bell-icon {
  width: 48px; height: 48px; border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.alert-core-title {
  margin: 0 0 8px 0; font-size: 16px; font-weight: 800; color: #0f172a;
}
.alert-core-message-text {
  margin: 0 0 20px 0; font-size: 13px; color: #475569; font-weight: 600;
  line-height: 1.6; padding: 0 4px;
}

.alert-core-confirm-action-btn {
  width: 100%; background-color: #f1f5f9; color: #1e293b;
  border: none; padding: 12px; border-radius: 12px;
  font-size: 13.5px; font-weight: 700; cursor: pointer;
  transition: all 0.15s ease-in-out;
}
.alert-core-confirm-action-btn:active {
  background-color: #e2e8f0; color: #0f172a;
}

/* Hoạt ảnh bounce nảy nhẹ kiểu iOS khi popup hiện hình */
.alert-bounce-enter-active {
  transition: opacity 0.25s ease-out;
}
.alert-bounce-leave-active {
  transition: opacity 0.15s ease-in;
}
.alert-bounce-enter-active .custom-alert-card-box {
  animation: alertPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.alert-bounce-leave-active .custom-alert-card-box {
  transform: scale(0.92); transition: transform 0.15s ease-in;
}

.alert-bounce-enter-from, .alert-bounce-leave-to { opacity: 0; }

@keyframes alertPop {
  0% { transform: scale(0.85); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.animate-fade-in { animation: fadeIn 0.2s ease-in-out both; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-2px); } to { opacity: 1; transform: translateY(0); } }
</style>
