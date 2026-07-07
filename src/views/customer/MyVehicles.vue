<template>
  <div class="vehicles-page-container animated fadeIn">
    <div class="vehicles-body-content">

      <div class="vehicles-list-box">
        <div v-for="(car, index) in vehicleList" :key="index" class="vehicle-card-item">
          <div class="vehicle-card-left">
            <span class="car-avatar-icon">🚘</span>
            <div class="vehicle-meta-info">
              <h4>{{ car.model }}</h4>
              <p class="monospace-plate-text">{{ car.plate }}</p>
            </div>
          </div>
          <button class="btn-delete-vehicle" @click="handleDeleteVehicle(index)" title="Xóa phương tiện">
            🗑️
          </button>
        </div>
      </div>

      <button class="btn-add-new-vehicle-trigger" @click="openAddModal">
        ➕ Thêm phương tiện mới
      </button>

    </div>

    <Transition name="modal-fade">
      <div v-if="isModalOpen" class="modal-blur-overlay" @click="closeModal">
        <div class="modal-card-box" @click.stop>
          <h3 class="modal-title-text">Đăng ký xe mới</h3>

          <div class="modal-form-inputs-group">
            <div class="input-field-block">
              <label>Tên dòng xe / Thương hiệu</label>
              <input type="text" v-model="newVehicle.model" placeholder="Ví dụ: Toyota Vios, VinFast VF8..." />
            </div>
            <div class="input-field-block">
              <label>Biển số kiểm soát (Vùng 77)</label>
              <input type="text" v-model="newVehicle.plate" placeholder="Ví dụ: 77A-123.45" class="uppercase-input" />
            </div>
          </div>

          <div class="modal-actions-row-buttons">
            <button class="btn-cancel-modal" @click="closeModal">Hủy bỏ</button>
            <button class="btn-submit-modal" @click="handleConfirmAdd">Đăng ký</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { CustomerService } from '@/services/customer.service'

const router = useRouter()
const route = useRoute()

const isModalOpen = ref(false)
const vehicleList = ref<{ id?: number; model: string; plate: string }[]>([])

const newVehicle = ref({ model: '', plate: '' })

const loadVehicles = async () => {
  try {
    const data = await CustomerService.getMyVehicles()
    vehicleList.value = data
  } catch (error) {
    console.error('Lỗi khi tải phương tiện:', error)
  }
}

const openAddModal = () => { isModalOpen.value = true }
const closeModal = () => {
  isModalOpen.value = false
  newVehicle.value = { model: '', plate: '' }
}

const handleConfirmAdd = async () => {
  if (!newVehicle.value.model || !newVehicle.value.plate) {
    window.toast?.('Vui lòng điền đầy đủ thông tin dòng xe và biển số!', 'warning')
    return
  }
  try {
    await CustomerService.addVehicle({
      model: newVehicle.value.model,
      plate: newVehicle.value.plate.toUpperCase()
    })
    window.toast?.('Đăng ký phương tiện thành công!', 'success')
    await loadVehicles()
    closeModal()

    const redirectPath = route.query.redirect as string
    if (redirectPath) {
      setTimeout(() => {
        router.push(redirectPath)
      }, 1000)
    }
  } catch {
    window.toast?.('Lỗi khi đăng ký phương tiện!', 'error')
  }
}

const handleDeleteVehicle = async (index: number) => {
  const isConfirmed = await (window.confirmDialog?.('Bạn có chắc chắn muốn xóa phương tiện này khỏi hệ thống SmartPark?') ?? false)
  if (!isConfirmed) return

  const vehicle = vehicleList.value[index]
  if (vehicle?.id) {
    try {
      await CustomerService.deleteVehicle(vehicle.id)
      window.toast?.('Đã xóa phương tiện!', 'success')
      await loadVehicles()
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      const msg = err.response?.data?.message || 'Lỗi khi xóa phương tiện!'
      window.toast?.(msg, 'error')
    }
  }
}

onMounted(loadVehicles)
</script>

<style scoped>
.vehicles-page-container { width: 100%; background-color: #f8fafc; box-sizing: border-box; }
.vehicles-body-content { padding: 16px; display: flex; flex-direction: column; gap: 16px; }

.vehicles-list-box { display: flex; flex-direction: column; gap: 12px; }
.vehicle-card-item { background: white; border-radius: 14px; padding: 14px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.01); }
.vehicle-card-left { display: flex; align-items: center; gap: 14px; text-align: left; }
.car-avatar-icon { font-size: 24px; background: #eff6ff; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 10px; }
.vehicle-meta-info h4 { margin: 0 0 4px 0; font-size: 13.5px; color: #1e293b; font-weight: 800; }
.monospace-plate-text { margin: 0; font-family: monospace; font-size: 14px; color: #2563eb; font-weight: 700; background: #f0fdf4; padding: 2px 6px; border-radius: 4px; border: 1px dashed #4ade80; }
.btn-delete-vehicle { background: none; border: none; cursor: pointer; font-size: 16px; padding: 6px; border-radius: 6px; transition: background 0.15s; }
.btn-delete-vehicle:hover { background: #fef2f2; }

.btn-add-new-vehicle-trigger { background: #2563eb; color: white; border: none; width: 100%; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 13.5px; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

/* Custom Modal Styles */
.modal-blur-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.3); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; padding: 0 24px; box-sizing: border-box; z-index: 2000; }
.modal-card-box { background: white; width: 100%; max-width: 320px; border-radius: 20px; padding: 20px; box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.15); display: flex; flex-direction: column; text-align: left; box-sizing: border-box; }
.modal-title-text { margin: 0 0 16px 0; font-size: 15px; font-weight: 800; color: #0f172a; text-align: center; }
.modal-form-inputs-group { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.input-field-block { display: flex; flex-direction: column; gap: 4px; }
.input-field-block label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
.input-field-block input { padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px; outline: none; font-weight: 600; color: #0f172a; }
.input-field-block input:focus { border-color: #2563eb; }
.uppercase-input { font-family: monospace; text-transform: uppercase; font-size: 14px !important; letter-spacing: 0.5px; }
.modal-actions-row-buttons { display: flex; gap: 10px; }
.btn-cancel-modal { flex: 1; background: #f1f5f9; color: #475569; border: none; padding: 11px; border-radius: 8px; font-weight: 700; font-size: 12.5px; cursor: pointer; text-align: center; }
.btn-submit-modal { flex: 1; background: #2563eb; color: white; border: none; padding: 11px; border-radius: 8px; font-weight: 700; font-size: 12.5px; cursor: pointer; text-align: center; }

.animated { animation-duration: 0.3s; animation-fill-mode: both; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.fadeIn { animation-name: fadeIn; }
</style>
