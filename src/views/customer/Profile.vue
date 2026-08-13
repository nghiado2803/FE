<template>
  <div class="profile-page-container animated fadeIn">
    <main class="profile-main-body">

      <!-- Hero card -->
      <section class="profile-user-hero-card">
        <div class="hero-avatar-circle" @click="triggerAvatarUpload" style="cursor: pointer; position: relative;">
          <img
            v-if="avatarPreview || currentUser.avatarUrl"
            :src="avatarPreview || currentUser.avatarUrl"
            alt="Avatar"
            style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;"
          />
          <span v-else class="avatar-initial-letter">
            {{ currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'K' }}
          </span>
          <div style="position: absolute; bottom: 0; right: 0; width: 20px; height: 20px; background: #2563eb; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </div>
          <input
            ref="avatarInput"
            type="file"
            accept="image/*"
            @change="handleAvatarUpload"
            style="display: none"
          />
        </div>
        <div class="hero-user-meta-data">
          <h3 class="user-vip-title-name">{{ currentUser.fullName || 'Người dùng' }}</h3>
          <p class="user-phone-sub">
            📱 Tài khoản: <span>{{ currentUser.email || currentUser.username }}</span>
          </p>
        </div>
      </section>

      <!-- Hồ sơ cá nhân -->
      <section class="profile-info-card" v-if="!isEditingProfile">
        <div class="info-card-header">
          <span class="info-card-title">Hồ sơ cá nhân</span>
          <button class="btn-edit-profile" @click="startEditProfile">✏️ Chỉnh sửa</button>
        </div>
        <div class="info-row">
          <span class="info-label">Họ và tên</span>
          <span class="info-val">{{ currentUser.fullName || '—' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Số điện thoại</span>
          <span class="info-val">{{ (currentUser.phone && currentUser.phone !== currentUser.email) ? currentUser.phone : '—' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-val">{{ currentUser.email || '—' }}</span>
        </div>
      </section>

      <!-- Form chỉnh sửa hồ sơ -->
      <section class="profile-info-card" v-else>
        <div class="info-card-header">
          <span class="info-card-title">Chỉnh sửa hồ sơ</span>
        </div>
        <div class="edit-form">
          <div class="edit-field">
            <label>Họ và tên</label>
            <input v-model="editForm.fullName" type="text" class="edit-input" placeholder="Nhập họ và tên..." />
          </div>
          <div class="edit-field">
            <label>Số điện thoại</label>
            <input v-model="editForm.phone" type="tel" class="edit-input" placeholder="Nhập số điện thoại..." />
          </div>
          <div class="edit-field">
            <label>Email</label>
            <input v-model="editForm.email" type="email" class="edit-input" placeholder="email@example.com" />
          </div>
          <div class="edit-field">
            <label>Mật khẩu mới (để trống nếu không đổi)</label>
            <input v-model="editForm.password" type="password" class="edit-input" placeholder="••••••••" />
          </div>
          <div class="edit-actions">
            <button class="btn-cancel-edit" @click="cancelEditProfile">Hủy</button>
            <button class="btn-save-edit" @click="saveProfile">Lưu thay đổi</button>
          </div>
        </div>
      </section>

      <!-- Menu điều hướng -->
      <section class="profile-menu-navigation-options">

        <router-link to="/customer/vehicles" class="menu-nav-item-row">
          <div class="item-row-left-content">
            <span class="item-emoji-icon">🚘</span>
            <span class="item-label-text">Phương tiện của tôi</span>
          </div>
          <span class="item-chevron-arrow">›</span>
        </router-link>



        <div class="menu-section-spacer"></div>

        <router-link to="/customer/policy" class="menu-nav-item-row">
          <div class="item-row-left-content">
            <span class="item-emoji-icon">🛡️</span>
            <span class="item-label-text">Chính sách phạt cọc &amp; Bảo mật</span>
          </div>
          <span class="item-chevron-arrow">›</span>
        </router-link>

      </section>

      <section class="profile-logout-action-zone">
        <button class="btn-logout-premium-border" @click="handleSystemLogout">
          <span class="logout-door-emoji">🚪</span> Đăng xuất khỏi hệ thống
        </button>
      </section>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import type { UserInfo } from '@/stores/authStore'
import apiClient from '@/services/api'

defineOptions({ name: 'CustomerProfile' })

const router = useRouter()
const authStore = useAuthStore()

const currentUser = ref(authStore.user || { fullName: 'Người dùng', username: '', email: '', phone: '', avatarUrl: '' })

const isEditingProfile = ref(false)
const editForm = ref({ fullName: '', email: '', phone: '', password: '', avatarUrl: '' })
const avatarInput = ref<HTMLInputElement>()
const avatarPreview = ref<string>('')

const loadProfile = async () => {
  try {
    const res = await apiClient.get('/customer/profile') as UserInfo
    authStore.updateUser(res)
    currentUser.value = authStore.user!
    if (res.avatarUrl) {
      avatarPreview.value = res.avatarUrl
    }
  } catch (error) {
    console.error('Lỗi load profile:', error)
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
      const res = await apiClient.put('/customer/profile', { avatarUrl: base64 }) as { message: string, success: boolean, user: UserInfo }
      if (res.success && res.user) {
        authStore.updateUser(res.user)
        currentUser.value = authStore.user!
        if (currentUser.value.avatarUrl) {
          avatarPreview.value = currentUser.value.avatarUrl
        }
        alert('✅ Cập nhật ảnh đại diện thành công!')
      } else {
        throw new Error(res.message || 'Không thể cập nhật ảnh đại diện')
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string; message?: string } }; message?: string }
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Lỗi khi cập nhật ảnh đại diện!'
      alert('❌ ' + errorMsg)
      avatarPreview.value = currentUser.value?.avatarUrl || ''
    }
  }
  reader.readAsDataURL(file)

  // Reset input để có thể chọn lại cùng file
  if (avatarInput.value) {
    avatarInput.value.value = ''
  }
}

const startEditProfile = () => {
  editForm.value.fullName = currentUser.value.fullName || ''
  editForm.value.email = currentUser.value.email || ''
  editForm.value.phone = (currentUser.value.phone && currentUser.value.phone !== currentUser.value.email) ? currentUser.value.phone : ''
  editForm.value.password = ''
  isEditingProfile.value = true
}

const cancelEditProfile = () => { isEditingProfile.value = false }

const saveProfile = async () => {
  try {
    const res = await apiClient.put('/customer/profile', editForm.value) as { message: string, success: boolean, user: UserInfo }
    if (res.success && res.user) {
      alert('✅ ' + res.message)
      authStore.updateUser(res.user)
      currentUser.value = authStore.user!
      if (currentUser.value.avatarUrl) {
        avatarPreview.value = currentUser.value.avatarUrl
      }
      isEditingProfile.value = false
    } else {
      throw new Error(res.message || 'Không thể cập nhật hồ sơ')
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string; message?: string } }; message?: string }
    alert('❌ ' + (err.response?.data?.error || err.response?.data?.message || err.message || 'Lỗi cập nhật hồ sơ!'))
  }
}

const handleSystemLogout = () => {
  authStore.logout()
  router.push('/customer/home')
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Inter:wght@500;600;700&display=swap');

.profile-page-container { width: 100%; background-color: #f8fafc; font-family: 'Inter', sans-serif; box-sizing: border-box; }
.profile-main-body { padding: 16px; display: flex; flex-direction: column; gap: 16px; }

/* Hero */
.profile-user-hero-card {
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
  border-radius: 16px; padding: 24px 20px;
  display: flex; align-items: center; gap: 18px;
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.12);
  width: 100%; box-sizing: border-box;
}
.hero-avatar-circle { width: 60px; height: 60px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar-initial-letter { font-family: 'Montserrat', sans-serif; color: #ffffff; font-size: 24px; font-weight: 800; }
.hero-user-meta-data { display: flex; flex-direction: column; align-items: flex-start; text-align: left; }
.user-vip-title-name { margin: 0 0 3px 0; font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 800; color: #ffffff; }
.user-phone-sub { margin: 0 0 8px 0; font-size: 12.5px; color: #bfdbfe; font-weight: 600; }
.user-phone-sub span { font-family: monospace; font-size: 13.5px; color: #ffffff; }
.vip-status-gold-tag { background: #fef08a; color: #854d0e; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 50px; display: flex; align-items: center; gap: 4px; }

/* Hồ sơ cá nhân */
.profile-info-card { background: white; border-radius: 16px; border: 1px solid #f1f5f9; padding: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); }
.info-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; }
.info-card-title { font-size: 13.5px; font-weight: 800; color: #0f172a; }
.btn-edit-profile { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; border-radius: 8px; padding: 6px 12px; font-size: 12px; font-weight: 700; cursor: pointer; }
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f8fafc; }
.info-row:last-child { border-bottom: none; }
.info-label { font-size: 12px; color: #94a3b8; font-weight: 600; }
.info-val { font-size: 13.5px; font-weight: 700; color: #1e293b; }

/* Edit form */
.edit-form { display: flex; flex-direction: column; gap: 12px; }
.edit-field { display: flex; flex-direction: column; gap: 5px; }
.edit-field label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
.edit-input { padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13.5px; color: #0f172a; outline: none; }
.edit-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.edit-actions { display: flex; gap: 10px; margin-top: 4px; }
.btn-cancel-edit { flex: 1; background: #f1f5f9; color: #475569; border: none; padding: 11px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; }
.btn-save-edit { flex: 1; background: #2563eb; color: white; border: none; padding: 11px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; }

/* Menu */
.profile-menu-navigation-options { background: #ffffff; border-radius: 16px; border: 1px solid #f1f5f9; display: flex; flex-direction: column; overflow: hidden; }
.menu-nav-item-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 16px; text-decoration: none; border-bottom: 1px solid #f8fafc; transition: background-color 0.15s; cursor: pointer; }
.menu-nav-item-row:active { background-color: #f8fafc; }
.menu-nav-item-row:last-child { border-bottom: none; }
.item-row-left-content { display: flex; align-items: center; gap: 12px; }
.item-emoji-icon { font-size: 16px; flex-shrink: 0; }
.item-label-text { font-size: 13px; font-weight: 700; color: #334155; }
.item-chevron-arrow { color: #cbd5e1; font-size: 18px; font-weight: 400; line-height: 1; }
.menu-section-spacer { height: 8px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; }

/* Logout */
.profile-logout-action-zone { width: 100%; margin-top: 4px; }
.btn-logout-premium-border { width: 100%; background: #ffffff; border: 1px solid #fca5a5; color: #dc2626; padding: 13px; border-radius: 12px; font-size: 13.5px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-sizing: border-box; }
.btn-logout-premium-border:active { background: #fef2f2; }
.logout-door-emoji { font-size: 14px; }

.animated { animation-duration: 0.3s; animation-fill-mode: both; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.fadeIn { animation-name: fadeIn; }
</style>
