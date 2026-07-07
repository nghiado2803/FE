<template>
  <footer id="contact" class="portal-footer-premium animated fade-in">
    <div class="footer-top-zone">
      <div class="container footer-layout-grid">

        <div class="footer-column brand-info-column">
          <div class="footer-logo-brand">
            <svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
              <rect width="38" height="38" rx="11" fill="url(#footerLogoGrad)"/>
              <path d="M13 28V10H20.5C23.538 10 26 12.462 26 15.5C26 18.538 23.538 21 20.5 21H17V28H13ZM17 17.5H20.5C21.328 17.5 22 16.828 22 16C22 15.172 21.328 14.5 20.5 14.5H17V17.5Z" fill="white"/>
              <defs>
                <linearGradient id="footerLogoGrad" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#60a5fa"/>
                  <stop offset="100%" stop-color="#2563eb"/>
                </linearGradient>
              </defs>
            </svg>
            <span class="logo-main-text">Smart<span class="text-blue-primary">Park</span></span>
          </div>
          <p class="brand-description-text">
            Giải pháp số hóa ma trận ô đỗ xe toàn diện, tự động tất toán luồng tiền cọc và minh bạch doanh thu chế tài phục vụ kỷ nguyên Đô thị thông minh Quy Nhơn.
          </p>
        </div>

        <div class="footer-column">
          <h4 class="column-section-title">Giải pháp số</h4>
          <ul class="footer-links-list">
            <li><a href="#features">Đặt chỗ thu cọc Web</a></li>
            <li><a href="#features">Giám sát sơ đồ lưới</a></li>
            <li><a href="#features">Tự động phạt No-Show</a></li>
            <li><router-link to="/customer/auth" class="router-link-inline">Ứng dụng Khách hàng</router-link></li>
          </ul>
        </div>

        <div class="footer-column">
          <h4 class="column-section-title">Hành lang hỗ trợ</h4>
          <ul class="footer-links-list">
            <li><router-link to="/doc-barie" class="router-link-inline">Tài liệu tích hợp Barie</router-link></li>
            <li><router-link to="/faq" class="router-link-inline">Câu hỏi thường gặp (FAQ)</router-link></li>
            <li><router-link to="/penalty-policy" class="router-link-inline">Chính sách xử lý phạt cọc</router-link></li>
            <li><router-link to="/terms" class="router-link-inline">Điều khoản vận hành bãi</router-link></li>
          </ul>
        </div>

        <div class="footer-column">
          <h4 class="column-section-title">Trung tâm thực địa</h4>
          <ul class="contact-info-list">
            <li class="contact-item-row">
              <span class="emoji-icon">📍</span>
              <span class="contact-text-detail">Đại lộ Khoa Học, P. Ghềnh Ráng, TP. Quy Nhơn, Tỉnh Bình Định</span>
            </li>
            <li class="contact-item-row">
              <span class="emoji-icon">📞</span>
              <span class="contact-text-detail">1900 8888 (Tổng đài CSKH 24/7)</span>
            </li>
            <li class="contact-item-row">
              <span class="emoji-icon">✉️</span>
              <span class="contact-text-detail">support@smartpark.vn</span>
            </li>
          </ul>
        </div>

      </div>
    </div>

    <div class="footer-bottom-bar">
      <div class="container bottom-bar-flex-content">
        <p class="copyright-text">&copy; {{ currentYear }} SmartPark Solutions Group. Toàn bộ bản quyền thuộc về dự án.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Inter:wght@400;500;600&display=swap');

.portal-footer-premium {
  background: linear-gradient(180deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%);
  color: #94a3b8;
  font-family: 'Inter', sans-serif;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-top-zone {
  padding: 70px 0 50px 0;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.footer-layout-grid {
  display: grid;
  grid-template-columns: 2.2fr 1fr 1fr 1.6fr;
  gap: 40px;
}

/* Logo footer — đồng bộ với sidebar */
.footer-logo-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.footer-logo-brand svg { width: 36px; height: 36px; }
.logo-main-text {
  font-family: 'Montserrat', sans-serif;
  font-size: 22px;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.5px;
}
.text-blue-primary { color: #93c5fd; }

.brand-description-text {
  line-height: 1.75;
  font-size: 14px;
  margin: 0;
  padding-right: 30px;
  color: rgba(255,255,255,0.5);
  text-align: left;
}

.column-section-title {
  font-family: 'Montserrat', sans-serif;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  margin: 0 0 20px 0;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-align: left;
  opacity: 0.9;
}

.footer-links-list, .contact-info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}
.footer-links-list li { margin-bottom: 12px; }

.footer-links-list a, .router-link-inline {
  text-decoration: none;
  color: rgba(255,255,255,0.55);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  display: inline-block;
  cursor: pointer;
}
.footer-links-list a:hover, .router-link-inline:hover {
  color: #93c5fd;
  transform: translateX(4px);
}

.contact-item-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255,255,255,0.55);
}
.emoji-icon { font-size: 15px; flex-shrink: 0; }
.contact-text-detail { font-weight: 500; }

/* Bottom bar */
.footer-bottom-bar {
  padding: 22px 0;
  background: rgba(0,0,0,0.2);
  border-top: 1px solid rgba(255,255,255,0.06);
}
.bottom-bar-flex-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.35);
}
.copyright-text { margin: 0; }

.social-media-links-zone { display: flex; align-items: center; gap: 12px; }
.social-text-link {
  text-decoration: none;
  color: rgba(255,255,255,0.35);
  font-weight: 600;
  transition: color 0.15s ease;
}
.social-text-link:hover { color: #93c5fd; }
.link-separator { color: rgba(255,255,255,0.15); user-select: none; }

@media (max-width: 992px) {
  .footer-layout-grid { grid-template-columns: 1fr 1fr; gap: 36px; }
  .brand-info-column { grid-column: span 2; padding-right: 0; }
}
@media (max-width: 576px) {
  .footer-layout-grid { grid-template-columns: 1fr; gap: 30px; }
  .brand-info-column { grid-column: span 1; }
  .bottom-bar-flex-content { flex-direction: column; gap: 14px; text-align: center; }
}

.animated { animation-duration: 0.3s; animation-fill-mode: both; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.fade-in { animation-name: fadeIn; }
</style>
