import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Lang = 'vi' | 'en'

const translations = {
  vi: {
    // Public menu
    home: 'Trang chủ',
    about: 'Giới thiệu',
    features: 'Tính năng',
    contact: 'Liên hệ',
    loginBtn: 'Đăng nhập',
    // Sidebar admin
    adminSection: 'Quản trị hệ thống',
    revenueReport: 'Báo cáo Doanh thu',
    parkingManage: 'Danh sách Bãi đỗ xe',
    userManage: 'Nhân sự & Phân quyền',
    parkingMap: 'Sơ đồ ô bãi',
    shiftAssignment: 'Phân công ca trực',
    profile: 'Hồ sơ cá nhân',
    // Sidebar staff
    staffSection: 'Nghiệp vụ trực bãi',
    mapLive: 'Giám sát Sơ đồ Live',
    scannerQR: 'Quét QR',
    mySchedule: 'Lịch trực của tôi',
    // Header dropdown
    accountInfo: 'Thông tin cá nhân',
    logout: 'Đăng xuất an toàn',
    operatingAccount: 'Tài khoản vận hành',
  },
  en: {
    home: 'Home',
    about: 'About',
    features: 'Features',
    contact: 'Contact',
    loginBtn: 'System Login',
    adminSection: 'System Administration',
    revenueReport: 'Revenue Report',
    parkingManage: 'Parking Lots',
    userManage: 'Staff & Permissions',
    parkingMap: 'Parking Map',
    shiftAssignment: 'Shift Assignment',
    profile: 'Profile',
    staffSection: 'Parking Operations',
    mapLive: 'Live Map Monitor',
    scannerQR: 'Scan QR',
    mySchedule: 'My Schedule',
    accountInfo: 'Personal Info',
    logout: 'Sign Out',
    operatingAccount: 'Operating Account',
  }
}

export const useLangStore = defineStore('lang', () => {
  const lang = ref<Lang>((localStorage.getItem('sp_lang') as Lang) || 'vi')

  const t = computed(() => translations[lang.value])

  const toggle = () => {
    lang.value = lang.value === 'vi' ? 'en' : 'vi'
    localStorage.setItem('sp_lang', lang.value)
  }

  const setLang = (l: Lang) => {
    lang.value = l
    localStorage.setItem('sp_lang', l)
  }

  return { lang, t, toggle, setLang }
})
