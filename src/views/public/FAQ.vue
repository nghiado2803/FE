<template>
  <div class="doc-page">
    <div class="doc-hero">
      <div class="container">
        <div class="breadcrumb"><router-link to="/">Trang chủ</router-link> / Câu hỏi thường gặp</div>
        <h1>Câu hỏi thường gặp (FAQ)</h1>
        <p>Giải đáp các thắc mắc phổ biến về dịch vụ đặt chỗ và thanh toán SmartPark</p>
      </div>
    </div>

    <div class="container doc-body">

      <div class="faq-group">
        <h2>🚗 Đặt chỗ & Thanh toán</h2>
        <div v-for="(item, i) in faqBooking" :key="i" class="faq-item" :class="{ open: openIndex === `b${i}` }" @click="toggle(`b${i}`)">
          <div class="faq-q">
            <span>{{ item.q }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="16" height="16" class="faq-arrow">
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
            </svg>
          </div>
          <div class="faq-a" v-show="openIndex === `b${i}`">{{ item.a }}</div>
        </div>
      </div>

      <div class="faq-group">
        <h2>⏱️ Giữ chỗ & Phạt cọc</h2>
        <div v-for="(item, i) in faqPenalty" :key="i" class="faq-item" :class="{ open: openIndex === `p${i}` }" @click="toggle(`p${i}`)">
          <div class="faq-q">
            <span>{{ item.q }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="16" height="16" class="faq-arrow">
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
            </svg>
          </div>
          <div class="faq-a" v-show="openIndex === `p${i}`">{{ item.a }}</div>
        </div>
      </div>

      <div class="faq-group">
        <h2>📱 Ứng dụng & Tài khoản</h2>
        <div v-for="(item, i) in faqApp" :key="i" class="faq-item" :class="{ open: openIndex === `a${i}` }" @click="toggle(`a${i}`)">
          <div class="faq-q">
            <span>{{ item.q }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="16" height="16" class="faq-arrow">
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
            </svg>
          </div>
          <div class="faq-a" v-show="openIndex === `a${i}`">{{ item.a }}</div>
        </div>
      </div>

      <div class="still-need-help">
        <h3>Vẫn còn thắc mắc?</h3>
        <p>Liên hệ đội hỗ trợ SmartPark qua hotline <strong>1900 8888</strong> hoặc email <strong>support@smartpark.vn</strong></p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const openIndex = ref<string | null>(null)
const toggle = (key: string) => { openIndex.value = openIndex.value === key ? null : key }

const faqBooking = [
  { q: 'Tôi đặt chỗ như thế nào?', a: 'Mở ứng dụng SmartPark, chọn bãi đỗ gần nhất trên bản đồ, chọn ô đỗ và tiến hành thanh toán cọc qua MoMo hoặc PayOS. Sau khi thanh toán thành công, bạn nhận được mã QR để check-in tại cổng bãi.' },
  { q: 'Tôi có thể thanh toán bằng những phương thức nào?', a: 'SmartPark hỗ trợ thanh toán qua Ví MoMo và PayOS (chuyển khoản QR ngân hàng). Chúng tôi không hỗ trợ thanh toán tiền mặt qua ứng dụng.' },
  { q: 'Tiền cọc có được hoàn lại không?', a: 'Tiền cọc sẽ được trừ vào phí đỗ xe khi bạn ra khỏi bãi. Nếu phí đỗ thấp hơn tiền cọc, phần dư sẽ được hoàn lại trong vòng 24 giờ.' },
  { q: 'Tôi có thể đặt nhiều chỗ cùng lúc không?', a: 'Hiện tại mỗi tài khoản chỉ được đặt 1 chỗ tại một thời điểm. Bạn cần hoàn tất hoặc hủy đặt chỗ hiện tại trước khi đặt mới.' },
]

const faqPenalty = [
  { q: 'Thời gian giữ chỗ là bao lâu?', a: 'Hệ thống giữ chỗ trong 30 phút kể từ thời điểm thanh toán cọc thành công. Sau 30 phút, hệ thống sẽ gia hạn thêm 15 phút cảnh báo trước khi tịch thu cọc.' },
  { q: 'Điều gì xảy ra nếu tôi không đến đúng giờ (No-Show)?', a: 'Nếu quá 45 phút mà bạn không check-in, hệ thống tự động đánh dấu No-Show, tịch thu 100% tiền cọc và giải phóng ô đỗ cho khách hàng khác.' },
  { q: 'Tôi có thể hủy đặt chỗ không?', a: 'Bạn có thể hủy trước khi hết thời gian giữ chỗ. Tuy nhiên tiền cọc sẽ không được hoàn lại khi hủy sau khi đã thanh toán.' },
  { q: 'Làm sao để biết chỗ của tôi còn được giữ không?', a: 'Màn hình vé trong ứng dụng hiển thị đồng hồ đếm ngược thời gian giữ chỗ còn lại. Bạn cũng nhận thông báo khi còn 5 phút.' },
]

const faqApp = [
  { q: 'Tôi quên mật khẩu thì làm sao?', a: 'Nhấn "Quên mật khẩu" trên màn hình đăng nhập, nhập số điện thoại đăng ký, hệ thống sẽ gửi mã OTP để đặt lại mật khẩu mới.' },
  { q: 'Tôi có thể đăng ký nhiều biển số xe không?', a: 'Có, bạn có thể thêm nhiều phương tiện trong mục "Phương tiện của tôi" ở trang Cá nhân.' },
  { q: 'Ứng dụng có hoạt động trên máy tính không?', a: 'SmartPark là ứng dụng web, hoạt động trên mọi trình duyệt. Giao diện khách hàng được tối ưu cho điện thoại di động.' },
]
</script>

<style scoped>
.doc-page { background: #f8fafc; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; }
.doc-hero { background: linear-gradient(135deg, #1e3a8a, #2563eb); color: white; padding: 60px 0 40px; }
.container { max-width: 860px; margin: 0 auto; padding: 0 24px; }
.breadcrumb { font-size: 13px; opacity: 0.7; margin-bottom: 16px; }
.breadcrumb a { color: #93c5fd; text-decoration: none; }
.doc-hero h1 { font-size: 32px; font-weight: 800; margin: 0 0 10px; }
.doc-hero p { font-size: 15px; opacity: 0.85; margin: 0; }
.doc-body { padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 24px; }
.faq-group h2 { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 12px; }
.faq-item { background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 8px; cursor: pointer; transition: border-color 0.2s; }
.faq-item.open { border-color: #2563eb; }
.faq-q { display: flex; justify-content: space-between; align-items: center; padding: 16px 18px; font-size: 14.5px; font-weight: 700; color: #0f172a; gap: 12px; }
.faq-arrow { flex-shrink: 0; color: #94a3b8; transition: transform 0.2s; }
.faq-item.open .faq-arrow { transform: rotate(180deg); color: #2563eb; }
.faq-a { padding: 0 18px 16px; font-size: 14px; color: #475569; line-height: 1.7; border-top: 1px solid #f1f5f9; padding-top: 12px; }
.still-need-help { background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 1px solid #bfdbfe; border-radius: 16px; padding: 28px; text-align: center; }
.still-need-help h3 { margin: 0 0 8px; font-size: 18px; font-weight: 800; color: #1e40af; }
.still-need-help p { margin: 0; font-size: 14.5px; color: #1e40af; }
</style>
