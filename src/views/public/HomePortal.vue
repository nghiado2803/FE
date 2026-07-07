<template>
  <div class="home-portal animated fade-in">
    <section class="hero-section" :style="{ backgroundImage: `url(${bannerBgImage})` }">

      <div class="hero-overlay"></div>
      <div class="hero-glow"></div>

      <div class="container hero-container">
        <div class="hero-content text-left">
          <div class="badge-intro animate-slide-right delay-1">
            <span class="badge-dot"></span> Hệ sinh thái SmartPark - Quy Nhơn
          </div>

          <h1 class="hero-title animate-slide-right delay-2">
            Giải pháp Quản lý <br/>
            <span class="text-gradient">{{ typeValue }}</span>
            <span class="blinking-cursor" :class="{'typing': typeStatus}">|</span>
          </h1>

          <p class="hero-subtitle animate-slide-right delay-3">
            Tối ưu hóa không gian lưới ô đỗ, tự động hóa tất toán dòng tiền cọc Web và minh bạch doanh thu bãi đỗ xe thời gian thực.
          </p>

          <div class="hero-actions animate-slide-right delay-4">
            <router-link to="/login" class="btn-primary glow-effect">
              🔑 Đăng nhập Hệ thống
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="icon-right">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <section id="about" class="about-section">
      <div class="container">
        <div class="about-wrapper">
          <div class="about-content reveal reveal-left text-left">
            <div class="section-label">Về dự án</div>
            <h2 class="section-title">Chuyển đổi số toàn diện <br/> hạ tầng bãi đỗ xe đô thị.</h2>
            <p class="about-desc">
              SmartPark giải quyết triệt để bài toán "ô đỗ ma" thông qua mô hình đặt chỗ thu cọc trước qua Web phối hợp chặt chẽ với chế tài tự động phạt hủy cọc quá hạn (No-Show). Một nền tảng nhất quán giúp Admin kiểm soát luồng tiền, Nhân viên tối ưu vận hành quầy và Khách hàng đặt chỗ an tâm tuyệt đối.
            </p>

            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">100<span class="text-gradient">%</span></div>
                <div class="stat-label">Khớp số liệu lưới</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">2<span class="text-gradient">s</span></div>
                <div class="stat-label">Quét QR rào chắn</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">45<span class="text-gradient">m</span></div>
                <div class="stat-label">Thời gian giữ chỗ tối đa</div>
              </div>
            </div>
          </div>

          <div class="about-image reveal reveal-right">
            <div class="image-frame">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop"
                alt="Tòa nhà vận hành SmartPark"
                class="company-building-img"
              />
              <div class="floating-card">
                <div class="fc-icon">✨</div>
                <div class="fc-text">
                  <strong>Nghiệp vụ cốt lõi</strong>
                  <span>Khấu trừ & Phạt cọc Web</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="features" class="features-section">
      <div class="container">
        <div class="section-header reveal reveal-up text-center">
          <div class="section-label center">Tính năng phân hệ nghiệp vụ</div>
          <h2 class="section-title">Kết nối mượt mà. Tất toán chuẩn xác.</h2>
          <p class="section-subtitle">Luồng dữ liệu khép kín tự động cập nhật trạng thái ô đỗ từ Web đặt chỗ đến cổng barie kiểm soát.</p>
        </div>

        <div class="features-grid text-left">
          <div class="feature-card reveal reveal-up delay-1">
            <div class="feature-icon-wrapper blue">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </div>
            <h3>Đặt chỗ thu cọc Web</h3>
            <p>Khách hàng quét tìm bãi gần nhất (Quảng trường/ĐH Quy Nhơn), chọn ô đỗ trên lưới và tiến hành đặt cọc trước để giữ chỗ an tâm.</p>
          </div>

          <div class="feature-card reveal reveal-up delay-2">
            <div class="feature-icon-wrapper green">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
              </svg>
            </div>
            <h3>Kiểm soát Barie Vào/Ra</h3>
            <p>Nhân viên quầy quét mã QR đối soát luồng cọc Web hoặc cấp phát vị trí nhanh chóng cho xe vãng lai, tự động lưu mốc thời gian.</p>
          </div>

          <div class="feature-card reveal reveal-up delay-3">
            <div class="feature-icon-wrapper orange">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
              </svg>
            </div>
            <h3>Giám sát Ma trận Lưới Ô</h3>
            <p>Hệ thống chia lưới tinh gọn cố định (30 ô bãi Quảng trường / 20 ô bãi ĐH Quy Nhơn) hiển thị trực quan trạng thái Đang đỗ, Chờ xe hay Trống.</p>
          </div>

          <div class="feature-card reveal reveal-up delay-4">
            <div class="feature-icon-wrapper purple">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>
            <h3>Báo cáo doanh thu phạt cọc</h3>
            <p>Tự động tổng hợp luồng doanh thu tất toán thường kết hợp dòng tiền phạt tịch thu cọc từ các ca bùng lịch No-Show một cách minh bạch.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
// GIẢI PHÁP ĐẮT GIÁ: Import trực tiếp ảnh assets bằng cơ chế module hóa của Vite
import bannerBgImage from '@/assets/banner.jpg'

const typeValue = ref<string>('')
const typeStatus = ref<boolean>(false)
const textArray: string[] = ['Bãi Đỗ Quy Nhơn', 'Cọc Giữ Chỗ Qua Web', 'Tự Động Phạt No-Show']
const typingSpeed = 80
const erasingSpeed = 40
const newTextDelay = 2000
let textArrayIndex = 0
let charIndex = 0

let typewriterTimeoutId: ReturnType<typeof setTimeout> | null = null

const typeText = () => {
  const currentText = textArray[textArrayIndex] ?? ''
  if (charIndex < currentText.length) {
    if (!typeStatus.value) typeStatus.value = true
    typeValue.value += currentText.charAt(charIndex)
    charIndex += 1
    typewriterTimeoutId = setTimeout(typeText, typingSpeed)
  } else {
    typeStatus.value = false
    typewriterTimeoutId = setTimeout(eraseText, newTextDelay)
  }
}

const eraseText = () => {
  const currentText = textArray[textArrayIndex] ?? ''
  if (charIndex > 0) {
    if (!typeStatus.value) typeStatus.value = true
    typeValue.value = currentText.substring(0, charIndex - 1)
    charIndex -= 1
    typewriterTimeoutId = setTimeout(eraseText, erasingSpeed)
  } else {
    typeStatus.value = false
    textArrayIndex += 1
    if (textArrayIndex >= textArray.length) textArrayIndex = 0
    typewriterTimeoutId = setTimeout(typeText, typingSpeed + 500)
  }
}

let scrollObserver: IntersectionObserver | null = null

onMounted(() => {
  typewriterTimeoutId = setTimeout(typeText, 1000)

  const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 }
  scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active')
      }
    })
  }, observerOptions)

  const revealElements = document.querySelectorAll('.reveal')
  const observer = scrollObserver
  if (observer) {
    revealElements.forEach(el => observer.observe(el))
  }
})

onUnmounted(() => {
  if (typewriterTimeoutId) clearTimeout(typewriterTimeoutId)
  if (scrollObserver) scrollObserver.disconnect()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap');

.home-portal { background-color: #f8fafc; overflow-x: hidden; font-family: 'Inter', sans-serif; color: #334155; -webkit-font-smoothing: antialiased; }
h1, h2, h3, .badge-intro, .btn-primary, .btn-glass, .stat-number, .section-label { font-family: 'Montserrat', sans-serif; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.text-center { text-align: center; }
.text-left { text-align: left; }

.section-label { display: inline-block; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #2563eb; margin-bottom: 12px; }
.section-label.center { margin: 0 auto 12px; display: block; }
.section-title { font-size: 40px; font-weight: 800; color: #0f172a; margin-bottom: 20px; line-height: 1.25; letter-spacing: -1px; }
.section-subtitle { font-size: 16px; color: #64748b; max-width: 600px; margin: 0 auto 56px; line-height: 1.7; }
.text-gradient { background: linear-gradient(135deg, #38bdf8, #60a5fa); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block; }

.btn-primary, .btn-glass { padding: 14px 32px; border-radius: 50px; font-size: 14px; font-weight: 700; text-decoration: none; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: inline-flex; justify-content: center; align-items: center; gap: 10px; }
.btn-primary { background: #2563eb; color: white; border: none; }
.btn-primary.glow-effect { box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4); }
.btn-primary:hover { transform: translateY(-3px); background: #1d4ed8; box-shadow: 0 15px 30px -5px rgba(37, 99, 235, 0.5); }
.icon-right { width: 16px; height: 16px; transition: transform 0.3s ease; }
.btn-primary:hover .icon-right { transform: translateX(4px); }

.btn-glass { background: rgba(255, 255, 255, 0.08); color: #ffffff; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
.btn-glass:hover { background: rgba(255, 255, 255, 0.18); border-color: rgba(255,255,255,0.35); transform: translateY(-3px); }

/* KHU VỰC CẤU HÌNH BANNER NỀN: Trả quyền bốc đường dẫn động lên khối inline-style phía trên */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.hero-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to right, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.8) 50%, rgba(15, 23, 42, 0.5) 100%); z-index: 1; }
.hero-glow { position: absolute; top: -10%; left: -10%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(37,99,235,0.12) 0%, rgba(0,0,0,0) 70%); z-index: 2; border-radius: 50%; pointer-events: none; }
.hero-container { position: relative; z-index: 3; width: 100%; }
.hero-content { max-width: 650px; }

.badge-intro { display: inline-flex; align-items: center; gap: 8px; padding: 6px 18px; background: rgba(37, 99, 235, 0.15); color: #38bdf8; border-radius: 50px; font-size: 13px; font-weight: 600; margin-bottom: 24px; border: 1px solid rgba(37, 99, 235, 0.25); backdrop-filter: blur(8px); }
.badge-dot { width: 8px; height: 8px; background: #38bdf8; border-radius: 50%; box-shadow: 0 0 8px #38bdf8; }

.hero-title { font-size: 54px; font-weight: 900; color: #ffffff; line-height: 1.15; margin-bottom: 24px; letter-spacing: -2px; }
.hero-subtitle { font-size: 16.5px; color: #94a3b8; line-height: 1.7; margin-bottom: 40px; font-weight: 400; max-width: 550px; }
.hero-actions { display: flex; gap: 16px; }

.blinking-cursor { font-weight: 300; color: #38bdf8; animation: blink 1s step-end infinite; margin-left: 2px; }
.blinking-cursor.typing { animation: none; }
@keyframes blink { from, to { opacity: 1; } 50% { opacity: 0; } }

.about-section { padding: 100px 0; background-color: #ffffff; overflow: hidden; }
.about-wrapper { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
.about-desc { color: #64748b; font-size: 15px; line-height: 1.8; margin-bottom: 36px; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.stat-item { padding: 20px; background: #f8fafc; border-radius: 16px; text-align: center; border: 1px solid #f1f5f9; }
.stat-number { font-size: 36px; font-weight: 800; color: #0f172a; margin-bottom: 4px; letter-spacing: -1px; }
.stat-label { font-size: 13px; color: #64748b; font-weight: 600; }

.image-frame { position: relative; z-index: 1; }
.company-building-img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: 24px; box-shadow: 0 20px 40px -12px rgba(0,0,0,0.12); }
.floating-card { position: absolute; bottom: 20px; left: -20px; background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(10px); padding: 12px 20px; border-radius: 16px; box-shadow: 0 15px 30px -5px rgba(0,0,0,0.08); display: flex; align-items: center; gap: 12px; animation: float 5s ease-in-out infinite; }
.fc-icon { font-size: 20px; }
.fc-text strong { display: block; color: #0f172a; font-size: 14px; margin-bottom: 1px; }
.fc-text span { color: #64748b; font-size: 12px; }

@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }

.features-section { padding: 80px 0 120px; background-color: #f8fafc; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
.feature-card { background: #ffffff; padding: 36px 28px; border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(15,23,42,0.01); }
.feature-card:hover { transform: translateY(-6px); border-color: #cbd5e1; box-shadow: 0 15px 30px -10px rgba(0,0,0,0.06); }
.feature-icon-wrapper { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
.feature-icon-wrapper svg { width: 24px; height: 24px; }
.feature-icon-wrapper.blue { background: #eff6ff; color: #2563eb; }
.feature-icon-wrapper.green { background: #f0fdf4; color: #16a34a; }
.feature-icon-wrapper.orange { background: #fff7ed; color: #ea580c; }
.feature-icon-wrapper.purple { background: #faf5ff; color: #9333ea; }
.feature-card h3 { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
.feature-card p { color: #64748b; line-height: 1.6; font-size: 14px; margin: 0; }

.reveal { opacity: 0; transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
.reveal-up { transform: translateY(40px); }
.reveal-left { transform: translateX(-40px); }
.reveal-right { transform: translateX(40px); }
.reveal.active { opacity: 1; transform: translate(0, 0); }

@media (max-width: 992px) {
  .hero-title { font-size: 40px; }
  .about-wrapper { grid-template-columns: 1fr; gap: 40px; }
  .floating-card { left: 10px; bottom: 10px; }
}
@media (max-width: 768px) {
  .hero-title { font-size: 34px; }
  .hero-actions { flex-direction: column; width: 100%; }
}
</style>
