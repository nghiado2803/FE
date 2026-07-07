import apiClient from './api'

// --- Interfaces ---
export interface ScanResult {
  bookingId: string
  plate: string
  spot: string
  customer: string
  status: 'VALID' | 'INVALID' | 'USED'
}

export interface CheckoutResult {
  bookingId: string
  plate: string
  timeIn: string
  timeOut: string
  durationStr: string
  totalFee: number
  depositPaid: number
  extraFee: number
}

// --- API Calls ---
export const StaffService = {
  // Kiểm tra mã QR lúc vào bãi
  checkInByQR(qrCode: string): Promise<ScanResult> {
    return apiClient.post('/staff/check-in', { qrCode })
  },

  // Quét mã QR lúc ra bãi để tính tiền
  checkOutByQR(qrCode: string): Promise<CheckoutResult> {
    return apiClient.post('/staff/check-out', { qrCode })
  },

  // Xác nhận check-in (mở cổng cho xe vào, đổi status PARKED)
  confirmCheckIn(bookingId: string): Promise<Record<string, unknown>> {
    return apiClient.post(`/staff/confirm-checkin/${bookingId}`)
  },

  // Xác nhận đã thu tiền và mở cổng (checkout)
  confirmPaymentAndOpenGate(bookingId: string): Promise<Record<string, unknown>> {
    return apiClient.post(`/staff/confirm-checkout/${bookingId}`)
  },

  // Lấy dữ liệu Map Live ban đầu (Sau đó sẽ nhường chỗ cho WebSocket)
  getInitialMap(parkingId: number): Promise<Record<string, unknown>> {
    return apiClient.get(`/staff/map-live/${parkingId}`)
  },

  // Lấy lịch trực cá nhân
  getMySchedule(staffId: number, date: string): Promise<unknown[]> {
    return apiClient.get('/staff/my-schedule', { params: { staffId, date } })
  }
}
