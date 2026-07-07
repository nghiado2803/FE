<template>
  <div class="doc-page">
    <div class="doc-hero red">
      <div class="container">
        <div class="breadcrumb"><router-link to="/">Trang chủ</router-link> / Chính sách xử lý phạt cọc</div>
        <h1>Chính sách xử lý phạt cọc</h1>
        <p>Quy định về No-Show, tịch thu cọc và các chế tài áp dụng tại hệ thống SmartPark</p>
      </div>
    </div>

    <div class="container doc-body">

      <div class="alert-banner">
        <span>⚠️</span>
        <p>Vui lòng đọc kỹ chính sách trước khi đặt chỗ. Việc thanh toán cọc đồng nghĩa với việc bạn đã đồng ý với các điều khoản dưới đây.</p>
      </div>

      <div class="doc-section">
        <h2>1. Định nghĩa No-Show</h2>
        <p>No-Show là tình trạng khách hàng đã đặt cọc giữ chỗ nhưng <strong>không đến check-in trong thời gian quy định</strong>. Hệ thống tự động xử lý phạt mà không cần thông báo thêm.</p>
      </div>

      <div class="doc-section">
        <h2>2. Khung thời gian xử lý</h2>
        <div class="timeline">
          <div class="tl-item green">
            <div class="tl-dot"></div>
            <div class="tl-content">
              <strong>0 – 30 phút</strong>
              <p>Thời gian giữ chỗ hợp lệ. Ô đỗ được bảo lưu cho bạn.</p>
            </div>
          </div>
          <div class="tl-item amber">
            <div class="tl-dot"></div>
            <div class="tl-content">
              <strong>30 – 45 phút</strong>
              <p>Thời gian gia hạn cảnh báo. Hệ thống gửi thông báo nhắc nhở qua ứng dụng.</p>
            </div>
          </div>
          <div class="tl-item red">
            <div class="tl-dot"></div>
            <div class="tl-content">
              <strong>Sau 45 phút</strong>
              <p>Hệ thống tự động đánh dấu No-Show, tịch thu 100% tiền cọc và giải phóng ô đỗ.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="doc-section">
        <h2>3. Bảng xử lý tiền cọc</h2>
        <table class="doc-table">
          <thead><tr><th>Tình huống</th><th>Xử lý tiền cọc</th><th>Ghi chú</th></tr></thead>
          <tbody>
            <tr><td>Đến đúng giờ, đỗ xe bình thường</td><td class="green-text">Trừ vào phí đỗ xe</td><td>Phần dư hoàn lại trong 24h</td></tr>
            <tr><td>Đến trong 30 – 45 phút</td><td class="amber-text">Trừ vào phí đỗ xe</td><td>Có cảnh báo trễ giờ</td></tr>
            <tr><td>Không đến sau 45 phút</td><td class="red-text">Tịch thu 100% cọc</td><td>Không hoàn trả</td></tr>
            <tr><td>Phí đỗ vượt tiền cọc</td><td>Thanh toán phần chênh lệch</td><td>Khi ra khỏi bãi</td></tr>
          </tbody>
        </table>
      </div>

      <div class="doc-section">
        <h2>4. Quy trình tự động</h2>
        <ol class="numbered-list">
          <li>Hệ thống ghi nhận thời điểm thanh toán cọc thành công.</li>
          <li>Sau 30 phút không check-in, gửi thông báo cảnh báo đến ứng dụng.</li>
          <li>Sau 45 phút, tự động đánh dấu trạng thái <strong>NO_SHOW</strong>.</li>
          <li>Tiền cọc được ghi nhận là doanh thu phạt, không hoàn trả.</li>
          <li>Ô đỗ được giải phóng để phục vụ khách hàng khác.</li>
        </ol>
      </div>

      <div class="doc-section">
        <h2>5. Khiếu nại & Hỗ trợ</h2>
        <p>Nếu bạn cho rằng bị xử lý phạt không đúng, vui lòng liên hệ trong vòng <strong>24 giờ</strong> kể từ thời điểm xảy ra sự cố:</p>
        <div class="contact-cards">
          <div class="contact-card"><span>📧</span><span>support@smartpark.vn</span></div>
          <div class="contact-card"><span>📞</span><span>1900 8888 (24/7)</span></div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.doc-page { background: #f8fafc; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; }
.doc-hero { color: white; padding: 60px 0 40px; }
.doc-hero.red { background: linear-gradient(135deg, #7f1d1d, #dc2626); }
.container { max-width: 860px; margin: 0 auto; padding: 0 24px; }
.breadcrumb { font-size: 13px; opacity: 0.7; margin-bottom: 16px; }
.breadcrumb a { color: #fca5a5; text-decoration: none; }
.doc-hero h1 { font-size: 32px; font-weight: 800; margin: 0 0 10px; }
.doc-hero p { font-size: 15px; opacity: 0.85; margin: 0; }
.doc-body { padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 20px; }
.alert-banner { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px 18px; display: flex; gap: 12px; align-items: flex-start; }
.alert-banner span { font-size: 20px; flex-shrink: 0; }
.alert-banner p { margin: 0; font-size: 14px; color: #991b1b; line-height: 1.6; font-weight: 600; }
.doc-section { background: white; border-radius: 16px; padding: 28px; border: 1px solid #e2e8f0; }
.doc-section h2 { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 16px; padding-bottom: 12px; border-bottom: 2px solid #fef2f2; }
.doc-section p { color: #475569; line-height: 1.7; margin: 0 0 12px; font-size: 14.5px; }
.timeline { display: flex; flex-direction: column; gap: 0; }
.tl-item { display: flex; gap: 14px; padding-bottom: 20px; position: relative; }
.tl-item::before { content: ''; position: absolute; left: 11px; top: 24px; bottom: 0; width: 2px; background: #e2e8f0; }
.tl-item:last-child::before { display: none; }
.tl-dot { width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0; margin-top: 2px; }
.tl-item.green .tl-dot { background: #16a34a; }
.tl-item.amber .tl-dot { background: #f59e0b; }
.tl-item.red .tl-dot { background: #dc2626; }
.tl-content strong { display: block; font-size: 14.5px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
.tl-content p { margin: 0; font-size: 13.5px; color: #64748b; }
.doc-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.doc-table th { background: #f8fafc; padding: 10px 14px; text-align: left; font-weight: 700; color: #64748b; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
.doc-table td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; color: #475569; }
.green-text { color: #16a34a; font-weight: 700; }
.amber-text { color: #d97706; font-weight: 700; }
.red-text { color: #dc2626; font-weight: 700; }
.numbered-list { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 10px; }
.numbered-list li { font-size: 14px; color: #475569; line-height: 1.6; }
.contact-cards { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 12px; }
.contact-card { display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 600; color: #1e293b; }
</style>
