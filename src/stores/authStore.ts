import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER' | null

export interface UserInfo {
  id: number
  username: string
  fullName: string
  email: string
  phone?: string
  avatarUrl?: string
  parkingLotId?: number
  parkingLotName?: string
}

export const useAuthStore = defineStore('auth', () => {
  // ==========================================
  // XỬ LÝ LỖI: Nhận diện Tab thuộc ngữ cảnh nào để cô lập dữ liệu
  // ==========================================
  const determinePortal = () => {
    if (typeof window === 'undefined') return 'ADMIN'

    let portal = sessionStorage.getItem('active_portal')
    const path = window.location.pathname

    if (path.includes('/customer')) {
      portal = 'CUSTOMER'
    } else if (path.includes('/admin') || path.includes('/staff') || path.includes('/login')) {
      portal = 'ADMIN'
    }

    if (portal) sessionStorage.setItem('active_portal', portal)
    return portal || 'ADMIN'
  }

  const activePortal = ref<string>(determinePortal())

  // ==========================================
  // 1. KHO DỮ LIỆU DÀNH CHO ADMIN / STAFF
  // ==========================================
  const adminToken = ref<string | null>(localStorage.getItem('admin_token'))
  const adminRole = ref<Role>((localStorage.getItem('admin_role') as Role) || null)
  const adminUser = ref<UserInfo | null>(JSON.parse(localStorage.getItem('admin_user') || 'null'))

  // ==========================================
  // 2. KHO DỮ LIỆU DÀNH CHO CUSTOMER
  // ==========================================
  const customerToken = ref<string | null>(localStorage.getItem('customer_token'))
  const customerRole = ref<Role>((localStorage.getItem('customer_role') as Role) || null)
  const customerUser = ref<UserInfo | null>(JSON.parse(localStorage.getItem('customer_user') || 'null'))

  // ==========================================
  // GETTERS (VÁ LỖI: Trả về dữ liệu độc lập theo từng Tab)
  // ==========================================
  const isAuthenticated = computed<boolean>(() => {
    if (activePortal.value === 'CUSTOMER') return !!customerToken.value
    return !!adminToken.value
  })

  const isAdmin = computed<boolean>(() => adminRole.value === 'ADMIN')
  const isStaff = computed<boolean>(() => adminRole.value === 'STAFF')
  const isCustomer = computed<boolean>(() => customerRole.value === 'CUSTOMER')

  const role = computed<Role>(() => {
    if (activePortal.value === 'CUSTOMER') return customerRole.value
    return adminRole.value
  })

  const user = computed<UserInfo | null>(() => {
    if (activePortal.value === 'CUSTOMER') return customerUser.value
    return adminUser.value
  })

  // ==========================================
  // ACTIONS (Xử lý Đăng nhập / Đăng xuất riêng biệt)
  // ==========================================
  const login = (newToken: string, newRole: Role, userData: UserInfo) => {
    if (newRole === 'CUSTOMER') {
      customerToken.value = newToken
      customerRole.value = newRole
      customerUser.value = userData

      localStorage.setItem('customer_token', newToken)
      localStorage.setItem('customer_role', newRole)
      localStorage.setItem('customer_user', JSON.stringify(userData))

      activePortal.value = 'CUSTOMER'
      sessionStorage.setItem('active_portal', 'CUSTOMER')
    } else {
      adminToken.value = newToken
      adminRole.value = newRole
      adminUser.value = userData

      localStorage.setItem('admin_token', newToken)
      localStorage.setItem('admin_role', newRole as string)
      localStorage.setItem('admin_user', JSON.stringify(userData))

      activePortal.value = 'ADMIN'
      sessionStorage.setItem('active_portal', 'ADMIN')
    }
  }

  const updateUser = (userData: Partial<UserInfo>) => {
    if (customerUser.value && activePortal.value === 'CUSTOMER') {
      customerUser.value = { ...customerUser.value, ...userData }
      localStorage.setItem('customer_user', JSON.stringify(customerUser.value))
    } else if (adminUser.value) {
      adminUser.value = { ...adminUser.value, ...userData }
      localStorage.setItem('admin_user', JSON.stringify(adminUser.value))
    }
  }

  const logout = () => {
    // VÁ LỖI: Tab nào gọi logout thì chỉ xóa dữ liệu của riêng nhánh đó
    if (activePortal.value === 'CUSTOMER') {
      customerToken.value = null
      customerRole.value = null
      customerUser.value = null
      localStorage.removeItem('customer_token')
      localStorage.removeItem('customer_role')
      localStorage.removeItem('customer_user')
      sessionStorage.removeItem('active_portal')
    } else {
      adminToken.value = null
      adminRole.value = null
      adminUser.value = null
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_role')
      localStorage.removeItem('admin_user')
      sessionStorage.removeItem('active_portal')
    }
  }

  return {
    adminToken, adminRole, adminUser,
    customerToken, customerRole, customerUser,
    user, role, isAuthenticated, isAdmin, isStaff, isCustomer,
    login, logout, updateUser, activePortal
  }
})
