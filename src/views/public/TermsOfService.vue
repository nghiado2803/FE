<template>
  <div class="doc-page">
    <div class="doc-hero">
      <div class="container">
        <div class="breadcrumb"><router-link to="/">Trang chủ</router-link> / Điều khoản vận hành bãi</div>
        <h1>Điều khoản vận hành bãi</h1>
        <p>Quy định sử dụng dịch vụ và trách nhiệm các bên tại hệ thống bãi đỗ xe SmartPark Quy Nhơn</p>
      </div>
    </div>

    <div class="container doc-body">

      <div class="last-updated">Cập nhật lần cuối: 22/05/2026 — Phiên bản 1.0</div>

      <div class="doc-section">
        <h2>1. Phạm vi áp dụng</h2>
        <p>Điều khoản này áp dụng cho tất cả người dùng sử dụng dịch vụ đặt chỗ, thanh toán và gửi xe tại các bãi đỗ xe thuộc hệ thống SmartPark tại TP. Quy Nhơn, tỉnh Bình Định.</p>
      </div>

      <div class="doc-section">
        <h2>2. Điều kiện sử dụng dịch vụ</h2>
        <ul class="bullet-list">
          <li>Người dùng phải đăng ký tài khoản với thông tin chính xác và hợp lệ.</li>
          <li>Mỗi tài khoản chỉ được sử dụng bởi một cá nhân, không được chia sẻ.</li>
          <li>Biển số xe đăng ký phải khớp với phương tiện thực tế khi check-in.</li>
          <li>Người dùng phải từ 18 tuổi trở lên hoặc có sự đồng ý của người giám hộ.</li>
        </ul>
      </div>

      <div class="doc-section">
        <h2>3. Trách nhiệm của khách hàng</h2>
        <ul class="bullet-list">
          <li>Đảm bảo xe đỗ đúng ô được phân công, không lấn sang ô khác.</li>
          <li>Không để vật có giá trị trong xe khi gửi bãi.</li>
          <li>Xuất trình mã QR hợp lệ khi vào/ra bãi theo yêu cầu của nhân viên.</li>
          <li>Thanh toán đầy đủ phí đỗ xe trước khi rời bãi.</li>
          <li>Tuân thủ nội quy bãi đỗ xe và hướng dẫn của nhân viên.</li>
        </ul>
      </div>

      <div class="doc-section">
        <h2>4. Trách nhiệm của SmartPark</h2>
        <ul class="bullet-list">
          <li>Đảm bảo hệ thống hoạt động ổn định 24/7.</li>
          <li>Bảo mật thông tin cá nhân và dữ liệu thanh toán của người dùng.</li>
          <li>Xử lý khiếu nại trong vòng 48 giờ làm việc.</li>
          <li>Thông báo trước ít nhất 7 ngày khi có thay đổi chính sách.</li>
        </ul>
      </div>

      <div class="doc-section">
        <h2>5. Giới hạn trách nhiệm</h2>
        <div class="warning-box">
          <p>SmartPark <strong>không chịu trách nhiệm</strong> về mất mát, hư hỏng tài sản cá nhân để trong xe. Chúng tôi chỉ cung cấp dịch vụ quản lý chỗ đỗ xe và không phải đơn vị bảo hiểm tài sản.</p>
        </div>
        <p>SmartPark không chịu trách nhiệm về các thiệt hại gián tiếp phát sinh từ việc sử dụng dịch vụ, bao gồm nhưng không giới hạn: trễ giờ, mất cơ hội kinh doanh.</p>
      </div>

      <div class="doc-section">
        <h2>6. Chấm dứt dịch vụ</h2>
        <p>SmartPark có quyền tạm khóa hoặc chấm dứt tài khoản trong các trường hợp:</p>
        <ul class="bullet-list">
          <li>Vi phạm điều khoản sử dụng.</li>
          <li>Cung cấp thông tin giả mạo.</li>
          <li>Có hành vi gian lận thanh toán.</li>
          <li>Gây mất trật tự tại bãi đỗ xe.</li>
        </ul>
      </div>

      <div class="doc-section">
        <h2>7. Giải quyết tranh chấp</h2>
        <p>Mọi tranh chấp phát sinh được ưu tiên giải quyết thông qua thương lượng. Nếu không đạt được thỏa thuận, tranh chấp sẽ được giải quyết tại <strong>Tòa án nhân dân TP. Quy Nhơn</strong> theo pháp luật Việt Nam hiện hành.</p>
      </div>

      <div class="doc-section">
        <h2>8. Liên hệ</h2>
        <div class="contact-cards">
          <div class="contact-card"><span>📍</span><span>Đại lộ Khoa Học, P. Ghềnh Ráng, TP. Quy Nhơn</span></div>
          <div class="contact-card"><span>📧</span><span>legal@smartpark.vn</span></div>
          <div class="contact-card"><span>📞</span><span>1900 8888</span></div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.doc-page { background: #f8fafc; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; }
.doc-hero { background: linear-gradient(135deg, #1e3a8a, #2563eb); color: white; padding: 60px 0 40px; }
.container { max-width: 860px; margin: 0 auto; padding: 0 24px; }
.breadcrumb { font-size: 13px; opacity: 0.7; margin-bottom: 16px; }
.breadcrumb a { color: #93c5fd; text-decoration: none; }
.doc-hero h1 { font-size: 32px; font-weight: 800; margin: 0 0 10px; }
.doc-hero p { font-size: 15px; opacity: 0.85; margin: 0; }
.doc-body { padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 20px; }
.last-updated { font-size: 12px; color: #94a3b8; text-align: right; }
.doc-section { background: white; border-radius: 16px; padding: 28px; border: 1px solid #e2e8f0; }
.doc-section h2 { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 16px; padding-bottom: 12px; border-bottom: 2px solid #eff6ff; }
.doc-section p { color: #475569; line-height: 1.7; margin: 0 0 12px; font-size: 14.5px; }
.bullet-list { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 8px; }
.bullet-list li { font-size: 14px; color: #475569; line-height: 1.6; }
.warning-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 14px 16px; margin-bottom: 12px; }
.warning-box p { margin: 0; color: #991b1b; font-size: 14px; }
.contact-cards { display: flex; flex-direction: column; gap: 10px; }
.contact-card { display: flex; align-items: center; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 600; color: #1e293b; }
</style>
