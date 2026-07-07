import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { peer } from '@/services/PeerService'

const STORAGE_KEY = 'iphone_peer_id'

export const useCameraStore = defineStore('camera', () => {
  // Khôi phục ID từ localStorage nếu có
  const iphonePeerId = ref(localStorage.getItem(STORAGE_KEY) ?? 'smartpark-camera-node')
  const isCameraConnected = ref(false)
  const isConnecting = ref(false)
  const remoteStream = ref<MediaStream | null>(null)

  // Tự lưu mỗi khi ID thay đổi
  watch(iphonePeerId, (val) => {
    if (val) localStorage.setItem(STORAGE_KEY, val)
    else localStorage.removeItem(STORAGE_KEY)
  })

  const isReconnecting = ref(false)

  const connect = (peerId: string) => {
    if (!peerId || isConnecting.value || isCameraConnected.value) return
    isConnecting.value = true
    isReconnecting.value = false

    const canvas = document.createElement('canvas')
    const fakeStream = canvas.captureStream(1)
    const call = peer.call(peerId, fakeStream)

    call.on('stream', (stream) => {
      remoteStream.value = stream
      isCameraConnected.value = true
      isConnecting.value = false
    })

    call.on('error', () => {
      isConnecting.value = false
      isCameraConnected.value = false
    })
  }

  // Tự động kết nối lại sau khi peer sẵn sàng (dùng sau F5)
  const autoReconnect = () => {
    if (!iphonePeerId.value || isCameraConnected.value) return
    isReconnecting.value = true
    if (peer.open) {
      connect(iphonePeerId.value)
    } else {
      peer.once('open', () => connect(iphonePeerId.value))
    }
  }

  return { iphonePeerId, isCameraConnected, isConnecting, isReconnecting, remoteStream, connect, autoReconnect }
})
