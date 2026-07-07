<template>
  <aside :class="['modern-dashboard-sidebar', { 'is-sidebar-collapsed': isCollapsed }]">

    <div class="sidebar-brand-header">
      <div class="logo-icon-box">
        <svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" width="38" height="38">
          <rect width="38" height="38" rx="11" fill="url(#logoGrad)"/>
          <path d="M13 28V10H20.5C23.538 10 26 12.462 26 15.5C26 18.538 23.538 21 20.5 21H17V28H13ZM17 17.5H20.5C21.328 17.5 22 16.828 22 16C22 15.172 21.328 14.5 20.5 14.5H17V17.5Z" fill="white"/>
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#60a5fa"/>
              <stop offset="100%" stop-color="#2563eb"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div class="logo-text-group">
        <span class="logo-brand-text">Smart<span class="logo-accent">Park</span></span>
        <span class="logo-sub">Management</span>
      </div>
    </div>

    <nav class="sidebar-nav-scroller">

      <!-- ADMIN -->
      <ul v-if="authStore.isAdmin" class="nav-menu-list">
        <!-- Nhóm: Tổng quan & Báo cáo -->
        <li class="nav-section-title">Tổng quan</li>
        <li>
          <router-link to="/admin/revenue-report" class="nav-item-link" active-class="is-link-active">
            <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
            <span class="menu-text-label">{{ langStore.t.revenueReport }}</span>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/parking-map" class="nav-item-link" active-class="is-link-active">
            <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
            </svg>
            <span class="menu-text-label">{{ langStore.t.parkingMap }}</span>
          </router-link>
        </li>

        <!-- Nhóm: Quản lý nghiệp vụ -->
        <li class="nav-section-title margin-top-12">Nghiệp vụ</li>
        <li>
          <router-link to="/admin/parking-manage" class="nav-item-link" active-class="is-link-active">
            <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
            </svg>
            <span class="menu-text-label">{{ langStore.t.parkingManage }}</span>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/shift-assignment" class="nav-item-link" active-class="is-link-active">
            <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
            </svg>
            <span class="menu-text-label">{{ langStore.t.shiftAssignment }}</span>
          </router-link>
        </li>

        <!-- Nhóm: Hệ thống & Tài khoản -->
        <li class="nav-section-title margin-top-12">Hệ thống</li>
        <li>
          <router-link to="/admin/user-manage" class="nav-item-link" active-class="is-link-active">
            <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            <span class="menu-text-label">{{ langStore.t.userManage }}</span>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/reviews" class="nav-item-link" active-class="is-link-active">
            <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.562 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>
            <span class="menu-text-label">Đánh giá & Phản hồi</span>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/incidents" class="nav-item-link" active-class="is-link-active">
            <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <span class="menu-text-label">Quản lý sự cố</span>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/profile" class="nav-item-link" active-class="is-link-active">
            <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            <span class="menu-text-label">{{ langStore.t.profile }}</span>
          </router-link>
        </li>
      </ul>

      <!-- STAFF -->
      <ul v-else-if="authStore.isStaff" class="nav-menu-list">
        <!-- Nhóm: Trực bãi -->
        <li class="nav-section-title">Vận hành</li>
        <li>
          <router-link to="/staff/parking-map-live" class="nav-item-link" active-class="is-link-active">
            <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
            </svg>
            <span class="menu-text-label">{{ langStore.t.mapLive }}</span>
          </router-link>
        </li>
        <li>
          <router-link to="/staff/scanner-checkin" class="nav-item-link staff-checkin-link" active-class="is-link-active">
            <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 8.25V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V8.25m-18 0V6a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6ZM7.5 6h.008v.008H7.5V6Zm2.25 6h.008v.008H9.75V12Zm2.25 0h.008v.008H12V12Zm2.25 0h.008v.008h-.008V12Zm2.25 0h.008v.008h-.008V12Z" />
            </svg>
            <span class="menu-text-label">{{ langStore.t.scannerQR }}</span>
          </router-link>
        </li>
        <li>
          <router-link to="/staff/incidents" class="nav-item-link" active-class="is-link-active">
            <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <span class="menu-text-label">Báo cáo sự cố</span>
          </router-link>
        </li>

        <!-- Nhóm: Cá nhân -->
        <li class="nav-section-title margin-top-12">Cá nhân</li>
        <li>
          <router-link to="/staff/schedule" class="nav-item-link" active-class="is-link-active">
            <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
            </svg>
            <span class="menu-text-label">{{ langStore.t.mySchedule }}</span>
          </router-link>
        </li>
        <li>
          <router-link to="/staff/profile" class="nav-item-link" active-class="is-link-active">
            <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            <span class="menu-text-label">{{ langStore.t.profile }}</span>
          </router-link>
        </li>
      </ul>

    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useLangStore } from '@/stores/langStore'

defineOptions({ name: 'SidebarMenu' })

const props = defineProps({
  isCollapsed: { type: Boolean, default: false }
})
const isCollapsed = computed(() => props.isCollapsed)
const authStore = useAuthStore()
const langStore = useLangStore()
</script>

<style scoped>
.modern-dashboard-sidebar {
  width: 260px;
  height: 100vh;
  background: linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 55%, #3b82f6 100%);
  color: rgba(255,255,255,0.75);
  display: flex;
  flex-direction: column;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: fixed;
  top: 0; left: 0;
  z-index: 100;
  border-right: 1px solid rgba(255,255,255,0.06);
  box-shadow: 4px 0 24px rgba(30, 58, 138, 0.35);
}
.is-sidebar-collapsed { width: 78px; }

/* Brand header */
.sidebar-brand-header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  overflow: hidden;
  gap: 12px;
  background: rgba(0,0,0,0.12);
}
.logo-icon-box { flex-shrink: 0; display: flex; align-items: center; }
.logo-text-group { display: flex; flex-direction: column; overflow: hidden; }
.logo-brand-text {
  color: #ffffff;
  font-family: 'Montserrat', system-ui, sans-serif;
  font-size: 17px;
  font-weight: 900;
  white-space: nowrap;
  letter-spacing: -0.3px;
  line-height: 1.15;
  transition: opacity 0.2s ease;
}
.logo-accent { color: #93c5fd; }
.logo-sub {
  font-size: 8.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2.5px;
  color: rgba(255,255,255,0.4);
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

/* Nav */
.sidebar-nav-scroller {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
  overflow-x: hidden;
}
.nav-menu-list { list-style: none; padding: 0; margin: 0; }

.nav-section-title {
  padding: 0 20px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(255,255,255,0.45);
  margin-bottom: 6px;
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.margin-top-12 { margin-top: 12px; }

.nav-item-link {
  display: flex;
  align-items: center;
  padding: 11px 16px;
  margin: 2px 10px;
  border-radius: 10px;
  text-decoration: none;
  color: rgba(255,255,255,0.9);
  font-size: 13.5px;
  font-weight: 700;
  transition: all 0.2s ease-in-out;
}
.nav-item-link:hover {
  background: rgba(255,255,255,0.15);
  color: #ffffff;
}

.menu-icon {
  width: 20px; height: 20px;
  margin-right: 12px;
  min-width: 20px;
  transition: transform 0.2s;
  color: rgba(255,255,255,0.75);
}

.menu-text-label {
  white-space: nowrap;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.nav-item-link.is-link-active {
  background: rgba(255,255,255,0.16);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.nav-item-link.is-link-active .menu-icon {
  color: #93c5fd;
  transform: scale(1.05);
}

.staff-checkin-link.is-link-active {
  background: rgba(74, 222, 128, 0.14);
  color: #bbf7d0;
}
.staff-checkin-link.is-link-active .menu-icon { color: #4ade80; }

/* Collapsed */
.is-sidebar-collapsed .logo-brand-text,
.is-sidebar-collapsed .logo-sub,
.is-sidebar-collapsed .nav-section-title,
.is-sidebar-collapsed .menu-text-label {
  opacity: 0; pointer-events: none; width: 0; overflow: hidden; margin: 0;
}
.is-sidebar-collapsed .menu-icon { margin-right: 0; }
.is-sidebar-collapsed .logo-text-group { width: 0; overflow: hidden; }

.sidebar-nav-scroller::-webkit-scrollbar { width: 4px; }
.sidebar-nav-scroller::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
</style>
