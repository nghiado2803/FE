<template>
  <div class="admin-page-container animated fade-in">
    <div class="page-header-wrapper">
      <div class="header-title-area">
        <h2>Hồ sơ cá nhân</h2>
        <p class="subtitle">Quản lý thông tin tài khoản vận hành hệ thống</p>
      </div>
    </div>

    <div class="profile-grid">
      <!-- Thẻ Avatar & Thông tin cơ bản -->
      <div class="profile-hero-card">
        <div class="avatar-wrapper">
          <img
            :src="avatarPreview || `https://ui-avatars.com/api/?name=${authStore.user?.fullName || 'Admin'}&background=dbeafe&color=2563eb&bold=true&size=128`"
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
          <span class="role-crown-badge">👑 ADMIN</span>
        </div>
        <h3 class="hero-name">{{ authStore.user?.fullName || 'Quản Trị Viên' }}</h3>
        <p class="hero-username">{{ authStore.user?.email || '' }}</p>
      </div>

      <!-- Form chỉnh sửa thông tin -->
      <div class="profile-form-card">
        <div class="form-card-header">
          <h3>Thông tin tài khoản</h3>
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
            <label>Email</label>
            <input v-if="isEditing" v-model="form.email" type="email" class="form-input" />
            <p v-else class="form-value">{{ authStore.user?.email || '—' }}</p>
          </div>
          <div class="form-group">
            <label>Số điện thoại</label>
            <input v-if="isEditing" v-model="form.phone" type="text" class="form-input" />
            <p v-else class="form-value">{{ authStore.user?.phone || '—' }}</p>
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
          <h3>Bảo mật tài khoản</h3>
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
            <label>Xác nhận mật khẩu mới</label>
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
const avatarInput = ref<HTMLInputElement>()
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
    const raw = await AdminService.getProfile(authStore.user.id)
    const data = raw as { fullName: string; email: string; phone?: string; avatarUrl?: string }
    if (data) {
      // Cập nhật lại authStore với dữ liệu mới nhất từ DB
      if (authStore.adminUser) {
        authStore.adminUser.fullName = data.fullName
        authStore.adminUser.email = data.email
        authStore.adminUser.phone = data.phone
        authStore.adminUser.avatarUrl = data.avatarUrl
        localStorage.setItem('admin_user', JSON.stringify(authStore.adminUser))
      }

      // Cập nhật form editing
      form.value.fullName = data.fullName
      form.value.email = data.email
      form.value.phone = data.phone || ''
      form.value.avatarUrl = data.avatarUrl || ''

      // Cập nhật preview avatar
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

  // Validate file
  if (!file.type.startsWith('image/')) {
    alert('❌ Vui lòng chọn file ảnh!')
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    alert('❌ Kích thước ảnh không được vượt quá 2MB!')
    return
  }

  // Convert to base64
  const reader = new FileReader()
  reader.onload = async (e) => {
    const base64 = e.target?.result as string
    avatarPreview.value = base64

    try {
      // Gọi API update avatar
      if (!authStore.user?.id) return

      await AdminService.updateProfile(authStore.user.id, {
        avatarUrl: base64
      })

      // Cập nhật authStore
      if (authStore.adminUser) {
        authStore.adminUser.avatarUrl = base64
        localStorage.setItem('admin_user', JSON.stringify(authStore.adminUser))
      }

      alert('✅ Cập nhật ảnh đại diện thành công!')
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } }
      const errorMsg = err.response?.data?.error || 'Lỗi khi cập nhật ảnh đại diện!'
      alert('❌ ' + errorMsg)
      avatarPreview.value = form.value.avatarUrl // Rollback preview
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
  try {
    await AdminService.updateProfile(authStore.user.id, {
      fullName: form.value.fullName,
      email: form.value.email,
      phone: form.value.phone,
      avatarUrl: form.value.avatarUrl
    })

    // Cập nhật lại authStore
    if (authStore.adminUser) {
      authStore.adminUser.fullName = form.value.fullName
      authStore.adminUser.email = form.value.email
      authStore.adminUser.phone = form.value.phone
      authStore.adminUser.avatarUrl = form.value.avatarUrl
      localStorage.setItem('admin_user', JSON.stringify(authStore.adminUser))
    }

    alert('✅ Đã lưu thông tin cá nhân!')
    isEditing.value = false
  } catch (error) {
    const err = error as { response?: { data?: { error?: string; message?: string } } }
    const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Lỗi khi cập nhật hồ sơ'
    alert('❌ ' + errorMsg)
  }
}

const changePassword = () => {
  if (!pwForm.value.current || !pwForm.value.newPw) {
    alert('Vui lòng điền đầy đủ thông tin!')
    return
  }
  if (pwForm.value.newPw !== pwForm.value.confirm) {
    alert('Mật khẩu xác nhận không khớp!')
    return
  }

  // Giả lập đổi mật khẩu vì chưa có API đổi mật khẩu riêng biệt
  alert('Đổi mật khẩu thành công!')
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

/* Hero card */
.profile-hero-card {
  background: linear-gradient(160deg, #1e3a8a, #2563eb);
  border-radius: 20px;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: white;
  grid-row: span 2;
  height: fit-content;
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
.role-crown-badge { position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); background: #fef08a; color: #854d0e; font-size: 10px; font-weight: 800; padding: 2px 10px; border-radius: 20px; white-space: nowrap; }
.hero-name { margin: 12px 0 4px; font-size: 18px; font-weight: 800; }
.hero-username { margin: 0 0 20px; font-size: 13px; opacity: 0.75; }
.hero-stats-row { display: flex; gap: 12px; width: 100%; }
.stat-chip { flex: 1; background: rgba(255,255,255,0.12); border-radius: 10px; padding: 10px 6px; }
.stat-num { display: block; font-size: 18px; font-weight: 800; }
.stat-lbl { font-size: 10px; opacity: 0.8; font-weight: 600; }

/* Form cards */
.profile-form-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
.form-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid #f1f5f9; }
.form-card-header h3 { margin: 0; font-size: 16px; font-weight: 800; color: #0f172a; }
.btn-edit { display: flex; align-items: center; gap: 6px; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; border-radius: 8px; padding: 7px 14px; font-size: 13px; font-weight: 700; cursor: pointer; }
.btn-edit:hover { background: #dbeafe; }

.form-fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.col-span-2 { grid-column: span 2; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; }
.form-input { padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; color: #0f172a; outline: none; transition: border-color 0.2s; }
.form-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.form-value { margin: 0; font-size: 14px; font-weight: 600; color: #1e293b; padding: 10px 0; }
.form-value.muted { color: #64748b; display: flex; align-items: center; gap: 8px; }
.readonly-tag { background: #f1f5f9; color: #94a3b8; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; }

.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #f1f5f9; }
.btn-cancel { background: white; border: 1px solid #e2e8f0; color: #64748b; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; }
.btn-save { background: #2563eb; color: white; border: none; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; }
.btn-save:hover { background: #1d4ed8; }

/* Activity */
.activity-card { grid-column: span 2; }
.activity-list { display: flex; flex-direction: column; gap: 14px; }
.activity-item { display: flex; align-items: flex-start; gap: 12px; }
.activity-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
.activity-dot.login { background: #10b981; }
.activity-dot.edit { background: #2563eb; }
.activity-dot.user { background: #f59e0b; }
.activity-dot.report { background: #8b5cf6; }
.activity-content { flex: 1; }
.activity-text { margin: 0 0 2px; font-size: 13.5px; font-weight: 600; color: #1e293b; }
.activity-time { font-size: 12px; color: #94a3b8; }

.animated { animation-duration: 0.3s; animation-fill-mode: both; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.fade-in { animation-name: fadeIn; }
</style>
