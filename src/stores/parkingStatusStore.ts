import { defineStore } from 'pinia'
import { ref } from 'vue'

// Định nghĩa kiểu dữ liệu cho 1 Ô đỗ xe
export interface ParkingSpot {
  id: string
  status: 'available' | 'pending' | 'occupied'
  plate?: string // Biển số xe (chỉ có khi pending hoặc occupied)
}

export const useParkingStatusStore = defineStore('parkingStatus', () => {
  // State
  const spots = ref<ParkingSpot[]>([])

  // Actions
  const setInitialSpots = (initialSpots: ParkingSpot[]) => {
    spots.value = initialSpots
  }

  // Hàm này sẽ được gọi mỗi khi WebSocket nhận được message từ Backend
  const updateSpotLive = (spotId: string, status: ParkingSpot['status'], plate?: string) => {
    const spot = spots.value.find(spot => spot.id === spotId)
    if (spot) {
      spot.status = status
      spot.plate = plate || ''
    }
  }

  return { spots, setInitialSpots, updateSpotLive }
})