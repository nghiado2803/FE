<template>
  <div class="forgot-page">

    <!-- Header -->
    <div class="page-header">
      <button class="btn-back" @click="router.back()">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="18" height="18">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/>
        </svg>
      </button>
      <h2>Quên mật khẩu</h2>
      <div class="header-spacer"></div>
    </div>

    <div class="page-body">

      <!-- Bước 1: Nhập Account -->
      <div v-if="step === 1" class="step-container animated fade-in">
        <div class="step-icon">🔐</div>
        <h3>Khôi phục mật khẩu</h3>
        <p class="step-desc">Nhập Email đã đăng ký. Hệ thống sẽ gửi mã xác thực về Email liên kết của bạn.</p>

        <div v-if="errorMsg" class="error-alert">⚠️ {{ errorMsg }}</div>

        <div class="input-group">
          <label>Tài khoản (Email)</label>
          <input
            v-model="account"
            type="text"
            class="mobile-input"
            placeholder="VD: email@gmail.com"
          />
        </div>

        <button class="btn-primary" :disabled="isLoading" @click="sendOtp">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>TIẾP TỤC</span>
        </button>
      </div>

      <!-- Bước 2: Nhập OTP -->
      <div v-else-if="step === 2" class="step-container animated fade-in">
        <div class="step-icon">📱</div>
        <h3>Nhập mã xác thực</h3>
        <p class="step-desc">Mã OTP đã được gửi về Email liên kết với tài khoản <strong>{{ account }}</strong>.</p>

        <div v-if="errorMsg" class="error-alert">⚠️ {{ errorMsg }}</div>

        <div class="otp-inputs">
          <input
            v-for="(_, i) in otpDigits"
            :key="i"
            :ref="el => otpRefs[i] = el as HTMLInputElement"
            v-model="otpDigits[i]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="otp-box"
            @input="onOtpInput(i)"
            @keydown.backspace="onOtpBackspace(i)"
          />
        </div>

        <button class="btn-primary" :disabled="isLoading || otpCode.length < 6" @click="verifyOtp">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>XÁC NHẬN MÃ OTP</span>
        </button>

        <button class="btn-resend" @click="resendOtp" :disabled="resendCooldown > 0">
          {{ resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại mã OTP' }}
        </button>
      </div>

      <!-- Bước 3: Đặt mật khẩu mới -->
      <div v-else-if="step === 3" class="step-container animated fade-in">
        <div class="step-icon">🔑</div>
        <h3>Đặt mật khẩu mới</h3>
        <p class="step-desc">Mật khẩu phải có ít nhất 6 ký tự.</p>

        <div v-if="errorMsg" class="error-alert">⚠️ {{ errorMsg }}</div>

        <div class="input-group">
          <label>Mật khẩu mới</label>
          <div class="input-pw-wrap">
            <input
              v-model="newPassword"
              :type="showPw ? 'text' : 'password'"
              class="mobile-input"
              placeholder="••••••••"
            />
            <button type="button" class="btn-eye" @click="showPw = !showPw">
              {{ showPw ? '👁️' : '🙈' }}
            </button>
          </div>
        </div>

        <div class="input-group">
          <label>Xác nhận mật khẩu</label>
          <div class="input-pw-wrap">
            <input
              v-model="confirmPassword"
              :type="showPwConfirm ? 'text' : 'password'"
              class="mobile-input"
              placeholder="••••••••"
            />
            <button type="button" class="btn-eye" @click="showPwConfirm = !showPwConfirm">
              {{ showPwConfirm ? '👁️' : '🙈' }}
            </button>
          </div>
        </div>

        <button class="btn-primary" :disabled="isLoading" @click="resetPassword">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>ĐẶT LẠI MẬT KHẨU</span>
        </button>
      </div>

      <!-- Bước 4: Thành công -->
      <div v-else-if="step === 4" class="step-container animated fade-in success-state">
        <div class="success-circle">✓</div>
        <h3>Đặt lại thành công!</h3>
        <p class="step-desc">Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại.</p>
        <button class="btn-primary" @click="router.replace('/customer/auth')">
          VỀ TRANG ĐĂNG NHẬP
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/services/api'

const router = useRouter()

const step = ref(1)
const account = ref('')
const otpDigits = ref(['', '', '', '', '', ''])
const otpRefs = ref<HTMLInputElement[]>([])
const newPassword = ref('')
const confirmPassword = ref('')
const showPw = ref(false)
const showPwConfirm = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')
const resendCooldown = ref(0)

const otpCode = computed(() => otpDigits.value.join(''))

let cooldownTimer: ReturnType<typeof setInterval> | undefined

const startCooldown = () => {
  resendCooldown.value = 60
  cooldownTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) clearInterval(cooldownTimer)
  }, 1000)
}

const sendOtp = async () => {
  errorMsg.value = ''
  if (!account.value) {
    errorMsg.value = 'Vui lòng nhập Email hoặc Số điện thoại!'
    return
  }
  isLoading.value = true
  try {
    const res = await apiClient.post('/auth/forgot-password/send-otp', { account: account.value }) as { message: string }
    window.toast?.(res.message, 'success')
    step.value = 2
    startCooldown()
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    errorMsg.value = err.response?.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại!'
  } finally {
    isLoading.value = false
  }
}

const resendOtp = async () => {
  if (resendCooldown.value > 0) return
  isLoading.value = true
  try {
    const res = await apiClient.post('/auth/forgot-password/send-otp', { account: account.value }) as { message: string }
    window.toast?.(res.message, 'success')
    otpDigits.value = ['', '', '', '', '', '']
    startCooldown()
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    errorMsg.value = err.response?.data?.message || 'Không thể gửi lại mã.'
  } finally {
    isLoading.value = false
  }
}

const onOtpInput = (index: number) => {
  const val = otpDigits.value[index]
  if (val && val.length === 1 && index < 5) {
    otpRefs.value[index + 1]?.focus()
  }
}

const onOtpBackspace = (index: number) => {
  if (!otpDigits.value[index] && index > 0) {
    otpDigits.value[index - 1] = ''
    otpRefs.value[index - 1]?.focus()
  }
}

const verifyOtp = async () => {
  errorMsg.value = ''
  if (otpCode.value.length < 6) {
    errorMsg.value = 'Vui lòng nhập đủ 6 chữ số OTP!'
    return
  }
  isLoading.value = true
  try {
    const res = await apiClient.post('/auth/forgot-password/verify', {
      account: account.value,
      otp: otpCode.value
    }) as { message: string }
    window.toast?.(res.message, 'success')
    step.value = 3
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    errorMsg.value = err.response?.data?.message || 'Mã OTP không chính xác.'
  } finally {
    isLoading.value = false
  }
}

const resetPassword = async () => {
  errorMsg.value = ''
  if (newPassword.value.length < 6) {
    errorMsg.value = 'Mật khẩu phải có ít nhất 6 ký tự!'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = 'Mật khẩu xác nhận không khớp!'
    return
  }
  isLoading.value = true
  try {
    const res = await apiClient.post('/auth/forgot-password/reset', {
      account: account.value,
      otp: otpCode.value,
      newPassword: newPassword.value
    }) as { message: string }
    window.toast?.(res.message, 'success')
    step.value = 4
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    errorMsg.value = err.response?.data?.message || 'Không thể đặt lại mật khẩu.'
  } finally {
    isLoading.value = false
  }
}

onUnmounted(() => { if (cooldownTimer) clearInterval(cooldownTimer) })
</script>

<style scoped>
.forgot-page {
  width: 100%;
  min-height: 100%;
  background: #f8fafc;
  font-family: 'Inter', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: white;
  border-bottom: 1px solid #f1f5f9;
}
.btn-back {
  background: none;
  border: none;
  color: #475569;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}
.page-header h2 { margin: 0; font-size: 16px; font-weight: 800; color: #0f172a; }
.header-spacer { width: 26px; }

/* Body */
.page-body { flex: 1; padding: 24px 20px; display: flex; flex-direction: column; }

.step-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  width: 100%;
}

.step-icon { font-size: 48px; }
.step-container h3 { margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; }
.step-desc { margin: 0; font-size: 13px; color: #64748b; line-height: 1.6; }

.error-alert {
  width: 100%;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  text-align: left;
}

/* Input */
.input-group { width: 100%; display: flex; flex-direction: column; gap: 6px; text-align: left; }
.input-group label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; }
.mobile-input {
  width: 100%;
  padding: 13px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  outline: none;
  background: white;
  box-sizing: border-box;
  transition: border-color 0.2s;
}
.mobile-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

.input-pw-wrap { position: relative; display: flex; align-items: center; }
.input-pw-wrap .mobile-input { padding-right: 46px; }
.btn-eye { position: absolute; right: 12px; background: none; border: none; font-size: 16px; cursor: pointer; padding: 4px; }

/* OTP */
.otp-inputs { display: flex; gap: 10px; justify-content: center; }
.otp-box {
  width: 46px;
  height: 54px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  text-align: center;
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  outline: none;
  background: white;
  transition: border-color 0.2s;
}
.otp-box:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

/* Buttons */
.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(37,99,235,0.2);
  transition: opacity 0.2s;
}
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-resend {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  padding: 4px;
}
.btn-resend:disabled { color: #94a3b8; cursor: not-allowed; }

/* Success */
.success-state { padding-top: 20px; }
.success-circle {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-size: 32px;
  font-weight: 900;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(16,185,129,0.25);
}

/* Spinner */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.animated { animation-duration: 0.3s; animation-fill-mode: both; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.fade-in { animation-name: fadeIn; }
</style>
