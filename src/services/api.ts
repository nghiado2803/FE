import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'

const BASE_URL = '/api/v1'

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000 // Tăng lên 60 giây để đợi AI nạp model (YOLO + EasyOCR)
})

// Request Interceptor: Tự động hít Token động từ kho tương ứng gửi lên Spring Boot
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // VÁ LỖI XUNG ĐỘT TAB: Xác định portal đang hoạt động trên tab này
    const portal = sessionStorage.getItem('active_portal')
    let token = null

    if (portal === 'CUSTOMER') {
      token = localStorage.getItem('customer_token')
    } else {
      // Mặc định cho ADMIN/STAFF portal
      token = localStorage.getItem('admin_token')
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Bộ lọc đánh chặn và đối soát mã lỗi toàn cục
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status
      const currentPath = window.location.pathname

      if (status === 401) {
        // VÁ LỖI SẠCH KHO: Xóa trắng toàn bộ dấu vết Token cũ để tránh xung đột
        localStorage.clear()

        // Điều hướng thông minh dựa vào URL hiện tại của khách hàng
        if (currentPath.startsWith('/customer')) {
          window.location.href = '/customer/auth'
        } else {
          window.location.href = '/login'
        }
      } else if (status === 403) {
        window.toast?.('Tài khoản của bạn không có quyền thực hiện hành động này!', 'error')
      }
    } else {
      console.error('Lỗi kết nối hạ tầng mạng Server:', error.message)
    }
    return Promise.reject(error)
  }
)

export default apiClient
