<template>
  <div :class="['modern-loader-container', { 'is-fullscreen-overlay': fullscreen }]">
    <div class="loader-content-aligner">

      <div :class="['modern-spinner', size]"></div>

      <p v-if="label" class="loader-status-text-label animated fade-in-out">
        {{ label }}
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  // Bật true nếu muốn làm rèm khóa toàn bộ màn hình khi gọi API nặng hoặc tất toán ví điện tử
  fullscreen: { type: Boolean, default: false },

  // Kích thước vòng xoay: sm (nhỏ trong nút/bảng), md (vừa phải), lg (lớn toàn trang)
  size: { type: String, default: 'md' },

  // Dòng chữ hiển thị kèm theo dưới vòng xoay (Ví dụ: "Hệ thống đang đối soát dòng tiền cọc...")
  label: { type: String, default: '' }
})
</script>

<style scoped>
/* Khung chứa mặc định dạng khối inline thông thoáng */
.modern-loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
}

/* NÂNG CẤP LUỒNG LUXURY: Rèm phủ kín toàn màn hình khi xử lý tác vụ bảo mật */
.modern-loader-container.is-fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.75); /* Nền trắng trong suốt sang trọng */
  backdrop-filter: blur(5px); /* Làm nhòe mờ bãi xe phía sau đúng tiêu chuẩn iOS/Android */
  -webkit-backdrop-filter: blur(5px);
  z-index: 3000; /* Đỉnh tuyệt đối của hệ thống */
  padding: 0;
}

.loader-content-aligner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

/* --- HỆ THỐNG ĐỊNH PHOM KÍCH THƯỚC XOAY (SPINNER SIZE SYSTEM) --- */
.modern-spinner {
  border: 3px solid #e2e8f0; /* Vòng nền xám nhạt phẳng */
  border-top: 3px solid #2563eb; /* Vòng quét màu xanh dương thương hiệu mới */
  border-radius: 50%;
  animation: spinPremium 0.75s linear infinite; /* Tăng tốc độ quay lên 0.75s mượt mắt hơn */
}

.modern-spinner.sm {
  width: 20px;
  height: 20px;
  border-width: 2.5px;
}

.modern-spinner.md {
  width: 36px;
  height: 36px;
  border-width: 3.5px;
}

.modern-spinner.lg {
  width: 54px;
  height: 54px;
  border-width: 4.5px;
}

/* Phông chữ trạng thái đi kèm chuẩn Slate UI */
.loader-status-text-label {
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
  color: #475569;
  letter-spacing: 0.2px;
}

@keyframes spinPremium {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Hiệu ứng nhấp nháy chữ dịu mắt */
@keyframes fadeInOut {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
.fade-in-out {
  animation: fadeInOut 1.5s ease-in-out infinite;
}
</style>
