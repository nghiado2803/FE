<template>
  <div class="page-wrap">
    <!-- ── Toolbar ── -->
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="icon-box"><i class="bi bi-person-badge-fill"></i></div>
        <div>
          <h2 class="page-title">Phân công Ca trực</h2>
          <p class="page-sub">Quản lý lịch làm việc nhân viên theo bãi đỗ</p>
        </div>
      </div>

      <div class="toolbar-right">
        <div class="field-group">
          <label>Bãi đỗ xe</label>
          <select v-model="selectedLotId" @change="fetchData" class="ctrl-select">
            <option v-for="lot in parkingLots" :key="lot.id" :value="lot.id">{{ lot.name }}</option>
          </select>
        </div>

        <div class="field-group">
          <label>Tuần làm việc</label>
          <div class="week-picker-row">
            <button class="nav-btn" @click="prevWeek"><i class="bi bi-chevron-left"></i></button>
            <span class="week-label">{{ weekRangeLabel }}</span>
            <button class="nav-btn" @click="nextWeek"><i class="bi bi-chevron-right"></i></button>
          </div>
        </div>

        <button class="btn-view" @click="openFullSchedule">
          <i class="bi bi-eye-fill"></i> Xem toàn bộ
        </button>

        <button class="btn-save" @click="saveAssignments" :disabled="saving">
          <i :class="saving ? 'bi bi-arrow-repeat spin' : 'bi bi-shield-check'"></i>
          {{ saving ? 'Đang lưu...' : 'Lưu phân công' }}
        </button>
      </div>
    </div>

    <!-- ── Toast ── -->
    <Transition name="toast-slide">
      <div v-if="toast.show" :class="['toast', toast.type]">
        <i :class="toast.type === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"></i>
        {{ toast.message }}
      </div>
    </Transition>

    <!-- ── Loading ── -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Đang tải dữ liệu nhân sự...</p>
    </div>

    <!-- ── Calendar ── -->
    <div v-else class="calendar-card">
      <!-- Sub-toolbar: legend + search -->
      <div class="cal-subbar">
        <div class="legend-row">
          <div v-for="shift in shifts" :key="shift.id" class="legend-item">
            <span :class="['ldot', `ldot-${shift.id % 4}`]"></span>
            <span class="lname">{{ shift.name }}</span>
            <span class="ltime">({{ shift.startTime }}–{{ shift.endTime }})</span>
          </div>
          <div class="legend-item">
            <span class="ldot ldot-off"></span>
            <span class="lname">Nghỉ</span>
          </div>
        </div>
        <div class="search-box">
          <i class="bi bi-search"></i>
          <input type="text" placeholder="Tìm nhân viên..." v-model="searchQuery" />
        </div>
      </div>

      <!-- Table -->
      <div class="tbl-wrap">
        <table class="sched-table">
          <thead>
            <tr>
              <th class="th-staff">Nhân viên</th>
              <th
                v-for="day in weekDays"
                :key="day.date"
                :class="['th-day', { today: day.isToday }]"
              >
                <div class="day-head-box">
                  <span class="dname">{{ day.dayName }}</span>
                  <span class="ddate">{{ day.label }}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredStaff.length === 0">
              <td :colspan="weekDays.length + 1" class="empty-row">
                <i class="bi bi-person-x"></i> Không có nhân viên nào
              </td>
            </tr>
            <tr v-for="staff in filteredStaff" :key="staff.id" class="srow">
              <td class="td-staff">
                <div class="staff-info">
                  <div class="avatar">{{ staff.fullName.charAt(0) }}</div>
                  <div>
                    <div class="sname">{{ staff.fullName }}</div>
                    <div class="sphone">{{ staff.phone || 'N/A' }}</div>
                  </div>
                </div>
              </td>
              <td
                v-for="day in weekDays"
                :key="day.date"
                class="td-shift"
                :style="{ zIndex: activeDropdown?.staffId === staff.id && activeDropdown?.date === day.date ? 200 : 1 }"
              >
                <div class="drop-wrap">
                  <div
                    :class="['shift-pill', getShiftClass(weekAssignments[day.date]?.[staff.id])]"
                    @click="toggleDropdown(staff.id, day.date)"
                  >
                    <span>{{ shifts.find(s => s.id === weekAssignments[day.date]?.[staff.id])?.name || '—' }}</span>
                    <i class="bi bi-chevron-down caret"></i>
                  </div>
                  <div
                    v-if="activeDropdown?.staffId === staff.id && activeDropdown?.date === day.date"
                    class="drop-menu"
                  >
                    <div class="drop-item off" @click="selectShift(day.date, staff.id, null)">— Nghỉ</div>
                    <div
                      v-for="shift in shifts"
                      :key="shift.id"
                      :class="['drop-item', `c${shift.id % 4}`]"
                      @click="selectShift(day.date, staff.id, shift.id)"
                    >{{ shift.name }}</div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Full Schedule Modal ── -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showFullSchedule" class="modal-overlay" @click.self="showFullSchedule = false">
          <div class="modal-box">
            <div class="modal-head">
              <div>
                <h3>Toàn bộ phân công ca trực</h3>
                <p>{{ weekRangeLabel }} · {{ parkingLots.find(l => l.id === selectedLotId)?.name }}</p>
              </div>
              <button class="close-btn" @click="showFullSchedule = false">✕</button>
            </div>
            <div class="modal-body">
              <div class="full-grid">
                <div v-for="day in weekDays" :key="day.date" class="day-col">
                  <div :class="['day-col-head', { today: day.isToday }]">
                    <span class="dname">{{ day.dayName }}</span>
                    <span class="ddate">{{ day.label }}</span>
                  </div>
                  <div class="day-body">
                    <div v-for="shift in shifts" :key="shift.id" class="sg">
                      <div class="sg-title">{{ shift.name }}</div>
                      <div class="sg-list">
                        <span v-for="s in getStaffByShift(day.date, shift.id)" :key="s.id" class="stag">{{ s.fullName }}</span>
                        <span v-if="getStaffByShift(day.date, shift.id).length === 0" class="stag-empty">Trống</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-foot">
              <button class="btn-ghost" @click="showFullSchedule = false">Đóng</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { AdminService } from '@/services/admin.service'

interface ParkingLot { id: number; name: string; [key: string]: unknown }
interface Shift { id: number; name: string; startTime: string; endTime: string; [key: string]: unknown }
interface Staff { id: number; fullName: string; phone?: string; [key: string]: unknown }
interface Assignment { userId: number; shiftId: number; date: string; [key: string]: unknown }

const parkingLots = ref<ParkingLot[]>([])
const selectedLotId = ref<number | null>(null)
const shifts = ref<Shift[]>([])
const staffList = ref<Staff[]>([])
const loading = ref(false)
const saving = ref(false)
const searchQuery = ref('')
const toast = ref({ show: false, type: 'success', message: '' })
const showFullSchedule = ref(false)
const activeDropdown = ref<{ staffId: number; date: string } | null>(null)
const weekAssignments = ref<Record<string, Record<number, number | null>>>({})

const getISOWeek = (d: Date): string => {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7))
  const week1 = new Date(date.getFullYear(), 0, 4)
  const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
  return `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

const parseWeek = (s: string): { year: number; week: number } => {
  const p = s.split('-W')
  return { year: parseInt(p[0] ?? '2026'), week: parseInt(p[1] ?? '1') }
}

const selectedWeek = ref(getISOWeek(new Date()))

const weekDays = computed(() => {
  const { year, week } = parseWeek(selectedWeek.value)
  const jan4 = new Date(year, 0, 4)
  const start = new Date(jan4)
  start.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + (week - 1) * 7)
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const names = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`
    return { date: dateStr, label: `${dd}/${mm}`, dayName: names[i] as string, isToday: dateStr === today }
  })
})

const weekRangeLabel = computed(() => {
  const f = weekDays.value[0]; const l = weekDays.value[6]
  return f && l ? `${f.label} – ${l.label}` : ''
})

const filteredStaff = computed(() =>
  searchQuery.value
    ? staffList.value.filter(s => s.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()))
    : staffList.value
)

const initWeekAssignments = () => {
  const map: Record<string, Record<number, number | null>> = {}
  for (const day of weekDays.value) {
    const dm: Record<number, number | null> = {}
    for (const s of staffList.value) dm[s.id] = null
    map[day.date] = dm
  }
  weekAssignments.value = map
}

const fetchData = async () => {
  if (!selectedLotId.value) return
  loading.value = true
  try {
    if (shifts.value.length === 0) shifts.value = (await AdminService.getShifts()) as Shift[]
    staffList.value = (await AdminService.getLotStaffs(selectedLotId.value)) as Staff[]
    initWeekAssignments()
    for (const day of weekDays.value) {
      const list = (await AdminService.getShiftAssignments(selectedLotId.value, day.date)) as Assignment[]
      const dm = weekAssignments.value[day.date]
      if (!dm) continue
      for (const s of staffList.value) {
        const m = list.find(a => a.userId === s.id)
        dm[s.id] = m ? m.shiftId : null
      }
    }
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const fetchLots = async () => {
  try {
    const res = (await AdminService.getParkingLots()) as unknown as ParkingLot[]
    parkingLots.value = res
    const first = res[0]
    if (first) { selectedLotId.value = first.id; fetchData() }
  } catch (e) { console.error(e) }
}

const onWeekChange = () => fetchData()

const prevWeek = () => {
  const { year, week } = parseWeek(selectedWeek.value)
  const d = new Date(year, 0, 4)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + (week - 2) * 7)
  selectedWeek.value = getISOWeek(d); fetchData()
}

const nextWeek = () => {
  const { year, week } = parseWeek(selectedWeek.value)
  const d = new Date(year, 0, 4)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + week * 7)
  selectedWeek.value = getISOWeek(d); fetchData()
}

const setAssignment = (date: string, staffId: number, value: string) => {
  if (!weekAssignments.value[date]) weekAssignments.value[date] = {}
  weekAssignments.value[date][staffId] = value === 'null' || value === '' ? null : Number(value)
}

const getShiftClass = (shiftId: number | null | undefined) =>
  shiftId ? `shift-color-${shiftId % 4}` : 'shift-off'

const toggleDropdown = (staffId: number, date: string) => {
  activeDropdown.value = (activeDropdown.value?.staffId === staffId && activeDropdown.value?.date === date)
    ? null : { staffId, date }
}

const selectShift = (date: string, staffId: number, shiftId: number | null) => {
  setAssignment(date, staffId, shiftId === null ? 'null' : String(shiftId))
  activeDropdown.value = null
}

const getStaffByShift = (date: string, shiftId: number) => {
  const dm = weekAssignments.value[date]
  return dm ? staffList.value.filter(s => dm[s.id] === shiftId) : []
}

const openFullSchedule = () => { showFullSchedule.value = true }

const showToast = (type: 'success' | 'error', message: string) => {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const saveAssignments = async () => {
  if (!selectedLotId.value) return
  saving.value = true
  try {
    for (const day of weekDays.value) {
      const dm = weekAssignments.value[day.date] ?? {}
      const assignments: { userId: number; shiftId: number | null }[] = Object.entries(dm)
        .filter(([, v]) => v !== null)
        .map(([uid, sid]) => ({ userId: Number(uid), shiftId: sid }))
      await AdminService.saveShiftAssignments({ lotId: selectedLotId.value, date: day.date, assignments })
    }
    showToast('success', 'Đã lưu phân công ca trực thành công!')
  } catch { showToast('error', 'Không thể lưu phân công!') }
  finally { saving.value = false }
}

onMounted(() => {
  fetchLots()
  window.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('.drop-wrap')) activeDropdown.value = null
  })
  // Lắng nghe sự kiện khi có yêu cầu đổi ca được duyệt
  window.addEventListener('shiftRequestUpdated', fetchData)
})

onUnmounted(() => {
  window.removeEventListener('shiftRequestUpdated', fetchData)
})

// suppress unused warning — kept for future use
void onWeekChange
</script>

<style scoped>
/* ── Base ── */
.page-wrap {
  padding: 24px 28px;
  max-width: 1600px;
  margin: 0 auto;
  font-family: 'Inter', system-ui, sans-serif;
  background: #ffffff;
  min-height: 100vh;
  color: #1e293b;
}

/* ── Toolbar ── */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px 24px;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}
.toolbar-left { display: flex; align-items: center; gap: 16px; }
.icon-box {
  width: 46px; height: 46px; border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; color: white;
  box-shadow: 0 4px 12px rgba(37,99,235,0.3);
  flex-shrink: 0;
}
.page-title { font-size: 17px; font-weight: 800; margin: 0; color: #1e293b; }
.page-sub { font-size: 12px; color: #64748b; margin: 2px 0 0; }

.toolbar-right {
  display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap;
}
.field-group { display: flex; flex-direction: column; gap: 5px; }
.field-group label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }

.ctrl-select {
  background: #f8fafc; border: 1.5px solid #e2e8f0;
  color: #1e293b; padding: 9px 14px; border-radius: 10px;
  font-size: 13px; font-weight: 600; outline: none; min-width: 180px;
  transition: all 0.2s;
}
.ctrl-select:focus { border-color: #2563eb; background: white; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

.week-picker-row {
  display: flex; align-items: center; gap: 8px;
  background: #f8fafc; border: 1.5px solid #e2e8f0;
  border-radius: 10px; padding: 6px 10px;
}
.nav-btn {
  width: 28px; height: 28px; border-radius: 8px;
  border: 1px solid #e2e8f0; background: white;
  color: #64748b; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: 0.2s; font-size: 12px;
}
.nav-btn:hover { background: #f1f5f9; color: #1e293b; border-color: #cbd5e1; }
.week-label { font-size: 13px; font-weight: 700; color: #1e293b; min-width: 120px; text-align: center; }

.btn-view {
  background: white; color: #2563eb; border: 1.5px solid #2563eb;
  padding: 9px 22px; border-radius: 10px; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  transition: all 0.2s; height: 40px;
}
.btn-view:hover { background: #eff6ff; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.1); }

.btn-save {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white; border: none; padding: 9px 22px; border-radius: 10px;
  font-size: 13px; font-weight: 700;
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  transition: 0.2s; height: 40px;
  box-shadow: 0 4px 14px rgba(37,99,235,0.35);
}
.btn-save:hover:not(:disabled) { background: linear-gradient(135deg, #1d4ed8, #1e40af); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(37,99,235,0.45); }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Toast ── */
.toast {
  position: fixed; top: 20px; right: 20px; z-index: 9999;
  display: flex; align-items: center; gap: 10px;
  padding: 13px 20px; border-radius: 12px;
  font-weight: 700; font-size: 14px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.toast.success { background: #10b981; color: white; }
.toast.error { background: #ef4444; color: white; }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.3s ease; }
.toast-slide-enter-from, .toast-slide-leave-to { opacity: 0; transform: translateX(30px); }

/* ── Calendar ── */
.calendar-card {
  background: white; border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  position: relative;
  z-index: 1;
}

.cal-subbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 24px; border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap; gap: 20px;
  background: white;
}
.legend-row {
  display: flex; align-items: center; gap: 12px;
  background: #f8fafc; padding: 10px 16px; border-radius: 12px;
  border: 1px solid #e2e8f0;
}
.legend-item { display: flex; align-items: center; gap: 6px; }
.ldot { width: 8px; height: 8px; border-radius: 50%; }
.ldot-0 { background: #2563eb; }
.ldot-1 { background: #10b981; }
.ldot-2 { background: #f59e0b; }
.ldot-3 { background: #8b5cf6; }
.ldot-off { background: #94a3b8; }
.lname { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
.ltime { font-size: 10px; color: #94a3b8; font-weight: 600; margin-left: 2px; }

.search-box {
  display: flex; align-items: center; gap: 10px;
  background: #f8fafc; border: 1.5px solid #e2e8f0;
  padding: 9px 16px; border-radius: 12px; min-width: 240px;
}
.search-box i { color: #94a3b8; font-size: 13px; }
.search-box input { background: none; border: none; outline: none; font-size: 13px; font-weight: 600; color: #1e293b; width: 100%; }

/* ── Table ── */
.tbl-wrap { overflow: visible; }
.sched-table { width: 100%; border-collapse: collapse; }
.th-staff {
  width: 200px; padding: 14px 20px; text-align: left;
  font-size: 12px; font-weight: 700; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.5px;
  border-bottom: 2px solid #e2e8f0;
  background: #f8fafc;
}
.th-day {
  padding: 10px 8px; text-align: center;
  border-bottom: 2px solid #e2e8f0;
  border-left: 1px solid #f1f5f9;
  min-width: 110px;
  background: #f8fafc;
}
.th-day.today { background: #eff6ff; }
.th-day.today .ddate { color: #2563eb; font-weight: 800; }
.th-day.today .dname { color: #2563eb; }

.day-head-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.dname { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
.ddate { font-size: 16px; font-weight: 800; color: #1e293b; line-height: 1; }
.th-day.today .ddate { color: #2563eb; }
.th-day.today .dname { color: #2563eb; opacity: 0.8; }

.srow { border-bottom: 1px solid #f1f5f9; transition: background 0.15s; }
.srow:hover { background: #fafbff; }
.td-staff { padding: 12px 20px; }
.staff-info { display: flex; align-items: center; gap: 12px; }
.avatar {
  width: 38px; height: 38px; border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white; display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 800; flex-shrink: 0;
}
.sname { font-size: 14px; font-weight: 700; color: #0f172a; }
.sphone { font-size: 12px; color: #94a3b8; font-weight: 500; }

.td-shift { padding: 8px; text-align: center; border-left: 1px solid #f1f5f9; position: relative; }
.drop-wrap { position: relative; width: 100%; }

.shift-pill {
  width: 100%; padding: 8px 12px; border-radius: 12px;
  font-size: 13px; font-weight: 700; border: 2px solid transparent;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative; user-select: none;
}
.shift-pill:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.caret { font-size: 10px; opacity: 0.7; transition: 0.3s; }

.shift-off { background: #f8fafc; color: #94a3b8; border-color: #e2e8f0; }
.shift-color-0 { background: #eff6ff; color: #2563eb; border-color: #dbeafe; }
.shift-color-1 { background: #ecfdf5; color: #10b981; border-color: #d1fae5; }
.shift-color-2 { background: #fffbeb; color: #f59e0b; border-color: #fef3c7; }
.shift-color-3 { background: #f5f3ff; color: #8b5cf6; border-color: #ede9fe; }

.drop-menu {
  position: absolute; top: calc(100% + 6px); left: 0; right: 0;
  background: white; border-radius: 14px; border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px rgba(0,0,0,0.12); z-index: 100;
  padding: 6px; display: flex; flex-direction: column; gap: 4px;
  min-width: 120px;
}
.drop-item {
  padding: 10px 14px; border-radius: 10px; font-size: 12px; font-weight: 700;
  cursor: pointer; transition: 0.2s; text-align: left;
}
.drop-item.off { background: #f8fafc; color: #94a3b8; }
.drop-item.off:hover { background: #f1f5f9; color: #64748b; }
.drop-item.c0 { color: #2563eb; } .drop-item.c0:hover { background: #eff6ff; }
.drop-item.c1 { color: #10b981; } .drop-item.c1:hover { background: #ecfdf5; }
.drop-item.c2 { color: #f59e0b; } .drop-item.c2:hover { background: #fffbeb; }
.drop-item.c3 { color: #8b5cf6; } .drop-item.c3:hover { background: #f5f3ff; }

.empty-row { text-align: center; padding: 60px; color: #94a3b8; font-size: 15px; font-weight: 600; }

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(15,23,42,0.6);
  backdrop-filter: blur(4px); display: flex; align-items: center;
  justify-content: center; z-index: 1000; padding: 20px;
}
.modal-box { background: white; border-radius: 24px; width: 100%; max-width: 1200px; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
.modal-head { padding: 24px 32px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.modal-head h3 { margin: 0; font-size: 18px; font-weight: 800; color: #0f172a; }
.modal-head p { margin: 4px 0 0; font-size: 13px; color: #64748b; }
.close-btn { background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; transition: 0.2s; }
.close-btn:hover { color: #64748b; }

.modal-body { padding: 32px; overflow: visible; background: #ffffff; }
.full-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 16px; }
.day-col { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
.day-col-head {
  padding: 12px; text-align: center;
  background: #f8fafc; border-bottom: 1px solid #e2e8f0;
  display: flex; flex-direction: column; gap: 2px;
}
.day-col-head.today { background: #2563eb; color: white; }
.day-col-head.today .ddate { color: rgba(255,255,255,0.9); }
.day-col-head.today .dname { color: rgba(255,255,255,0.7); }

.day-body { padding: 12px; display: flex; flex-direction: column; gap: 16px; }
.sg-title { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
.sg-list { display: flex; flex-wrap: wrap; gap: 6px; }
.stag { background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; }
.stag-empty { font-size: 11px; color: #cbd5e1; font-style: italic; }

.modal-foot {
  padding: 20px 32px; border-top: 1px solid #f1f5f9;
  display: flex; justify-content: flex-end; gap: 12px;
}
.btn-ghost {
  background: white; color: #475569; border: 1.5px solid #e2e8f0;
  padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 14px;
  cursor: pointer; transition: 0.2s;
}
.btn-ghost:hover { background: #f8fafc; border-color: #cbd5e1; color: #1e293b; }

/* ── Loading ── */
.loading-state { height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: #475569; font-weight: 600; }
.spinner { width: 40px; height: 40px; border: 3px solid #334155; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }

/* ── Animations ── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .toolbar { flex-direction: column; align-items: flex-start; }
  .toolbar-right { width: 100%; }
  .full-grid { grid-template-columns: repeat(3, 1fr); }
  .page-wrap { padding: 14px; }
}
@media (max-width: 600px) {
  .full-grid { grid-template-columns: 1fr 1fr; }
}
</style>
