<template>
  <div class="auth-page-container animated fade-in">
    <div class="auth-card-wrapper">

      <div class="brand-header">
        <h1>Smart<span class="text-blue-primary">Park</span></h1>
        <p class="subtitle">Trung tâm Vận hành & Cấu hình Tham số Nghiệp vụ</p>
      </div>

      <div class="auth-box-card">
        <div class="auth-card-identity-header">
          <h2>Đăng nhập Hệ thống</h2>
          <p>Dành riêng cho Ban quản lý (Admin) và Nhân viên trực quầy (Staff)</p>
        </div>

        <div v-if="errorMessage" class="auth-error-alert-bar">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleLogin" class="auth-core-form" novalidate>
          <div class="modern-form-group">
            <label>Tên đăng nhập / Email quản trị</label>
            <div class="input-field-wrapper">
              <input
                type="text"
                v-model.trim="form.username"
                placeholder="Nhập tài khoản quản trị của bạn..."
                class="modern-auth-input"
                required
              />
            </div>
          </div>

          <div class="modern-form-group">
            <label>Mật khẩu mật mã</label>
            <div class="input-field-wrapper relative-position">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="form.password"
                placeholder="••••••••"
                class="modern-auth-input password-padding"
                required
              />
              <button type="button" class="password-toggle-eye-btn" @click="showPassword = !showPassword">
                {{ showPassword ? '👁️' : '🙈' }}
              </button>
            </div>
          </div>

          <div class="form-options-row">
            <router-link to="/forgot-password?from=admin" class="forgot-password-link">Quên mật khẩu?</router-link>
          </div>

          <button type="submit" class="btn-submit-auth" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-loader"></span>
            <span v-else>XÁC THỰC ĐĂNG NHẬP</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AuthService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/authStore'

defineOptions({ name: 'AdminLogin' })

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

const form = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.username || !form.password) {
    errorMessage.value = 'Vui lòng điền đầy đủ tài khoản và mật khẩu vận hành!'
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = ''

    const res = await AuthService.login({
      username: form.username,
      password: form.password
    })

    const userRole = res.role!.toUpperCase()

    if (userRole === 'CUSTOMER') {
      errorMessage.value = 'Tài khoản khách hàng không được phép truy cập cổng thông tin quản trị!'
      return
    }

    authStore.login(res.token, res.role, res.user)

    if (userRole === 'ADMIN') {
      router.push('/admin/revenue-report')
    } else if (userRole === 'STAFF') {
      router.push('/staff/parking-map-live')
    }
  } catch (error: unknown) {
    console.error('Lỗi xác thực hệ thống:', error)
    // Hiển thị thông báo thân thiện thay vì lỗi kỹ thuật
    const err = error as { response?: { status?: number } }
    if (err.response && err.response.status === 401) {
      errorMessage.value = 'Sai tên đăng nhập hoặc mật khẩu quản trị!'
    } else {
      errorMessage.value = 'Đăng nhập không thành công. Vui lòng thử lại!'
    }
  } finally {
    isLoading.value = false
  }
}

</script>

<style scoped>
.auth-page-container { display: flex; align-items: center; justify-content: center; min-height: 100vh; background-color: #f8fafc; padding: 20px; box-sizing: border-box; }
.auth-card-wrapper { width: 100%; max-width: 420px; display: flex; flex-direction: column; gap: 20px; }
.brand-header { text-align: center; margin-bottom: 5px; }
.brand-header h1 { font-size: 36px; font-weight: 900; margin: 0; color: #0f172a; letter-spacing: -0.5px; font-family: 'Montserrat', sans-serif; }
.text-blue-primary { color: #2563eb; }
.subtitle { color: #64748b; font-size: 13px; margin-top: 6px; font-weight: 500; }
.auth-box-card { background: white; border-radius: 16px; padding: 32px 24px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; box-sizing: border-box; }
.auth-card-identity-header { text-align: center; margin-bottom: 24px; }
.auth-card-identity-header h2 { font-size: 21px; color: #0f172a; font-weight: 800; margin: 0 0 6px 0; letter-spacing: -0.3px; }
.auth-card-identity-header p { color: #64748b; font-size: 12.5px; line-height: 1.4; margin: 0; font-weight: 500; }
.auth-core-form { display: flex; flex-direction: column; gap: 18px; }
.modern-form-group { display: flex; flex-direction: column; gap: 6px; text-align: left; }
.modern-form-group label { font-size: 12.5px; font-weight: 700; color: #334155; }
.input-field-wrapper { width: 100%; }
.relative-position { position: relative; display: flex; align-items: center; }
.password-padding { padding-right: 46px !important; }
.password-toggle-eye-btn { position: absolute; right: 12px; background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; z-index: 10; display: flex; align-items: center; justify-content: center; }
.modern-auth-input { width: 100%; padding: 12px 16px; font-size: 14px; border: 1px solid #cbd5e1; border-radius: 10px; outline: none; transition: 0.2s; background-color: #f8fafc; box-sizing: border-box; font-weight: 600; color: #0f172a; }
.modern-auth-input:focus { border-color: #2563eb; background-color: white; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.form-options-row { display: flex; justify-content: flex-end; align-items: center; }
.forgot-password-link { color: #2563eb; font-size: 13px; text-decoration: none; font-weight: 600; }
.forgot-password-link:hover { text-decoration: underline; }
.btn-submit-auth { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; padding: 14px; border-radius: 10px; font-size: 13.5px; font-weight: 700; width: 100%; margin-top: 4px; cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center; min-height: 48px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); box-sizing: border-box; letter-spacing: 0.5px; }
.btn-submit-auth:hover { background: linear-gradient(135deg, #1d4ed8, #1e40af); }
.btn-submit-auth:disabled { opacity: 0.6; cursor: not-allowed; }
.auth-error-alert-bar { background-color: #fffbeb; border: 1px solid #fef08a; color: #b45309; padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; text-align: left; margin-bottom: 4px; line-height: 1.4; }
.portal-footer-hint { margin-top: 4px; }
.text-muted { color: #64748b; }
.text-xs { font-size: 12px; font-weight: 500; }
.spinner-loader { width: 18px; height: 18px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 0.7s linear infinite; }

/* VÁ LỖI CÚ PHÁP: Phục hồi từ @keys pins về @keyframes spin chuẩn tắc */
@keyframes spin { to { transform: rotate(360deg); } }
.animated { animation-duration: 0.3s; animation-fill-mode: both; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.fade-in { animation-name: fadeIn; }
</style>
