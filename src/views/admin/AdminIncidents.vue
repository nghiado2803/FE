<template>
  <div class="admin-page-container animated fade-in">
    <!-- ── Header ── -->
    <div class="page-header-wrapper">
      <div class="header-title-area">
        <h2>Quản lý & Xử lý</h2>
        <p class="subtitle">Theo dõi và xử lý báo cáo sự cố & yêu cầu đổi ca từ nhân viên</p>
      </div>
      <div class="header-action-group">
        <button class="btn-primary" @click="fetchAllData" :disabled="isLoading">
          <span :class="['icon', { 'spin': isLoading }]">🔄</span> Làm mới dữ liệu
        </button>
      </div>
    </div>

    <!-- ── Tabs ── -->
    <div class="tabs-container margin-bottom-24">
      <button :class="['tab-btn', { active: activeTab === 'incidents' }]" @click="activeTab = 'incidents'">
        <span class="tab-icon">🚨</span> Báo cáo sự cố
      </button>
      <button :class="['tab-btn', { active: activeTab === 'shifts' }]" @click="activeTab = 'shifts'">
        <span class="tab-icon">🔄</span> Yêu cầu đổi ca
      </button>
    </div>

    <!-- ── Incidents Tab ── -->
    <div v-if="activeTab === 'incidents'">
      <!-- ── Stats Grid ── -->
      <div class="stats-grid margin-bottom-24">
        <div class="stat-card primary">
          <div class="stat-icon">🚨</div>
          <div class="stat-content">
            <span class="stat-label">Tổng sự cố</span>
            <h3 class="stat-value">{{ incidents.length }}</h3>
          </div>
        </div>
        <div class="stat-card warning">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <span class="stat-label">Đang chờ</span>
            <h3 class="stat-value">{{ pendingCount }}</h3>
          </div>
        </div>
        <div class="stat-card success">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <span class="stat-label">Đã giải quyết</span>
            <h3 class="stat-value">{{ resolvedCount }}</h3>
          </div>
        </div>
      </div>

      <!-- ── Main Data Card ── -->
      <div class="main-data-card">
        <div class="table-responsive">
          <table class="modern-admin-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Loại / Tiêu đề</th>
                <th>Vị trí / Người báo</th>
                <th>Trạng thái</th>
                <th class="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inc in incidents" :key="inc.id" class="table-row-interactive">
                <td>
                  <div class="time-cell">
                    <div class="primary-text-bold">{{ formatTime(inc.createdAt) }}</div>
                    <div class="text-muted text-xs">{{ formatDate(inc.createdAt) }}</div>
                  </div>
                </td>
                <td>
                  <div class="title-cell">
                    <span :class="['role-badge', getTypeClass(inc.type)]">
                      {{ getTypeLabel(inc.type) }}
                    </span>
                    <div class="primary-text-bold margin-top-4">{{ inc.title }}</div>
                  </div>
                </td>
                <td>
                  <div class="info-cell">
                    <div class="text-blue-dark font-medium">📍 {{ inc.parkingLot.name }}</div>
                    <div class="text-muted text-xs margin-top-4">👤 {{ inc.reporter.fullName }}</div>
                  </div>
                </td>
                <td>
                  <span :class="['status-badge', getStatusClass(inc.status)]">
                    {{ getStatusLabel(inc.status) }}
                  </span>
                </td>
                <td class="text-center">
                  <button class="btn-action-icon edit" title="Xem chi tiết & Xử lý" @click="viewDetail(inc)">
                    ⚙️
                  </button>
                </td>
              </tr>

              <tr v-if="incidents.length === 0 && !isLoading">
                <td colspan="5" class="empty-state-cell">
                  <div class="empty-state-content">
                    <span class="empty-icon">🍃</span>
                    <p>Hệ thống chưa ghi nhận báo cáo sự cố nào.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── Shift Change Requests Tab ── -->
    <div v-if="activeTab === 'shifts'">
      <!-- ── Stats Grid ── -->
      <div class="stats-grid margin-bottom-24">
        <div class="stat-card primary">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <span class="stat-label">Tổng yêu cầu</span>
            <h3 class="stat-value">{{ shiftRequests.length }}</h3>
          </div>
        </div>
        <div class="stat-card warning">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <span class="stat-label">Đang chờ</span>
            <h3 class="stat-value">{{ shiftPendingCount }}</h3>
          </div>
        </div>
        <div class="stat-card success">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <span class="stat-label">Đã phê duyệt</span>
            <h3 class="stat-value">{{ shiftApprovedCount }}</h3>
          </div>
        </div>
      </div>

      <!-- ── Shift Requests Cards ── -->
      <div class="requests-grid">
        <div v-if="shiftRequests.length === 0 && !isLoading" class="empty-state-wrapper">
          <div class="empty-state-content">
            <span class="empty-icon">📄</span>
            <p>Hiện chưa có yêu cầu đổi ca nào.</p>
          </div>
        </div>

        <div v-for="req in shiftRequests" :key="req.id" class="request-card">
          <div :class="['card-status-bar', getShiftStatusClass(req.status)]"></div>
          <div class="card-content">
            <div class="card-header">
              <div>
                <span :class="['status-badge', getShiftStatusClass(req.status)]">
                  {{ getShiftStatusLabel(req.status) }}
                </span>
              </div>
              <div class="date">{{ formatDateTime(req.createdAt) }}</div>
            </div>

            <div class="shifts-row">
              <div class="shift-box current">
                <div class="shift-label">Ca hiện tại</div>
                <div class="shift-name">{{ req.currentShift.name }}</div>
                <div class="shift-date">{{ formatShiftDate(req.currentShiftDate) }}</div>
                <div class="shift-time">{{ req.currentShift.startTime }} - {{ req.currentShift.endTime }}</div>
              </div>
              <div class="arrow">↔</div>
              <div class="shift-box target">
                <div class="shift-label">Ca mong muốn</div>
                <div class="shift-name">{{ req.targetShift.name }}</div>
                <div class="shift-date">{{ formatShiftDate(req.targetShiftDate) }}</div>
                <div class="shift-time">{{ req.targetShift.startTime }} - {{ req.targetShift.endTime }}</div>
                <div v-if="req.targetUserName" class="target-user">Đổi với: {{ req.targetUserName }}</div>
              </div>
            </div>

            <div class="reason-section">
              <div class="reason-label">Lý do:</div>
              <div class="reason-text">{{ req.reason }}</div>
            </div>

            <div class="requester-info">
              <div class="info-item">
                <span class="info-label">👤 Người yêu cầu:</span>
                <span class="info-value">{{ req.requester.fullName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">📍 Vị trí:</span>
                <span class="info-value">{{ req.parkingLot.name }}</span>
              </div>
            </div>

            <div v-if="req.adminNote" class="admin-note">
              <div class="note-label">Phản hồi admin:</div>
              <div class="note-text">{{ req.adminNote }}</div>
            </div>

            <div v-if="req.status === 'PENDING'" class="action-buttons">
              <button class="btn-reject" @click="viewShiftDetail(req)">📝 Xem & Xử lý</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Incident Detail Modal ── -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="selectedIncident" class="modal-overlay" @click.self="selectedIncident = null">
          <div class="modal-content max-width-600 animated slide-up-modal">
            <div class="modal-header">
              <div class="header-icon-title">
                <div class="header-badge" :class="getStatusClass(selectedIncident.status)">
                  {{ getStatusLabel(selectedIncident.status) }}
                </div>
                <div class="header-text">
                  <h3>Xử lý sự cố #{{ selectedIncident.id }}</h3>
                  <p class="text-muted">Xem chi tiết và cập nhật tiến độ xử lý</p>
                </div>
              </div>
              <button class="close-btn" @click="selectedIncident = null">✕</button>
            </div>

            <div class="modal-body modal-scrollable">
              <!-- Info Cards Section -->
              <div class="info-grid-section">
                <div class="detail-info-card main-info">
                  <div class="card-header">
                    <span class="icon">📝</span>
                    <h4>Thông tin sự cố</h4>
                  </div>
                  <div class="card-content">
                    <div class="info-item">
                      <label>Tiêu đề</label>
                      <div class="value title-text">{{ selectedIncident.title }}</div>
                    </div>
                    <div class="info-item">
                      <label>Loại sự cố</label>
                      <div class="value">
                        <span :class="['type-tag', getTypeClass(selectedIncident.type)]">
                          {{ getTypeLabel(selectedIncident.type) }}
                        </span>
                      </div>
                    </div>
                    <div class="info-item full-width">
                      <label>Mô tả chi tiết</label>
                      <div class="value desc-text">{{ selectedIncident.description }}</div>
                    </div>
                  </div>
                </div>

                <div class="detail-info-card reporter-info">
                  <div class="card-header">
                    <span class="icon">👤</span>
                    <h4>Người báo cáo & Vị trí</h4>
                  </div>
                  <div class="card-content">
                    <div class="info-item">
                      <label>Nhân viên</label>
                      <div class="value font-bold">{{ selectedIncident.reporter.fullName }}</div>
                    </div>
                    <div class="info-item">
                      <label>Số điện thoại</label>
                      <div class="value">
                        <a :href="`tel:${selectedIncident.reporter.phone}`" class="phone-link">
                          {{ selectedIncident.reporter.phone || 'N/A' }}
                        </a>
                      </div>
                    </div>
                    <div class="info-item">
                      <label>Vị trí</label>
                      <div class="value location-text">📍 {{ selectedIncident.parkingLot.name }}</div>
                    </div>
                    <div class="info-item">
                      <label>Thời gian báo</label>
                      <div class="value text-sm">{{ formatDate(selectedIncident.createdAt) }} {{ formatTime(selectedIncident.createdAt) }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Lost Card Resolution Section (Conditional) -->
              <div v-if="selectedIncident.type === 'LOST_CARD' && selectedIncident.status !== 'RESOLVED'" class="lost-card-resolution-section">
                <h4 class="section-title warning-border">Nghiệp vụ xử lý mất thẻ</h4>
                <div class="action-card lost-card-box">
                  <div class="form-row-group">
                    <div class="form-group">
                      <label>Biển số xe của khách</label>
                      <div class="input-with-btn">
                        <input v-model="lostCardData.plate" type="text" class="form-control" placeholder="VD: 77A-12345" />
                        <button class="btn-check" @click="previewLostCard">🔍 Tra cứu</button>
                      </div>
                    </div>
                  </div>

                  <div v-if="lostCardData.isFound" class="fee-preview-box animated fadeIn">
                    <div class="preview-item">
                      <span class="label">Phí gửi xe tạm tính:</span>
                      <span class="value">{{ lostCardData.parkingFee.toLocaleString() }} VNĐ</span>
                    </div>
                    <div class="preview-item">
                      <span class="label">Tiền phạt mất thẻ:</span>
                      <div class="input-inline">
                        <input v-model.number="lostCardData.fineAmount" type="number" class="form-control inline-input" />
                        <span class="unit">VNĐ</span>
                      </div>
                    </div>
                    <div class="total-row">
                      <span class="label">TỔNG THU DỰ KIẾN:</span>
                      <span class="total-value">{{ (lostCardData.parkingFee + lostCardData.fineAmount).toLocaleString() }} VNĐ</span>
                    </div>
                    <button class="btn-resolve-lost" @click="resolveLostCard" :disabled="isUpdating">
                      <span v-if="isUpdating" class="spinner"></span>
                      <span v-else>✅ Xác nhận thu tiền & Checkout xe</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Action Section -->
              <div v-if="selectedIncident.status !== 'RESOLVED'" class="action-section-wrapper">
                <h4 class="section-title">Cập nhật xử lý khác</h4>
                <div class="action-card">
                  <div class="form-group margin-bottom-16">
                    <label>Trạng thái mới <span class="required">*</span></label>
                    <div class="status-select-wrapper">
                      <select v-model="statusUpdate.status" class="form-control status-select">
                        <option value="PENDING">🕒 Chờ xử lý (Pending)</option>
                        <option value="PROCESSING">⚙️ Đang xử lý (Processing)</option>
                        <option value="RESOLVED">✅ Đã giải quyết (Resolved)</option>
                        <option value="REJECTED">❌ Từ chối (Rejected)</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Ghi chú phản hồi cho nhân viên</label>
                    <textarea
                      v-model="statusUpdate.resolutionNote"
                      class="form-control resolution-textarea"
                      rows="3"
                      placeholder="Nhập hướng giải quyết hoặc lý do từ chối..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- History/Resolution Note Section (If Resolved) -->
              <div v-if="selectedIncident.status === 'RESOLVED'" class="resolution-history-section">
                <h4 class="section-title success-border">Kết quả xử lý</h4>
                <div class="resolution-note-box">
                  <p>{{ selectedIncident.resolutionNote || 'Đã giải quyết sự cố.' }}</p>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-cancel" @click="selectedIncident = null">Hủy bỏ</button>
              <button v-if="selectedIncident.status !== 'RESOLVED'" class="btn-save" @click="updateIncident" :disabled="isUpdating">
                <span v-if="isUpdating" class="spinner"></span>
                <span v-else>💾 Lưu & Phản hồi</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Shift Change Detail Modal ── -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="selectedShiftRequest" class="modal-overlay" @click.self="selectedShiftRequest = null">
          <div class="modal-content max-width-600 animated slide-up-modal">
            <div class="modal-header">
              <div class="header-icon-title">
                <div class="header-badge" :class="getShiftStatusClass(selectedShiftRequest.status)">
                  {{ getShiftStatusLabel(selectedShiftRequest.status) }}
                </div>
                <div class="header-text">
                  <h3>Xử lý yêu cầu đổi ca #{{ selectedShiftRequest.id }}</h3>
                  <p class="text-muted">Xem chi tiết và quyết định phê duyệt/từ chối</p>
                </div>
              </div>
              <button class="close-btn" @click="selectedShiftRequest = null">✕</button>
            </div>

            <div class="modal-body modal-scrollable">
              <!-- Shift Info -->
              <div class="info-grid-section">
                <div class="detail-info-card main-info">
                  <div class="card-header">
                    <span class="icon">🔄</span>
                    <h4>Thông tin đổi ca</h4>
                  </div>
                  <div class="card-content">
                    <div class="shifts-row">
                      <div class="shift-box current">
                        <div class="shift-label">Ca hiện tại</div>
                        <div class="shift-name">{{ selectedShiftRequest.currentShift.name }}</div>
                        <div class="shift-date">{{ formatShiftDate(selectedShiftRequest.currentShiftDate) }}</div>
                        <div class="shift-time">{{ selectedShiftRequest.currentShift.startTime }} - {{ selectedShiftRequest.currentShift.endTime }}</div>
                      </div>
                      <div class="arrow">↔</div>
                      <div class="shift-box target">
                        <div class="shift-label">Ca mong muốn</div>
                        <div class="shift-name">{{ selectedShiftRequest.targetShift.name }}</div>
                        <div class="shift-date">{{ formatShiftDate(selectedShiftRequest.targetShiftDate) }}</div>
                        <div class="shift-time">{{ selectedShiftRequest.targetShift.startTime }} - {{ selectedShiftRequest.targetShift.endTime }}</div>
                        <div v-if="selectedShiftRequest.targetUserName" class="target-user">Đổi với: {{ selectedShiftRequest.targetUserName }}</div>
                      </div>
                    </div>
                    <div class="reason-section">
                      <div class="reason-label">Lý do:</div>
                      <div class="reason-text">{{ selectedShiftRequest.reason }}</div>
                    </div>
                  </div>
                </div>

                <div class="detail-info-card reporter-info">
                  <div class="card-header">
                    <span class="icon">👤</span>
                    <h4>Người yêu cầu</h4>
                  </div>
                  <div class="card-content">
                    <div class="info-item">
                      <label>Họ tên</label>
                      <div class="value font-bold">{{ selectedShiftRequest.requester.fullName }}</div>
                    </div>
                    <div class="info-item">
                      <label>Vị trí</label>
                      <div class="value location-text">📍 {{ selectedShiftRequest.parkingLot.name }}</div>
                    </div>
                    <div class="info-item">
                      <label>Ngày gửi yêu cầu</label>
                      <div class="value text-sm">{{ formatDateTime(selectedShiftRequest.createdAt) }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Section -->
              <div v-if="selectedShiftRequest.status === 'PENDING'" class="action-section-wrapper">
                <h4 class="section-title">Quyết định</h4>
                <div class="action-card">
                  <div class="form-group margin-bottom-16">
                    <label>Trạng thái <span class="required">*</span></label>
                    <div class="status-select-wrapper">
                      <select v-model="shiftStatusUpdate.status" class="form-control status-select">
                        <option value="APPROVED">✅ Phê duyệt (Approved)</option>
                        <option value="REJECTED">❌ Từ chối (Rejected)</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Ghi chú (nếu có)</label>
                    <textarea
                      v-model="shiftStatusUpdate.adminNote"
                      class="form-control resolution-textarea"
                      rows="3"
                      placeholder="Nhập ghi chú cho nhân viên..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Note Section -->
              <div v-if="selectedShiftRequest.adminNote" class="resolution-history-section">
                <h4 class="section-title success-border">Ghi chú</h4>
                <div class="resolution-note-box">
                  <p>{{ selectedShiftRequest.adminNote }}</p>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-cancel" @click="selectedShiftRequest = null">Hủy bỏ</button>
              <button v-if="selectedShiftRequest.status === 'PENDING'" class="btn-save" @click="updateShiftRequest" :disabled="isUpdating">
                <span v-if="isUpdating" class="spinner"></span>
                <span v-else>💾 Lưu & Phản hồi</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import apiClient from '@/services/api'

interface Incident {
  id: number
  title: string
  description: string
  status: string
  type: string
  resolutionNote?: string
  createdAt: string
  parkingLot: { id: number; name: string }
  reporter: { fullName: string; phone?: string }
}

interface Shift {
  id: number
  name: string
  startTime: string
  endTime: string
}

interface ShiftChangeRequest {
  id: number
  requester: { id: number; fullName: string }
  currentShiftDate: string
  currentShift: Shift
  targetShiftDate: string
  targetShift: Shift
  targetUserId?: number
  targetUserName?: string
  parkingLot: { id: number; name: string }
  reason: string
  status: string
  adminNote?: string
  createdAt: string
  updatedAt: string
}

const activeTab = ref<'incidents' | 'shifts'>('incidents')
const incidents = ref<Incident[]>([])
const shiftRequests = ref<ShiftChangeRequest[]>([])
const isLoading = ref(false)
const selectedIncident = ref<Incident | null>(null)
const selectedShiftRequest = ref<ShiftChangeRequest | null>(null)
const isUpdating = ref(false)

const statusUpdate = ref({
  status: '',
  resolutionNote: ''
})

const shiftStatusUpdate = ref({
  status: 'APPROVED',
  adminNote: ''
})

const lostCardData = ref({
  plate: '',
  fineAmount: 50000,
  parkingFee: 0,
  isFound: false
})

const pendingCount = computed(() => incidents.value.filter(i => i.status === 'PENDING').length)
const resolvedCount = computed(() => incidents.value.filter(i => i.status === 'RESOLVED').length)
const shiftPendingCount = computed(() => shiftRequests.value.filter(r => r.status === 'PENDING').length)
const shiftApprovedCount = computed(() => shiftRequests.value.filter(r => r.status === 'APPROVED').length)

const fetchIncidents = async () => {
  isLoading.value = true
  try {
    const res = await apiClient.get('/incidents/all')
    // Lọc chỉ lấy các báo cáo không phải yêu cầu đổi ca
    incidents.value = (res as unknown as Incident[]).filter(i => i.type !== 'SHIFT_CHANGE')
  } catch (error) {
    console.error('Lỗi tải sự cố:', error)
  } finally {
    isLoading.value = false
  }
}

const fetchShiftRequests = async () => {
  try {
    const res = await apiClient.get('/admin/shift-change-requests')
    shiftRequests.value = res as unknown as ShiftChangeRequest[]
  } catch (error) {
    console.error('Lỗi tải yêu cầu đổi ca:', error)
  }
}

const fetchAllData = async () => {
  isLoading.value = true
  await Promise.all([fetchIncidents(), fetchShiftRequests()])
  isLoading.value = false
}

const viewDetail = (inc: Incident) => {
  selectedIncident.value = inc
  statusUpdate.value = {
    status: inc.status,
    resolutionNote: inc.resolutionNote || ''
  }

  // Reset lost card data
  if (inc.type === 'LOST_CARD') {
    // Try to extract plate from description (assuming staff follows instruction)
    const plateMatch = inc.description.match(/[0-9]{2}[A-Z][0-9\-.]+/i)
    lostCardData.value = {
      plate: plateMatch ? plateMatch[0] : '',
      fineAmount: 50000,
      parkingFee: 0,
      isFound: false
    }
  }
}

const previewLostCard = async () => {
  if (!lostCardData.value.plate || !selectedIncident.value) return
  try {
    const res = await apiClient.get('/incidents/preview-lost-card', {
      params: {
        plate: lostCardData.value.plate,
        lotId: selectedIncident.value.parkingLot.id
      }
    }) as unknown as { parkingFee: number }
    lostCardData.value.parkingFee = res.parkingFee
    lostCardData.value.isFound = true
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    window.toast?.(err.response?.data?.message || 'Không tìm thấy xe đang đỗ với biển số này!', 'error')
    lostCardData.value.isFound = false
  }
}

const resolveLostCard = async () => {
  if (!selectedIncident.value || !lostCardData.value.isFound) return
  isUpdating.value = true
  try {
    await apiClient.post(`/incidents/${selectedIncident.value.id}/resolve-lost-card`, {
      plate: lostCardData.value.plate,
      fineAmount: lostCardData.value.fineAmount
    })
    window.toast?.('Đã xử lý mất thẻ và checkout xe thành công!', 'success')
    selectedIncident.value = null
    fetchIncidents()
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    window.toast?.(err.response?.data?.message || 'Lỗi xử lý mất thẻ!', 'error')
  } finally {
    isUpdating.value = false
  }
}

const updateIncident = async () => {
  if (!selectedIncident.value) return
  isUpdating.value = true
  try {
    await apiClient.put(`/incidents/${selectedIncident.value.id}/status`, statusUpdate.value)
    window.toast?.('Cập nhật trạng thái sự cố thành công!', 'success')
    selectedIncident.value = null
    fetchIncidents()
  } catch (error) {
    console.error('Lỗi cập nhật:', error)
    window.toast?.('Có lỗi xảy ra khi cập nhật sự cố.', 'error')
  } finally {
    isUpdating.value = false
  }
}

const viewShiftDetail = (req: ShiftChangeRequest) => {
  // Ensure shift objects exist
  const safeReq = {
    ...req,
    currentShift: req.currentShift || { id: 0, name: 'N/A', startTime: '00:00', endTime: '00:00' },
    targetShift: req.targetShift || { id: 0, name: 'N/A', startTime: '00:00', endTime: '00:00' }
  }
  selectedShiftRequest.value = safeReq
  shiftStatusUpdate.value = {
    status: 'APPROVED',
    adminNote: req.adminNote || ''
  }
}

const updateShiftRequest = async () => {
  if (!selectedShiftRequest.value) return
  isUpdating.value = true
  try {
    await apiClient.put(`/admin/shift-change-requests/${selectedShiftRequest.value.id}/status`, shiftStatusUpdate.value)
    window.toast?.('Cập nhật yêu cầu đổi ca thành công!', 'success')
    selectedShiftRequest.value = null
    fetchShiftRequests()
    // Dispatch sự kiện để AdminShiftAssignment.vue reload
    window.dispatchEvent(new CustomEvent('shiftRequestUpdated'))
  } catch (error) {
    console.error('Lỗi cập nhật:', error)
    window.toast?.('Có lỗi xảy ra khi cập nhật yêu cầu đổi ca.', 'error')
  } finally {
    isUpdating.value = false
  }
}

const getShiftStatusLabel = (status: string) => {
  const map: Record<string, string> = { 'PENDING': 'Chờ xử lý', 'APPROVED': 'Đã phê duyệt', 'REJECTED': 'Từ chối' }
  return map[status] || status
}

const getShiftStatusClass = (status: string) => {
  const map: Record<string, string> = { 'PENDING': 'warning', 'APPROVED': 'success', 'REJECTED': 'danger' }
  return map[status] || ''
}

const formatDateTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

const formatShiftDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return 'N/A'
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = { 'PENDING': 'Chờ xử lý', 'PROCESSING': 'Đang xử lý', 'RESOLVED': 'Đã giải quyết', 'REJECTED': 'Từ chối' }
  return map[status] || status
}

const getStatusClass = (status: string) => {
  const map: Record<string, string> = { 'PENDING': 'warning', 'PROCESSING': 'info', 'RESOLVED': 'success', 'REJECTED': 'danger' }
  return map[status] || ''
}

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = { 'LOST_CARD': 'Mất thẻ', 'EQUIPMENT': 'Thiết bị', 'SECURITY': 'An ninh', 'OTHER': 'Khác' }
  return map[type] || type
}

const getTypeClass = (type: string) => {
  const map: Record<string, string> = { 'LOST_CARD': 'admin', 'EQUIPMENT': 'staff', 'SECURITY': 'admin', 'OTHER': 'neutral' }
  return map[type] || ''
}

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

onMounted(fetchAllData)
</script>

<style scoped>
/* SmartPark Design System Overrides */
.admin-page-container {
  padding: 32px;
  max-width: 1440px;
  margin: 0 auto;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: #f8fafc;
  min-height: 100vh;
}

.admin-page-container * {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Header */
.page-header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}
.header-title-area h2 {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px 0;
}
.subtitle {
  color: #64748b;
  font-size: 15px;
  margin: 0;
}

/* Tabs */
.tabs-container {
  display: flex;
  gap: 12px;
  background: white;
  padding: 10px;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
}

.tab-btn {
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  color: #64748b;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #f8fafc;
  color: #475569;
}

.tab-btn.active {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.tab-icon {
  font-size: 18px;
}

.margin-bottom-24 { margin-bottom: 32px; }

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}
.stat-card {
  background: white;
  padding: 24px;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}
.stat-icon {
  font-size: 28px;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-card.primary .stat-icon { background: #eff6ff; }
.stat-card.warning .stat-icon { background: #fff7ed; }
.stat-card.success .stat-icon { background: #f0fdf4; }
.stat-label {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}
.stat-value {
  font-size: 32px;
  font-weight: 900;
  color: #0f172a;
  margin: 4px 0 0;
}

/* Table */
.main-data-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  overflow: hidden;
}
.modern-admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.modern-admin-table th {
  background: #f8fafc;
  padding: 20px 28px;
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  border-bottom: 1px solid #e2e8f0;
}
.modern-admin-table td {
  padding: 20px 28px;
  border-bottom: 1px solid #f1f5f9;
}
.table-row-interactive:hover {
  background: #f8fafc;
}

/* Badges & Status */
.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}
.status-badge.success { background: #dcfce7; color: #166534; }
.status-badge.warning { background: #fef3c7; color: #92400e; }
.status-badge.info { background: #eff6ff; color: #1e40af; }
.status-badge.danger { background: #fee2e2; color: #991b1b; }

.role-badge {
  padding: 4px 12px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
.role-badge.admin { background: #fee2e2; color: #991b1b; }
.role-badge.staff { background: #eff6ff; color: #1e40af; }
.role-badge.customer { background: #fef3c7; color: #92400e; }
.role-badge.neutral { background: #f1f5f9; color: #475569; }

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: inherit;
  transition: all 0.2s;
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary {
  background: white;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  font-family: inherit;
}
.btn-action-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
}
.btn-action-icon:hover { background: #eff6ff; border-color: #2563eb; color: #2563eb; }

/* Shift Change Requests Grid */
.requests-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.request-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  overflow: hidden;
  display: flex;
  transition: all 0.2s;
}

.request-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
}

.card-status-bar {
  width: 8px;
  flex-shrink: 0;
}
.card-status-bar.pending { background-color: #f59e0b; }
.card-status-bar.approved { background-color: #10b981; }
.card-status-bar.rejected { background-color: #ef4444; }
.card-status-bar.warning { background-color: #f59e0b; }
.card-status-bar.success { background-color: #10b981; }
.card-status-bar.danger { background-color: #ef4444; }

.card-content {
  flex: 1;
  padding: 28px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.shifts-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
}

.shift-box {
  background: #f8fafc;
  border-radius: 16px;
  padding: 28px;
  text-align: center;
  border: 2px solid #e2e8f0;
}

.shift-box.current {
  border-color: #94a3b8;
  background: #f1f5f9;
}

.shift-box.target {
  border-color: #2563eb;
  background: #eff6ff;
}

.shift-label {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  margin-bottom: 8px;
}

.shift-name {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 6px;
}

.shift-date {
  font-size: 14px;
  color: #475569;
  margin-bottom: 6px;
  font-weight: 700;
}

.shift-time {
  font-size: 13px;
  color: #64748b;
}

.arrow {
  font-size: 24px;
  color: #2563eb;
  font-weight: 900;
}

.reason-section {
  margin-bottom: 16px;
  background: #f8fafc;
  padding: 16px;
  border-radius: 14px;
}

.reason-label {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  margin-bottom: 8px;
}

.reason-text {
  font-size: 14.5px;
  color: #475569;
  line-height: 1.6;
}

.requester-info {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #e2e8f0;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.info-label {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
}

.info-value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 600;
}

.text-blue-dark { color: #1e40af; }
.text-muted { color: #64748b; }
.text-xs { font-size: 12px; }
.margin-top-4 { margin-top: 4px; }
.text-center { text-align: center; }

.admin-note {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e2e8f0;
}

.note-label {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  margin-bottom: 8px;
}

.note-text {
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
  font-style: italic;
}

.action-buttons {
  margin-top: 16px;
}

.btn-reject {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}
.btn-reject:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }

/* Modal System (Centered) */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 24px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
.modal-overlay * {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
.modal-content {
  background: white; border-radius: 24px; width: 100%;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  overflow: hidden; display: flex; flex-direction: column;
  max-height: calc(100vh - 48px);
}
.max-width-600 { max-width: 800px; }
.modal-header {
  padding: 28px 32px; border-bottom: 1px solid #e2e8f0;
  display: flex; justify-content: space-between; align-items: flex-start;
}
.modal-body { padding: 32px; overflow-y: auto; }
.modal-scrollable { max-height: 65vh; }
.modal-footer {
  padding: 20px 32px; border-top: 1px solid #e2e8f0;
  display: flex; justify-content: flex-end; gap: 14px;
  background-color: #f8fafc;
}
.section-title {
  font-size: 14px; font-weight: 800; color: #0f172a;
  text-transform: uppercase; border-left: 4px solid #2563eb;
  padding-left: 10px; margin-bottom: 16px;
}
.section-title.warning-border { border-left-color: #f59e0b; }
.section-title.success-border { border-left-color: #10b981; }

.btn-cancel {
  background: white;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel:hover { background: #f8fafc; }

.btn-save {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

/* Lost Card Styles */
.lost-card-resolution-section { margin-bottom: 32px; }
.lost-card-box {
  border: 2px solid #fff7ed;
  background: #fffcf9;
  border-radius: 16px;
  padding: 20px;
}
.input-with-btn { display: flex; gap: 10px; }
.btn-check {
  background: #f59e0b; color: white; border: none; padding: 0 20px;
  border-radius: 10px; font-weight: 700; cursor: pointer; white-space: nowrap;
  transition: all 0.2s;
}
.btn-check:hover { background: #d97706; transform: translateY(-1px); }
.fee-preview-box {
  margin-top: 20px; padding: 20px; background: white; border-radius: 14px;
  border: 1px solid #fed7aa;
}
.preview-item {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 14px; font-size: 14px; color: #475569;
}
.preview-item .label { font-weight: 700; }
.preview-item .value { font-weight: 800; color: #0f172a; }
.input-inline { display: flex; align-items: center; gap: 8px; }
.inline-input { width: 130px; text-align: right; font-weight: 700; color: #0f172a; }
.unit { font-size: 12px; font-weight: 800; color: #64748b; }

.total-row {
  display: flex; justify-content: space-between; align-items: center;
  margin: 16px 0; padding-top: 16px; border-top: 2px dashed #fed7aa;
}
.total-row .label { font-weight: 900; color: #0f172a; font-size: 14px; }
.total-value { font-size: 22px; font-weight: 900; color: #dc2626; }

.btn-resolve-lost {
  width: 100%; padding: 14px; background: #10b981; color: white;
  border: none; border-radius: 12px; font-weight: 800; cursor: pointer;
  transition: all 0.2s;
}
.btn-resolve-lost:hover { background: #059669; transform: translateY(-1px); }
.btn-resolve-lost:disabled { opacity: 0.6; cursor: not-allowed; }

.resolution-note-box {
  background: #f0fdf4; border: 1px solid #dcfce7; padding: 20px;
  border-radius: 14px; color: #166534; font-weight: 700; font-style: italic;
}

.form-group label { display: block; font-size: 13px; font-weight: 800; color: #475569; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
.form-control {
  width: 100%; padding: 14px 18px; border: 2px solid #f1f5f9; border-radius: 14px;
  font-size: 15px; outline: none; transition: all 0.2s; box-sizing: border-box;
  background: #f8fafc; font-family: inherit;
}
.form-control:focus {
  border-color: #3b82f6; background: white; box-shadow: 0 0 0 4px rgba(37,99,235,0.1);
}
.margin-bottom-16 { margin-bottom: 20px; }
.resolution-textarea { resize: vertical; min-height: 100px; }
.required { color: #dc2626; }

/* Detail Modal Enhancements */
.header-icon-title { display: flex; align-items: center; gap: 16px; }
.header-badge {
  padding: 6px 14px; border-radius: 10px; font-size: 12px;
  font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;
}
.header-badge.warning { background: #fff7ed; color: #9a3412; border: 1px solid #ffedd5; }
.header-badge.info { background: #eff6ff; color: #1e40af; border: 1px solid #dbeafe; }
.header-badge.success { background: #ecfdf5; color: #065f46; border: 1px solid #d1fae5; }
.header-badge.danger { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }

.header-text h3 { margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; }
.header-text p { margin: 6px 0 0; font-size: 15px; color: #64748b; }
.close-btn {
  background: #f1f5f9; border: none; width: 40px; height: 40px;
  border-radius: 12px; color: #64748b; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; font-size: 18px;
}
.close-btn:hover { background: #e2e8f0; color: #0f172a; transform: rotate(90deg); }

.info-grid-section {
  display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; margin-bottom: 32px;
}

.detail-info-card {
  background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;
  padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}
.detail-info-card.main-info { background: #f8fafc; border-color: #e2e8f0; }

.card-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
  padding-bottom: 10px; border-bottom: 1px dashed #e2e8f0;
}
.card-header h4 { margin: 0; font-size: 14px; font-weight: 800; color: #334155; }
.card-header .icon { font-size: 18px; }

.card-content { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.info-item.full-width { grid-column: span 2; }
.info-item .title-text { font-size: 15px; font-weight: 800; color: #0f172a; }
.info-item .desc-text {
  font-size: 14px; color: #475569; line-height: 1.6; font-style: italic;
  background: white; padding: 12px; border-radius: 10px; border: 1px solid #f1f5f9;
}
.info-item .location-text { font-size: 14px; color: #1e40af; font-weight: 800; }
.info-item .font-bold { font-weight: 800; }
.info-item .text-sm { font-size: 13px; color: #64748b; font-weight: 600; }

.phone-link {
  font-size: 14px; color: #2563eb; text-decoration: none; font-weight: 700;
  display: flex; align-items: center; gap: 4px;
}
.phone-link:hover { text-decoration: underline; }

.type-tag {
  font-size: 12px;
  font-weight: 800;
  padding: 8px 14px;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 8px;
}
.type-tag.admin { background: #fee2e2; color: #be123c; }
.type-tag.staff { background: #f0fdf4; color: #15803d; }

.action-section-wrapper { margin-bottom: 24px; }
.action-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
}

.status-select-wrapper { margin-bottom: 8px; }
.status-select { font-weight: 700; color: #0f172a; font-family: inherit; }

/* Empty State */
.empty-state-cell { padding: 80px 20px; }
.empty-state-content { text-align: center; }
.empty-state-wrapper {
  padding: 80px 20px;
  text-align: center;
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
}
.empty-icon {
  font-size: 64px;
  opacity: 0.5;
  margin-bottom: 16px;
  display: block;
}
.empty-state-content p, .empty-state-wrapper p { color: #64748b; margin: 0; font-size: 15px; }

/* Spinner */
.spinner {
  width: 20px; height: 20px;
  border: 2px solid #f1f5f9;
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  display: inline-block;
  margin-right: 8px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Transitions */
.animated { animation-duration: 0.4s; animation-fill-mode: both; }
.fade-in { animation-name: fadeIn; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* Responsive */
@media (max-width: 1024px) {
  .requests-grid { grid-template-columns: 1fr; }
  .info-grid-section { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .admin-page-container { padding: 20px; }
  .stats-grid { grid-template-columns: 1fr; }
  .page-header-wrapper { flex-direction: column; align-items: flex-start; gap: 20px; }
  .form-row { flex-direction: column; }
  .shifts-row { grid-template-columns: 1fr; gap: 12px; }
  .arrow { transform: rotate(90deg); }
}
.type-tag.staff { background: #eff6ff; color: #2563eb; }
.type-tag.customer { background: #fef3c7; color: #92400e; }
.type-tag.admin { background: #fee2e2; color: #dc2626; }
.type-tag.neutral { background: #f1f5f9; color: #475569; }

.phone-link { color: #2563eb; text-decoration: none; font-weight: 700; }
.phone-link:hover { text-decoration: underline; }
.location-text { color: #1e3a8a; font-weight: 800; }

.action-section-wrapper { margin-top: 8px; }
.action-card {
  background: #ffffff; border: 2px solid #eff6ff; border-radius: 16px;
  padding: 20px;
}

.status-select-wrapper { position: relative; }
.status-select {
  appearance: none; background-color: #f8fafc; font-weight: 800;
  border: 1.5px solid #e2e8f0; color: #0f172a;
}
.status-select:focus { border-color: #2563eb; background-color: #ffffff; }

.resolution-textarea {
  resize: vertical; min-height: 100px; background-color: #f8fafc;
  border: 1.5px solid #e2e8f0;
}
.resolution-textarea:focus { border-color: #2563eb; background-color: #ffffff; }

.btn-cancel {
  background: #f1f5f9; color: #475569; border: none; padding: 10px 24px;
  border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s;
}
.btn-cancel:hover { background: #e2e8f0; }

.btn-save {
  background: #2563eb; color: white; border: none; padding: 10px 24px;
  border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.2s;
  box-shadow: 0 4px 12px rgba(37,99,235,0.2);
}
.btn-save:hover { background: #1d4ed8; transform: translateY(-1px); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.spinner {
  width: 18px; height: 18px; border: 2px solid white; border-top-color: transparent;
  border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block;
}

@media (max-width: 640px) {
  .info-grid-section { grid-template-columns: 1fr; }
  .info-item.full-width { grid-column: auto; }
}

.close-btn { background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.animated { animation-duration: 0.3s; }
.fade-in { animation-name: fadeIn; }
.slide-up-modal { animation-name: slideUp; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.margin-bottom-24 { margin-bottom: 24px; }
.margin-bottom-16 { margin-bottom: 16px; }
.margin-top-4 { margin-top: 4px; }
.primary-text-bold { font-weight: 700; }
.font-bold { font-weight: 800; }
.text-sm { font-size: 13px; }
.text-xs { font-size: 12px; }
.text-muted { color: #64748b; }
.text-blue-dark { color: #1e3a8a; }
.font-medium { font-weight: 500; }
.text-center { text-align: center; }

/* Shift Change Request Cards */
.requests-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.empty-state-wrapper {
  grid-column: 1 / -1;
}

.request-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
  overflow: hidden;
  display: flex;
  transition: all 0.2s;
}

.request-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04);
}

.card-status-bar {
  width: 6px;
  flex-shrink: 0;
}

.card-status-bar.warning { background-color: #f59e0b; }
.card-status-bar.success { background-color: #10b981; }
.card-status-bar.danger { background-color: #ef4444; }

.card-content {
  flex: 1;
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header .date {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.shifts-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.shift-box {
  background: #f8fafc;
  border-radius: 14px;
  padding: 16px;
  text-align: center;
  border: 2px solid #e2e8f0;
}

.shift-box.current {
  border-color: #94a3b8;
  background: #f1f5f9;
}

.shift-box.target {
  border-color: #2563eb;
  background: #eff6ff;
}

.shift-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  margin-bottom: 6px;
}

.shift-name {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 4px;
}

.shift-date {
  font-size: 13px;
  color: #475569;
  margin-bottom: 4px;
  font-weight: 600;
}

.shift-time {
  font-size: 12px;
  color: #64748b;
}

.target-user {
  font-size: 12px;
  margin-top: 6px;
  color: #1d4ed8;
  font-weight: 600;
}

.arrow {
  font-size: 20px;
  color: #2563eb;
  font-weight: 800;
}

.reason-section {
  margin-bottom: 16px;
  background: #f8fafc;
  padding: 12px;
  border-radius: 12px;
}

.reason-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  margin-bottom: 6px;
}

.reason-text {
  font-size: 13.5px;
  color: #475569;
  line-height: 1.5;
}

.requester-info {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  background: #eff6ff;
  padding: 10px 14px;
  border-radius: 10px;
}

.requester-info .info-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.requester-info .info-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.requester-info .info-value {
  font-size: 13px;
  font-weight: 700;
  color: #1e3a8a;
}

.admin-note {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e2e8f0;
}

.admin-note .note-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  margin-bottom: 6px;
}

.admin-note .note-text {
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
  font-style: italic;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.btn-reject {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  transition: all 0.2s;
}

.btn-reject:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37,99,235,0.2);
}
</style>
