import router from './index'
import { useAuthStore } from '@/stores/authStore'

router.beforeEach((to, _from) => {
  const authStore = useAuthStore()

  // Đồng bộ context portal theo URL
  if (to.path.startsWith('/customer')) {
    if (authStore.activePortal !== 'CUSTOMER') {
      authStore.activePortal = 'CUSTOMER'
      sessionStorage.setItem('active_portal', 'CUSTOMER')
    }
  } else if (to.path.startsWith('/admin') || to.path.startsWith('/staff') || to.path === '/login') {
    if (authStore.activePortal !== 'ADMIN') {
      authStore.activePortal = 'ADMIN'
      sessionStorage.setItem('active_portal', 'ADMIN')
    }
  }

  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.role

  // Đã đăng nhập mà vào trang login → redirect về trang chính
  if (isAuthenticated && (to.path === '/login' || to.path === '/customer/auth')) {
    if (userRole === 'ADMIN') return '/admin/revenue-report'
    if (userRole === 'STAFF') return '/staff/parking-map-live'
    if (userRole === 'CUSTOMER') return '/customer/home'
    return '/'
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth) {
    if (!isAuthenticated) {
      return to.path.startsWith('/customer') ? '/customer/auth' : '/login'
    }

    const expectedRole = to.matched.find(record => record.meta.role)?.meta.role
    if (expectedRole && expectedRole !== userRole) {
      if (userRole === 'ADMIN') return '/admin/revenue-report'
      if (userRole === 'STAFF') return '/staff/parking-map-live'
      if (userRole === 'CUSTOMER') return '/customer/home'
      return '/'
    }
  }

  // Cho phép đi tiếp
  return true
})
