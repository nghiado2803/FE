<template>
  <div class="camera-node-container">
    <div class="status-panel">
      <h1>Trạm Camera Node</h1>
      <p>ID thiết bị: <span class="peer-id">{{ myPeerId }}</span></p>
      <div v-if="!cameraReady" class="loading">Đang khởi động camera...</div>
      <div v-else class="ready">✅ Camera đã sẵn sàng</div>
    </div>

    <video id="localVideo" autoplay playsinline muted></video>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Peer from 'peerjs';

const myPeerId = ref('smartpark-camera-node');const cameraReady = ref(false);

onMounted(async () => {
  // 1. Khởi tạo PeerJS
  const peer = new Peer('smartpark-camera-node');

  peer.on('open', () => {
    // ID cố định, không cần cập nhật
  });

  // 2. Lấy luồng camera từ iPhone
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }, // Dùng camera sau
      audio: false
    });

    const video = document.getElementById('localVideo') as HTMLVideoElement | null;
    if (video) {
      video.srcObject = stream;

      // ÉP SAFARI TRÊN IPHONE PHÁT HÌNH
      video.play().catch(err => console.error("Lỗi phát video trên iOS:", err));
    }

    cameraReady.value = true;

    // 3. Lắng nghe cuộc gọi từ máy Acer của Staff
    peer.on('call', (call) => {
      call.answer(stream); // Gửi luồng video này sang máy Staff
    });
  } catch (err) {
    alert("Không thể truy cập camera: " + err);
  }
});
</script>

<style scoped>
.camera-node-container {
  background: #000;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
}
.status-panel { padding: 20px; text-align: center; }
.peer-id { font-weight: bold; color: #facc15; font-size: 1.5rem; display: block; margin: 10px 0; }
#localVideo { width: 100%; height: auto; border: 2px solid #333; }
.loading { color: #f87171; }
.ready { color: #4ade80; }
</style>
