import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CustomerService, type MonthlyTicketResponse, type MonthlyTicketRequest, type MonthlyCapacityCheckResponse } from '@/services/customer.service'

export const useMonthlyTicketStore = defineStore('monthlyTicket', () => {
  const monthlyTickets = ref<MonthlyTicketResponse[]>([])
  const activeMonthlyTickets = ref<MonthlyTicketResponse[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const hasActiveMonthlyTickets = computed(() => activeMonthlyTickets.value.length > 0)

  const todayValidTickets = computed<MonthlyTicketResponse[]>(() => {
    const today = new Date()
    return activeMonthlyTickets.value.filter(ticket => {
      const startDate = new Date(ticket.startDate)
      const endDate = new Date(ticket.endDate)
      return ticket.status === 'PENDING' && startDate <= today && endDate >= today
    })
  })

  // Actions
  const fetchMonthlyTickets = async () => {
    try {
      loading.value = true
      error.value = null
      monthlyTickets.value = await CustomerService.getMonthlyTickets()
    } catch (err) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      error.value = errorObj.response?.data?.message || 'Lỗi khi tải danh sách vé tháng'
      console.error('Error fetching monthly tickets:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchActiveMonthlyTickets = async () => {
    try {
      loading.value = true
      error.value = null
      activeMonthlyTickets.value = await CustomerService.getActiveMonthlyTickets()
    } catch (err) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      error.value = errorObj.response?.data?.message || 'Lỗi khi tải vé tháng đang hoạt động'
      console.error('Error fetching active monthly tickets:', err)
    } finally {
      loading.value = false
    }
  }

  const checkMonthlyCapacity = async (lotId: number, startDate: string, endDate: string): Promise<MonthlyCapacityCheckResponse> => {
    try {
      loading.value = true
      error.value = null
      const result = (await CustomerService.checkMonthlyCapacity(lotId, startDate, endDate)) as unknown as MonthlyCapacityCheckResponse
      return result
    } catch (err) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      error.value = errorObj.response?.data?.message || 'Lỗi khi kiểm tra capacity'
      console.error('Error checking capacity:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const purchaseMonthlyTicket = async (request: MonthlyTicketRequest): Promise<{ success?: boolean; message?: string }> => {
    try {
      loading.value = true
      error.value = null
      const result = (await CustomerService.purchaseMonthlyTicket(request)) as unknown as { success?: boolean; message?: string }

      // Refresh danh sách sau khi mua thành công
      if ((result as { success?: boolean }).success) {
        await fetchMonthlyTickets()
        await fetchActiveMonthlyTickets()
      }

      return result
    } catch (err) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      error.value = errorObj.response?.data?.message || 'Lỗi khi mua vé tháng'
      console.error('Error purchasing monthly ticket:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getTodayValidTickets = async (): Promise<MonthlyTicketResponse[]> => {
    try {
      loading.value = true
      error.value = null
      const tickets = await CustomerService.getTodayValidMonthlyTickets()
      return tickets
    } catch (err) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      error.value = errorObj.response?.data?.message || 'Lỗi khi tải vé tháng hợp lệ'
      console.error('Error fetching today valid tickets:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    monthlyTickets.value = []
    activeMonthlyTickets.value = []
    error.value = null
    loading.value = false
  }

  return {
    // State
    monthlyTickets,
    activeMonthlyTickets,
    loading,
    error,

    // Computed
    hasActiveMonthlyTickets,
    todayValidTickets,

    // Actions
    fetchMonthlyTickets,
    fetchActiveMonthlyTickets,
    checkMonthlyCapacity,
    purchaseMonthlyTicket,
    getTodayValidTickets,
    clearError,
    reset
  }
})
