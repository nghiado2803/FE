<template>
  <div class="admin-page-container animated fade-in">

    <!-- Header -->
    <div class="page-header-wrapper">
      <div class="header-title-area">
        <h2>Nhân sự & Phân quyền</h2>
        <p class="subtitle">Quản lý tài khoản, vai trò và quyền truy cập hệ thống</p>
      </div>
      <div class="header-action-group">
        <router-link to="/" class="btn-secondary">Trang chủ Portal</router-link>
        <button class="btn-primary" @click="openModal('ADD')">
          <span>➕</span> Tạo tài khoản mới
        </button>
      </div>
    </div>

    <!-- KPI Stats -->
    <div class="kpi-row">
      <div class="kpi-card">
        <div class="kpi-icon admin-icon">🛡️</div>
        <div><div class="kpi-num">{{ stats.adminCount }}</div><div class="kpi-label">Quản trị viên</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon staff-icon">👷</div>
        <div><div class="kpi-num">{{ stats.staffCount }}</div><div class="kpi-label">Nhân viên</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon customer-icon">🧑‍💼</div>
        <div><div class="kpi-num">{{ stats.customerCount }}</div><div class="kpi-label">Khách hàng</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon locked-icon">🔒</div>
        <div><div class="kpi-num">{{ stats.lockedCount }}</div><div class="kpi-label">Đã khóa</div></div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <button :class="['tab-item', { active: activeTab === 'STAFF' }]" @click="switchTab('STAFF')">
        👥 Quản trị & Nhân sự
      </button>
      <button :class="['tab-item', { active: activeTab === 'CUSTOMER' }]" @click="switchTab('CUSTOMER')">
        🛍️ Khách hàng hệ thống
      </button>
    </div>

    <!-- Toolbar -->
    <div class="toolbar-wrapper">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input v-model="searchQuery" type="text" placeholder="Tìm theo tên, email, SĐT..." class="form-control pl-10" />
      </div>
      <div v-if="activeTab === 'STAFF'" class="filter-box">
        <select v-model="selectedRoleFilter" class="form-control">
          <option value="ALL">Tất cả vai trò</option>
          <option value="ADMIN">Quản trị viên</option>
          <option value="STAFF">Nhân viên</option>
        </select>
      </div>
      <div class="filter-box">
        <select v-model="selectedStatusFilter" class="form-control">
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="LOCKED">Đã khóa</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="main-data-card">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <span>Đang tải dữ liệu...</span>
      </div>

      <div v-else class="table-responsive">
        <table class="modern-admin-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Vai trò</th>
              <th v-if="activeTab === 'STAFF'">Bãi đỗ phụ trách</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th class="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedUsers" :key="user.id"
              :class="['table-row-interactive', { 'row-locked': user.status === 'LOCKED' }]">

              <td>
                <div class="user-info-cell">
                  <div class="avatar" :class="user.accountType?.toLowerCase()">
                    {{ user.fullName?.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="user-name" :class="{ 'text-strikethrough': user.status === 'LOCKED' }">
                      {{ user.fullName }}
                    </div>
                    <div class="user-meta">📧 {{ user.email || '—' }}</div>
                    <div class="user-meta">📱 {{ user.phone || '—' }}</div>
                  </div>
                </div>
              </td>

              <td>
                <span :class="['role-badge', user.accountType?.toLowerCase()]">
                  {{ roleLabel(user.accountType) }}
                </span>
              </td>

              <td v-if="activeTab === 'STAFF'">
                <span class="lot-chip">📍 {{ user.parkingLot || '—' }}</span>
              </td>

              <td>
                <span :class="['status-badge', statusClass(user.status)]">
                  {{ statusLabel(user.status) }}
                </span>
              </td>

              <td class="text-muted text-xs">{{ user.createdAt || '—' }}</td>

              <td class="text-center">
                <div class="action-buttons-flex">
                  <button class="btn-icon edit" title="Chỉnh sửa" @click="openModal('EDIT', user)">✏️</button>

                  <button v-if="user.accountType === 'STAFF' || user.accountType === 'CUSTOMER'"
                    class="btn-icon promote" title="Nâng lên Admin"
                    @click="confirmChangeRole(user, 'ADMIN')">⬆️</button>

                  <button v-if="user.accountType === 'STAFF' || user.accountType === 'CUSTOMER'"
                    class="btn-icon promote-staff" title="Cấp quyền Staff"
                    @click="confirmChangeRole(user, 'STAFF')">👷</button>

                  <button v-if="user.accountType === 'ADMIN' && !isSelf(user)"
                    class="btn-icon demote"
                    :title="isLastAdmin(user) ? 'Không thể hạ — chỉ còn 1 Admin' : 'Hạ xuống Staff'"
                    :disabled="isLastAdmin(user)"
                    @click="confirmChangeRole(user, 'STAFF')">⬇️</button>

                  <button v-if="!isSelf(user) && user.accountType !== 'ADMIN'"
                    :class="['btn-icon', user.status === 'ACTIVE' ? 'lock' : 'unlock']"
                    :title="user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'"
                    @click="confirmToggleLock(user)">
                    {{ user.status === 'ACTIVE' ? '🔒' : '🔓' }}
                  </button>

                </div>
              </td>
            </tr>

            <tr v-if="filteredUsers.length === 0">
              <td :colspan="activeTab === 'STAFF' ? 6 : 5" class="empty-state-cell">
                <div class="empty-state-content">
                  <span style="font-size:32px">📭</span>
                  <p>Không tìm thấy tài khoản nào</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-bar">
        <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">‹</button>
        <button v-for="p in totalPages" :key="p" :class="['page-btn', { active: p === currentPage }]" @click="currentPage = p">{{ p }}</button>
        <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">›</button>
        <span class="page-info">{{ filteredUsers.length }} tài khoản</span>
      </div>
    </div>

    <!-- Modal Tạo / Chỉnh sửa -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
          <div class="modal-content animated slide-up-modal">
            <div class="modal-header">
              <div>
                <h3>{{ modalMode === 'ADD' ? '➕ Tạo tài khoản mới' : '✏️ Chỉnh sửa tài khoản' }}</h3>
                <p class="text-muted text-sm">{{ modalMode === 'ADD' ? 'Điền thông tin và cấp quyền cho tài khoản' : 'Cập nhật thông tin người dùng' }}</p>
              </div>
              <button class="close-btn" @click="closeModal">✕</button>
            </div>

            <div class="modal-body">
              <!-- Role -->
              <div class="form-group">
                <label>Vai trò hệ thống <span class="required">*</span></label>
                <div class="role-selector">
                  <label v-for="r in availableRoles" :key="r.value"
                    :class="['role-option', { selected: form.accountType === r.value }]">
                    <input type="radio" :value="r.value" v-model="form.accountType" />
                    <span class="role-icon">{{ r.icon }}</span>
                    <span class="role-text">{{ r.label }}</span>
                    <span class="role-desc">{{ r.desc }}</span>
                  </label>
                </div>
                <small v-if="form.accountType !== (users.find(u => u.id === form.id)?.accountType)" class="helper-text warning">
                  ⚠️ Vai trò sẽ thay đổi — người dùng cần đăng nhập lại để áp dụng
                </small>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Họ và Tên <span class="required">*</span></label>
                  <input type="text" v-model="form.fullName" class="form-control" placeholder="VD: Nguyễn Văn A" />
                </div>
                <div class="form-group">
                  <label>Số điện thoại <span class="required">*</span></label>
                  <input type="text" v-model="form.phone" class="form-control" placeholder="VD: 0987654321" />
                </div>
              </div>

              <div class="form-group">
                <label>Email</label>
                <input type="email" v-model="form.email" class="form-control" placeholder="username@smartpark.vn" />
              </div>

              <div class="form-group">
                <label>Mật khẩu {{ modalMode === 'EDIT' ? '(Để trống nếu không đổi)' : '' }} <span v-if="modalMode === 'ADD'" class="required">*</span></label>
                <div class="password-input-wrapper">
                  <input :type="showPassword ? 'text' : 'password'" v-model="form.password" class="form-control" placeholder="••••••••" />
                  <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                    {{ showPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
              </div>

              <div v-if="form.accountType === 'STAFF'" class="form-group animated fade-in">
                <label>Phân công bãi đỗ <span class="required">*</span></label>
                <select v-model="form.parkingLotId" class="form-control">
                  <option :value="0">— Chưa phân công —</option>
                  <option v-for="lot in parkingLots" :key="lot.id" :value="lot.id">{{ lot.name }}</option>
                </select>
                <small class="helper-text">Staff chưa phân công bãi sẽ bị khóa đăng nhập tự động</small>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-secondary" @click="closeModal">Hủy</button>
              <button class="btn-primary" :disabled="isSaving" @click="saveUser">
                <span v-if="isSaving">⏳ Đang lưu...</span>
                <span v-else>{{ modalMode === 'ADD' ? '✅ Tạo tài khoản' : '💾 Lưu thay đổi' }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Confirm Dialog -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="confirmDialog.show" class="modal-overlay" @click.self="confirmDialog.show = false">
          <div class="confirm-dialog animated slide-up-modal">
            <div class="confirm-icon">{{ confirmDialog.icon }}</div>
            <h3>{{ confirmDialog.title }}</h3>
            <p>{{ confirmDialog.message }}</p>
            <div class="confirm-actions">
              <button class="btn-secondary" @click="confirmDialog.show = false">Hủy</button>
              <button :class="['btn-confirm', confirmDialog.danger ? 'danger' : 'primary']"
                @click="confirmDialog.onConfirm(); confirmDialog.show = false">
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast — nổi trên tất cả kể cả modal -->
    <Teleport to="body">
      <Transition name="toast-drop">
        <div v-if="toast.show" :class="['toast-banner', toast.type]">
          <span class="toast-icon">
            {{ toast.type === 'success' ? '✅' : toast.type === 'error' ? '⛔' : '⚠️' }}
          </span>
          <span class="toast-text">{{ toast.message }}</span>
          <button class="toast-close" @click="toast.show = false">✕</button>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { AdminService } from '@/services/admin.service'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

type UserStatus = 'ACTIVE' | 'LOCKED' | 'UNASSIGNED'
type AccountType = 'ADMIN' | 'STAFF' | 'CUSTOMER'

interface UserInfo {
  id: number
  fullName: string
  email: string
  phone?: string
  accountType?: AccountType
  parkingLot?: string
  parkingLotId?: number
  status: UserStatus
  password?: string
  createdAt?: string
}

// ── State ──────────────────────────────────────────────────
const users = ref<UserInfo[]>([])
const parkingLots = ref<{ id: number; name: string }[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const showPassword = ref(false)
const activeTab = ref<'STAFF' | 'CUSTOMER'>('STAFF')
const searchQuery = ref('')
const selectedRoleFilter = ref<'ALL' | AccountType>('ALL')
const selectedStatusFilter = ref<'ALL' | string>('ALL')
const currentPage = ref(1)
const PAGE_SIZE = 10

const availableRoles = [
  { value: 'ADMIN', icon: '🛡️', label: 'Quản trị viên', desc: 'Toàn quyền hệ thống' },
  { value: 'STAFF', icon: '👷', label: 'Nhân viên', desc: 'Quản lý bãi đỗ được phân công' },
]

// ── Toast ──────────────────────────────────────────────────
const toast = ref({ show: false, message: '', type: 'success' })
const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3500)
}

// ── Confirm Dialog ─────────────────────────────────────────
const confirmDialog = ref({
  show: false, title: '', message: '', icon: '❓', danger: false,
  onConfirm: () => {}
})
const showConfirm = (title: string, message: string, icon: string, danger: boolean, onConfirm: () => void) => {
  confirmDialog.value = { show: true, title, message, icon, danger, onConfirm }
}

// ── Stats ──────────────────────────────────────────────────
const stats = computed(() => ({
  adminCount: users.value.filter(u => u.accountType === 'ADMIN').length,
  staffCount: users.value.filter(u => u.accountType === 'STAFF').length,
  customerCount: users.value.filter(u => u.accountType === 'CUSTOMER' && !isTestAccount(u)).length,
  lockedCount: users.value.filter(u => u.status === 'LOCKED').length,
}))

// ── Helpers ────────────────────────────────────────────────
const isSelf = (user: UserInfo) => user.id === authStore.user?.id
const roleLabel = (r?: string) => r === 'ADMIN' ? '🛡️ Admin' : r === 'STAFF' ? '👷 Staff' : '🧑‍💼 Customer'
const statusLabel = (s: string) => s === 'ACTIVE' ? 'Hoạt động' : s === 'UNASSIGNED' ? 'Chưa phân công' : 'Đã khóa'
const statusClass = (s: string) => s === 'ACTIVE' ? 'success' : s === 'UNASSIGNED' ? 'warning' : 'danger'

// Tài khoản test/hệ thống — ẩn khỏi danh sách
const isTestAccount = (u: UserInfo) =>
  u.fullName === 'Khách vãng lai' || u.phone === '0000000000'

// Kiểm tra chỉ còn 1 admin — không được hạ cấp
const isLastAdmin = (user: UserInfo) =>
  user.accountType === 'ADMIN' && users.value.filter(u => u.accountType === 'ADMIN').length <= 1

// ── Filter & Pagination ────────────────────────────────────
const filteredUsers = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return users.value.filter(u => {
    // Luôn ẩn tài khoản hệ thống/test
    if (isTestAccount(u)) return false

    if (activeTab.value === 'STAFF' && u.accountType === 'CUSTOMER') return false
    if (activeTab.value === 'CUSTOMER' && u.accountType !== 'CUSTOMER') return false
    if (selectedRoleFilter.value !== 'ALL' && u.accountType !== selectedRoleFilter.value) return false
    if (selectedStatusFilter.value !== 'ALL' && u.status !== selectedStatusFilter.value) return false
    return !q || (u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q))
  })
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / PAGE_SIZE))
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredUsers.value.slice(start, start + PAGE_SIZE)
})

const switchTab = (tab: 'STAFF' | 'CUSTOMER') => {
  activeTab.value = tab
  selectedRoleFilter.value = 'ALL'
  selectedStatusFilter.value = 'ALL'
  searchQuery.value = ''
  currentPage.value = 1
}

// ── Load Data ──────────────────────────────────────────────
const loadData = async () => {
  try {
    isLoading.value = true
    const [usersRes, lotsRes] = await Promise.all([AdminService.getUsers(), AdminService.getParkingLots()])
    users.value = usersRes as unknown as UserInfo[]
    parkingLots.value = lotsRes.map(l => ({ id: l.id!, name: l.name }))
  } catch {
    showToast('Không thể tải dữ liệu người dùng', 'error')
  } finally {
    isLoading.value = false
  }
}

// ── Modal ──────────────────────────────────────────────────
const isModalOpen = ref(false)
const modalMode = ref<'ADD' | 'EDIT'>('ADD')
const isOriginalCustomer = ref(false)
const form = ref<UserInfo>({ id: 0, fullName: '', email: '', phone: '', password: '', accountType: 'STAFF', parkingLot: '', parkingLotId: 0, status: 'ACTIVE' })

const openModal = (mode: 'ADD' | 'EDIT', user: UserInfo | null = null) => {
  modalMode.value = mode
  showPassword.value = false
  if (mode === 'EDIT' && user) {
    isOriginalCustomer.value = false // Cho phép đổi role từ customer
    const lot = parkingLots.value.find(l => l.name === user.parkingLot)
    form.value = { ...user, parkingLotId: lot?.id || 0, password: '' }
  } else {
    isOriginalCustomer.value = false
    form.value = { id: 0, fullName: '', email: '', phone: '', password: '', accountType: 'STAFF', parkingLot: '', parkingLotId: 0, status: 'ACTIVE' }
  }
  isModalOpen.value = true
}

const closeModal = () => { isModalOpen.value = false }

// ── Save User ──────────────────────────────────────────────
const saveUser = async () => {
  if (!form.value.fullName?.trim()) { showToast('Vui lòng nhập họ tên', 'warning'); return }
  if (!form.value.phone?.trim()) { showToast('Vui lòng nhập số điện thoại', 'warning'); return }
  if (modalMode.value === 'ADD' && !form.value.password?.trim()) { showToast('Vui lòng nhập mật khẩu', 'warning'); return }

  // Bảo vệ admin cuối cùng khi tự hạ cấp qua modal EDIT
  if (modalMode.value === 'EDIT') {
    const original = users.value.find(u => u.id === form.value.id)
    if (original?.accountType === 'ADMIN' && form.value.accountType !== 'ADMIN') {
      if (isLastAdmin(original)) {
        showToast('⛔ Không thể hạ cấp — hệ thống chỉ còn 1 Admin', 'error')
        return
      }
    }
  }

  try {
    isSaving.value = true
    const payload = { ...form.value }
    if (modalMode.value === 'ADD') {
      await AdminService.createStaffAccount(payload)
      showToast(`✅ Đã tạo tài khoản ${form.value.fullName}`, 'success')
    } else {
      await AdminService.updateUser(form.value.id, payload)
      showToast(`✅ Đã cập nhật ${form.value.fullName}`, 'success')
    }
    closeModal()
    await loadData()
  } catch (error) {
    const err = error as { response?: { data?: { message?: string } } }
    showToast(err.response?.data?.message || 'Lỗi khi lưu thông tin', 'error')
  } finally {
    isSaving.value = false
  }
}

// ── Change Role ────────────────────────────────────────────
const confirmChangeRole = (user: UserInfo, newRole: AccountType) => {
  // Không làm gì nếu role không đổi
  if (user.accountType === newRole) {
    showToast(`${user.fullName} đã là ${roleLabel(newRole)}`, 'warning')
    return
  }

  // Bảo vệ admin cuối
  if (user.accountType === 'ADMIN' && newRole !== 'ADMIN' && isLastAdmin(user)) {
    showToast('⛔ Không thể hạ cấp — hệ thống chỉ còn 1 Admin', 'error')
    return
  }

  const fromLabel = roleLabel(user.accountType)
  const toLabel = roleLabel(newRole)
  const isDemotion = user.accountType === 'ADMIN' && newRole !== 'ADMIN'

  showConfirm(
    'Thay đổi vai trò',
    `Đổi "${user.fullName}" từ ${fromLabel} → ${toLabel}?\nNgười dùng cần đăng nhập lại để áp dụng.`,
    isDemotion ? '⬇️' : '⬆️',
    isDemotion,
    async () => {
      try {
        await AdminService.updateUser(user.id, { accountType: newRole })
        showToast(`✅ Đã đổi ${user.fullName}: ${fromLabel} → ${toLabel}`, 'success')
        await loadData()
      } catch {
        showToast('Không thể thay đổi vai trò', 'error')
      }
    }
  )
}

// ── Toggle Lock ────────────────────────────────────────────
const confirmToggleLock = (user: UserInfo) => {
  const isLocking = user.status === 'ACTIVE'
  showConfirm(
    isLocking ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
    `Bạn có chắc muốn ${isLocking ? 'khóa' : 'mở khóa'} tài khoản "${user.fullName}"?`,
    isLocking ? '🔒' : '🔓',
    isLocking,
    async () => {
      try {
        await AdminService.toggleUserStatus(user.id)
        showToast(`✅ Đã ${isLocking ? 'khóa' : 'mở khóa'} ${user.fullName}`, 'success')
        await loadData()
      } catch {
        showToast('Không thể cập nhật trạng thái', 'error')
      }
    }
  )
}


onMounted(loadData)
</script>

<style scoped>
@import '@/assets/styles/admin-shared.css';

.admin-page-container { padding: 32px; max-width: 1440px; margin: 0 auto; color: #1e293b; background: #f8fafc; min-height: 100vh; }

/* Header */
.page-header-wrapper { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.header-title-area h2 { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.subtitle { color: #64748b; font-size: 14px; margin: 0; }
.header-action-group { display: flex; gap: 12px; }

/* Buttons */
button, .btn-secondary { border: none; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s; padding: 10px 18px; text-decoration: none; }
.btn-primary { background: #2563eb; color: white; box-shadow: 0 4px 6px -1px rgba(37,99,235,0.2); }
.btn-primary:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background: white; color: #475569; border: 1px solid #cbd5e1; }
.btn-secondary:hover { background: #f1f5f9; }

/* KPI Row */
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.kpi-card { background: white; border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; gap: 14px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.kpi-icon { font-size: 28px; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.admin-icon { background: #fef2f2; }
.staff-icon { background: #eff6ff; }
.customer-icon { background: #f0fdf4; }
.locked-icon { background: #fef9c3; }
.kpi-num { font-size: 24px; font-weight: 800; color: #0f172a; }
.kpi-label { font-size: 12px; color: #64748b; font-weight: 600; }

/* Tabs */
.tabs-container { display: flex; gap: 8px; margin-bottom: 16px; }
.tab-item { padding: 10px 20px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; color: #64748b; font-weight: 600; font-size: 14px; }
.tab-item:hover { background: #e2e8f0; }
.tab-item.active { background: white; color: #2563eb; border-color: #bfdbfe; box-shadow: 0 2px 8px rgba(37,99,235,0.08); }

/* Toolbar */
.toolbar-wrapper { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
.search-box { position: relative; flex: 1; min-width: 240px; }
.filter-box { min-width: 180px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.form-control { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; color: #1e293b; background: white; box-sizing: border-box; transition: all 0.2s; }
.form-control:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.form-control.pl-10 { padding-left: 40px; }

/* Table Card */
.main-data-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.04); overflow: hidden; }
.table-responsive { overflow-x: auto; }
.modern-admin-table { width: 100%; border-collapse: collapse; text-align: left; }
.modern-admin-table th { background: #f8fafc; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; padding: 14px 20px; border-bottom: 1px solid #e2e8f0; }
.modern-admin-table td { padding: 14px 20px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.table-row-interactive:hover { background: #f8fafc; }
.row-locked td { opacity: 0.65; }

/* User Cell */
.user-info-cell { display: flex; align-items: center; gap: 12px; }
.avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0; }
.avatar.admin { background: #fef2f2; color: #b91c1c; }
.avatar.staff { background: #eff6ff; color: #1d4ed8; }
.avatar.customer { background: #f0fdf4; color: #15803d; }
.user-name { font-weight: 700; font-size: 14px; color: #0f172a; }
.user-meta { font-size: 12px; color: #64748b; margin-top: 2px; }

/* Badges */
.role-badge { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; border: 1px solid transparent; }
.role-badge.admin { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
.role-badge.staff { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.role-badge.customer { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
.status-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.status-badge.success { background: #dcfce7; color: #166534; }
.status-badge.warning { background: #fef3c7; color: #92400e; }
.status-badge.danger { background: #fee2e2; color: #991b1b; }
.lot-chip { background: #f1f5f9; color: #334155; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 500; }

/* Action Buttons */
.action-buttons-flex { display: flex; gap: 6px; justify-content: center; }
.btn-icon { width: 32px; height: 32px; border-radius: 8px; padding: 0; font-size: 14px; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; background: #f8fafc; }
.btn-icon:hover { transform: translateY(-1px); }
.btn-icon.edit:hover { background: #e0e7ff; border-color: #a5b4fc; }
.btn-icon.promote { background: #f0fdf4; border-color: #bbf7d0; }
.btn-icon.promote:hover { background: #dcfce7; }
.btn-icon.promote-staff { background: #eff6ff; border-color: #bfdbfe; }
.btn-icon.promote-staff:hover { background: #dbeafe; }
.btn-icon.demote { background: #fefce8; border-color: #fde68a; }
.btn-icon.demote:hover:not(:disabled) { background: #fef9c3; }
.btn-icon:disabled { opacity: 0.35; cursor: not-allowed; transform: none !important; }
.btn-icon.lock { background: #fff7ed; border-color: #fed7aa; }
.btn-icon.lock:hover { background: #ffedd5; }
.btn-icon.unlock { background: #f0fdf4; border-color: #bbf7d0; }
.btn-icon.delete { background: #fef2f2; border-color: #fecaca; }
.btn-icon.delete:hover { background: #fee2e2; }

/* Loading */
.loading-state { display: flex; align-items: center; gap: 12px; padding: 32px; color: #64748b; font-weight: 600; }
.spinner { width: 20px; height: 20px; border: 2px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Pagination */
.pagination-bar { display: flex; align-items: center; gap: 6px; padding: 16px 20px; border-top: 1px solid #f1f5f9; }
.page-btn { min-width: 36px; height: 36px; border-radius: 8px; background: white; border: 1px solid #e2e8f0; font-weight: 600; font-size: 14px; }
.page-btn:hover:not(:disabled) { background: #f1f5f9; }
.page-btn.active { background: #2563eb; color: white; border-color: #2563eb; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { margin-left: auto; font-size: 13px; color: #64748b; }

/* Empty State */
.empty-state-cell { padding: 48px 24px !important; text-align: center; }
.empty-state-content { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #64748b; font-weight: 500; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.55); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 100; padding: 20px; }
.modal-content { background: white; border-radius: 16px; width: 100%; max-width: 520px; max-height: calc(100vh - 40px); display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; }
.modal-header { padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-start; }
.modal-header h3 { margin: 0 0 4px; font-size: 18px; color: #0f172a; }
.close-btn { background: none; border: none; font-size: 18px; color: #94a3b8; cursor: pointer; padding: 4px; }
.modal-body { padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 10px; background: #f8fafc; }

/* Form */
.form-group label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: #475569; }
.form-group .required { color: #ef4444; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.helper-text { font-size: 11px; color: #94a3b8; margin-top: 4px; display: block; }
.helper-text.warning { color: #f59e0b; font-weight: 600; }
.password-input-wrapper { position: relative; }
.password-input-wrapper .form-control { padding-right: 44px; }
.toggle-password { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; }

/* Role Selector */
.role-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.role-option { display: flex; flex-direction: column; align-items: center; padding: 14px 10px; border: 2px solid #e2e8f0; border-radius: 10px; cursor: pointer; transition: all 0.2s; text-align: center; gap: 4px; }
.role-option input { display: none; }
.role-option:hover { border-color: #93c5fd; background: #f8fafc; }
.role-option.selected { border-color: #2563eb; background: #eff6ff; }
.role-icon { font-size: 24px; }
.role-text { font-weight: 700; font-size: 13px; color: #0f172a; }
.role-desc { font-size: 11px; color: #94a3b8; }

/* Confirm Dialog */
.confirm-dialog { background: white; border-radius: 16px; padding: 32px 28px; text-align: center; max-width: 380px; width: 100%; box-shadow: 0 25px 50px rgba(0,0,0,0.25); }
.confirm-icon { font-size: 40px; margin-bottom: 12px; }
.confirm-dialog h3 { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }
.confirm-dialog p { color: #64748b; font-size: 14px; margin: 0 0 20px; line-height: 1.6; }
.confirm-actions { display: flex; gap: 10px; justify-content: center; }
.btn-confirm { padding: 10px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; }
.btn-confirm.primary { background: #2563eb; color: white; }
.btn-confirm.danger { background: #dc2626; color: white; }

/* Toast Banner — nổi trên modal, top-center */
.toast-banner {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  min-width: 320px;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10);
  pointer-events: all;
}
.toast-banner.success { background: #dcfce7; color: #166534; border: 1.5px solid #86efac; }
.toast-banner.error   { background: #fee2e2; color: #991b1b; border: 1.5px solid #fca5a5; }
.toast-banner.warning { background: #fef9c3; color: #854d0e; border: 1.5px solid #fde047; }
.toast-icon { font-size: 18px; flex-shrink: 0; }
.toast-text { flex: 1; line-height: 1.4; }
.toast-close { background: none; border: none; cursor: pointer; font-size: 14px; padding: 0 0 0 8px; opacity: 0.5; color: inherit; }
.toast-close:hover { opacity: 1; }

/* Toast animation — rơi từ trên xuống */
.toast-drop-enter-active { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-drop-leave-active { transition: all 0.2s ease; }
.toast-drop-enter-from { opacity: 0; transform: translateX(-50%) translateY(-24px); }
.toast-drop-leave-to   { opacity: 0; transform: translateX(-50%) translateY(-12px); }

/* Animations */
.animated { animation-duration: 0.3s; animation-fill-mode: both; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideUpModal { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
.fade-in { animation-name: fadeInUp; }
.slide-up-modal { animation-name: slideUpModal; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.text-muted { color: #64748b; }
.text-xs { font-size: 12px; }
.text-strikethrough { text-decoration: line-through; color: #94a3b8; }
.text-center { text-align: center; }
.text-sm { font-size: 13px; }
</style>
