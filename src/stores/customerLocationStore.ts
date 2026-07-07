import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Coordinates {
  lat: number
  lng: number
}

export const useCustomerLocationStore = defineStore('customerLocation', () => {
  const currentLocation = ref<Coordinates | null>(null)
  const isLocating = ref<boolean>(false)
  const errorMsg = ref<string | null>(null)

  // Hàm lấy vị trí GPS từ trình duyệt
  const fetchGeolocation = () => {
    isLocating.value = true
    errorMsg.value = null

    if (!navigator.geolocation) {
      errorMsg.value = "Trình duyệt của bạn không hỗ trợ định vị GPS."
      isLocating.value = false
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        currentLocation.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        isLocating.value = false
      },
      (_error: GeolocationPositionError) => {
        errorMsg.value = "Không thể lấy vị trí. Vui lòng cấp quyền truy cập vị trí."
        isLocating.value = false
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return { currentLocation, isLocating, errorMsg, fetchGeolocation }
})
