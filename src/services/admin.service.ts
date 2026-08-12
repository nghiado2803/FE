import apiClient from './api'

// --- Interfaces ---
export interface ParkingLotDTO {
  id: number
  name: string
  address: string
  latitude: number
  longitude: number
  totalSpots: number
  availableSpots: number
  occupiedSpots?: number
  pricePerHour?: number
  priceExtraHour?: number
  priceMaxDaytime?: number
  priceOvernight?: number
  priceCap24h?: number
  depositAmount?: number
  maxHoldMinutes?: number
  graceMinutes?: number
  status: 'ACTIVE' | 'MAINTENANCE'
}

export type ParkingLotCreatePayload = Omit<ParkingLotDTO, 'id'>

export interface RevenueSummaryResponse {
  totalEarned: number
  totalVehicles: number
  activeLotsRate: string
  newUsers: number
}

export interface RevenueChartPoint {
  label: string
  value: number
  percentage: number
}

export interface TransactionDTO {
  id: number
  ticketCode: string
  plate: string
  lotName: string
  checkInTime: string
  checkoutTime: string
  paymentMethod: string
  amount: number
  deposit: number
  extraFee: number
  status: string
  customerName: string
}

export interface MonthlyTicketOverviewItem {
  id: number
  ticketCode: string
  customerName?: string
  lotName: string
  plate: string
  status: string
  startDate: string
  endDate: string
  pricePaid: number
  createdAt: string
}

export interface MonthlyCapacityResponse {
  currentMonthlyTickets: number
}

export interface MonthlyTicketStatisticsResponse {
  summary: {
    totalTickets: number
    activeTickets: number
    totalRevenue: number
    averagePrice: number
  }
  tickets: MonthlyTicketOverviewItem[]
}

export interface RevenueSummaryPayload {
  summary: RevenueSummaryResponse
  chartData: RevenueChartPoint[]
  transactions: TransactionDTO[]
}

// --- API Calls ---
export const AdminService = {
  // Quản lý bãi đỗ
  getParkingLots(): Promise<ParkingLotDTO[]> {
    return apiClient.get('/admin/parking-lots')
  },

  createParkingLot(data: ParkingLotCreatePayload): Promise<ParkingLotDTO> {
    return apiClient.post('/admin/parking-lots', data)
  },

  updateParkingLot(id: number, data: Partial<ParkingLotDTO>): Promise<ParkingLotDTO> {
    return apiClient.put(`/admin/parking-lots/${id}`, data)
  },

  // Báo cáo doanh thu
  getRevenueSummary(filterType: 'TODAY' | 'WEEK' | 'MONTH' | 'DAY' | 'YEAR', lotName?: string): Promise<RevenueSummaryPayload> {
    const filter = filterType === 'DAY' ? 'TODAY' : filterType
    return apiClient.get('/admin/revenue/summary', { params: { filter, lotName } })
  },

  // Quản lý User
  getUsers(role?: string): Promise<Record<string, unknown>[]> {
    return apiClient.get('/admin/users', { params: { role } })
  },

  getUserById(id: number): Promise<Record<string, unknown>> {
    return apiClient.get(`/admin/users/${id}`)
  },

  getProfile(id: number): Promise<Record<string, unknown>> {
    return apiClient.get(`/admin/users/${id}/profile`)
  },

  createStaffAccount(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return apiClient.post('/admin/users/staff', data)
  },

  updateUser(id: number, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return apiClient.put(`/admin/users/${id}`, data)
  },

  toggleUserStatus(id: number): Promise<Record<string, unknown>> {
    return apiClient.put(`/admin/users/${id}/status`)
  },

  deleteUser(id: number): Promise<Record<string, unknown>> {
    return apiClient.delete(`/admin/users/${id}`)
  },

  updateProfile(id: number, data: { fullName?: string; email?: string; phone?: string; avatarUrl?: string }): Promise<Record<string, unknown>> {
    return apiClient.put(`/admin/users/${id}/profile`, data)
  },

  // Quản lý ca trực & Sơ đồ
  getShifts(): Promise<unknown[]> {
    return apiClient.get('/admin/shifts')
  },

  getLotStaffs(lotId: number): Promise<unknown[]> {
    return apiClient.get(`/admin/parking-lots/${lotId}/staffs`)
  },

  getShiftAssignments(lotId: number, date: string): Promise<unknown[]> {
    return apiClient.get('/admin/shifts/assignments', { params: { lotId, date } })
  },

  saveShiftAssignments(data: { lotId: number; date: string; assignments: { userId: number; shiftId: number | null }[] }): Promise<unknown> {
    return apiClient.post('/admin/shifts/assignments', data)
  },

  getMapLive(lotId: number): Promise<unknown> {
    return apiClient.get(`/admin/parking-lots/${lotId}/map-live`)
  },

  searchByPlate(lotId: number, plate: string): Promise<unknown> {
    return apiClient.get(`/admin/parking-lots/${lotId}/search-by-plate`, { params: { plate } })
  },

  // === VÉ THÁNG ENDPOINTS ===

  // Lấy tổng quan vé tháng
  getMonthlyTicketsOverview(): Promise<MonthlyTicketOverviewItem[]> {
    return apiClient.get('/admin/monthly-tickets/overview')
  },

  // Lấy capacity vé tháng của bãi xe
  getMonthlyCapacity(lotId: number): Promise<MonthlyCapacityResponse> {
    return apiClient.get(`/admin/parking-lots/${lotId}/monthly-capacity`)
  },

  // Cập nhật cấu hình vé tháng cho bãi xe
  updateMonthlyConfig(lotId: number, config: { monthlySlots?: number; monthlyPrice?: number }): Promise<unknown> {
    return apiClient.put(`/admin/parking-lots/${lotId}/monthly-config`, config)
  },

  // Thống kê vé tháng
  getMonthlyTicketStatistics(lotName: string = 'ALL', filter: string = 'MONTH'): Promise<MonthlyTicketStatisticsResponse> {
    return apiClient.get('/admin/monthly-tickets/statistics', { params: { lotName, filter } })
  }
}
