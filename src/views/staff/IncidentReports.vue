<template>
  <div class="incident-page-container animated fadeIn">
    <div class="page-header-wrapper">
      <div class="header-title-area">
        <h2>Báo cáo & Yêu cầu</h2>
        <p class="subtitle">Quản lý và theo dõi các vấn đề và yêu cầu đổi ca</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <button :class="['tab-btn', { active: activeTab === 'incidents' }]" @click="activeTab = 'incidents'">
        <span class="tab-icon">🚨</span> Báo cáo sự cố
      </button>
      <button :class="['tab-btn', { active: activeTab === 'shifts' }]" @click="activeTab = 'shifts'">
        <span class="tab-icon">🔄</span> Yêu cầu đổi ca
      </button>
    </div>

    <!-- Incidents Tab -->
    <div v-if="activeTab === 'incidents'">
      <div class="tab-toolbar">
        <button class="btn-report-new" @click="openIncidentModal">
          <span class="icon">➕</span> Tạo báo cáo mới
        </button>
      </div>

      <div class="stats-overview-grid">
        <div class="stat-mini-card">
          <span class="stat-label">Tổng báo cáo</span>
          <span class="stat-value">{{ reports.length }}</span>
        </div>
        <div class="stat-mini-card">
          <span class="stat-label">Đang chờ</span>
          <span class="stat-value text-warning">{{ reports.filter(r => r.status === 'PENDING').length }}</span>
        </div>
        <div class="stat-mini-card">
          <span class="stat-label">Đã xử lý</span>
          <span class="stat-value text-success">{{ reports.filter(r => r.status === 'RESOLVED').length }}</span>
        </div>
      </div>

      <div class="reports-list">
        <div v-if="isLoadingIncidents" class="loading-state">
          <div class="spinner"></div>
          <p>Đang đồng bộ dữ liệu sự cố...</p>
        </div>

        <div v-else-if="reports.length === 0" class="empty-state">
          <div class="empty-illustration">📂</div>
          <h3>Chưa có báo cáo nào</h3>
          <p>Mọi thứ vẫn đang vận hành ổn định tại bãi đỗ của bạn.</p>
        </div>

        <div v-for="report in reports" :key="report.id" class="report-card-modern">
          <div class="card-status-bar" :class="report.status.toLowerCase()"></div>
          <div class="card-body">
            <div class="card-top">
              <div class="type-tag" :class="report.type.toLowerCase()">
                {{ getTypeIcon(report.type) }} {{ getTypeLabel(report.type) }}
              </div>
              <span :class="['status-pill', report.status.toLowerCase()]">
                {{ getStatusLabel(report.status) }}
              </span>
            </div>

            <h3 class="report-title">{{ report.title }}</h3>
            <p class="report-desc">{{ report.description }}</p>

            <div v-if="report.resolutionNote" class="resolution-feedback">
              <div class="feedback-header">
                <span class="admin-avatar">A</span>
                <div class="admin-info">
                  <span class="admin-name">Quản trị viên</span>
                  <span class="feedback-label">Phản hồi xử lý</span>
                </div>
              </div>
              <div class="feedback-content">
                {{ report.resolutionNote }}
              </div>
            </div>

            <div class="card-footer">
              <div class="footer-item">
                <span class="icon">📅</span>
                {{ formatDateTime(report.createdAt) }}
              </div>
              <div class="footer-item lot-info">
                <span class="icon">📍</span>
                {{ report.parkingLot.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Shift Change Tab -->
    <div v-if="activeTab === 'shifts'">
      <div class="tab-toolbar">
        <button class="btn-report-new" @click="openShiftModal">
          <span class="icon">➕</span> Tạo yêu cầu đổi ca
        </button>
      </div>

      <div class="stats-overview-grid">
        <div class="stat-mini-card">
          <span class="stat-label">Tổng yêu cầu</span>
          <span class="stat-value">{{ shiftRequests.length }}</span>
        </div>
        <div class="stat-mini-card">
          <span class="stat-label">Đang chờ</span>
          <span class="stat-value text-warning">{{ shiftRequests.filter(r => r.status === 'PENDING').length }}</span>
        </div>
        <div class="stat-mini-card">
          <span class="stat-label">Đã phê duyệt</span>
          <span class="stat-value text-success">{{ shiftRequests.filter(r => r.status === 'APPROVED').length }}</span>
        </div>
      </div>

      <div class="requests-grid">
        <div v-if="isLoadingShifts" class="loading-state">
          <div class="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>

        <div v-else-if="shiftRequests.length === 0" class="empty-state">
          <div class="empty-illustration">📄</div>
          <h3>Chưa có yêu cầu đổi ca nào</h3>
          <p>Tạo yêu cầu đổi ca đầu tiên của bạn!</p>
        </div>

        <div v-for="req in shiftRequests" :key="req.id" class="request-card">
          <div :class="['card-status-bar', req.status.toLowerCase()]"></div>
          <div class="card-body">
            <div class="card-top">
              <span :class="['status-pill', req.status.toLowerCase()]">
                {{ getShiftStatusLabel(req.status) }}
              </span>
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

            <div class="lot-info">
              <span class="icon">📍</span>
              {{ req.parkingLot.name }}
            </div>

            <div v-if="req.adminNote" class="admin-note">
              <div class="note-label">Phản hồi admin:</div>
              <div class="note-text">{{ req.adminNote }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Report Incident -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="isIncidentModalOpen" class="modal-overlay" @click.self="closeIncidentModal">
          <div class="modal-content max-width-500 animated slide-up-modal">
            <div class="modal-header">
              <div class="header-text">
                <h3>Báo cáo sự cố mới</h3>
                <p>Mô tả vấn đề để Admin hỗ trợ xử lý</p>
              </div>
              <button class="close-btn" @click="closeIncidentModal">✕</button>
            </div>

            <div class="modal-body modal-scrollable">
              <div class="form-group">
                <label>Phân loại sự cố</label>
                <div class="type-selector">
                  <button
                    v-for="t in incidentTypes"
                    :key="t.value"
                    :class="['type-btn', { active: incidentForm.type === t.value }]"
                    @click="incidentForm.type = t.value"
                  >
                    {{ t.label }}
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>Tiêu đề ngắn gọn</label>
                <input v-model="incidentForm.title" type="text" placeholder="VD: Khách làm mất thẻ xe..." class="form-control" />
              </div>

              <div class="form-group">
                <label>Mô tả chi tiết</label>
                <textarea
                  v-model="incidentForm.description"
                  class="form-control"
                  rows="4"
                  :placeholder="incidentForm.type === 'LOST_CARD' ? 'Vui lòng nhập BIỂN SỐ XE của khách để Admin đối soát...' : 'Nhập nội dung sự cố chi tiết...'"
                ></textarea>
              </div>

              <div class="form-group no-margin">
                <label>Bãi đỗ xe hiện tại</label>
                <select v-model="incidentForm.lotId" class="form-control">
                  <option v-for="lot in myLots" :key="lot.id" :value="lot.id">{{ lot.name }}</option>
                </select>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-secondary" @click="closeIncidentModal">Hủy bỏ</button>
              <button class="btn-primary" :disabled="isSubmittingIncident" @click="submitIncidentReport">
                {{ isSubmittingIncident ? 'Đang gửi...' : 'Gửi báo cáo' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Shift Change Request -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="isShiftModalOpen" class="modal-overlay" @click.self="closeShiftModal">
          <div class="modal-content max-width-600 animated slide-up-modal">
            <div class="modal-header">
              <div class="header-text">
                <h3>Tạo yêu cầu đổi ca</h3>
                <p>Điền thông tin để gửi yêu cầu đến quản trị viên</p>
              </div>
              <button class="close-btn" @click="closeShiftModal">✕</button>
            </div>

            <div class="modal-body modal-scrollable">
              <div class="form-group">
                <label>Bãi đỗ *</label>
                <select v-model="shiftForm.lotId" class="form-control">
                  <option :value="null">Chọn bãi</option>
                  <option v-for="lot in myLots" :key="lot.id" :value="lot.id">{{ lot.name }}</option>
                </select>
              </div>

              <div class="form-row">
                <div class="form-group half">
                  <label>Ngày làm hiện tại *</label>
                  <input v-model="shiftForm.currentShiftDate" type="date" lang="vi" class="form-control" />
                </div>
                <div class="form-group half">
                  <label>Ca hiện tại *</label>
                  <select v-model="shiftForm.currentAssignmentId" class="form-control">
                    <option :value="null">Chọn ca</option>
                    <option v-for="shift in myAssignedShifts" :key="shift.assignmentId" :value="shift.assignmentId">
                      {{ shift.shiftName }} ({{ shift.startTime }} - {{ shift.endTime }}) - {{ formatShiftDate(shift.shiftDate) }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group half">
                  <label>Ngày làm mong muốn *</label>
                  <input v-model="shiftForm.targetShiftDate" type="date" lang="vi" class="form-control" />
                </div>
                <div class="form-group half">
                  <label>Đồng nghiệp để đổi ca *</label>
                  <select v-model="shiftForm.targetAssignmentId" class="form-control">
                    <option :value="null">Chọn đồng nghiệp</option>
                    <option v-for="colleague in colleagues" :key="colleague.assignmentId" :value="colleague.assignmentId">
                      {{ colleague.fullName }} - {{ colleague.shiftName }} ({{ colleague.startTime }} - {{ colleague.endTime }})
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Lý do đổi ca *</label>
                <textarea
                  v-model="shiftForm.reason"
                  class="form-control"
                  rows="4"
                  placeholder="Mô tả lý do bạn cần thay đổi ca..."
                ></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-secondary" @click="closeShiftModal">Hủy bỏ</button>
              <button class="btn-primary" :disabled="isSubmittingShift" @click="submitShiftRequest">
                {{ isSubmittingShift ? 'Đang gửi...' : 'Gửi yêu cầu' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import apiClient from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

interface Report {
  id: number
  title: string
  description: string
  status: string
  type: string
  resolutionNote?: string
  createdAt: string
  parkingLot: { name: string }
}

interface ShiftDTO {
  id: number
  name: string
  startTime: string
  endTime: string
}

interface ShiftChangeRequestDTO {
  id: number
  requester: { id: number; fullName: string }
  currentShiftDate: string
  currentShift: ShiftDTO
  targetShiftDate: string
  targetShift: ShiftDTO
  targetUserId?: number
  targetUserName?: string
  parkingLot: { id: number; name: string }
  reason: string
  status: string
  adminNote?: string
  createdAt: string
  updatedAt: string
}

interface AssignedShiftDTO {
  assignmentId: number
  shiftId: number
  shiftName: string
  startTime: string
  endTime: string
  shiftDate: string
  lotId: number
  lotName: string
}

interface ColleagueDTO {
  userId: number
  fullName: string
  assignmentId: number
  shiftId: number
  shiftName: string
  startTime: string
  endTime: string
  shiftDate: string
}

const authStore = useAuthStore()
const activeTab = ref<'incidents' | 'shifts'>('incidents')

// Incidents
const reports = ref<Report[]>([])
const isLoadingIncidents = ref(false)
const isIncidentModalOpen = ref(false)
const isSubmittingIncident = ref(false)

const incidentTypes = [
  { label: 'Mất thẻ', value: 'LOST_CARD' },
  { label: 'Thiết bị', value: 'EQUIPMENT' },
  { label: 'An ninh', value: 'SECURITY' },
  { label: 'Khác', value: 'OTHER' }
]

const incidentForm = ref({
  title: '',
  description: '',
  type: 'LOST_CARD',
  lotId: null as number | null
})

// Shift Change Requests
const shiftRequests = ref<ShiftChangeRequestDTO[]>([])
const isLoadingShifts = ref(false)
const isShiftModalOpen = ref(false)
const isSubmittingShift = ref(false)
const myAssignedShifts = ref<AssignedShiftDTO[]>([])
const colleagues = ref<ColleagueDTO[]>([])

const shiftForm = ref({
  currentAssignmentId: null as number | null,
  currentShiftDate: '',
  targetUserId: null as number | null,
  targetAssignmentId: null as number | null,
  targetShiftDate: '',
  lotId: null as number | null,
  reason: ''
})

interface ParkingLotOption {
  id: number
  name: string
}

const myLots = ref<ParkingLotOption[]>([])

const fetchReports = async () => {
  isLoadingIncidents.value = true
  try {
    const res = await apiClient.get('/incidents/my-reports')
    // Lọc chỉ lấy các báo cáo không phải yêu cầu đổi ca
    reports.value = (res as unknown as Report[]).filter(r => r.type !== 'SHIFT_CHANGE')
  } catch (error) {
    console.error('Lỗi tải báo cáo:', error)
  } finally {
    isLoadingIncidents.value = false
  }
}

const fetchShiftRequests = async () => {
  if (!authStore.user?.id) return
  isLoadingShifts.value = true
  try {
    const res = await apiClient.get('/staff/my-shift-change-requests', { params: { staffId: authStore.user.id } })
    shiftRequests.value = res as unknown as ShiftChangeRequestDTO[]
  } catch (error) {
    console.error('Lỗi tải yêu cầu đổi ca:', error)
  } finally {
    isLoadingShifts.value = false
  }
}

const fetchMyAssignedShifts = async (date?: string) => {
  try {
    const res = await apiClient.get('/staff/my-assigned-shifts', { params: { date } })
    myAssignedShifts.value = res as unknown as AssignedShiftDTO[]
  } catch (error) {
    console.error('Lỗi tải ca được phân công:', error)
  }
}

const fetchColleagues = async (lotId: number, date: string) => {
  try {
    const res = await apiClient.get('/staff/colleagues-with-shifts', { params: { lotId, date } })
    colleagues.value = res as unknown as ColleagueDTO[]
  } catch (error) {
    console.error('Lỗi tải danh sách đồng nghiệp:', error)
  }
}

const fetchMyLots = async () => {
  if (authStore.user?.parkingLotId) {
    myLots.value = [{
      id: authStore.user.parkingLotId,
      name: authStore.user.parkingLotName || 'Bãi đỗ của tôi'
    }]
    incidentForm.value.lotId = authStore.user.parkingLotId
    shiftForm.value.lotId = authStore.user.parkingLotId
    return
  }

  try {
    const res = await apiClient.get('/admin/parking-lots')
    myLots.value = res as unknown as ParkingLotOption[]
    const firstLot = myLots.value[0]
    if (firstLot) {
      incidentForm.value.lotId = firstLot.id
      shiftForm.value.lotId = firstLot.id
    }
  } catch (error) {
    console.error('Lỗi tải danh sách bãi:', error)
  }
}

const openIncidentModal = () => { isIncidentModalOpen.value = true }

const closeIncidentModal = () => {
  isIncidentModalOpen.value = false
  incidentForm.value = { title: '', description: '', type: 'LOST_CARD', lotId: myLots.value[0]?.id || null }
}

const submitIncidentReport = async () => {
  if (!incidentForm.value.title || !incidentForm.value.description || !incidentForm.value.lotId) {
    alert('Vui lòng điền đầy đủ thông tin báo cáo!')
    return
  }

  isSubmittingIncident.value = true
  try {
    await apiClient.post('/incidents/report', incidentForm.value)
    alert('Đã gửi báo cáo sự cố thành công!')
    closeIncidentModal()
    fetchReports()
  } catch (error) {
    console.error('Lỗi gửi báo cáo:', error)
    alert('Không thể gửi báo cáo lúc này.')
  } finally {
    isSubmittingIncident.value = false
  }
}

const openShiftModal = async () => {
  isShiftModalOpen.value = true
  if (shiftForm.value.lotId) {
    await fetchMyAssignedShifts()
  }
}

const closeShiftModal = () => {
  isShiftModalOpen.value = false
  shiftForm.value = {
    currentAssignmentId: null,
    currentShiftDate: '',
    targetUserId: null,
    targetAssignmentId: null,
    targetShiftDate: '',
    lotId: myLots.value[0]?.id || null,
    reason: ''
  }
  colleagues.value = []
}

// Watch for changes to currentShiftDate or lotId to reload assigned shifts
watch(() => shiftForm.value.currentShiftDate, async (newDate) => {
  if (newDate && shiftForm.value.lotId) {
    await fetchMyAssignedShifts(newDate)
  }
})

watch(() => shiftForm.value.lotId, async () => {
  if (shiftForm.value.currentShiftDate) {
    await fetchMyAssignedShifts(shiftForm.value.currentShiftDate)
  }
})

// Watch for changes to targetShiftDate or lotId to reload colleagues
watch(() => shiftForm.value.targetShiftDate, async (newDate) => {
  if (newDate && shiftForm.value.lotId) {
    await fetchColleagues(shiftForm.value.lotId, newDate)
  }
})

watch(() => shiftForm.value.targetAssignmentId, (assignmentId) => {
  if (assignmentId) {
    const colleague = colleagues.value.find(c => c.assignmentId === assignmentId)
    if (colleague) {
      shiftForm.value.targetUserId = colleague.userId
    }
  }
})

const submitShiftRequest = async () => {
  if (!shiftForm.value.currentAssignmentId || !shiftForm.value.lotId || !shiftForm.value.reason) {
    alert('Vui lòng điền đầy đủ thông tin!')
    return
  }

  if (!authStore.user?.id) return

  isSubmittingShift.value = true
  try {
    await apiClient.post('/staff/shift-change-request', {
      currentAssignmentId: shiftForm.value.currentAssignmentId,
      targetUserId: shiftForm.value.targetUserId,
      targetAssignmentId: shiftForm.value.targetAssignmentId,
      lotId: shiftForm.value.lotId,
      reason: shiftForm.value.reason
    })
    alert('Đã gửi yêu cầu đổi ca thành công!')
    closeShiftModal()
    fetchShiftRequests()
  } catch (error) {
    console.error('Lỗi gửi yêu cầu:', error)
    alert('Không thể gửi yêu cầu lúc này.')
  } finally {
    isSubmittingShift.value = false
  }
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = { 'PENDING': 'Chờ xử lý', 'PROCESSING': 'Đang xử lý', 'RESOLVED': 'Đã xong', 'REJECTED': 'Từ chối' }
  return map[status] || status
}

const getShiftStatusLabel = (status: string) => {
  const map: Record<string, string> = { 'PENDING': 'Chờ xử lý', 'APPROVED': 'Đã phê duyệt', 'REJECTED': 'Từ chối' }
  return map[status] || status
}

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = { 'EQUIPMENT': 'Thiết bị', 'CUSTOMER': 'Khách hàng', 'SECURITY': 'An ninh', 'LOST_CARD': 'Mất thẻ xe', 'OTHER': 'Khác' }
  return map[type] || type
}

const getTypeIcon = (type: string) => {
  const map: Record<string, string> = { 'EQUIPMENT': '⚙️', 'CUSTOMER': '👥', 'SECURITY': '🛡️', 'LOST_CARD': '💳', 'OTHER': '❓' }
  return map[type] || '📝'
}

const formatDateTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

const formatShiftDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return 'N/A'
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

onMounted(() => {
  fetchReports()
  fetchShiftRequests()
  fetchMyLots()
})
</script>

<style scoped>
.incident-page-container {
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
  color: #1e293b;
  background-color: #f8fafc;
  min-height: 100vh;
}

/* Header Wrapper */
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
  letter-spacing: -0.5px;
}
.subtitle {
  color: #64748b;
  font-size: 15px;
  margin: 0;
}

.btn-report-new {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(37,99,235,0.25);
}
.btn-report-new:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37,99,235,0.35);
}

/* Tabs */
.tabs-container {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
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
  box-shadow: 0 4px 12px rgba(37,99,235,0.25);
}

.tab-icon {
  font-size: 18px;
}

.tab-toolbar {
  margin-bottom: 24px;
  display: flex;
  justify-content: flex-end;
}

/* Stats Overview */
.stats-overview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}
.stat-mini-card {
  background: white;
  padding: 24px;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}
.stat-label {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.stat-value {
  font-size: 28px;
  font-weight: 900;
  color: #0f172a;
}
.text-warning { color: #f59e0b; }
.text-success { color: #10b981; }

/* Reports List */
.reports-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Requests Grid for Shift Change */
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

.shifts-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
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

.target-user {
  font-size: 13px;
  margin-top: 8px;
  color: #1d4ed8;
  font-weight: 600;
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

.form-row {
  display: flex;
  gap: 16px;
}

.form-group.half {
  flex: 1;
}

.max-width-600 {
  max-width: 640px;
}

/* Modern Report Card */
.report-card-modern {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  overflow: hidden;
  display: flex;
  transition: all 0.2s;
}
.report-card-modern:hover {
  transform: translateX(4px);
  border-color: #cbd5e1;
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
}

.card-status-bar {
  width: 8px;
  flex-shrink: 0;
}
.card-status-bar.pending { background-color: #f59e0b; }
.card-status-bar.processing { background-color: #3b82f6; }
.card-status-bar.resolved { background-color: #10b981; }
.card-status-bar.rejected { background-color: #ef4444; }
.card-status-bar.warning { background-color: #f59e0b; }
.card-status-bar.success { background-color: #10b981; }
.card-status-bar.danger { background-color: #ef4444; }

.card-body {
  flex: 1;
  padding: 28px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

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
.type-tag.lost_card { background: #fff1f2; color: #be123c; }
.type-tag.equipment { background: #f0fdf4; color: #15803d; }
.type-tag.security { background: #fef2f2; color: #991b1b; }

.status-pill {
  font-size: 12px;
  font-weight: 800;
  padding: 6px 14px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.status-pill.pending { background: #fef3c7; color: #92400e; }
.status-pill.processing { background: #dbeafe; color: #1e40af; }
.status-pill.resolved { background: #dcfce7; color: #15803d; }
.status-pill.rejected { background: #fee2e2; color: #991b1b; }
.status-pill.approved { background: #dcfce7; color: #15803d; }

.report-title {
  font-size: 19px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 10px 0;
  line-height: 1.4;
}
.report-desc {
  font-size: 15px;
  color: #475569;
  line-height: 1.7;
  margin-bottom: 24px;
}

/* Admin Feedback Section */
.resolution-feedback {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}
.feedback-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.admin-avatar {
  width: 40px;
  height: 40px;
  background: #1e293b;
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
}
.admin-info {
  display: flex;
  flex-direction: column;
}
.admin-name {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
}
.feedback-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}
.feedback-content {
  font-size: 14.5px;
  color: #334155;
  line-height: 1.6;
  font-style: italic;
  padding-left: 52px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}
.footer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #94a3b8;
}
.lot-info {
  color: #2563eb;
  background: #eff6ff;
  padding: 6px 14px;
  border-radius: 10px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 24px;
}
.modal-content {
  background: white; border-radius: 24px; width: 100%;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  overflow: hidden; display: flex; flex-direction: column;
  max-height: calc(100vh - 48px);
}
.max-width-500 { max-width: 540px; }
.modal-header {
  padding: 28px 32px; border-bottom: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: flex-start;
}
.header-text h3 { margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; }
.header-text p { margin: 6px 0 0; font-size: 15px; color: #64748b; }
.close-btn {
  background: #f1f5f9; border: none; width: 40px; height: 40px;
  border-radius: 12px; color: #64748b; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; font-size: 18px;
}
.close-btn:hover { background: #e2e8f0; color: #0f172a; transform: rotate(90deg); }

.modal-body { padding: 32px; overflow-y: auto; }
.modal-scrollable { max-height: 65vh; }
.modal-footer {
  padding: 20px 32px; border-top: 1px solid #f1f5f9;
  display: flex; justify-content: flex-end; gap: 14px;
  background-color: #f8fafc;
}

.type-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 10px;
}
.type-btn {
  padding: 14px;
  border: 2px solid #f1f5f9;
  border-radius: 14px;
  font-size: 14.5px;
  font-weight: 700;
  color: #64748b;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}
.type-btn:hover { border-color: #e2e8f0; }
.type-btn.active {
  border-color: #2563eb;
  background: #eff6ff;
  color: #2563eb;
  box-shadow: 0 4px 8px rgba(37,99,235,0.1);
}

.form-group { margin-bottom: 28px; }
.form-group.no-margin { margin-bottom: 0; }
.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 800;
  color: #334155;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.form-control {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #f1f5f9;
  border-radius: 14px;
  font-size: 15px;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
  background: #f8fafc;
  font-family: inherit;
}
.form-control:focus {
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14.5px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.25); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary {
  background: white;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14.5px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover { background: #f8fafc; }

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
.btn-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.25); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

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
.btn-reject:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.25); }

.loading-state, .empty-state { text-align: center; padding: 120px 0; color: #94a3b8; }
.empty-illustration { font-size: 72px; margin-bottom: 20px; opacity: 0.5; }
.empty-state h3 { color: #475569; font-size: 20px; font-weight: 800; margin: 0 0 10px 0; }

.spinner {
  width: 40px; height: 40px;
  border: 4px solid #f1f5f9;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  margin: 0 auto 24px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.animated { animation-duration: 0.4s; animation-fill-mode: both; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.fade-in { animation-name: fadeIn; }

@keyframes slideUpModal { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.slide-up-modal { animation-name: slideUpModal; animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); }

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* Responsive */
@media (max-width: 1024px) {
  .requests-grid { grid-template-columns: 1fr; }
  .info-grid-section { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .incident-page-container { padding: 20px; }
  .stats-overview-grid { grid-template-columns: 1fr; }
  .page-header-wrapper { flex-direction: column; align-items: flex-start; gap: 20px; }
  .btn-report-new { width: 100%; justify-content: center; }
  .form-row { flex-direction: column; }
  .shifts-row { grid-template-columns: 1fr; gap: 12px; }
  .arrow { transform: rotate(90deg); }
}
</style>
