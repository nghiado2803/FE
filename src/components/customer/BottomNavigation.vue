<template>
  <nav class="modern-bottom-navigation-bar">
    <div class="nav-flex-container">

      <router-link to="/customer/home" class="nav-interactive-item" active-class="is-link-active">
        <div class="nav-icon-bounce-wrapper">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <span class="nav-label-text">Trang chủ</span>
      </router-link>

      <router-link to="/customer/history" class="nav-interactive-item" active-class="is-link-active">
        <div class="nav-icon-bounce-wrapper">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
          </svg>
        </div>
        <span class="nav-label-text">Lịch sử</span>
      </router-link>

      <router-link to="/customer/monthly-tickets" class="nav-interactive-item" active-class="is-link-active">
        <div class="nav-icon-bounce-wrapper">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
            <path d="M6 8h12M6 12h12"/>
          </svg>
          <span v-if="hasActiveMonthlyTicket" class="nav-active-ticket-dot monthly"></span>
        </div>
        <span class="nav-label-text">Vé tháng</span>
      </router-link>

      <router-link to="/customer/ticket" class="nav-interactive-item" active-class="is-link-active">
        <div class="nav-icon-bounce-wrapper">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
            <rect x="7" y="14" width="4" height="4"></rect>
            <rect x="13" y="14" width="4" height="4"></rect>
          </svg>
          <span v-if="hasActiveTicket" class="nav-active-ticket-dot"></span>
        </div>
        <span class="nav-label-text">Vé của tôi</span>
      </router-link>

      <router-link to="/customer/profile" class="nav-interactive-item" active-class="is-link-active">
        <div class="nav-icon-bounce-wrapper">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <span class="nav-label-text">Cá nhân</span>
      </router-link>

    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTicketStore } from '@/stores/ticketStore'
import { useMonthlyTicketStore } from '@/stores/monthlyTicketStore'

const ticketStore = useTicketStore()
const monthlyTicketStore = useMonthlyTicketStore()

const hasActiveTicket = computed(() => !!ticketStore.activeTicket)
const hasActiveMonthlyTicket = computed(() => monthlyTicketStore.hasActiveMonthlyTickets)
</script>

<style scoped>
.modern-bottom-navigation-bar {
  position: absolute; /* Khóa chặt dưới đáy simulator */
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #ffffff;
  box-shadow: 0 -4px 16px rgba(15, 23, 42, 0.04);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  border-top: 1px solid #f1f5f9;
  z-index: 10;
  padding-bottom: calc(6px + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.nav-flex-container {
  display: flex; justify-content: space-around; align-items: center; height: 58px; padding: 0 4px;
}

.nav-interactive-item {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-decoration: none; color: #94a3b8; width: 25%; height: 100%;
  transition: all 0.2s ease-in-out; cursor: pointer; -webkit-tap-highlight-color: transparent;
}

.nav-icon-bounce-wrapper {
  margin-bottom: 2px; position: relative;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex; align-items: center; justify-content: center;
}

.nav-label-text { font-size: 10.5px; font-weight: 700; letter-spacing: 0.1px; }

.nav-active-ticket-dot {
  position: absolute; top: -1px; right: -2px; width: 6px; height: 6px;
  background-color: #f43f5e; border-radius: 50%; border: 1px solid white;
}

.nav-active-ticket-dot.monthly {
  background-color: #10b981; /* Green color for monthly tickets */
}

/* TRẠNG THÁI ACTIVE THƯƠNG HIỆU MỚI */
.nav-interactive-item.is-link-active { color: #2563eb; }
.nav-interactive-item.is-link-active .nav-icon-bounce-wrapper { transform: translateY(-3px) scale(1.05); }
.nav-interactive-item.is-link-active .nav-icon-bounce-wrapper svg {
  stroke: #2563eb; filter: drop-shadow(0px 3px 6px rgba(37, 99, 235, 0.25));
}
</style>
