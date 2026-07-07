<template>
  <header :class="['portal-header-premium', { 'is-header-scrolled': !isOnHero }]">
    <div class="container header-inner-flex">

      <router-link to="/" class="logo-brand-wrapper" @click="handleHomeClick">
        <div class="logo-svg-icon">
          <svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" width="34" height="34">
            <rect width="38" height="38" rx="11" fill="url(#portalLogoGrad)"/>
            <path d="M13 28V10H20.5C23.538 10 26 12.462 26 15.5C26 18.538 23.538 21 20.5 21H17V28H13ZM17 17.5H20.5C21.328 17.5 22 16.828 22 16C22 15.172 21.328 14.5 20.5 14.5H17V17.5Z" fill="white"/>
            <defs>
              <linearGradient id="portalLogoGrad" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#60a5fa"/>
                <stop offset="100%" stop-color="#2563eb"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span class="logo-brand-text">Smart<span class="text-blue-primary">Park</span></span>
      </router-link>

      <nav class="desktop-navigation-pills">
        <router-link to="/" class="nav-pill-item" @click="handleHomeClick">{{ langStore.t.home }}</router-link>
        <a href="#" class="nav-pill-item" @click.prevent="handleAnchorClick('about')">{{ langStore.t.about }}</a>
        <a href="#" class="nav-pill-item" @click.prevent="handleAnchorClick('features')">{{ langStore.t.features }}</a>
        <a href="#" class="nav-pill-item" @click.prevent="handleAnchorClick('contact')">{{ langStore.t.contact }}</a>
      </nav>

      <div class="header-action-buttons desktop-only-view">
        <!-- Hiển thị nút đăng nhập khi chưa đăng nhập -->
        <router-link v-if="!authStore.isAuthenticated" to="/login" class="btn-primary-glow">{{ langStore.t.loginBtn }}</router-link>

        <!-- Hiển thị vai trò khi đã đăng nhập (Admin/Staff) -->
        <router-link v-if="authStore.isAdmin" to="/admin/parking-map" class="btn-role-dashboard">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>{{ langStore.lang === 'vi' ? 'Quản trị viên' : 'Admin' }}</span>
        </router-link>

        <router-link v-if="authStore.isStaff" to="/staff/parking-map-live" class="btn-role-dashboard">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <line x1="19" y1="8" x2="19" y2="14"></line>
            <line x1="22" y1="11" x2="16" y2="11"></line>
          </svg>
          <span>{{ langStore.lang === 'vi' ? 'Nhân viên' : 'Staff' }}</span>
        </router-link>

        <!-- Nút đổi ngôn ngữ — sau nút đăng nhập hoặc vai trò -->
        <button class="btn-lang-toggle" @click="langStore.toggle()" :title="langStore.lang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'">
          <svg v-if="langStore.lang === 'vi'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 22" width="26" height="18">
            <rect width="32" height="22" rx="3" fill="#DA251D"/>
            <polygon points="16,4 17.9,9.8 24,9.8 19.1,13.2 21,19 16,15.6 11,19 12.9,13.2 8,9.8 14.1,9.8" fill="#FFFF00"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" width="26" height="18">
            <rect width="60" height="40" rx="3" fill="#012169"/>
            <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" stroke-width="8"/>
            <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" stroke-width="5"/>
            <path d="M30,0 V40 M0,20 H60" stroke="#fff" stroke-width="13"/>
            <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" stroke-width="8"/>
          </svg>
          <span class="lang-code">{{ langStore.lang === 'vi' ? 'VI' : 'EN' }}</span>
        </button>
      </div>

      <button class="mobile-menu-hamburger-btn" @click="toggleMobileMenu" aria-label="Bật thực đơn">
        <span :class="['hamburger-bars', { 'is-hamburger-active': isMenuOpen }]"></span>
      </button>
    </div>

    <Transition name="premium-fade">
      <div v-if="isMenuOpen" class="mobile-menu-blur-overlay" @click="toggleMobileMenu"></div>
    </Transition>

    <Transition name="premium-slide-down">
      <div v-if="isMenuOpen" class="mobile-dropdown-panel">
        <div class="mobile-nav-links-list">
          <router-link to="/" class="mobile-nav-link-item" @click="handleHomeClick">{{ langStore.t.home }}</router-link>
          <a href="#" class="mobile-nav-link-item" @click.prevent="handleAnchorClick('about')">{{ langStore.t.about }}</a>
          <a href="#" class="mobile-nav-link-item" @click.prevent="handleAnchorClick('features')">{{ langStore.t.features }}</a>
          <a href="#" class="mobile-nav-link-item" @click.prevent="handleAnchorClick('contact')">{{ langStore.t.contact }}</a>
        </div>

        <div class="mobile-action-zone">
          <!-- Hiển thị nút đăng nhập khi chưa đăng nhập -->
          <router-link v-if="!authStore.isAuthenticated" to="/login" class="btn-primary-glow w-full-btn" @click="toggleMobileMenu">
            {{ langStore.t.loginBtn }}
          </router-link>

          <!-- Hiển thị vai trò khi đã đăng nhập (Admin/Staff) -->
          <router-link v-if="authStore.isAdmin" to="/admin/parking-map" class="btn-role-dashboard-mobile" @click="toggleMobileMenu">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>{{ langStore.lang === 'vi' ? 'Về trang Quản trị viên' : 'Go to Admin Dashboard' }}</span>
          </router-link>

          <router-link v-if="authStore.isStaff" to="/staff/parking-map-live" class="btn-role-dashboard-mobile" @click="toggleMobileMenu">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <line x1="19" y1="8" x2="19" y2="14"></line>
              <line x1="22" y1="11" x2="16" y2="11"></line>
            </svg>
            <span>{{ langStore.lang === 'vi' ? 'Về trang Nhân viên' : 'Go to Staff Dashboard' }}</span>
          </router-link>

          <!-- Nút đổi ngôn ngữ mobile — sau nút đăng nhập hoặc vai trò -->
          <button class="btn-lang-toggle-mobile" @click="langStore.toggle()">
            <svg v-if="langStore.lang === 'vi'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 22" width="22" height="15">
              <rect width="32" height="22" rx="3" fill="#DA251D"/>
              <polygon points="16,4 17.9,9.8 24,9.8 19.1,13.2 21,19 16,15.6 11,19 12.9,13.2 8,9.8 14.1,9.8" fill="#FFFF00"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" width="22" height="15">
              <rect width="60" height="40" rx="3" fill="#012169"/>
              <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" stroke-width="8"/>
              <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" stroke-width="5"/>
              <path d="M30,0 V40 M0,20 H60" stroke="#fff" stroke-width="13"/>
              <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" stroke-width="8"/>
            </svg>
            <span>{{ langStore.lang === 'vi' ? 'Tiếng Việt' : 'English' }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLangStore } from '@/stores/langStore'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const langStore = useLangStore()
const authStore = useAuthStore()

const isScrolled = ref(false)
const isMenuOpen = ref(false)

// Chỉ dùng style trắng khi đang ở trang chủ VÀ chưa scroll
const isOnHero = computed(() => route.path === '/' && !isScrolled.value)

const handleScroll = () => { isScrolled.value = window.scrollY > 20 }

const toggleMobileMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  document.body.style.overflow = isMenuOpen.value ? 'hidden' : ''
}

const executeScrollToElementId = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    const offsetPosition = element.getBoundingClientRect().top + window.scrollY - 70
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
  }
}

const handleHomeClick = (e: MouseEvent) => {
  if (isMenuOpen.value) toggleMobileMenu()
  if (route.path === '/') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }
}

const handleAnchorClick = (id: string) => {
  if (isMenuOpen.value) toggleMobileMenu()
  if (route.path !== '/') {
    router.push('/').then(() => setTimeout(() => executeScrollToElementId(id), 150))
  } else {
    executeScrollToElementId(id)
  }
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => { window.removeEventListener('scroll', handleScroll); document.body.style.overflow = '' })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Inter:wght@500;600;700&display=swap');

.portal-header-premium {
  position: fixed; top: 0; left: 0; width: 100%; z-index: 1500;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 16px 0;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  box-shadow: 0 2px 20px rgba(15, 23, 42, 0.06);
  font-family: 'Inter', sans-serif;
}
.is-header-scrolled {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 12px 0;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.08);
}

.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; box-sizing: border-box; }
.header-inner-flex { display: flex; justify-content: space-between; align-items: center; }

.logo-brand-wrapper { display: flex; align-items: center; gap: 10px; text-decoration: none; transition: transform 0.2s ease; }
.logo-brand-wrapper:hover { transform: scale(1.02); }
.logo-svg-icon svg { width: 34px; height: 34px; display: block; }

/* Logo — luôn tối rõ ràng */
.logo-brand-text {
  font-family: 'Montserrat', sans-serif;
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.5px;
}
.text-blue-primary { color: #2563eb; }

/* Nav pills */
.desktop-navigation-pills {
  display: flex; gap: 2px;
  background: rgba(241, 245, 249, 0.8);
  padding: 4px; border-radius: 9999px;
}
.nav-pill-item {
  text-decoration: none;
  color: #475569;
  font-weight: 700; font-size: 14px;
  padding: 8px 18px; border-radius: 9999px;
  transition: all 0.2s ease; cursor: pointer;
}
.nav-pill-item:hover { color: #0f172a; background: rgba(15,23,42,0.06); }

/* Hamburger — luôn tối */
.hamburger-bars { display: block; width: 22px; height: 2px; background: #0f172a; position: relative; transition: 0.25s ease-in-out; border-radius: 2px; }
.hamburger-bars::before, .hamburger-bars::after { content: ''; position: absolute; width: 22px; height: 2px; background: #0f172a; transition: 0.25s ease-in-out; left: 0; border-radius: 2px; }

.header-action-buttons { display: flex; gap: 10px; align-items: center; }

/* Nút đổi ngôn ngữ desktop */
.btn-lang-toggle {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 50px;
  background: rgba(241, 245, 249, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
  backdrop-filter: blur(8px);
  cursor: pointer; transition: all 0.2s;
  color: #334155; font-size: 12px; font-weight: 800;
}
.is-header-scrolled .btn-lang-toggle {
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #334155;
}
.btn-lang-toggle:hover { transform: translateY(-1px); }
.lang-code { letter-spacing: 0.5px; }

.btn-primary-glow {
  background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white;
  padding: 11px 24px; border-radius: 50px;
  font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 13.5px;
  text-decoration: none; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); cursor: pointer;
}
.btn-primary-glow:hover { background: linear-gradient(135deg, #1d4ed8, #1e40af); transform: translateY(-2px); box-shadow: 0 6px 18px rgba(37, 99, 235, 0.45); }

/* Nút vai trò Dashboard (Admin/Staff) */
.btn-role-dashboard {
  display: flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #16a34a, #15803d); color: white;
  padding: 11px 20px; border-radius: 50px;
  font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 13.5px;
  text-decoration: none; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3); cursor: pointer;
}
.btn-role-dashboard:hover {
  background: linear-gradient(135deg, #15803d, #166534);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(22, 163, 74, 0.45);
}

/* Nút vai trò Dashboard Mobile */
.btn-role-dashboard-mobile {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  background: linear-gradient(135deg, #16a34a, #15803d); color: white;
  padding: 13px 18px; border-radius: 10px;
  font-weight: 700; font-size: 14px;
  text-decoration: none; transition: all 0.15s;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
}
.btn-role-dashboard-mobile:active {
  background: linear-gradient(135deg, #15803d, #166534);
  transform: scale(0.98);
}

.mobile-menu-hamburger-btn { display: none; background: none; border: none; cursor: pointer; padding: 8px; z-index: 2001; }
.hamburger-bars::before { top: -6px; }
.hamburger-bars::after { top: 6px; }
.hamburger-bars.is-hamburger-active { background: transparent !important; }
.hamburger-bars.is-hamburger-active::before { top: 0; transform: rotate(45deg); }
.hamburger-bars.is-hamburger-active::after { top: 0; transform: rotate(-45deg); }

.mobile-menu-blur-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.3); backdrop-filter: blur(4px); z-index: 1800; }
.mobile-dropdown-panel { position: absolute; top: 100%; left: 0; width: 100%; background: #ffffff; padding: 20px; box-shadow: 0 15px 30px -5px rgba(15,23,42,0.1); border-bottom-left-radius: 20px; border-bottom-right-radius: 20px; z-index: 1900; display: flex; flex-direction: column; gap: 16px; box-sizing: border-box; }
.mobile-nav-links-list { display: flex; flex-direction: column; gap: 6px; text-align: left; }
.mobile-nav-link-item { padding: 12px 14px; text-decoration: none; color: #334155; font-weight: 700; font-size: 14.5px; border-radius: 10px; background: #f8fafc; transition: all 0.15s ease; cursor: pointer; }
.mobile-nav-link-item:active { background: #eff6ff; color: #2563eb; }

.mobile-action-zone { display: flex; flex-direction: column; gap: 10px; }

/* Nút đổi ngôn ngữ mobile */
.btn-lang-toggle-mobile {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 11px; border-radius: 10px;
  background: #f8fafc; border: 1px solid #e2e8f0;
  cursor: pointer; font-size: 14px; font-weight: 700; color: #334155;
  transition: background 0.15s;
}
.btn-lang-toggle-mobile:active { background: #eff6ff; }

.w-full-btn { width: 100%; text-align: center; justify-content: center; display: flex; box-sizing: border-box; }

.premium-fade-enter-active, .premium-fade-leave-active { transition: opacity 0.2s ease-in-out; }
.premium-fade-enter-from, .premium-fade-leave-to { opacity: 0; }
.premium-slide-down-enter-active { transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.premium-slide-down-leave-active { transition: all 0.2s ease-in-out; }
.premium-slide-down-enter-from, .premium-slide-down-leave-to { transform: translateY(-14px); opacity: 0; }

@media (max-width: 900px) {
  .desktop-navigation-pills, .desktop-only-view { display: none; }
  .mobile-menu-hamburger-btn { display: block; }
}
</style>
