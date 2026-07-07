<template>
  <header class="dashboard-header-premium animated fade-in">
    <div class="header-left-zone">
      <button class="icon-action-btn menu-toggle" @click="$emit('toggle-sidebar')" title="Mở/Đóng thanh thực đơn">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
    </div>

    <div class="header-right-zone">

      <div class="user-profile-pill-wrapper">
        <div class="user-pill-container" :class="{ 'is-active-dropdown': isUserMenuOpen }" @click.stop="toggleUserMenu">
          <img
            :src="authStore.user?.avatarUrl || `https://ui-avatars.com/api/?name=${authStore.user?.fullName || 'Admin'}&background=dbeafe&color=2563eb&bold=true`"
            alt="User Account Avatar"
            class="avatar-circle-img"
          />
          <div class="user-meta-data-text">
            <span class="user-display-name">{{ authStore.user?.fullName || 'Quản Trị Viên' }}</span>
            <span class="user-role-tag-badge">{{ displayRole }}</span>
          </div>
          <svg class="chevron-arrow-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>

        <Transition name="dropdown-slide-up">
          <div v-if="isUserMenuOpen" class="modern-management-dropdown">
            <div class="dropdown-header-profile-box">
              <strong>{{ langStore.t.operatingAccount }}</strong>
              <span class="text-truncated-email">{{ authStore.user?.username || 'admin@smartpark.vn' }}</span>
            </div>

            <div class="dropdown-divider-line"></div>

            <a href="#" class="dropdown-action-item" @click.prevent="navigateToProfile">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              {{ langStore.t.accountInfo }}
            </a>

            <div class="dropdown-divider-line"></div>

            <a href="#" class="dropdown-action-item logout-red-action-item" @click.prevent="handleLogout">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              {{ langStore.t.logout }}
            </a>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useLangStore } from '@/stores/langStore'

const router = useRouter()
const authStore = useAuthStore()
const langStore = useLangStore()

const isUserMenuOpen = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null) // Tạo con trỏ liên kết ô tìm kiếm
const displayRole = computed(
  () => authStore.adminRole || authStore.customerRole || 'BQL Hệ thống'
)

defineEmits(['toggle-sidebar'])

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const focusSearchInputElement = () => {
  if (searchInputRef.value) searchInputRef.value.focus()
}

// NÂNG CẤP NGHIỆP VỤ 1: THUẬT TOÁN ĐÁNH CHẶN LẮNG NGHE PHÍM TẮT CTRL + K THỜI GIAN THỰC
const handleGlobalKeyboardShortcut = (event: KeyboardEvent) => {
  // Nhận diện tổ hợp Ctrl + K hoặc Cmd + K (trên MacOS)
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault() // Ngăn chặn hành vi tìm kiếm mặc định của trình duyệt web
    focusSearchInputElement()
  }
}

// Đóng dropdown khi click trượt ra ngoài vùng quản trị
const handleOutsideClickDismiss = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-profile-pill-wrapper')) {
    isUserMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleOutsideClickDismiss)
  window.addEventListener('keydown', handleGlobalKeyboardShortcut) // Đăng ký phím tắt toàn cục
})

onUnmounted(() => {
  window.removeEventListener('click', handleOutsideClickDismiss)
  window.removeEventListener('keydown', handleGlobalKeyboardShortcut) // Dọn dẹp sạch sẽ chống Memory Leak
})

const navigateToProfile = () => {
  isUserMenuOpen.value = false
  if (authStore.isAdmin) {
    router.push('/admin/profile')
  } else if (authStore.isStaff) {
    router.push('/staff/profile')
  }
}

// NÂNG CẤP NGHIỆP VỤ 2: ĐỒNG BỘ ĐƯỜNG TRUYỀN ĐĂNG XUẤT VỀ CỔNG THỰC ĐƠN CHUẨN
const handleLogout = () => {
  isUserMenuOpen.value = false
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
button { border: none; background: none; cursor: pointer; color: inherit; }

.dashboard-header-premium {
  height: 64px;
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 90;
}

.header-left-zone, .header-right-zone { display: flex; align-items: center; gap: 16px; }

/* Icon button format */
.icon-action-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #64748b;
  transition: all 0.2s ease-in-out;
}
.icon-action-btn:hover { background-color: #f1f5f9; color: #0f172a; }
.icon-action-btn svg { width: 20px; height: 20px; }

/* Thanh tìm kiếm thông minh */
.search-bar-inner-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #f1f5f9;
  border-radius: 10px;
  padding: 8px 14px;
  border: 1px solid transparent;
  transition: all 0.2s;
  cursor: text;
}
.search-bar-inner-wrapper:focus-within {
  background-color: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.search-lens-icon { color: #94a3b8; width: 18px; height: 18px; }
.search-core-input {
  border: none; background: transparent; outline: none;
  font-size: 13.5px; width: 260px; color: #0f172a; font-weight: 600;
}
.search-core-input::placeholder { color: #94a3b8; font-weight: 500; }

.search-keyboard-hint-badge {
  font-size: 10px; font-weight: 700; color: #94a3b8;
  background: white; border: 1px solid #cbd5e1;
  padding: 1.5px 5px; border-radius: 5px; user-select: none;
}

/* Chấm báo hiệu Notification chuông */
.notification-bell-btn { position: relative; }
.pulse-danger-badge-dot {
  position: absolute; top: 9px; right: 9px;
  width: 7px; height: 7px;
  background-color: #ef4444; border-radius: 50%;
  border: 1.5px solid #ffffff;
}

/* Khối kén thông tin Account viên */
.user-profile-pill-wrapper { position: relative; }
.user-pill-container {
  display: flex; align-items: center; gap: 10px;
  padding: 5px 12px 5px 6px;
  border-radius: 9999px;
  background-color: white;
  border: 1px solid #e2e8f0;
  cursor: pointer; transition: all 0.2s ease-in-out;
  user-select: none;
}
.user-pill-container:hover, .user-pill-container.is-active-dropdown {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

.avatar-circle-img { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid #e2e8f0; }
.user-meta-data-text { display: flex; flex-direction: column; text-align: left; }
.user-display-name { font-size: 13px; font-weight: 700; color: #0f172a; }
.user-role-tag-badge { font-size: 11px; font-weight: 600; color: #64748b; margin-top: -2px; }

.chevron-arrow-icon { width: 14px; height: 14px; color: #94a3b8; transition: transform 0.2s; }
.user-pill-container.is-active-dropdown .chevron-arrow-icon { transform: rotate(180deg); color: #0f172a; }

/* Thiết kế Dropdown thực đơn rộng rãi phẳng phiu */
.modern-management-dropdown {
  position: absolute; top: calc(100% + 10px); right: 0;
  width: 230px; background: white; border-radius: 14px;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.08);
  border: 1px solid #e2e8f0; padding: 8px; z-index: 100;
}

.dropdown-header-profile-box { padding: 8px 12px 10px 12px; display: flex; flex-direction: column; text-align: left; }
.dropdown-header-profile-box strong { font-size: 13.5px; color: #0f172a; }
.dropdown-header-profile-box span { font-size: 12px; color: #64748b; margin-top: 1px; }
.text-truncated-email { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.dropdown-divider-line { height: 1px; background-color: #f1f5f9; margin: 6px 0; }

.dropdown-action-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; text-decoration: none;
  color: #334155; font-size: 13.5px; font-weight: 700;
  border-radius: 8px; transition: all 0.15s ease-in-out;
}
.dropdown-action-item svg { color: #94a3b8; width: 16px; height: 16px; }

/* ĐỒNG BỘ UI THƯƠNG HIỆU: Đổi sang màu xanh dương cao cấp mới */
.dropdown-action-item:hover { background-color: #eff6ff; color: #2563eb; }
.dropdown-action-item:hover svg { color: #2563eb; }

/* Mục Đăng xuất màu đỏ sắc nét */
.logout-red-action-item { color: #dc2626; }
.logout-red-action-item svg { color: #dc2626; opacity: 0.8; }
.logout-red-action-item:hover { background-color: #fff5f5; color: #b91c1c; }
.logout-red-action-item:hover svg { color: #b91c1c; opacity: 1; }

/* Hoạt ảnh dropdown mượt mà */
.dropdown-slide-up-enter-active,
.dropdown-slide-up-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-slide-up-enter-from { opacity: 0; transform: translateY(8px); }
.dropdown-slide-up-leave-to { opacity: 0; transform: translateY(4px); }

.animated { animation-duration: 0.3s; animation-fill-mode: both; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.fade-in { animation-name: fadeIn; }
</style>
