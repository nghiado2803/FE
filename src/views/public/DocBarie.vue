<template>
  <div class="doc-page">
    <div class="doc-hero">
      <div class="container">
        <div class="breadcrumb"><router-link to="/">Trang chủ</router-link> / Tài liệu tích hợp Barie</div>
        <h1>Tài liệu tích hợp Barie</h1>
        <p>Hướng dẫn kết nối hệ thống SmartPark với cổng barie kiểm soát ra vào bãi đỗ xe</p>
      </div>
    </div>

    <div class="container doc-body">

      <div class="doc-section">
        <h2>1. Tổng quan hệ thống</h2>
        <p>SmartPark tích hợp với barie thông qua giao thức WebSocket thời gian thực. Khi nhân viên xác nhận QR hợp lệ, hệ thống gửi lệnh mở cổng tự động trong vòng <strong>500ms</strong>.</p>
        <div class="info-box">
          <span class="info-icon">ℹ️</span>
          <p>Barie phải hỗ trợ giao thức TCP/IP và có khả năng nhận lệnh từ server qua cổng <code>8080</code>.</p>
        </div>
      </div>

      <div class="doc-section">
        <h2>2. Luồng xử lý Check-in</h2>
        <div class="flow-steps">
          <div class="step"><span class="step-num">1</span><div><strong>Khách xuất trình QR</strong><p>Nhân viên quét mã QR từ ứng dụng SmartPark của khách hàng.</p></div></div>
          <div class="step"><span class="step-num">2</span><div><strong>AI nhận diện biển số</strong><p>Camera iPhone gửi ảnh sang Spring Boot → Python YOLOv8 đọc biển số.</p></div></div>
          <div class="step"><span class="step-num">3</span><div><strong>Đối soát dữ liệu</strong><p>Hệ thống so khớp biển số AI với biển số đăng ký trên vé cọc.</p></div></div>
          <div class="step"><span class="step-num">4</span><div><strong>Mở barie tự động</strong><p>Nếu khớp → gửi lệnh mở cổng. Nếu không khớp → cảnh báo nhân viên.</p></div></div>
        </div>
      </div>

      <div class="doc-section">
        <h2>3. Yêu cầu phần cứng</h2>
        <table class="doc-table">
          <thead><tr><th>Thiết bị</th><th>Yêu cầu tối thiểu</th><th>Khuyến nghị</th></tr></thead>
          <tbody>
            <tr><td>Barie điện</td><td>Hỗ trợ TCP/IP</td><td>Loại có relay 12V</td></tr>
            <tr><td>Camera AI</td><td>iPhone 8 trở lên</td><td>iPhone 12 Pro</td></tr>
            <tr><td>Máy tính nhân viên</td><td>RAM 4GB, Chrome 90+</td><td>RAM 8GB</td></tr>
            <tr><td>Mạng nội bộ</td><td>WiFi 2.4GHz</td><td>LAN có dây 100Mbps</td></tr>
          </tbody>
        </table>
      </div>

      <div class="doc-section">
        <h2>4. Cấu hình kết nối</h2>
        <p>Chỉnh sửa file <code>application.properties</code> trong Spring Boot:</p>
        <div class="code-block">
          <pre>server.port=8080
barrier.host=192.168.1.100
barrier.port=4001
barrier.open-command=OPEN
barrier.timeout=5000</pre>
        </div>
      </div>

      <div class="doc-section">
        <h2>5. Liên hệ hỗ trợ kỹ thuật</h2>
        <p>Gặp sự cố tích hợp? Liên hệ đội kỹ thuật SmartPark:</p>
        <div class="contact-cards">
          <div class="contact-card"><span>📧</span><span>tech@smartpark.vn</span></div>
          <div class="contact-card"><span>📞</span><span>1900 8888 (nhánh 2)</span></div>
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
.doc-body { padding: 40px 24px 80px; }
.doc-section { background: white; border-radius: 16px; padding: 28px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
.doc-section h2 { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 16px; padding-bottom: 12px; border-bottom: 2px solid #eff6ff; }
.doc-section p { color: #475569; line-height: 1.7; margin: 0 0 12px; font-size: 14.5px; }
.info-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px 16px; display: flex; gap: 10px; align-items: flex-start; }
.info-icon { font-size: 18px; flex-shrink: 0; }
.info-box p { margin: 0; color: #1e40af; font-size: 14px; }
code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #2563eb; }
.flow-steps { display: flex; flex-direction: column; gap: 14px; }
.step { display: flex; gap: 14px; align-items: flex-start; }
.step-num { width: 32px; height: 32px; background: #2563eb; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; flex-shrink: 0; }
.step strong { display: block; font-size: 14.5px; color: #0f172a; margin-bottom: 3px; }
.step p { margin: 0; font-size: 13.5px; color: #64748b; }
.doc-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.doc-table th { background: #f8fafc; padding: 10px 14px; text-align: left; font-weight: 700; color: #64748b; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
.doc-table td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; color: #475569; }
.code-block { background: #0f172a; border-radius: 10px; padding: 16px 20px; }
.code-block pre { margin: 0; color: #93c5fd; font-family: monospace; font-size: 13px; line-height: 1.7; }
.contact-cards { display: flex; gap: 12px; flex-wrap: wrap; }
.contact-card { display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 600; color: #1e293b; }
</style>
