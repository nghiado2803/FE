<template>
  <div class="policy-page">

    <!-- Hero banner -->
    <div class="policy-hero">
      <div class="hero-icon">🛡️</div>
      <h2>Chính sách & Bảo mật</h2>
      <p>SmartPark cam kết minh bạch về quy định sử dụng dịch vụ</p>
    </div>

    <!-- Tabs -->
    <div class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- Nội dung tab -->
    <div class="policy-content">

      <!-- Tab 1: Chính sách phạt cọc -->
      <div v-if="activeTab === 'penalty'" class="content-section">
        <div class="section-alert red">
          <span class="alert-icon">⚠️</span>
          <div>
            <strong>Quy định phạt No-Show</strong>
            <p>Khách hàng đặt cọc giữ chỗ nhưng không đến trong thời gian quy định sẽ bị tịch thu toàn bộ tiền cọc.</p>
          </div>
        </div>

        <div class="policy-card">
          <h4>⏱️ Thời gian giữ chỗ</h4>
          <div class="timeline">
            <div class="timeline-item green">
              <div class="tl-dot"></div>
              <div class="tl-content">
                <strong>0 – 30 phút</strong>
                <p>Thời gian giữ chỗ hợp lệ. Hệ thống giữ ô đỗ cho bạn.</p>
              </div>
            </div>
            <div class="timeline-item amber">
              <div class="tl-dot"></div>
              <div class="tl-content">
                <strong>30 – 45 phút</strong>
                <p>Thời gian gia hạn cảnh báo. Hệ thống gửi thông báo nhắc nhở.</p>
              </div>
            </div>
            <div class="timeline-item red">
              <div class="tl-dot"></div>
              <div class="tl-content">
                <strong>Sau 45 phút</strong>
                <p>Hệ thống tự động tịch thu 100% tiền cọc và giải phóng ô đỗ.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="policy-card">
          <h4>💰 Bảng phí & Hoàn tiền</h4>
          <table class="policy-table">
            <thead>
              <tr>
                <th>Tình huống</th>
                <th>Xử lý tiền cọc</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Đến đúng giờ, đỗ xe bình thường</td>
                <td class="green-text">Trừ vào phí đỗ xe</td>
              </tr>
              <tr>
                <td>Đến muộn nhưng trong 45 phút</td>
                <td class="amber-text">Trừ vào phí đỗ xe (có cảnh báo)</td>
              </tr>
              <tr>
                <td>Không đến sau 45 phút (No-Show)</td>
                <td class="red-text">Tịch thu 100% tiền cọc</td>
              </tr>
              <tr>
                <td>Phí đỗ xe vượt tiền cọc</td>
                <td>Thanh toán phần chênh lệch khi ra</td>
              </tr>
              <tr>
                <td>Phí đỗ xe thấp hơn tiền cọc</td>
                <td class="green-text">Hoàn lại phần dư (trong 24h)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="policy-card">
          <h4>📋 Quy trình xử lý No-Show</h4>
          <ol class="policy-list">
            <li>Hệ thống ghi nhận thời điểm đặt cọc thành công.</li>
            <li>Sau 30 phút không check-in, hệ thống gửi thông báo cảnh báo.</li>
            <li>Sau 45 phút, hệ thống tự động đánh dấu trạng thái <strong>NO_SHOW</strong>.</li>
            <li>Tiền cọc được ghi nhận là doanh thu phạt, không hoàn trả.</li>
            <li>Ô đỗ được giải phóng để phục vụ khách hàng khác.</li>
          </ol>
        </div>
      </div>

      <!-- Tab 2: Chính sách bảo mật -->
      <div v-if="activeTab === 'privacy'" class="content-section">
        <div class="section-alert blue">
          <span class="alert-icon">🔒</span>
          <div>
            <strong>Cam kết bảo mật dữ liệu</strong>
            <p>SmartPark áp dụng tiêu chuẩn mã hóa SSL/TLS và không chia sẻ thông tin cá nhân với bên thứ ba.</p>
          </div>
        </div>

        <div class="policy-card">
          <h4>📱 Dữ liệu chúng tôi thu thập</h4>
          <div class="data-list">
            <div class="data-item">
              <span class="data-icon">👤</span>
              <div>
                <strong>Thông tin cá nhân</strong>
                <p>Họ tên, số điện thoại, email để tạo tài khoản và liên lạc.</p>
              </div>
            </div>
            <div class="data-item">
              <span class="data-icon">🚗</span>
              <div>
                <strong>Thông tin phương tiện</strong>
                <p>Biển số xe để xác thực khi check-in bằng AI nhận diện.</p>
              </div>
            </div>
            <div class="data-item">
              <span class="data-icon">📍</span>
              <div>
                <strong>Vị trí GPS</strong>
                <p>Chỉ dùng để tìm bãi đỗ gần nhất, không lưu trữ lịch sử di chuyển.</p>
              </div>
            </div>
            <div class="data-item">
              <span class="data-icon">💳</span>
              <div>
                <strong>Thông tin thanh toán</strong>
                <p>Xử lý qua cổng MoMo/PayOS, SmartPark không lưu thông tin thẻ.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="policy-card">
          <h4>🔐 Biện pháp bảo mật</h4>
          <div class="security-badges">
            <div class="sec-badge">
              <span>🔑</span>
              <span>Mã hóa BCrypt</span>
            </div>
            <div class="sec-badge">
              <span>🌐</span>
              <span>HTTPS / SSL</span>
            </div>
            <div class="sec-badge">
              <span>🎫</span>
              <span>JWT Token</span>
            </div>
            <div class="sec-badge">
              <span>🛡️</span>
              <span>CORS Protection</span>
            </div>
          </div>
        </div>

        <div class="policy-card">
          <h4>📞 Liên hệ hỗ trợ</h4>
          <div class="contact-list">
            <div class="contact-item">
              <span>📧</span>
              <span>support@smartpark.vn</span>
            </div>
            <div class="contact-item">
              <span>📱</span>
              <span>Hotline: 1800-SMART (Miễn phí)</span>
            </div>
            <div class="contact-item">
              <span>🕐</span>
              <span>Hỗ trợ 24/7 tất cả các ngày</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 3: Điều khoản sử dụng -->
      <div v-if="activeTab === 'terms'" class="content-section">
        <div class="policy-card">
          <h4>📜 Điều khoản sử dụng dịch vụ</h4>
          <ol class="policy-list">
            <li>Người dùng phải đăng ký tài khoản với thông tin chính xác và hợp lệ.</li>
            <li>Mỗi tài khoản chỉ được sử dụng bởi một cá nhân, không được chia sẻ.</li>
            <li>Biển số xe đăng ký phải khớp với phương tiện thực tế khi check-in.</li>
            <li>Nghiêm cấm sử dụng dịch vụ cho mục đích gian lận hoặc vi phạm pháp luật.</li>
            <li>SmartPark có quyền khóa tài khoản vi phạm mà không cần thông báo trước.</li>
            <li>Mọi tranh chấp được giải quyết theo pháp luật Việt Nam hiện hành.</li>
          </ol>
        </div>

        <div class="policy-card">
          <h4>🚗 Trách nhiệm của khách hàng</h4>
          <ul class="policy-list bullet">
            <li>Đảm bảo xe đỗ đúng ô được phân công.</li>
            <li>Không để vật có giá trị trong xe khi gửi bãi.</li>
            <li>Xuất trình mã QR hợp lệ khi vào/ra bãi.</li>
            <li>Thanh toán đầy đủ phí đỗ xe trước khi rời bãi.</li>
          </ul>
        </div>

        <div class="policy-card">
          <h4>⚖️ Giới hạn trách nhiệm</h4>
          <p class="policy-text">SmartPark không chịu trách nhiệm về mất mát tài sản cá nhân để trong xe. Chúng tôi chỉ cung cấp dịch vụ quản lý chỗ đỗ xe và không phải là đơn vị bảo hiểm tài sản.</p>
        </div>

        <div class="last-updated">
          Cập nhật lần cuối: 22/05/2026 — Phiên bản 1.0
        </div>
      </div>

    </div>

    <!-- Nút quay lại -->
    <div class="back-footer">
      <button class="btn-back" @click="router.back()">← Quay lại</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('penalty')

const tabs = [
  { id: 'penalty', icon: '⚠️', label: 'Phạt cọc' },
  { id: 'privacy', icon: '🔒', label: 'Bảo mật' },
  { id: 'terms', icon: '📜', label: 'Điều khoản' },
]
</script>

<style scoped>
.policy-page {
  width: 100%;
  background: #f8fafc;
  font-family: 'Inter', system-ui, sans-serif;
  padding-bottom: 24px;
}

/* Hero */
.policy-hero {
  background: linear-gradient(135deg, #1e3a8a, #2563eb);
  padding: 28px 20px 24px;
  text-align: center;
  color: white;
}
.hero-icon { font-size: 36px; margin-bottom: 8px; }
.policy-hero h2 { margin: 0 0 6px; font-size: 20px; font-weight: 800; }
.policy-hero p { margin: 0; font-size: 12px; opacity: 0.85; }

/* Tabs */
.tab-bar {
  display: flex;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 16px;
  gap: 4px;
  overflow-x: auto;
}
.tab-btn {
  padding: 12px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  white-space: nowrap;
  margin-bottom: -1px;
  transition: all 0.2s;
}
.tab-btn.active { color: #2563eb; border-bottom-color: #2563eb; }

/* Content */
.policy-content { padding: 16px; display: flex; flex-direction: column; gap: 14px; }
.content-section { display: flex; flex-direction: column; gap: 14px; }

.section-alert {
  display: flex;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  align-items: flex-start;
}
.section-alert.red { background: #fef2f2; border: 1px solid #fecaca; }
.section-alert.blue { background: #eff6ff; border: 1px solid #bfdbfe; }
.section-alert strong { display: block; font-size: 13.5px; color: #0f172a; margin-bottom: 4px; }
.section-alert p { margin: 0; font-size: 12px; color: #475569; line-height: 1.5; }
.alert-icon { font-size: 20px; flex-shrink: 0; }

.policy-card {
  background: white;
  border-radius: 14px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}
.policy-card h4 { margin: 0 0 14px; font-size: 14px; font-weight: 800; color: #0f172a; }

/* Timeline */
.timeline { display: flex; flex-direction: column; gap: 0; }
.timeline-item { display: flex; gap: 12px; padding-bottom: 16px; position: relative; }
.timeline-item:last-child { padding-bottom: 0; }
.timeline-item::before { content: ''; position: absolute; left: 7px; top: 18px; bottom: 0; width: 2px; background: #e2e8f0; }
.timeline-item:last-child::before { display: none; }
.tl-dot { width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0; margin-top: 2px; }
.timeline-item.green .tl-dot { background: #16a34a; }
.timeline-item.amber .tl-dot { background: #f59e0b; }
.timeline-item.red .tl-dot { background: #dc2626; }
.tl-content strong { display: block; font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 3px; }
.tl-content p { margin: 0; font-size: 12px; color: #64748b; line-height: 1.5; }

/* Table */
.policy-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.policy-table th { background: #f8fafc; padding: 10px 12px; text-align: left; font-weight: 700; color: #64748b; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
.policy-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #475569; }
.policy-table tr:last-child td { border-bottom: none; }
.green-text { color: #16a34a; font-weight: 700; }
.amber-text { color: #d97706; font-weight: 700; }
.red-text { color: #dc2626; font-weight: 700; }

/* Lists */
.policy-list { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 8px; }
.policy-list li { font-size: 13px; color: #475569; line-height: 1.6; }
.policy-list.bullet { list-style: disc; }
.policy-text { margin: 0; font-size: 13px; color: #475569; line-height: 1.7; }

/* Data items */
.data-list { display: flex; flex-direction: column; gap: 12px; }
.data-item { display: flex; gap: 12px; align-items: flex-start; }
.data-icon { font-size: 20px; flex-shrink: 0; }
.data-item strong { display: block; font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 2px; }
.data-item p { margin: 0; font-size: 12px; color: #64748b; }

/* Security badges */
.security-badges { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.sec-badge { display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; font-size: 13px; font-weight: 700; color: #1e293b; }
.sec-badge span:first-child { font-size: 18px; }

/* Contact */
.contact-list { display: flex; flex-direction: column; gap: 10px; }
.contact-item { display: flex; align-items: center; gap: 10px; font-size: 13.5px; color: #1e293b; font-weight: 600; }
.contact-item span:first-child { font-size: 18px; }

.last-updated { text-align: center; font-size: 11px; color: #94a3b8; padding-top: 8px; }

/* Back button */
.back-footer { padding: 0 16px; }
.btn-back { width: 100%; padding: 13px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 13.5px; font-weight: 700; color: #475569; cursor: pointer; }
.btn-back:active { background: #f8fafc; }
</style>
