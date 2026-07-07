<template>
  <div class="auth-page-container animated fade-in">
    <div class="auth-card-wrapper">

      <div class="brand-header">
        <h1>Smart<span class="text-blue-primary">Park</span></h1>
        <p class="subtitle">Hệ thống Quản lý & Đặt chỗ bãi đỗ xe thông minh</p>
      </div>

      <div class="auth-box-card">
        <div class="auth-header-zone">
          <div class="icon-circle-wrapper">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2>Khôi phục mật khẩu</h2>
          <p class="header-desc-text">Nhập địa chỉ Email liên kết với tài khoản SmartPark của bạn để nhận mật mã đặt lại.</p>
        </div>

        <div v-if="uiMessage.text" :class="['auth-status-alert-bar', uiMessage.type]">
          {{ uiMessage.text }}
        </div>

        <form v-if="!isSent" @submit.prevent="handleResetPassword" class="auth-core-form" novalidate>
          <div class="modern-form-group">
            <label>Địa chỉ Email đăng ký</label>
            <div class="input-field-wrapper">
              <input
                type="email"
                v-model.trim="email"
                placeholder="Ví dụ: admin@smartpark.vn"
                class="modern-auth-input"
                required
              />
            </div>
          </div>

          <button type="submit" class="btn-submit-auth" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-loader"></span>
            <span v-else>GỬI YÊU CẦU KHÔI PHỤC</span>
          </button>
        </form>

        <div v-else class="success-state-display animated scale-in">
          <div class="success-icon-badge">✓</div>
          <h3>Đã gửi Email thành công!</h3>
          <p class="success-desc-text">
            Hệ thống đã gửi liên kết đặt lại mật khẩu vào hòm thư <strong>{{ email }}</strong>. Vui lòng kiểm tra kỹ cả hộp thư rác (Spam).
          </p>
        </div>

        <div class="back-to-login-link-zone">
          <router-link :to="backLink" class="back-link">
            ← Quay lại màn hình Đăng nhập
          </router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const email = ref('')
const isLoading = ref(false)
const isSent = ref(false)
const uiMessage = ref({ text: '', type: 'error' })

// Phân biệt nguồn gọi: admin/staff hay customer
const isAdminFlow = computed(() => route.query.from === 'admin')
const backLink = computed(() => isAdminFlow.value ? '/login' : '/customer/auth')

const handleResetPassword = async () => {
  if (!email.value) {
    uiMessage.value = { text: 'Vui lòng điền địa chỉ email hệ thống!', type: 'error' }
    return
  }

  try {
    isLoading.value = true
    uiMessage.value = { text: '', type: 'error' }

    // Gọi API thật đẩy dữ liệu lên Spring Boot Server
    // await AuthService.forgotPassword({ email: email.value })

    // Giả lập độ trễ mạng 1 giây để chạy kịch bản demo uý tín
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Kiểm tra định dạng mail mẫu trước khi thông báo để tăng tính logic thực tế
    if (email.value.includes('@')) {
      isSent.value = true
      uiMessage.value = { text: '', type: 'error' }
    } else {
      uiMessage.value = { text: 'Định dạng email nhập vào không hợp lệ!', type: 'error' }
    }

  } catch (error) {
    console.error('Lỗi khôi phục mật khẩu:', error)
    uiMessage.value = { text: 'Email này không tồn tại trên hệ thống SmartPark!', type: 'error' }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* CSS Đồng bộ phom cấu trúc lồng Card giữa màn hình máy tính của bác */
.auth-page-container { display: flex; align-items: center; justify-content: center; min-height: 100vh; background-color: #f8fafc; padding: 20px; box-sizing: border-box; }
.auth-card-wrapper { width: 100%; max-width: 420px; display: flex; flex-direction: column; gap: 20px; }

.brand-header { text-align: center; margin-bottom: 5px; }
.brand-header h1 { font-size: 36px; font-weight: 900; margin: 0; color: #0f172a; letter-spacing: -0.5px; }
.text-blue-primary { color: #2563eb; }
.subtitle { color: #64748b; font-size: 13px; margin-top: 6px; font-weight: 500; }

.auth-box-card { background: white; border-radius: 16px; padding: 32px 24px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; box-sizing: border-box; }

.auth-header-zone { text-align: center; margin-bottom: 24px; }
.icon-circle-wrapper { width: 44px; height: 44px; background: #eff6ff; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin: 0 auto 12px; }
.auth-header-zone h2 { font-size: 20px; color: #0f172a; font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.3px; }
.header-desc-text { color: #64748b; font-size: 13px; line-height: 1.5; margin: 0; }

.auth-core-form { display: flex; flex-direction: column; gap: 18px; }
.modern-form-group { display: flex; flex-direction: column; gap: 6px; text-align: left; }
.modern-form-group label { font-size: 13px; font-weight: 700; color: #334155; }
.input-field-wrapper { width: 100%; }

/* BỔ SUNG BOX-SIZING TRIỆT TIÊU LỖI ĐƠ LAYOUT */
.modern-auth-input { width: 100%; padding: 12px 16px; font-size: 14px; border: 1px solid #cbd5e1; border-radius: 10px; outline: none; transition: 0.2s; background-color: #f8fafc; box-sizing: border-box; }
.modern-auth-input:focus { border-color: #2563eb; background-color: white; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }

.btn-submit-auth { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; padding: 14px; border-radius: 10px; font-size: 14px; font-weight: 700; width: 100%; margin-top: 6px; cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center; min-height: 46px; box-sizing: border-box; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
.btn-submit-auth:hover { background: linear-gradient(135deg, #1d4ed8, #1e40af); }
.btn-submit-auth:disabled { opacity: 0.6; cursor: not-allowed; }

/* Trạng thái thành công */
.success-state-display { padding: 10px 0 20px 0; text-align: center; }
.success-icon-badge { width: 44px; height: 44px; background: #10b981; color: white; font-size: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-weight: bold; box-shadow: 0 4px 10px rgba(16,185,129,0.2); }
.success-state-display h3 { color: #065f46; font-size: 16px; font-weight: 800; margin: 0 0 6px 0; }
.success-desc-text { color: #475569; font-size: 13px; line-height: 1.5; margin: 0; }

.back-to-login-link-zone { margin-top: 24px; border-top: 1px dashed #e2e8f0; padding-top: 16px; }
.back-link { color: #64748b; text-decoration: none; font-size: 13.5px; font-weight: 700; transition: color 0.2s; }
.back-link:hover { color: #2563eb; }

/* Thanh cảnh báo lỗi UI */
.auth-status-alert-bar { background-color: #fffbeb; border: 1px solid #fef08a; color: #b45309; padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; text-align: left; margin-bottom: 16px; line-height: 1.4; }

.spinner-loader { width: 18px; height: 18px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.animated { animation-duration: 0.3s; animation-fill-mode: both; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.fade-in { animation-name: fadeIn; }
</style>
