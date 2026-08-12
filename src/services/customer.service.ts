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

export interface MonthlyTicketRequest {
  lotId: number
  plate: string
  startDate: string
  endDate: string
  paymentGateway?: 'PAYOS' | 'MOMO' | string
}

export interface MonthlyTicketPurchaseResponse {
  success?: boolean
  message?: string
  paymentUrl?: string
  orderId?: string
  bookingId?: number
  ticketCode?: string
  amount?: number
}

export interface MonthlyCapacityCheckResponse {
  canPurchase: boolean
  monthlyPrice: number
  totalMonthlySlots: number
  existingTickets: number
  availableSlots: number
  message?: string
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

export interface MonthlyTicketResponse {
  id: number
  ticketCode: string
  lotId?: number
  lotName: string
  lotAddress?: string
  plate: string
  status: string
  startDate: string
  endDate: string
  pricePaid: number
  qrCode: string
  createdAt: string
}

export interface MonthlyTicketPurchaseResponse {
  success?: boolean
  message?: string
  paymentUrl?: string
  orderId?: string
  bookingId?: number
  ticketCode?: string
  amount?: number
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
  monthlySlots?: number
  normalSlots?: number
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
  getVehicles(): Promise<VehicleResponse[]> {
    return apiClient.get('/customer/vehicles')
  },

  getMyVehicles(): Promise<VehicleResponse[]> {
    return apiClient.get('/customer/vehicles')
  },

  // Search nearby parking lots (alias for findNearestParking)
  searchNearby(params: SearchQuery): Promise<{ data: NearbyParkingLot[] }> {
    return this.findNearestParking(params).then(data => ({ data }))
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
  },

  // === VÉ THÁNG ENDPOINTS ===

  // Lấy danh sách vé tháng của user
  getMonthlyTickets(): Promise<MonthlyTicketResponse[]> {
    return apiClient.get<MonthlyTicketResponse[]>('/customer/monthly-tickets')
  },

  // Lấy vé tháng đang hoạt động
  getActiveMonthlyTickets(): Promise<MonthlyTicketResponse[]> {
    return apiClient.get<MonthlyTicketResponse[]>('/customer/monthly-tickets/active')
  },

  // Kiểm tra capacity vé tháng còn lại
  async checkMonthlyCapacity(lotId: number, startDate: string, endDate: string): Promise<MonthlyCapacityCheckResponse> {
    const res = await apiClient.post<MonthlyCapacityCheckResponse>('/customer/monthly-tickets/check-capacity', {
      lotId,
      startDate,
      endDate
    })
    return res as unknown as MonthlyCapacityCheckResponse
  },

  // Mua vé tháng
  async purchaseMonthlyTicket(request: MonthlyTicketRequest): Promise<MonthlyTicketPurchaseResponse> {
    const res = await apiClient.post<MonthlyTicketPurchaseResponse>('/customer/monthly-tickets/purchase', request)
    return res as unknown as MonthlyTicketPurchaseResponse
  },

  async createMonthlyTicketPayosPayment(request: {
    amount: number
    bookingId: number
    ticketCode: string
    plate: string
    lotId: number
    lotName: string
    baseUrl: string
    returnUrl: string
    cancelUrl: string
  }): Promise<{ paymentUrl?: string; orderId?: string; status?: string; message?: string; amount?: number }> {
    const res = await apiClient.post('/payos/create', request)
    return res as unknown as { paymentUrl?: string; orderId?: string; status?: string; message?: string; amount?: number }
  },

  // Lấy vé tháng valid hôm nay (để hiển thị QR)
  getTodayValidMonthlyTickets(): Promise<MonthlyTicketResponse[]> {
    return apiClient.get('/customer/monthly-tickets/today-valid')
  }
}
