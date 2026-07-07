import apiClient from './api'

// --- Interfaces ---
export interface SearchQuery {
  lat: number
  lng: number
  radiusKm?: number
}

export interface BookingRequest {
  parkingId: number
  plate: string
}

export interface PaymentResponse {
  paymentUrl: string // URL của VNPay/MoMo trả về để chuyển hướng
  orderId: string
}

export type TicketStatus = 'NONE' | 'PAYING' | 'PENDING' | 'PARKED' | 'CHECKOUT'

export interface TicketResponse {
  status: TicketStatus
  bookingId?: number
  lotName?: string
  ticketCode?: string
  plate?: string
  expireTimeHint?: string
  spotCode?: string
  checkInTime?: string
  checkOutTime?: string
  depositPaid?: number
  pricePerHour?: number
  bookingTime?: string
  latitude?: number
  longitude?: number
  lotLat?: number
  lotLng?: number
}

export interface VehicleResponse {
  id: number
  plate: string
  model: string
}

export interface HistoryLog {
  id: number
  lotName: string
  plate: string
  status: string
  checkInTime: string
  checkOutTime?: string
  fee: number
  isReviewed: boolean
}

export interface NearbyParkingLot {
  id: number
  name: string
  address: string
  distanceMeters: number
  availableSpots: number
  pricePerHour: number
  imageUrl?: string
}

export interface ParkingDetailResponse {
  id: number
  name: string
  address: string
  totalSpots: number
  pricePerHour: number
  status: string
  availableSpots: number
}

// --- API Calls ---
export const CustomerService = {
  // Tìm bãi xe gần nhất dựa vào GPS
  findNearestParking(params: SearchQuery): Promise<NearbyParkingLot[]> {
    return apiClient.get('/customer/parking/nearest', { params })
  },

  // Lấy chi tiết 1 bãi xe (Sơ đồ, giá tiền)
  getParkingDetail(parkingId: number): Promise<ParkingDetailResponse> {
    return apiClient.get(`/customer/parking/${parkingId}`)
  },

  // Đặt chỗ
  bookSpot(data: BookingRequest): Promise<Record<string, unknown>> {
    return apiClient.post('/customer/booking', data)
  },

  // Hủy booking đang chờ thanh toán (PAYING) — dùng khi user bấm back rồi muốn đặt lại
  cancelPayingBooking(): Promise<Record<string, unknown>> {
    return apiClient.delete('/customer/booking/paying')
  },

  // Tạo link thanh toán VNPay/MoMo
  createPaymentUrl(bookingId: string, paymentMethod: 'VNPAY' | 'MOMO'): Promise<PaymentResponse> {
    return apiClient.post('/customer/payment/create-url', { bookingId, paymentMethod })
  },

  // Lấy danh sách xe của cá nhân
  getMyVehicles(): Promise<VehicleResponse[]> {
    return apiClient.get('/customer/vehicles')
  },

  addVehicle(data: { plate: string, model: string }): Promise<VehicleResponse> {
    return apiClient.post('/customer/vehicles', data)
  },

  deleteVehicle(id: number): Promise<Record<string, unknown>> {
    return apiClient.delete(`/customer/vehicles/${id}`)
  },

  // Lấy chi tiết vé hiện tại
  getCurrentTicket(): Promise<TicketResponse> {
    return apiClient.get('/customer/ticket/current')
  },

  // Cập nhật biển số xe cho vé hiện tại
  updateTicketPlate(plate: string): Promise<Record<string, unknown>> {
    return apiClient.put('/customer/ticket/update-plate', { plate })
  },

  // Lấy lịch sử gửi xe
  getHistory(): Promise<HistoryLog[]> {
    return apiClient.get('/customer/history')
  }
}
