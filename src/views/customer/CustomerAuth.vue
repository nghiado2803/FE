<template>
  <div class="auth-page-container animated fade-in">
    <div class="auth-card-wrapper">

      <div class="brand-header">
        <h1>Smart<span class="text-blue-primary">Park</span></h1>
        <p class="subtitle">Hệ thống Quản lý & Đặt chỗ bãi đỗ xe thông minh</p>
      </div>

      <div class="auth-box-card">
        <div class="tab-header-toggle">
          <button :class="['tab-toggle-btn', { active: isLogin }]" @click="switchTab(true)">
            Đăng nhập
          </button>
          <button :class="['tab-toggle-btn', { active: !isLogin }]" @click="switchTab(false)">
            Đăng ký
          </button>
        </div>

        <div v-if="errorMessage" class="auth-error-alert-bar">
          {{ errorMessage }}
        </div>

        <form v-if="isLogin" class="auth-core-form" @submit.prevent="handleLogin" novalidate>
          <div class="input-field-wrapper">
            <input
              type="text"
              v-model.trim="loginUsername"
              class="modern-auth-input"
              placeholder="Số điện thoại hoặc Email..."
              required
            />
          </div>

          <div class="input-field-wrapper">
            <input
              type="password"
              v-model="loginPassword"
              class="modern-auth-input"
              placeholder="Mật khẩu tài khoản..."
              required
            />
          </div>

          <div class="form-options-row">
            <router-link to="/customer/forgot-password" class="forgot-password-link">Quên mật khẩu?</router-link>
          </div>

          <button type="submit" class="btn-submit-auth" :disabled="isSubmitting">
            {{ isSubmitting ? 'Đang xác thực...' : 'ĐĂNG NHẬP HỆ THỐNG' }}
          </button>
        </form>

        <form v-else-if="!isVerifyingOtp" class="auth-core-form" @submit.prevent="handleRegister">
          <div class="input-field-wrapper">
            <input
              type="text"
              v-model.trim="registerForm.fullName"
              class="modern-auth-input"
              placeholder="Họ và tên của bạn..."
              required
            />
          </div>

          <div class="input-field-wrapper">
            <input
              type="tel"
              v-model.trim="registerForm.phone"
              class="modern-auth-input"
              placeholder="Số điện thoại đăng ký..."
              required
            />
          </div>

          <div class="input-field-wrapper">
            <input
              type="email"
              v-model.trim="registerForm.email"
              class="modern-auth-input"
              placeholder="Địa chỉ Email (Nhận OTP)..."
              required
            />
          </div>

          <div class="input-field-wrapper">
            <input
              type="password"
              v-model="registerForm.password"
              class="modern-auth-input"
              placeholder="Thiết lập mật khẩu..."
              required
            />
          </div>

          <button type="submit" class="btn-submit-auth register-btn" :disabled="isSubmitting">
            {{ isSubmitting ? 'Đang gửi mã OTP...' : 'GỬI MÃ XÁC THỰC OTP' }}
          </button>
        </form>

        <!-- Form nhập OTP -->
        <form v-else class="auth-core-form" @submit.prevent="handleVerifyOtp">
          <div class="otp-instruction">
            <p>Chúng tôi đã gửi mã OTP gồm 6 chữ số đến email:</p>
            <strong>{{ registerForm.email }}</strong>
          </div>

          <div class="input-field-wrapper">
            <input
              type="text"
              v-model.trim="otp"
              class="modern-auth-input text-center otp-input"
              placeholder="Nhập mã OTP 6 số"
              maxlength="6"
              required
            />
          </div>

          <button type="submit" class="btn-submit-auth" :disabled="isSubmitting">
            {{ isSubmitting ? 'Đang xác thực...' : 'XÁC NHẬN ĐĂNG KÝ' }}
          </button>

          <button type="button" class="btn-resend-otp" @click="isVerifyingOtp = false">
            Quay lại sửa thông tin
          </button>
        </form>

        <div class="divider-line-text"><span>HOẶC TIẾP TỤC VỚI</span></div>

        <div class="google-auth-wrapper">
          <div id="googleButtonContainer"></div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AuthService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/authStore'
import type { Role, UserInfo } from '@/stores/authStore'
import apiClient from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const isLogin = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')

const loginUsername = ref('')
const loginPassword = ref('')

const registerForm = ref({
  fullName: '',
  phone: '',
  email: '',
  password: ''
})
const otp = ref('')
const isVerifyingOtp = ref(false)

const switchTab = (status: boolean) => {
  isLogin.value = status
  errorMessage.value = ''
}

const handleLogin = async () => {
  if (!loginUsername.value || !loginPassword.value) {
    errorMessage.value = 'Vui lòng nhập đầy đủ tài khoản và mật khẩu!'
    return
  }

  try {
    isSubmitting.value = true
    errorMessage.value = ''

    const res = await AuthService.login({
      username: loginUsername.value,
      password: loginPassword.value
    })

    const userRole = res.role!.toUpperCase()

    if (userRole === 'ADMIN' || userRole === 'STAFF') {
      errorMessage.value = 'Tài khoản quản trị vui lòng đăng nhập tại cổng nội bộ!'
      return
    }

    authStore.login(res.token, res.role, res.user)
    window.toast?.('Đăng nhập thành công!', 'success')
    router.push('/customer/home')

  } catch (error: unknown) {
    console.error('Lỗi đăng nhập hệ thống:', error)
    const err = error as { response?: { status?: number } }
    if (err.response && err.response.status === 401) {
      errorMessage.value = 'Số điện thoại hoặc mật khẩu không chính xác!'
    } else {
      errorMessage.value = 'Đăng nhập không thành công. Vui lòng thử lại!'
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleRegister = async () => {
  if (!registerForm.value.fullName || !registerForm.value.phone || !registerForm.value.email || !registerForm.value.password) {
    errorMessage.value = 'Vui lòng điền trọn vẹn thông tin đăng ký tài khoản!'
    return
  }
  try {
    isSubmitting.value = true
    errorMessage.value = ''

    // Gửi OTP qua email
    const res = await apiClient.post('/auth/register/send-otp', registerForm.value) as { message: string }
    window.toast?.(res.message, 'success')
    isVerifyingOtp.value = true
  } catch (error: unknown) {
    console.error('Lỗi gửi OTP:', error)
    const err = error as { response?: { status?: number } }
    if (err.response && err.response.status === 409) {
      errorMessage.value = 'Số điện thoại hoặc Email này đã được đăng ký!'
    } else {
      errorMessage.value = 'Đăng ký không thành công. Vui lòng thử lại sau!'
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleVerifyOtp = async () => {
  if (!otp.value || otp.value.length < 6) {
    errorMessage.value = 'Vui lòng nhập đúng mã OTP 6 chữ số!'
    return
  }

  try {
    isSubmitting.value = true
    errorMessage.value = ''

    const res = await apiClient.post('/auth/register/verify', {
      email: registerForm.value.email,
      otp: otp.value
    }) as { message: string }

    window.toast?.(res.message, 'success')
    isLogin.value = true
    isVerifyingOtp.value = false
    // Tự động điền email để login
    loginUsername.value = registerForm.value.email
  } catch (error: unknown) {
    console.error('Lỗi xác thực OTP:', error)
    errorMessage.value = 'Mã OTP không chính xác hoặc đã hết hạn!'
  } finally {
    isSubmitting.value = false
  }
}

// GOOGLE LOGIN LOGIC
const GOOGLE_CLIENT_ID = '996571651207-ubh7ce1mhc8ea1biido5grnpgbist1dc.apps.googleusercontent.com'

declare const google: {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string
        callback: (response: { credential: string }) => void
        auto_select?: boolean
        itp_support?: boolean
        ux_mode?: 'popup' | 'redirect'
        context?: 'signin' | 'signup' | string
        cancel_on_tap_outside?: boolean
      }) => void
      prompt: () => void
      renderButton: (parent: HTMLElement | null, options: object) => void
      disableAutoSelect?: () => void
    }
  }
}

let googleInitPromise: Promise<void> | null = null

const loadGoogleScript = async () => {
  if (typeof google !== 'undefined') return

  const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]')
  if (existingScript) {
    if (typeof google !== 'undefined') return
    const readyState = (existingScript as unknown as { readyState?: string }).readyState
    if (readyState === 'complete' || existingScript.getAttribute('data-google-loaded') === 'true') {
      return
    }
    await new Promise<void>((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', () => reject(new Error('Không tải được script Google')))
    })
    return
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      script.setAttribute('data-google-loaded', 'true')
      resolve()
    }
    script.onerror = () => reject(new Error('Không tải được script Google'))
    document.head.appendChild(script)
  })
}

const initGoogleAuth = async () => {
  if (googleInitPromise) return googleInitPromise

  googleInitPromise = (async () => {
    try {
      await loadGoogleScript()
      if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          itp_support: false,
          ux_mode: 'popup',
          context: 'signin'
        })

        google.accounts.id.disableAutoSelect?.()

        const container = document.getElementById('googleButtonContainer')
        if (container) {
          google.accounts.id.renderButton(container, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: container.offsetWidth || 370
          })
        }
      }
    } catch (error) {
      console.error('Lỗi khởi tạo Google Auth:', error)
      throw error
    }
  })()

  return googleInitPromise
}

const handleGoogleResponse = async (response: { credential: string }) => {
  try {
    isSubmitting.value = true
    errorMessage.value = ''

    // Gửi idToken lên backend
    const res = await apiClient.post('/auth/google-login', {
      idToken: response.credential
    }) as { token: string; role: Role; user: UserInfo }

    authStore.login(res.token, res.role, res.user)
    window.toast?.('Đăng nhập Google thành công!', 'success')
    router.push('/customer/home')
  } catch (error: unknown) {
    console.error('Lỗi đăng nhập Google:', error)
    errorMessage.value = 'Đăng nhập bằng Google không thành công. Vui lòng thử lại!'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  initGoogleAuth()
})
</script>

<style scoped>
.auth-page-container { display: flex; align-items: center; justify-content: center; min-height: 100vh; background-color: #f8fafc; padding: 20px; }
.auth-card-wrapper { width: 100%; max-width: 420px; display: flex; flex-direction: column; gap: 20px; }
.brand-header { text-align: center; margin-bottom: 10px; }
.brand-header h1 { font-size: 36px; font-weight: 900; margin: 0; color: #0f172a; letter-spacing: -0.5px; }
.text-blue-primary { color: #2563eb; }
.subtitle { color: #64748b; font-size: 13px; margin-top: 6px; font-weight: 500; }
.auth-box-card { background: white; border-radius: 16px; padding: 32px 24px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
.tab-header-toggle { display: flex; border-bottom: 2px solid #f1f5f9; margin-bottom: 24px; }
.tab-toggle-btn { flex: 1; padding: 12px; background: none; border: none; font-size: 15px; font-weight: 700; color: #94a3b8; border-bottom: 2px solid transparent; margin-bottom: -2px; cursor: pointer; transition: all 0.2s; }
.tab-toggle-btn.active { color: #2563eb; border-bottom-color: #2563eb; }
.auth-core-form { display: flex; flex-direction: column; gap: 16px; }
.input-field-wrapper { width: 100%; }
.modern-auth-input { width: 100%; padding: 12px 16px; font-size: 14px; border: 1px solid #cbd5e1; border-radius: 10px; outline: none; transition: 0.2s; background-color: #f8fafc; box-sizing: border-box; }
.modern-auth-input:focus { border-color: #2563eb; background-color: white; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.form-options-row { display: flex; justify-content: space-between; align-items: center; }
.text-muted { color: #64748b; }
.text-xs { font-size: 11px; font-weight: 600; }
.forgot-password-link { color: #2563eb; font-size: 13px; text-decoration: none; font-weight: 600; }
.btn-submit-auth { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; padding: 14px; border-radius: 10px; font-size: 14px; font-weight: 700; width: 100%; margin-top: 6px; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
.btn-submit-auth:hover { background: linear-gradient(135deg, #1d4ed8, #1e40af); }
.btn-submit-auth:disabled { opacity: 0.6; cursor: not-allowed; }
.register-btn { background: linear-gradient(135deg, #0f172a, #1e293b); box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.2); }
.divider-line-text { text-align: center; margin: 24px 0; position: relative; }
.divider-line-text::before { content: ''; position: absolute; left: 0; top: 50%; width: 100%; height: 1px; background: #e2e8f0; z-index: 1; }
.divider-line-text span { background: white; padding: 0 12px; color: #94a3b8; font-size: 11px; font-weight: 700; position: relative; z-index: 2; letter-spacing: 0.5px; }

.google-auth-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  min-height: 60px;
}
.btn-google-auth {
  width: 100%;
  max-width: 360px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  color: #111827;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.btn-google-auth:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}
.google-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  color: #4285f4;
  font-size: 16px;
  font-weight: 900;
}

.otp-instruction { text-align: center; font-size: 13px; color: #64748b; margin-bottom: 8px; }
.otp-instruction strong { color: #0f172a; display: block; margin-top: 4px; }
.otp-input { letter-spacing: 8px; font-size: 20px; font-weight: 800; }
.btn-resend-otp { background: none; border: none; color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer; margin-top: 8px; text-decoration: underline; }
.auth-error-alert-bar { background-color: #fffbeb; border: 1px solid #fef08a; color: #b45309; padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; text-align: left; margin-bottom: 16px; line-height: 1.4; }
.animated { animation-duration: 0.3s; animation-fill-mode: both; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.fade-in { animation-name: fadeIn; }
</style>
