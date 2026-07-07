import { defineStore } from 'pinia'
import { ref } from 'vue'

export type TicketStatus = 'PENDING' | 'PARKED' | 'CHECKOUT' | 'PAID'

export type ActiveTicket = {
  status: TicketStatus
  ticketCode: string
  lotName: string
  address?: string
  plate: string
  spotCode: string
  depositPaid: number
  pricePerHour?: number
  bookingTime?: string   // Lúc đặt cọc (để đếm ngược 30p)
  checkInTime?: string   // Lúc staff quét check-in
  checkOutTime?: string  // Lúc staff quét check-out
  holdExpireAt?: string  // Thời điểm hết hạn giữ chỗ
  graceMinutes?: number  // Số phút gia hạn
  parkingFee?: number    // Phí đỗ xe
  extraFee?: number      // Phí phát sinh
  totalPaid?: number     // Tổng đã trả
  lotLat?: number
  lotLng?: number
}

export type HistoryRecord = {
  id: number
  lotName: string
  plate: string
  spotCode: string
  timeString: string
  fee: number
  duration: string
  status: 'COMPLETED' | 'FORFEITED'
}

export const useTicketStore = defineStore('ticket', () => {
  const activeTicket = ref<ActiveTicket | null>(null)
  const history = ref<HistoryRecord[]>([
    { id: 1, lotName: 'Bãi đỗ Quảng trường Quy Nhơn', plate: '77A-124.56', spotCode: 'A02', timeString: 'Hôm qua, 14:15 - 16:30', fee: 35000, duration: '2h 15p', status: 'COMPLETED' },
    { id: 2, lotName: 'Bãi đỗ Đại học Quy Nhơn', plate: '77A-124.56', spotCode: 'B11', timeString: '15/05/2026, 08:00 - 10:15', fee: 45000, duration: '2h 15p', status: 'COMPLETED' },
  ])

  const setTicket = (ticket: ActiveTicket) => {
    activeTicket.value = ticket
  }

  const updateTicketStatus = (status: TicketStatus, extra?: Partial<ActiveTicket>) => {
    if (!activeTicket.value) return
    activeTicket.value = { ...activeTicket.value, status, ...extra }
  }

  const clearTicket = () => {
    activeTicket.value = null
  }

  const addToHistory = (record: HistoryRecord) => {
    history.value.unshift(record)
  }

  // Persist thủ công qua localStorage
  const TICKET_KEY = 'smartpark_ticket'
  const HISTORY_KEY = 'smartpark_history'

  const loadFromStorage = () => {
    try {
      const t = localStorage.getItem(TICKET_KEY)
      if (t) activeTicket.value = JSON.parse(t)
      const h = localStorage.getItem(HISTORY_KEY)
      if (h) history.value = JSON.parse(h)
    } catch {}
  }

  const saveTicketToStorage = () => {
    if (activeTicket.value) localStorage.setItem(TICKET_KEY, JSON.stringify(activeTicket.value))
    else localStorage.removeItem(TICKET_KEY)
  }

  const saveHistoryToStorage = () => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
  }

  const setTicketPersist = (ticket: ActiveTicket) => {
    setTicket(ticket)
    saveTicketToStorage()
  }

  const updateStatusPersist = (status: TicketStatus, extra?: Partial<ActiveTicket>) => {
    updateTicketStatus(status, extra)
    saveTicketToStorage()
  }

  const clearTicketPersist = () => {
    clearTicket()
    saveTicketToStorage()
  }

  const addToHistoryPersist = (record: HistoryRecord) => {
    addToHistory(record)
    saveHistoryToStorage()
  }

  loadFromStorage()

  return {
    activeTicket,
    history,
    setTicket: setTicketPersist,
    updateTicketStatus: updateStatusPersist,
    clearTicket: clearTicketPersist,
    addToHistory: addToHistoryPersist
  }
})
