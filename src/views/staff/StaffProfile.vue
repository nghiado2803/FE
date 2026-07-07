<template>
  <div class="admin-page-container animated fade-in">
    <div class="page-header-wrapper">
      <div class="header-title-area">
        <h2>Hồ sơ nhân viên</h2>
        <p class="subtitle">Thông tin ca trực và tài khoản vận hành bãi đỗ</p>
      </div>
    </div>

    <div class="profile-grid">
      <!-- Hero card -->
      <div class="profile-hero-card">
        <div class="avatar-wrapper">
          <img
            :src="avatarPreview || authStore.user?.avatarUrl || `https://ui-avatars.com/api/?name=${authStore.user?.fullName || 'Staff'}&background=dbeafe&color=2563eb&bold=true&size=128`"
            alt="Avatar"
            class="avatar-img"
          />
          <button class="avatar-upload-btn" @click="triggerAvatarUpload" title="Đổi ảnh đại diện">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </button>
          <input
            ref="avatarInput"
            type="file"
            accept="image/*"
            @change="handleAvatarUpload"
            style="display: none"
          />
          <span class="role-badge">🛡️ STAFF</span>
        </div>
        <h3 class="hero-name">{{ authStore.user?.fullName || 'Nhân Viên Bãi' }}</h3>
        <p class="hero-username">{{ authStore.user?.email || '' }}</p>

        <div class="lot-assignment-box">
          <span class="lot-label">Bãi đỗ phụ trách</span>
          <strong class="lot-name">{{ authStore.user?.parkingLotName || '—' }}</strong>
        </div>

        <div class="shift-status-box">
          <span class="shift-dot"></span>
          <span class="shift-text">Đang trong ca trực</span>
        </div>
      </div>

      <!-- Thông tin cá nhân -->
      <div class="profile-form-card">
        <div class="form-card-header">
          <h3>Thông tin cá nhân</h3>
          <button v-if="!isEditing" class="btn-edit" @click="startEdit">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="14" height="14">
              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"/>
            </svg>
            Chỉnh sửa
          </button>
        </div>
        <div class="form-fields-grid">
          <div class="form-group">
            <label>Họ và tên</label>
            <input v-if="isEditing" v-model="form.fullName" type="text" class="form-input" />
            <p v-else class="form-value">{{ authStore.user?.fullName || '—' }}</p>
          </div>
          <div class="form-group">
            <label>Email liên hệ</label>
            <input v-if="isEditing" v-model="form.email" type="email" class="form-input" />
            <p v-else class="form-value">{{ authStore.user?.email || '—' }}</p>
          </div>
          <div class="form-group">
            <label>Số điện thoại</label>
            <input v-if="isEditing" v-model="form.phone" type="text" class="form-input" />
            <p v-else class="form-value">{{ authStore.user?.phone || '—' }}</p>
          </div>
          <div class="form-group col-span-2">
            <label>Bãi đỗ phụ trách</label>
            <p class="form-value muted">{{ authStore.user?.parkingLotName || 'Bãi đỗ Quảng trường Quy Nhơn' }} <span class="readonly-tag">Phân công bởi Admin</span></p>
          </div>
        </div>
        <div v-if="isEditing" class="form-actions">
          <button class="btn-cancel" @click="cancelEdit">Hủy</button>
          <button class="btn-save" @click="saveProfile">Lưu thay đổi</button>
        </div>
      </div>

      <!-- Đổi mật khẩu -->
      <div class="profile-form-card">
        <div class="form-card-header">
          <h3>Đổi mật khẩu</h3>
        </div>
        <div class="form-fields-grid">
          <div class="form-group col-span-2">
            <label>Mật khẩu hiện tại</label>
            <input v-model="pwForm.current" type="password" class="form-input" placeholder="••••••••" />
          </div>
          <div class="form-group">
            <label>Mật khẩu mới</label>
            <input v-model="pwForm.newPw" type="password" class="form-input" placeholder="••••••••" />
          </div>
          <div class="form-group">
            <label>Xác nhận</label>
            <input v-model="pwForm.confirm" type="password" class="form-input" placeholder="••••••••" />
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-save" @click="changePassword">Đổi mật khẩu</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { AdminService } from '@/services/admin.service'

const authStore = useAuthStore()
const isEditing = ref(false)
const loading = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)
const avatarPreview = ref<string>('')

const form = ref({
  fullName: authStore.user?.fullName || '',
  email: authStore.user?.email || '',
  phone: authStore.user?.phone || '',
  avatarUrl: authStore.user?.avatarUrl || ''
})

const pwForm = ref({ current: '', newPw: '', confirm: '' })

const loadProfile = async () => {
  if (!authStore.user?.id) return
  try {
    const response = await AdminService.getProfile(authStore.user.id)
    const data = response as { fullName: string; email: string; phone?: string; avatarUrl?: string }

    if (data) {
      if (authStore.adminUser) {
        authStore.adminUser.fullName = data.fullName
        authStore.adminUser.email = data.email
        authStore.adminUser.phone = data.phone
        authStore.adminUser.avatarUrl = data.avatarUrl
        localStorage.setItem('admin_user', JSON.stringify(authStore.adminUser))
      }

      form.value.fullName = data.fullName
      form.value.email = data.email
      form.value.phone = data.phone || ''
      form.value.avatarUrl = data.avatarUrl || ''

      if (data.avatarUrl) {
        avatarPreview.value = data.avatarUrl
      }
    }
  } catch (error) {
    console.error('Lỗi khi tải thông tin cá nhân:', error)
  }
}

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('❌ Vui lòng chọn file ảnh!')
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    alert('❌ Kích thước ảnh không được vượt quá 2MB!')
    return
  }

  const reader = new FileReader()
  reader.onload = async (e) => {
    const base64 = e.target?.result as string
    avatarPreview.value = base64

    try {
      if (!authStore.user?.id) return

      await AdminService.updateProfile(authStore.user.id, {
        avatarUrl: base64
      })

      if (authStore.adminUser) {
        authStore.adminUser.avatarUrl = base64
        localStorage.setItem('admin_user', JSON.stringify(authStore.adminUser))
      }

      alert('✅ Cập nhật ảnh đại diện thành công!')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string; message?: string } } }
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Lỗi khi cập nhật ảnh đại diện!'
      alert('❌ ' + errorMsg)
      avatarPreview.value = form.value.avatarUrl
    }
  }
  reader.readAsDataURL(file)
}

const startEdit = () => {
  form.value.fullName = authStore.user?.fullName || ''
  form.value.email = authStore.user?.email || ''
  form.value.phone = authStore.user?.phone || ''
  isEditing.value = true
}

const cancelEdit = () => { isEditing.value = false }

const saveProfile = async () => {
  if (!authStore.user?.id) return
  loading.value = true
  try {
    await AdminService.updateProfile(authStore.user.id, form.value)

    if (authStore.adminUser) {
      authStore.adminUser.fullName = form.value.fullName
      authStore.adminUser.email = form.value.email
      authStore.adminUser.phone = form.value.phone
      authStore.adminUser.avatarUrl = form.value.avatarUrl
      localStorage.setItem('admin_user', JSON.stringify(authStore.adminUser))
    }

    alert('✅ Cập nhật hồ sơ thành công!')
    isEditing.value = false
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string; message?: string } } }
    const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Không thể cập nhật hồ sơ'
    alert('❌ ' + errorMsg)
  } finally {
    loading.value = false
  }
}

const changePassword = () => {
  if (pwForm.value.newPw !== pwForm.value.confirm) { alert('Mật khẩu xác nhận không khớp!'); return }
  alert('Tính năng đổi mật khẩu đang được bảo trì. Vui lòng liên hệ Admin!')
  pwForm.value = { current: '', newPw: '', confirm: '' }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.admin-page-container { padding: 32px; max-width: 1200px; margin: 0 auto; font-family: 'Inter', system-ui, sans-serif; color: #1e293b; background-color: #f8fafc; min-height: 100vh; }
.page-header-wrapper { margin-bottom: 28px; }
.header-title-area h2 { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; }
.subtitle { color: #64748b; font-size: 14px; margin: 0; }

.profile-grid { display: grid; grid-template-columns: 280px 1fr; gap: 24px; }

.profile-hero-card {
  background: linear-gradient(160deg, #1e3a8a, #2563eb);
  border-radius: 20px; padding: 28px 20px;
  display: flex; flex-direction: column; align-items: center;
  text-align: center; color: white; grid-row: span 2; height: fit-content;
}
.avatar-wrapper { position: relative; margin-bottom: 16px; }
.avatar-img { width: 96px; height: 96px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.4); object-fit: cover; }
.avatar-upload-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #2563eb;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}
.avatar-upload-btn:hover {
  background: #1d4ed8;
  transform: scale(1.1);
}
.role-badge { position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); background: #dbeafe; color: #2563eb; font-size: 10px; font-weight: 800; padding: 2px 10px; border-radius: 20px; white-space: nowrap; }
.hero-name { margin: 12px 0 4px; font-size: 18px; font-weight: 800; }
.hero-username { margin: 0 0 16px; font-size: 13px; opacity: 0.75; }

.lot-assignment-box { background: rgba(255,255,255,0.12); border-radius: 10px; padding: 12px 16px; width: 100%; margin-bottom: 12px; }
.lot-label { display: block; font-size: 10px; font-weight: 700; opacity: 0.7; text-transform: uppercase; margin-bottom: 4px; }
.lot-name { font-size: 13px; font-weight: 800; }

.shift-status-box { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.1); border-radius: 20px; padding: 6px 14px; font-size: 12px; font-weight: 700; }
.shift-dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; animation: pulse 1.5s infinite; }
@keyframes pulse { to { box-shadow: 0 0 0 6px rgba(74,222,128,0); } }

.profile-form-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
.form-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid #f1f5f9; }
.form-card-header h3 { margin: 0; font-size: 16px; font-weight: 800; color: #0f172a; }
.live-badge { background: #dcfce7; color: #16a34a; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; }
.btn-edit { display: flex; align-items: center; gap: 6px; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; border-radius: 8px; padding: 7px 14px; font-size: 13px; font-weight: 700; cursor: pointer; }

.form-fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.col-span-2 { grid-column: span 2; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; }
.form-input { padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; color: #0f172a; outline: none; }
.form-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.form-value { margin: 0; font-size: 14px; font-weight: 600; color: #1e293b; padding: 10px 0; }
.form-value.muted { color: #64748b; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.readonly-tag { background: #f1f5f9; color: #94a3b8; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; }

.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #f1f5f9; }
.btn-cancel { background: white; border: 1px solid #e2e8f0; color: #64748b; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; }
.btn-save { background: #2563eb; color: white; border: none; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; }
.btn-save:hover { background: #1d4ed8; }

.animated { animation-duration: 0.3s; animation-fill-mode: both; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.fade-in { animation-name: fadeIn; }
</style>
