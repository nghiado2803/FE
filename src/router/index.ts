import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Import hệ thống khung vỏ Layout bọc ngoài ứng dụng
import PublicLayout from '@/layouts/PublicLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import CustomerLayout from '@/layouts/CustomerLayout.vue'

// Khai báo ma trận định tuyến toàn hệ thống SmartPark-G1
const routes: Array<RouteRecordRaw> = [

  // =========================================================================
  // 1. PHÂN HỆ PUBLIC (Cổng thông tin ngoài, biểu mẫu Landing Page không khóa)
  // =========================================================================
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: '', name: 'HomePortal', component: () => import('@/views/public/HomePortal.vue') },
      { path: 'login', name: 'Login', component: () => import('@/views/public/Login.vue') },
      { path: 'forgot-password', name: 'ForgotPassword', component: () => import('@/views/public/ForgotPassword.vue') },
      { path: 'doc-barie', name: 'DocBarie', component: () => import('@/views/public/DocBarie.vue') },
      { path: 'faq', name: 'FAQ', component: () => import('@/views/public/FAQ.vue') },
      { path: 'penalty-policy', name: 'PenaltyPolicy', component: () => import('@/views/public/PenaltyPolicy.vue') },
      { path: 'terms', name: 'TermsOfService', component: () => import('@/views/public/TermsOfService.vue') }
    ]
  },

  // =========================================================================
  // 2. PHÂN HỆ CUSTOMER (Ứng dụng di động giả lập dành cho Khách hàng đỗ xe)
  // =========================================================================
  {
    path: '/customer',
    component: CustomerLayout,
    redirect: '/customer/home', // Tự động bốc đầu điều hướng về trang chủ di động
    children: [
      {
        path: 'home',
        name: 'CustomerHome',
        component: () => import('@/views/customer/CustomerHome.vue'),
        meta: { title: 'Trang chủ' }
      },
      {
        path: 'auth',
        name: 'CustomerLogin',
        component: () => import('@/views/customer/CustomerAuth.vue'),
        meta: { title: 'Đăng nhập khách hàng' }
      },
      {
        path: 'search',
        name: 'SearchLocation',
        component: () => import('@/views/customer/SearchLocation.vue'),
        meta: { title: 'Tìm bãi đỗ' }
      },
      {
        path: 'map-booking',
        name: 'MapBooking',
        component: () => import('@/views/customer/MapViewAndBooking.vue'),
        meta: { title: 'Sơ đồ bãi xe', showBack: true }
      },
      {
        path: 'deposit',
        name: 'DepositPayment',
        component: () => import('@/views/customer/DepositPayment.vue'),
        meta: { title: 'Thanh toán cọc', showBack: true }
      },
      {
        path: 'ticket',
        name: 'MyTicket',
        component: () => import('@/views/customer/MyTicketQRCode.vue'),
        meta: { title: 'Vé của tôi' }
      },
      {
        path: 'navigation',
        name: 'Navigation',
        component: () => import('@/views/customer/NavigationGuide.vue'),
        meta: { requiresAuth: true, role: 'CUSTOMER', title: 'Chỉ đường đi', showBack: true }
      },
      {
        path: 'profile',
        name: 'CustomerProfile',
        component: () => import('@/views/customer/Profile.vue'),
        meta: { requiresAuth: true, role: 'CUSTOMER', title: 'Cá nhân' }
      },

      // ĐÃ CẬP NHẬT ĐƯỜNG TRUYỀN ĐẮT GIÁ 1: Quản lý phương tiện CRUD biển số 77 Quy Nhơn
      {
        path: 'vehicles',
        name: 'MyVehicles',
        component: () => import('@/views/customer/MyVehicles.vue'),
        meta: { requiresAuth: true, role: 'CUSTOMER', title: 'Phương tiện của tôi', showBack: true }
      },

      // ĐÃ CẬP NHẬT ĐƯỜNG TRUYỀN ĐẮT GIÁ 2: Nhật ký lịch sử tất toán dòng tiền cọc và phạt No-Show
      {
        path: 'history',
        name: 'ParkingHistory',
        component: () => import('@/views/customer/ParkingHistory.vue'),
        meta: { requiresAuth: true, role: 'CUSTOMER', title: 'Nhật ký gửi xe', showBack: true }
      },

      // VÉ THÁNG: Quản lý vé đỗ xe dài hạn
      {
        path: 'monthly-tickets',
        name: 'MonthlyTickets',
        component: () => import('@/views/customer/MonthlyTickets.vue'),
        meta: { requiresAuth: true, role: 'CUSTOMER', title: 'Vé tháng của tôi', showBack: true }
      },
      {
        path: 'policy',
        name: 'ParkingPolicy',
        component: () => import('@/views/customer/ParkingPolicy.vue'),
        meta: { title: 'Chính sách & Bảo mật', showBack: true }
      },
      {
        path: 'forgot-password',
        name: 'CustomerForgotPassword',
        component: () => import('@/views/customer/CustomerForgotPassword.vue'),
        meta: { title: 'Quên mật khẩu', showBack: true }
      }
    ]
  },

  // =========================================================================
  // 3. PHÂN HỆ ADMIN (Cổng Dashboard quản trị tối cao của sếp tổng)
  // =========================================================================
  {
    path: '/admin',
    component: DashboardLayout,
    meta: { requiresAuth: true, role: 'ADMIN' }, // Khóa nghiêm ngặt tầng cha
    children: [
      { path: 'revenue-report', name: 'RevenueReport', component: () => import('@/views/admin/RevenueReport.vue'), meta: { title: 'Báo cáo doanh thu' } },
      { path: 'parking-manage', name: 'ParkingManage', component: () => import('@/views/admin/ParkingManage.vue'), meta: { title: 'Danh sách bãi đỗ' } },
      { path: 'monthly-tickets', name: 'MonthlyTicketManage', component: () => import('@/views/admin/MonthlyTicketManage.vue'), meta: { title: 'Quản lý vé tháng' } },
      { path: 'user-manage', name: 'UserManage', component: () => import('@/views/admin/UserManage.vue'), meta: { title: 'Quản lý tài khoản' } },
      { path: 'parking-map', name: 'AdminParkingMap', component: () => import('@/views/admin/AdminParkingMap.vue'), meta: { title: 'Sơ đồ ô bãi' } },
      { path: 'shift-assignment', name: 'AdminShiftAssignment', component: () => import('@/views/admin/AdminShiftAssignment.vue'), meta: { title: 'Phân công ca trực' } },
      { path: 'incidents', name: 'AdminIncidents', component: () => import('@/views/admin/AdminIncidents.vue'), meta: { title: 'Quản lý sự cố' } },
      { path: 'reviews', name: 'AdminReviews', component: () => import('@/views/admin/AdminReviews.vue'), meta: { title: 'Đánh giá & Phản hồi' } },
      { path: 'profile', name: 'AdminProfile', component: () => import('@/views/admin/AdminProfile.vue'), meta: { title: 'Hồ sơ admin' } }
    ]
  },

  // =========================================================================
  // 4. PHÂN HỆ STAFF (Giao diện nghiệp vụ cầm tay quét mã QR của nhân viên bãi)
  // =========================================================================
  {
    path: '/staff',
    component: DashboardLayout,
    meta: { requiresAuth: true, role: 'STAFF' }, // Khóa nghiêm ngặt tầng cha
    children: [
      { path: 'parking-map-live', name: 'ParkingMapLive', component: () => import('@/views/staff/ParkingMapLive.vue'), meta: { title: 'Giám sát sơ đồ Live' } },
      { path: 'scanner-checkin', name: 'ScannerCheckIn', component: () => import('@/views/staff/ScannerCheckIn.vue'), meta: { title: 'Quét QR Vào' } },
      { path: 'incidents', name: 'StaffIncidents', component: () => import('@/views/staff/IncidentReports.vue'), meta: { title: 'Báo cáo sự cố' } },
      { path: 'schedule', name: 'StaffSchedule', component: () => import('@/views/staff/StaffSchedule.vue'), meta: { title: 'Lịch trực cá nhân' } },
      { path: 'profile', name: 'StaffProfile', component: () => import('@/views/staff/StaffProfile.vue'), meta: { title: 'Hồ sơ nhân viên' } }
    ]
  },

  // =========================================================================
  // 5. TRẠM CAMERA (Độc lập, không cần layout, dành cho thiết bị iPhone)
  // =========================================================================
  {
    path: '/camera-node',
    name: 'CameraNode',
    component: () => import('@/components/CameraStreamer.vue'),
    meta: { title: 'Trạm Camera iPhone' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Thuật toán cuộn mượt thông minh chống kẹt thanh cuốn khi nhảy trang
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return {
        el: to.hash,
        top: 80, // Trừ hao khoảng đệm rèm kính Header
        behavior: 'smooth'
      }
    }
    return { top: 0 } // Mặc định chuyển view tự bật mượt lên đỉnh đầu
  }
})

export default router
