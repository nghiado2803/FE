<template>
  <div class="monthly-tickets-page">
    <!-- Header với gradient -->
    <div class="page-header">
      <button class="btn-back" @click="router.push('/customer/home')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <div class="header-title-wrap">
        <h1 class="page-title">Vé Tháng Của Tôi</h1>
        <p class="page-subtitle">Quản lý vé đỗ xe dài hạn của bạn</p>
      </div>
      <button @click="showPurchaseModal = true" class="btn-buy">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>

    <div class="page-content">
      <!-- Loading -->
      <div v-if="monthlyTicketStore.loading" class="state-container">
        <div class="state-card">
          <LoadingSpinner />
          <p class="state-text">Đang tải vé tháng...</p>
        </div>
      </div>

      <template v-else>
        <!-- Error -->
        <div v-if="monthlyTicketStore.error" class="state-container">
          <div class="state-card error-card">
            <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p class="state-text error-text">{{ monthlyTicketStore.error }}</p>
            <button @click="monthlyTicketStore.clearError()" class="btn-action-secondary">Đóng</button>
          </div>
        </div>

        <template v-else>
          <!-- Tab Control -->
          <div class="top-controls">
            <div class="tab-control" role="tablist">
              <button
                class="tab-btn"
                :class="{ active: activeTab === 'active' }"
                @click="activeTab = 'active'"
                role="tab"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Đang hoạt động
                <span v-if="activeCount > 0" class="tab-badge active-count">{{ activeCount }}</span>
              </button>
              <button
                class="tab-btn"
                :class="{ active: activeTab === 'history' }"
                @click="activeTab = 'history'"
                role="tab"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Lịch sử
                <span v-if="historyCount > 0" class="tab-badge history-count">{{ historyCount }}</span>
              </button>
            </div>
          </div>

          <!-- Tab: Đang hoạt động -->
          <div v-if="activeTab === 'active'" class="tab-panel">
            <div v-if="filteredActiveTickets.length === 0" class="state-container">
              <div class="empty-card">
                <div class="empty-illustration">
                  <div class="empty-circle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 10V7a2 2 0 0 0-2-2h-3l-2-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"></path>
                      <path d="M9 13h.01"></path>
                      <path d="M16 19h6"></path>
                      <path d="M19 16v6"></path>
                    </svg>
                  </div>
                </div>
                <h3>Chưa có vé tháng nào</h3>
                <p>Mua vé tháng để tiết kiệm chi phí đỗ xe dài hạn với ưu đãi đặc biệt</p>
                <button @click="showPurchaseModal = true" class="btn-action-primary gradient-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Mua Vé Tháng Đầu Tiên
                </button>
              </div>
            </div>

            <div v-else class="coupon-list">
              <div
                v-for="ticket in filteredActiveTickets"
                :key="ticket.id"
                class="coupon-card active-ticket"
                :class="{ 'paying-ticket': ticket.status === 'PAYING' }"
              >
                <div class="coupon-notch top-left"></div>
                <div class="coupon-notch top-right"></div>
                <div class="coupon-notch bottom-left"></div>
                <div class="coupon-notch bottom-right"></div>

                <div class="coupon-top-bar">
                  <span class="ticket-code-mono">{{ ticket.ticketCode }}</span>
                  <span class="status-badge" :class="statusClass(ticket.status)">
                    {{ getStatusText(ticket.status, ticket.startDate, ticket.endDate) }}
                  </span>
                </div>

                <div class="coupon-body">
                  <div class="coupon-info">
                    <div class="parking-lot-row">
                      <span class="ticket-icon-pill">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                      </span>
                      <span class="lot-name">{{ ticket.lotName }}</span>
                    </div>
                    <div class="plate-frame">
                      <div class="plate-number">{{ ticket.plate }}</div>
                    </div>
                    <div class="date-range-row">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span class="range-text">{{ formatDateRange(ticket.startDate, ticket.endDate) }}</span>
                    </div>
                  </div>

                  <div class="coupon-divider">
                    <div class="divider-dash"></div>
                  </div>

                  <div class="coupon-side">
                    <div class="coupon-actions">
                      <button v-if="ticket.status === 'PAYING'" @click="confirmDeleteTicket(ticket)" class="coupon-btn delete-btn" title="Xóa vé chưa thanh toán">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        Xóa vé
                      </button>
                      <template v-else>
                        <button @click="showQRCode(ticket)" class="coupon-btn qr-btn" title="Xem mã QR">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                          </svg>
                          Mã QR
                        </button>
                        <button @click="showEditModal(ticket)" class="coupon-btn edit-btn" title="Chỉnh sửa">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                          Sửa
                        </button>
                        <button @click="showTicketDetail(ticket)" class="coupon-btn detail-btn" title="Chi tiết">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                          </svg>
                          Chi tiết
                        </button>
                      </template>
                    </div>
                  </div>
                </div>

                <div class="coupon-perforation">
                  <span v-for="i in 22" :key="i" class="perf-hole"></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: Lịch sử -->
          <div v-if="activeTab === 'history'" class="tab-panel">
            <div v-if="filteredHistoryTickets.length === 0" class="state-container">
              <div class="empty-card">
                <div class="empty-illustration">
                  <div class="empty-circle gray">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                </div>
                <h3>Chưa có lịch sử vé tháng</h3>
                <p>Lịch sử vé tháng đã sử dụng sẽ hiển thị tại đây</p>
                <button @click="showPurchaseModal = true" class="btn-action-primary gradient-btn">
                  Mua Vé Tháng
                </button>
              </div>
            </div>

            <div v-else class="coupon-list">
              <div
                v-for="ticket in filteredHistoryTickets"
                :key="ticket.id"
                class="coupon-card"
                :class="{ 'paying-ticket': ticket.status === 'PAYING', 'cancelled-ticket': ticket.status === 'CANCELLED' }"
              >
                <div class="coupon-notch top-left"></div>
                <div class="coupon-notch top-right"></div>
                <div class="coupon-notch bottom-left"></div>
                <div class="coupon-notch bottom-right"></div>

                <div class="coupon-top-bar">
                  <span class="ticket-code-mono">{{ ticket.ticketCode }}</span>
                  <span class="status-badge" :class="statusClass(ticket.status)">
                    {{ getStatusText(ticket.status, ticket.startDate, ticket.endDate) }}
                  </span>
                </div>

                <div class="coupon-body">
                  <div class="coupon-info">
                    <div class="parking-lot-row">
                      <span class="ticket-icon-pill">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                      </span>
                      <span class="lot-name">{{ ticket.lotName }}</span>
                    </div>
                    <div class="plate-frame">
                      <div class="plate-number">{{ ticket.plate }}</div>
                    </div>
                    <div class="date-range-row">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span class="range-text">{{ formatDateRange(ticket.startDate, ticket.endDate) }}</span>
                    </div>
                  </div>

                  <div class="coupon-divider">
                    <div class="divider-dash"></div>
                  </div>

                  <div class="coupon-side">
                    <div class="coupon-actions">
                      <button v-if="ticket.status === 'PAYING'" @click="confirmDeleteTicket(ticket)" class="coupon-btn delete-btn" title="Xóa vé chưa thanh toán">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        Xóa vé
                      </button>
                      <template v-else-if="ticket.status !== 'CANCELLED'">
                        <button @click="showQRCode(ticket)" class="coupon-btn qr-btn" title="Xem mã QR">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                          </svg>
                          Mã QR
                        </button>
                        <button v-if="ticket.status === 'PENDING' && canEditTicket(ticket)" @click="showEditModal(ticket)" class="coupon-btn edit-btn" title="Chỉnh sửa">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                          Sửa
                        </button>
                        <button @click="showTicketDetail(ticket)" class="coupon-btn detail-btn" title="Chi tiết">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                          </svg>
                          Chi tiết
                        </button>
                      </template>
                      <div v-else class="cancelled-indicator">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        <span>Vé đã hủy</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="coupon-perforation">
                  <span v-for="i in 22" :key="i" class="perf-hole"></span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>

    <!-- Purchase Modal -->
    <BaseModal :isOpen="showPurchaseModal" title="Mua vé tháng" @close="showPurchaseModal = false">
      <MonthlyTicketPurchase
        @success="handlePurchaseSuccess"
        @cancel="showPurchaseModal = false"
      />
    </BaseModal>

    <!-- QR Code Modal -->
    <BaseModal :isOpen="showQRModal && !!selectedTicket" title="QR Code Vé Tháng" @close="showQRModal = false">
      <div class="qr-modal">
        <h3>Mã QR Xác Nhận Vé</h3>
        <div class="qr-code-box">
          <QrCodeGenerator :value="selectedTicket?.qrCode" :size="200" />
        </div>
        <div class="qr-details">
          <div class="qr-row"><span class="qr-label">Mã vé</span><span class="qr-value qr-code-text">{{ selectedTicket?.ticketCode }}</span></div>
          <div class="qr-row"><span class="qr-label">Biển số</span><span class="qr-value"><span class="plate-mini blue-plate">{{ selectedTicket?.plate }}</span></span></div>
          <div class="qr-row"><span class="qr-label">Bãi xe</span><span class="qr-value">{{ selectedTicket?.lotName }}</span></div>
          <div class="qr-row"><span class="qr-label">Hiệu lực</span><span class="qr-value">{{ formatDateRange(selectedTicket?.startDate || '', selectedTicket?.endDate || '') }}</span></div>
        </div>
        <div class="qr-actions">
          <button @click="showQRModal = false" class="btn-action-secondary">Đóng</button>
        </div>
      </div>
    </BaseModal>

    <!-- Edit Monthly Ticket Modal -->
    <BaseModal :isOpen="showEditTicketModal && !!editingTicket" title="Chỉnh Sửa Vé Tháng" @close="closeEditModal">
      <div class="edit-ticket-modal">
        <form @submit.prevent="submitEdit" class="edit-form">

          <!-- 1. CHỌN BÃI XE -->
          <div class="edit-section">
            <label class="edit-label">Bãi đỗ xe <span class="req">*</span></label>
            <BaseSelect
              v-model="editForm.lotId"
              :options="lotOptions"
              placeholder="Chọn bãi xe..."
              :disabled="isSubmitting"
            />
          </div>

          <!-- 2. BIỂN SỐ XE -->
          <div class="edit-section">
            <label class="edit-label">Biển số xe <span class="req">*</span></label>
            <BaseSelect
              v-model="editForm.plate"
              :options="vehicleOptions"
              placeholder="Chọn biển số xe..."
              :disabled="isSubmitting"
            />
          </div>

          <!-- 3. THỜI GIAN -->
          <div class="edit-section">
            <label class="edit-label">Thời gian sử dụng <span class="req">*</span></label>
            <div class="edit-date-range">
              <div class="date-field">
                <label class="date-field-label">Từ ngày</label>
                <input
                  type="date"
                  v-model="editForm.startDate"
                  :disabled="isSubmitting"
                  class="edit-date-input"
                />
              </div>

              <div class="date-arrow">→</div>

              <div class="date-field">
                <label class="date-field-label">Đến ngày</label>
                <input
                  type="date"
                  v-model="editForm.endDate"
                  :disabled="true"
                  class="edit-date-input"
                />
              </div>
            </div>
          </div>

          <!-- ERROR -->
          <transition name="pop">
            <div v-if="editError" class="edit-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{{ editError }}</span>
            </div>
          </transition>

          <!-- BUTTONS -->
          <div class="edit-actions">
            <button type="button" @click="closeEditModal" class="edit-btn ghost" :disabled="isSubmitting">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Hủy bỏ
            </button>
            <button type="submit" class="edit-btn primary" :disabled="isSubmitting">
              <LoadingSpinner v-if="isSubmitting" size="small" />
              <template v-else>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>
                Lưu thay đổi
              </template>
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '@/services/api'
import { useMonthlyTicketStore } from '@/stores/monthlyTicketStore'
import type { MonthlyTicketResponse } from '@/services/customer.service'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import QrCodeGenerator from '@/components/common/QrCodeGenerator.vue'
import MonthlyTicketPurchase from '@/components/customer/MonthlyTicketPurchase.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import { AdminService } from '@/services/admin.service'

const router = useRouter()
const route = useRoute()
const monthlyTicketStore = useMonthlyTicketStore()
const showPurchaseModal = ref(false)
const showQRModal = ref(false)
const selectedTicket = ref<MonthlyTicketResponse | null>(null)
const showEditTicketModal = ref(false)
const editingTicket = ref<MonthlyTicketResponse | null>(null)
const userVehicles = ref<Array<{ id: number; plate: string; model: string }>>([])
const isSubmitting = ref(false)
const editError = ref('')

const editForm = ref({
  lotId: '' as string | number,
  plate: '',
  startDate: '',
  endDate: ''
})

const parkingLots = ref<Array<{ id: number; name: string; address: string }>>([])

const vehicleOptions = computed(() => {
  return userVehicles.value.map(vehicle => {
    const plate = (vehicle.plate || '').trim()
    const model = (vehicle.model || 'Xe cá nhân').trim()
    const label = `${plate}  ·  ${model}`
    return {
      value: plate,
      text: label.length > 55 ? label.slice(0, 52).trimEnd() + '...' : label
    }
  })
})

const lotOptions = computed(() => {
  return parkingLots.value.map(lot => {
    const nameTrim = (lot.name || '').trim() || 'Bãi xe không tên'
    const shortName = nameTrim.length > 52 ? nameTrim.slice(0, 49).trimEnd() + '...' : nameTrim
    return {
      value: lot.id,
      text: shortName,
      data: lot
    }
  })
})

const pendingMonthlyPaymentKey = 'pending_monthly_payment'
let monthlyPaymentPolling: ReturnType<typeof setInterval> | null = null

const activeTab = ref<'active' | 'history'>('active')

const filteredActiveTickets = computed(() => {
  return monthlyTicketStore.activeMonthlyTickets || []
})

const filteredHistoryTickets = computed(() => {
  return monthlyTicketStore.monthlyTickets || []
})

const activeCount = computed(() => (monthlyTicketStore.activeMonthlyTickets || []).length)
const historyCount = computed(() => (monthlyTicketStore.monthlyTickets || []).length)

onMounted(async () => {
  monthlyTicketStore.fetchMonthlyTickets()
  monthlyTicketStore.fetchActiveMonthlyTickets()
  handleRouteQuery()
  initializePendingMonthlyPayment()
  await loadUserVehicles()
  await loadParkingLots()
})

const loadUserVehicles = async () => {
  try {
    const response = await apiClient.get('/customer/vehicles') as Array<{ id: number; plate: string; model: string }>
    userVehicles.value = response
  } catch (error) {
    console.error('Lỗi khi tải danh sách xe:', error)
  }
}

const loadParkingLots = async () => {
  try {
    const response = await AdminService.getParkingLots()
    parkingLots.value = (response || []) as Array<{ id: number; name: string; address: string }>
  } catch (error) {
    console.error('Lỗi khi tải danh sách bãi xe:', error)
  }
}

onUnmounted(() => {
  clearMonthlyPaymentPolling()
})

const getStatusText = (status: string, startDate?: string, endDate?: string) => {
  // Kiểm tra thời gian nếu status là PENDING
  if (status === 'PENDING' && startDate && endDate) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)

    const end = new Date(endDate)
    end.setHours(0, 0, 0, 0)

    if (today < start) {
      return 'Sắp hoạt động'
    } else if (today > end) {
      return 'Hết hạn'
    } else {
      return 'Đang hoạt động'
    }
  }

  const statusMap: Record<string, string> = {
    'PENDING': 'Đang hoạt động',
    'PARKED': 'Đang đỗ',
    'CHECKOUT': 'Đã ra',
    'PAYING': 'Chờ thanh toán',
    'EXPIRED': 'Hết hạn',
    'CANCELLED': 'Đã hủy',
    'SUSPENDED': 'Tạm ngưng'
  }
  return statusMap[status] || status
}

const statusClass = (status: string) => String(status || '').toLowerCase()

const formatDateRange = (startDate: string, endDate: string) => {
  const formatOpts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }
  const start = new Date(startDate).toLocaleDateString('vi-VN', formatOpts)
  const end = new Date(endDate).toLocaleDateString('vi-VN', formatOpts)
  return `${start} → ${end}`
}

const formatCurrency = (amount: number | null | undefined) => {
  // Kiểm tra và xử lý các trường hợp null, undefined, NaN
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(500000) // Giá mặc định 500,000 VND
  }

  const numAmount = Number(amount)
  if (numAmount === 0) {
    return '0 ₫'
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(numAmount)
}

const showQRCode = (ticket: MonthlyTicketResponse) => {
  if (ticket.status === 'CANCELLED') {
    window.toast?.('Vé đã hủy không thể xem QR code')
    return
  }
  if (ticket.status === 'PAYING') {
    window.toast?.('Vé chưa thanh toán không thể xem QR code')
    return
  }
  selectedTicket.value = ticket
  showQRModal.value = true
}

const showTicketDetail = (ticket: MonthlyTicketResponse) => {
  console.log('Show ticket detail:', ticket)
  showQRCode(ticket)
}

const handlePurchaseSuccess = () => {
  showPurchaseModal.value = false
  monthlyTicketStore.fetchMonthlyTickets()
  monthlyTicketStore.fetchActiveMonthlyTickets()
}

const clearMonthlyPaymentPolling = () => {
  if (monthlyPaymentPolling) {
    clearInterval(monthlyPaymentPolling)
    monthlyPaymentPolling = null
  }
}

const startMonthlyPaymentPolling = (orderId: string) => {
  clearMonthlyPaymentPolling()
  monthlyPaymentPolling = setInterval(async () => {
    try {
      const statusData = await apiClient.get(`/payos/status/${orderId}`) as { status?: string }
      if (statusData.status === 'SUCCESS') {
        clearMonthlyPaymentPolling()
        localStorage.removeItem(pendingMonthlyPaymentKey)
        window.toast?.('Thanh toán vé tháng thành công')
        await monthlyTicketStore.fetchMonthlyTickets()
        await monthlyTicketStore.fetchActiveMonthlyTickets()
      } else if (statusData.status === 'FAILED') {
        clearMonthlyPaymentPolling()
        localStorage.removeItem(pendingMonthlyPaymentKey)
        window.toast?.('Thanh toán vé tháng thất bại')
      }
    } catch (err) {
      console.error('Lỗi kiểm tra trạng thái PayOS vé tháng:', err)
    }
  }, 3000)
}

const initializePendingMonthlyPayment = () => {
  const pending = localStorage.getItem(pendingMonthlyPaymentKey)
  if (!pending) return
  try {
    const data = JSON.parse(pending) as { orderId: string }
    if (data?.orderId) {
      startMonthlyPaymentPolling(data.orderId)
    }
  } catch {
    localStorage.removeItem(pendingMonthlyPaymentKey)
  }
}

const handleRouteQuery = () => {
  const status = route.query.status
  if (status === 'CANCELLED') {
    localStorage.removeItem(pendingMonthlyPaymentKey)
    window.toast?.('Bạn đã hủy thanh toán vé tháng')
  }
}

const showEditModal = (ticket: MonthlyTicketResponse) => {
  // Chỉ cho phép sửa vé có status PENDING và chưa vào bãi
  if (ticket.status !== 'PENDING') {
    window.toast?.('Chỉ có thể chỉnh sửa vé chưa vào bãi!')
    return
  }

  editingTicket.value = ticket
  editForm.value = {
    lotId: ticket.lotId || '',
    plate: ticket.plate,
    startDate: ticket.startDate,
    endDate: ticket.endDate
  }
  editError.value = ''
  showEditTicketModal.value = true
}

const canEditTicket = (ticket: MonthlyTicketResponse) => {
  // Chỉ cho phép sửa vé PENDING (chưa vào bãi, chưa hết hạn, chưa hủy)
  return ticket.status === 'PENDING'
}

const closeEditModal = () => {
  showEditTicketModal.value = false
  editingTicket.value = null
  editError.value = ''
  isSubmitting.value = false
}

const handleStartDateChange = () => {
  if (editForm.value.startDate) {
    const startDate = new Date(editForm.value.startDate)
    startDate.setDate(startDate.getDate() + 30)
    editForm.value.endDate = startDate.toISOString().split('T')[0]
  }
}

const submitEdit = async () => {
  if (!editingTicket.value) return

  if (!editForm.value.lotId || !editForm.value.plate || !editForm.value.startDate || !editForm.value.endDate) {
    editError.value = 'Vui lòng điền đầy đủ thông tin'
    return
  }

  isSubmitting.value = true
  editError.value = ''

  try {
    await apiClient.put(`/customer/monthly-tickets/${editingTicket.value.id}`, {
      lotId: Number(editForm.value.lotId),
      plate: editForm.value.plate,
      startDate: editForm.value.startDate,
      endDate: editForm.value.endDate
    })

    window.toast?.('Cập nhật vé tháng thành công!')
    closeEditModal()

    // Reload data
    await monthlyTicketStore.fetchMonthlyTickets()
    await monthlyTicketStore.fetchActiveMonthlyTickets()
  } catch (error: any) {
    console.error('Lỗi khi cập nhật vé tháng:', error)
    editError.value = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật vé tháng'
  } finally {
    isSubmitting.value = false
  }
}

const confirmDeleteTicket = (ticket: MonthlyTicketResponse) => {
  if (confirm(`Bạn có chắc muốn xóa vé ${ticket.ticketCode}?\n\nVé này chưa thanh toán và sẽ bị hủy vĩnh viễn.`)) {
    deleteTicket(ticket.id)
  }
}

const deleteTicket = async (ticketId: number) => {
  try {
    await apiClient.delete(`/customer/monthly-tickets/${ticketId}`)
    window.toast?.('Đã xóa vé tháng thành công!')

    // Reload data
    await monthlyTicketStore.fetchMonthlyTickets()
    await monthlyTicketStore.fetchActiveMonthlyTickets()
  } catch (error: any) {
    console.error('Lỗi khi xóa vé tháng:', error)
    window.toast?.('Có lỗi xảy ra khi xóa vé tháng: ' + (error.response?.data?.message || error.message))
  }
}
</script>

<style scoped>
.monthly-tickets-page {
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  background: linear-gradient(160deg, #1e3a8a 0%, #2563eb 55%, #06b6d4 100%);
  background-attachment: fixed;
  color: #0f172a;
  padding-bottom: 48px;
}

/* HEADER */
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 28px;
  color: white;
}

.btn-back {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
}
.btn-back svg { width: 20px; height: 20px; }
.btn-back:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-2px);
}

.header-title-wrap { flex: 1; min-width: 0; }
.page-title {
  font-size: 22px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.3px;
}
.page-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  opacity: 0.8;
  font-weight: 500;
}

.btn-buy {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #ffffff 0%, #dbeafe 100%);
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.btn-buy svg { width: 20px; height: 20px; stroke-width: 2.5; }
.btn-buy:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.2);
}

/* PAGE CONTENT */
.page-content {
  padding: 0 16px;
  max-width: 720px;
  margin: 0 auto;
}

/* STATE (loading / error / empty) */
.state-container {
  padding: 28px 0;
  display: flex;
  justify-content: center;
}
.state-card {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 40px 28px;
  text-align: center;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}
.state-text {
  margin: 16px 0 20px;
  color: #475569;
  font-size: 14px;
}
.error-card {
  border-top: 3px solid #ef4444;
}
.error-icon {
  width: 48px; height: 48px;
  color: #ef4444;
  margin: 0 auto;
}
.error-text { color: #b91c1c; }

.empty-card {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 40px 28px;
  text-align: center;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}
.empty-illustration { margin-bottom: 20px; }
.empty-circle {
  width: 88px;
  height: 88px;
  margin: 0 auto;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(6, 182, 212, 0.12) 100%);
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-circle.gray {
  background: linear-gradient(135deg, rgba(100, 116, 139, 0.1) 0%, rgba(15, 23, 42, 0.06) 100%);
  color: #64748b;
}
.empty-circle svg { width: 48px; height: 48px; }
.empty-card h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.2px;
}
.empty-card p {
  margin: 0 0 24px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
}

/* CONTROLS */
.top-controls {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}

.search-box {
  position: relative;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  padding: 4px 12px 4px 44px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.4);
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px; height: 18px;
  color: #64748b;
}
.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 12px 8px;
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
  font-family: inherit;
  min-width: 0;
}
.search-input::placeholder {
  color: #94a3b8;
  font-weight: 500;
}
.search-clear {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: none;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.15s ease;
}
.search-clear svg { width: 14px; height: 14px; }
.search-clear:hover { background: #e2e8f0; color: #0f172a; }

/* TAB CONTROL */
.tab-control {
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  padding: 4px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  border: 1px solid rgba(255, 255, 255, 0.18);
}
.tab-btn {
  position: relative;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.88);
  padding: 12px 14px;
  border-radius: 11px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: color 0.2s ease;
  font-family: inherit;
}
.tab-btn svg { width: 16px; height: 16px; }
.tab-btn.active {
  background: white;
  color: #2563eb;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.14);
}
.tab-badge {
  min-width: 20px;
  padding: 0 6px;
  height: 18px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.22);
  color: white;
}
.tab-btn.active .tab-badge {
  background: linear-gradient(135deg, #2563eb, #06b6d4);
  color: white;
}

/* TAB PANEL */
.tab-panel { animation: fadeIn 0.25s ease; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* COUPON CARD */
.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-bottom: 8px;
}

.coupon-card {
  position: relative;
  background: white;
  border-radius: 18px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14);
  overflow: hidden;
}
.coupon-card.active-ticket {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}
.coupon-card.active-ticket::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2563eb 0%, #06b6d4 100%);
}

/* Vé đã hủy */
.coupon-card.cancelled-ticket {
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  opacity: 0.85;
}
.coupon-card.cancelled-ticket::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(90deg, #94a3b8 0%, #64748b 100%);
}

/* Cancelled indicator */
.cancelled-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 10px;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 10px;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
}
.cancelled-indicator svg {
  width: 24px;
  height: 24px;
  color: #94a3b8;
}

.coupon-notch {
  position: absolute;
  width: 18px;
  height: 18px;
  background: linear-gradient(160deg, #1e3a8a 0%, #2563eb 55%, #06b6d4 100%);
  border-radius: 50%;
  z-index: 2;
}
.coupon-notch.top-left     { top: -9px;    left: 50%; transform: translateX(-50%); }
.coupon-notch.top-right    { display: none; }
.coupon-notch.bottom-left  { bottom: -9px; left: 50%; transform: translateX(-50%); }
.coupon-notch.bottom-right { display: none; }

.coupon-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 16px 18px 12px;
}

.ticket-code-mono {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12.5px;
  font-weight: 700;
  background: #eff6ff;
  color: #1d4ed8;
  padding: 5px 10px;
  border-radius: 7px;
  letter-spacing: 0.3px;
}

/* STATUS BADGE */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  line-height: 1.4;
  border: 1px solid transparent;
}
.status-badge.small { font-size: 10px; padding: 3px 8px; }
.status-badge.pending {
  background: #dcfce7;
  color: #166534;
  border-color: rgba(34, 197, 94, 0.3);
}
.status-badge.expired {
  background: #fee2e2;
  color: #991b1b;
  border-color: rgba(239, 68, 68, 0.28);
}
.status-badge.cancelled,
.status-badge.suspended {
  background: #f1f5f9;
  color: #475569;
  border-color: #cbd5e1;
}

/* COUPON BODY */
.coupon-body {
  display: grid;
  grid-template-columns: 1.45fr 1px 1fr;
  align-items: stretch;
  padding: 6px 0 12px;
}
.coupon-info {
  padding: 6px 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.parking-lot-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 12.5px;
  font-weight: 600;
}

.ticket-icon-pill {
  width: 34px;
  height: 34px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #2563eb;
  border: 1px solid #dbeafe;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
}

.ticket-icon-pill svg {
  width: 16px;
  height: 16px;
}

.parking-lot-row .lot-name {
  color: #0f172a;
  font-weight: 700;
  font-size: 13.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plate-frame {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 14px 6px;
  border-radius: 7px;
  background: linear-gradient(180deg, #15803d 0%, #166534 100%);
  color: #fcd34d;
  box-shadow: 0 2px 0 #14532d, 0 6px 16px rgba(20, 83, 45, 0.25);
  align-self: flex-start;
  border: 1.5px solid #fbbf24;
}
.plate-header {
  font-size: 8px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 2.2px;
  padding-bottom: 2px;
  border-bottom: 1px dashed rgba(251, 191, 36, 0.45);
  margin-bottom: 2px;
}
.plate-number {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #fcd34d;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
}

.date-range-row {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  padding-top: 2px;
}
.date-range-row svg {
  width: 15px; height: 15px;
  color: #0ea5e9;
  flex-shrink: 0;
}
.range-text { color: #334155; }

.coupon-divider {
  display: flex;
  justify-content: center;
  padding: 0;
  position: relative;
}
.divider-dash {
  width: 0;
  border-left: 2px dashed #cbd5e1;
  height: 100%;
}

.coupon-side {
  padding: 6px 16px 14px 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  text-align: center;
  gap: 8px;
}
.price-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 700;
  letter-spacing: 0.2px;
}
.price-value {
  font-size: 17px;
  font-weight: 800;
  color: #059669;
  letter-spacing: -0.2px;
  line-height: 1.2;
}
.coupon-actions {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 6px;
}
.coupon-btn {
  border: none;
  padding: 8px 10px;
  border-radius: 10px;
  font-size: 11.5px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.18s ease;
  font-family: inherit;
}
.coupon-btn svg { width: 14px; height: 14px; }
.qr-btn {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 3px 10px rgba(37, 99, 235, 0.28);
}
.qr-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.34);
}
.edit-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 3px 10px rgba(16, 185, 129, 0.28);
}
.edit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(16, 185, 129, 0.34);
}
.detail-btn {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
}
.detail-btn:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.coupon-perforation {
  display: flex;
  justify-content: space-between;
  padding: 0 12px 10px;
  opacity: 0.55;
  gap: 4px;
}
.perf-hole {
  flex: 1;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, #2563eb 0%, #06b6d4 100%);
  opacity: 0.35;
}

/* HISTORY LIST */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 8px;
}

/* History item wrapper - container cho cả vé và nút */
.history-item-wrapper {
  background: white;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  border-left: 3px solid #cbd5e1;
}

.history-item-wrapper:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateX(3px);
}

.history-item-wrapper.pending   { border-left-color: #22c55e; }
.history-item-wrapper.expired   { border-left-color: #ef4444; }
.history-item-wrapper.cancelled { border-left-color: #94a3b8; }
.history-item-wrapper.suspended { border-left-color: #f59e0b; }
.history-item-wrapper.paying    { border-left-color: #f59e0b; }

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.18s ease;
}

.history-left {
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 12px;
  align-items: center;
}

.history-avatar {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 12px;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
}
.history-avatar svg { width: 22px; height: 22px; }
.history-avatar.pending   { background: #dcfce7; color: #16a34a; }
.history-avatar.expired   { background: #fee2e2; color: #dc2626; }
.history-avatar.cancelled { background: #f1f5f9; color: #64748b; }
.history-avatar.suspended { background: #fef3c7; color: #d97706; }

.history-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.history-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.history-code {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: 0.2px;
}
.history-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #475569;
  font-weight: 600;
}
.meta-item svg { width: 13px; height: 13px; color: #2563eb; flex-shrink: 0; }
.plate-meta { padding: 0; background: none; }
.plate-mini {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  background: #15803d;
  color: #fcd34d;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 800;
  border: 1px solid rgba(251, 191, 36, 0.55);
  letter-spacing: 0.3px;
}
.plate-mini.blue-plate {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.history-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 2px;
}
.history-date {
  font-size: 11.5px;
  color: #64748b;
  font-weight: 600;
}
.history-price {
  font-size: 13px;
  font-weight: 800;
  color: #059669;
}

.history-chevron {
  width: 18px; height: 18px;
  color: #cbd5e1;
  flex-shrink: 0;
  transition: color 0.18s ease, transform 0.18s ease;
}
.history-item:hover .history-chevron {
  color: #2563eb;
  transform: translateX(2px);
}

/* ACTION BUTTONS */
.btn-action-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 22px;
  border-radius: 12px;
  border: none;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.btn-action-primary svg { width: 18px; height: 18px; }
.gradient-btn {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.32);
}
.gradient-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.42);
}
.btn-action-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.18s ease, border-color 0.18s ease;
}
.btn-action-secondary:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* QR MODAL */
.qr-modal {
  padding: 10px 6px 6px;
  text-align: center;
  font-family: 'Inter', system-ui, sans-serif;
}
.qr-modal h3 {
  margin: 0 0 18px;
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.2px;
}
.qr-code-box {
  padding: 16px;
  background: linear-gradient(135deg, #eff6ff 0%, #f0fdfa 100%);
  border-radius: 16px;
  margin: 0 auto 18px;
  display: inline-block;
  box-shadow: inset 0 0 0 1px #dbeafe;
}
.qr-details {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 16px;
  margin: 0 0 18px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.qr-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
}
.qr-label {
  color: #64748b;
  font-weight: 600;
  flex-shrink: 0;
}
.qr-value {
  color: #0f172a;
  font-weight: 700;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.qr-code-text {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  color: #1d4ed8;
  background: #eff6ff;
  padding: 3px 8px;
  border-radius: 6px;
}
.qr-actions { display: flex; justify-content: center; }

/* RESPONSIVE */
@media (min-width: 640px) {
  .page-content { padding: 0 24px; }
  .coupon-body { grid-template-columns: 1.8fr 1px 1fr; }
}

@media (max-width: 420px) {
  .page-header { padding: 18px 16px 22px; }
  .page-title { font-size: 19px; }
  .ticket-code-mono { font-size: 11.5px; padding: 4px 8px; }
  .plate-number { font-size: 15.5px; }
  .coupon-body { grid-template-columns: 1.2fr 1px 1.05fr; }
  .coupon-info { padding: 6px 14px 14px; }
  .coupon-side { padding: 6px 12px 14px 12px; }
  .parking-lot-row .lot-name { font-size: 12.5px; }
  .price-value { font-size: 15px; }
  .tab-btn { padding: 11px 10px; font-size: 12.5px; }
  .tab-btn svg { width: 14px; height: 14px; }
}
</style>


/* EDIT TICKET MODAL */
.edit-ticket-modal {
  width: 100%;
  padding: 0;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: #0f172a;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* === SECTION === */
.edit-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.edit-label-wrap {
  display: none;
}

.edit-icon-pill {
  display: none;
}

.edit-label-text {
  display: none;
}
.edit-label {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.05px;
}
.edit-label .req { color: #ef4444; }
.edit-label-hint {
  display: none;
}

/* === DATE RANGE === */
.edit-date-range {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  gap: 10px;
}

.date-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.date-field-label {
  font-size: 12px; font-weight: 700; color: #475569; letter-spacing: 0.1px;
}
.date-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.date-input-icon {
  display: none;
}
.edit-date-input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  background: #ffffff;
  font-family: inherit;
  transition: all 0.2s ease;
  outline: none;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  box-sizing: border-box;
  cursor: pointer;
}
.edit-date-input:hover:not(:disabled) {
  border-color: #cbd5e1;
  background: #f8fafc;
}
.edit-date-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
  background: #ffffff;
}
.edit-date-input:disabled {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #94a3b8;
  cursor: not-allowed;
  border-color: #e2e8f0;
  font-style: italic;
}

.date-arrow {
  padding: 0;
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
}

/* === ERROR === */
.edit-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 2px solid #fecaca;
  border-left: 4px solid #dc2626;
  color: #991b1b;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.12);
  animation: slideIn 0.3s ease;
}
.edit-error svg {
  width: 18px !important;
  height: 18px !important;
  flex-shrink: 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* === ACTIONS === */
.edit-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
  margin-top: 6px;
}
.edit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 20px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
  border: none;
  transition: all 0.18s ease;
}
.edit-btn svg {
  width: 16px !important;
  height: 16px !important;
  flex-shrink: 0;
}
.edit-btn.primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.28);
  min-width: 180px;
}
.edit-btn.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.38);
}
.edit-btn.primary:disabled {
  background: #d1d5db;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
  opacity: 0.7;
}

.edit-btn.ghost {
  background: #f8fafc;
  color: #334155;
  border: 1.5px solid #e2e8f0;
}
.edit-btn.ghost:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
}
.edit-btn.ghost:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* === TRANSITIONS === */
.pop-enter-active, .pop-leave-active {
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.pop-enter-from {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
.pop-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.98);
}

/* === RESPONSIVE === */
@media (max-width: 540px) {
  .edit-ticket-modal { padding: 0; }
  .edit-form { gap: 14px; }
  .edit-date-range { grid-template-columns: 1fr; gap: 8px; }
  .date-arrow { display: none; margin-bottom: 0; }
  .edit-actions { flex-direction: column-reverse; padding-top: 12px; }
  .edit-btn { width: 100%; min-width: 0 !important; padding: 14px 18px; }
}

/* Đặc biệt: loại bỏ style xấu mặc định của input[type=date] trên Chrome/Safari */
.edit-date-input::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 0; top: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

/* Button xóa vé PAYING */
.btn-delete-ticket {
  flex-shrink: 0 !important;
  width: 48px !important;
  height: 48px !important;
  min-width: 48px !important;
  min-height: 48px !important;
  border-radius: 14px !important;
  border: 2px solid #ef4444 !important;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  color: white !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4) !important;
  z-index: 10 !important;
}

.btn-delete-ticket svg {
  width: 22px !important;
  height: 22px !important;
  stroke-width: 2.5 !important;
}

.btn-delete-ticket:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%) !important;
  border-color: #b91c1c !important;
  transform: scale(1.12) !important;
  box-shadow: 0 8px 20px rgba(220, 38, 38, 0.5) !important;
}

.btn-delete-ticket:active {
  transform: scale(1.05) !important;
}

.history-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
}

.history-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

/* Nút xóa cho vé PAYING trong coupon card */
.coupon-btn.delete-btn {
  background: linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%);
  color: #dc2626;
  border: 1px solid #fecaca;
  font-weight: 600;
  padding: 10px 16px;
  width: 100%;
  justify-content: center;
}

.coupon-btn.delete-btn:hover {
  background: linear-gradient(135deg, #fca5a5 0%, #f87171 100%);
  border-color: #f87171;
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.coupon-btn.delete-btn svg {
  width: 18px;
  height: 18px;
  margin-right: 6px;
}

/* Vé PAYING có style khác */
.coupon-card.paying-ticket {
  border: 2px solid #fca5a5;
  box-shadow: 0 4px 16px rgba(220, 38, 38, 0.15);
}

.coupon-card.paying-ticket .status-badge.paying {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border: 1px solid #fde047;
}

/* Status badge colors - updated */
.status-badge.pending {
  /* Sẽ thay đổi màu dựa vào text "Đang hoạt động" vs "Sắp hoạt động" */
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border: 1px solid #6ee7b7;
}

/* Thêm style cho các trạng thái khác */
.status-badge {
  font-size: 11px;
  font-weight: 800;
  padding: 5px 12px;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.status-badge.parked {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #3730a3;
  border: 1px solid #a5b4fc;
}

.status-badge.checkout {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border: 1px solid #93c5fd;
}

.status-badge.expired {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.status-badge.cancelled {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
  border: 1px solid #d1d5db;
}

/* Icon vé đã hủy */
.cancelled-mark {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* History actions container */
.history-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* Nút sửa trong lịch sử */
.btn-history-edit {
  flex-shrink: 0 !important;
  width: 48px !important;
  height: 48px !important;
  min-width: 48px !important;
  min-height: 48px !important;
  border-radius: 14px !important;
  border: 2px solid #3b82f6 !important;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
  color: white !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4) !important;
  z-index: 10 !important;
}

.btn-history-edit svg {
  width: 22px !important;
  height: 22px !important;
  stroke-width: 2.5 !important;
}

.btn-history-edit:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%) !important;
  border-color: #1d4ed8 !important;
  transform: scale(1.12) !important;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.5) !important;
}

.btn-history-edit:active {
  transform: scale(1.05) !important;
}

/* History item wrapper - container cho cả vé và nút */
.history-item-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: white;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.history-item-wrapper:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

/* History item - phần thông tin vé */
.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

/* Nút hành động ở dưới */
.history-actions-bottom {
  display: none;
}
/* Side actions - mũi tên và icon cancelled */
.history-actions-side {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.history-chevron-wrapper {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
}

.history-chevron {
  width: 16px;
  height: 16px;
  color: #2563eb;
}

.history-action-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  flex-shrink: 0;
}

.btn-history-edit {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.28);
}

.btn-history-delete {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 6px 18px rgba(220, 38, 38, 0.28);
}

.history-action-icon:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.18);
}

