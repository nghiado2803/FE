<template>
  <div class="page-wrap animated fade-in">
    <!-- ── Toolbar ── -->
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="icon-box"><i class="bi bi-calendar-check-fill"></i></div>
        <div>
          <h2 class="page-title">Lịch trực cá nhân</h2>
          <p class="page-sub">Theo dõi lịch phân công làm việc hàng tuần của bạn</p>
        </div>
      </div>

      <div class="toolbar-right">
        <div class="field-group">
          <label>Tuần làm việc</label>
          <div class="week-picker-row">
            <button class="nav-btn" @click="prevWeek"><i class="bi bi-chevron-left"></i></button>
            <span class="week-label">{{ weekRangeLabel }}</span>
            <button class="nav-btn" @click="nextWeek"><i class="bi bi-chevron-right"></i></button>
          </div>
        </div>
        <button class="btn-refresh" @click="fetchData" :disabled="loading">
          <i :class="['bi bi-arrow-clockwise', { 'spin': loading }]"></i> Làm mới
        </button>
      </div>
    </div>

    <!-- ── Content ── -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Đang tải lịch trực...</p>
    </div>

    <div v-else class="schedule-container">
      <!-- Legend -->
      <div class="cal-subbar">
        <div class="legend-row">
          <div class="legend-item">
            <span class="ldot ldot-0"></span>
            <span class="lname">Ca Sáng</span>
          </div>
          <div class="legend-item">
            <span class="ldot ldot-1"></span>
            <span class="lname">Ca Chiều</span>
          </div>
          <div class="legend-item">
            <span class="ldot ldot-2"></span>
            <span class="lname">Ca Tối</span>
          </div>
          <div class="legend-item">
            <span class="ldot ldot-off"></span>
            <span class="lname">Nghỉ</span>
          </div>
        </div>
      </div>

      <!-- Days Grid -->
      <div class="days-grid">
        <div v-for="day in weekDays" :key="day.date" :class="['day-card', { today: day.isToday }]">
          <div class="day-card-head">
            <span class="dname">{{ day.dayName }}</span>
            <span class="ddate">{{ day.label }}</span>
            <span v-if="day.isToday" class="today-tag">Hôm nay</span>
          </div>

          <div class="day-card-body">
            <div v-if="myAssignments[day.date]" class="assignment-info">
              <div :class="['shift-pill', getShiftClass(getAssignment(day.date)!.shiftId)]">
                <i class="bi bi-clock-fill"></i>
                <span>{{ getAssignment(day.date)!.shiftName }}</span>
              </div>
              <div class="time-range">
                {{ getAssignment(day.date)!.startTime }} – {{ getAssignment(day.date)!.endTime }}
              </div>
              <div class="lot-info">
                <i class="bi bi-geo-alt-fill"></i>
                <span>{{ getAssignment(day.date)!.lotName }}</span>
              </div>
            </div>
            <div v-else class="no-assignment">
              <div class="off-icon"><i class="bi bi-moon-stars"></i></div>
              <p>Lịch nghỉ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { StaffService } from '@/services/staff.service'

interface Assignment {
  id: number
  userId: number
  shiftId: number
  shiftName: string
  startTime: string
  endTime: string
  lotName: string
}

const authStore = useAuthStore()
const loading = ref(false)
const myAssignments = ref<Record<string, Assignment>>({})

// Week Logic (Same as Admin)
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
  const names = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật']
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

const fetchData = async () => {
  if (!authStore.user?.id) return
  loading.value = true
  myAssignments.value = {}
  try {
    for (const day of weekDays.value) {
      const res = await StaffService.getMySchedule(authStore.user.id, day.date) as Assignment[]
      if (res && res.length > 0) {
        myAssignments.value[day.date] = res[0]!
      }
    }
  } catch (e) {
    console.error('Lỗi tải lịch trực:', e)
  } finally {
    loading.value = false
  }
}

const prevWeek = () => {
  const { year, week } = parseWeek(selectedWeek.value)
  const d = new Date(year, 0, 4)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + (week - 2) * 7)
  selectedWeek.value = getISOWeek(d)
  fetchData()
}

const nextWeek = () => {
  const { year, week } = parseWeek(selectedWeek.value)
  const d = new Date(year, 0, 4)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + week * 7)
  selectedWeek.value = getISOWeek(d)
  fetchData()
}

const getShiftClass = (shiftId: number | null | undefined) =>
  shiftId ? `shift-color-${Number(shiftId) % 4}` : 'shift-off'

const getAssignment = (date: string): Assignment | undefined => myAssignments.value[date]

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-wrap { padding: 24px 28px; max-width: 1400px; margin: 0 auto; font-family: 'Inter', system-ui, sans-serif; min-height: 100vh; background: #ffffff; }

/* ── Toolbar ── */
.toolbar {
  display: flex; align-items: center; justify-content: space-between;
  background: white; border: 1px solid #e2e8f0; border-radius: 16px;
  padding: 16px 24px; margin-bottom: 24px; gap: 16px; flex-wrap: wrap;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}
.toolbar-left { display: flex; align-items: center; gap: 16px; }
.icon-box {
  width: 46px; height: 46px; border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; color: white; box-shadow: 0 4px 12px rgba(37,99,235,0.3);
}
.page-title { font-size: 18px; font-weight: 800; margin: 0; color: #1e293b; }
.page-sub { font-size: 13px; color: #64748b; margin: 2px 0 0; }

.toolbar-right { display: flex; align-items: flex-end; gap: 16px; }
.field-group { display: flex; flex-direction: column; gap: 5px; }
.field-group label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }

.week-picker-row {
  display: flex; align-items: center; gap: 8px;
  background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 6px 10px;
}
.nav-btn {
  width: 28px; height: 28px; border-radius: 8px; border: 1px solid #e2e8f0;
  background: white; color: #64748b; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: 0.2s;
}
.nav-btn:hover { background: #f1f5f9; color: #1e293b; }
.week-label { font-size: 14px; font-weight: 700; color: #1e293b; min-width: 120px; text-align: center; }

.btn-refresh {
  background: white; color: #2563eb; border: 1.5px solid #2563eb;
  padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s;
}
.btn-refresh:hover { background: #eff6ff; transform: translateY(-1px); }

/* ── Content ── */
.schedule-container { display: flex; flex-direction: column; gap: 20px; }

.cal-subbar {
  background: white; padding: 16px 24px; border-radius: 16px; border: 1px solid #e2e8f0;
}
.legend-row { display: flex; align-items: center; gap: 20px; }
.legend-item { display: flex; align-items: center; gap: 8px; }
.ldot { width: 10px; height: 10px; border-radius: 50%; }
.ldot-0 { background: #2563eb; }
.ldot-1 { background: #10b981; }
.ldot-2 { background: #f59e0b; }
.ldot-3 { background: #8b5cf6; }
.ldot-off { background: #94a3b8; }
.lname { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }

.days-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 16px; }

.day-card {
  background: white; border-radius: 16px; border: 1.5px solid #e2e8f0;
  overflow: hidden; transition: all 0.2s ease;
}
.day-card.today { border-color: #2563eb; box-shadow: 0 8px 20px rgba(37,99,235,0.1); }

.day-card-head {
  padding: 16px; text-align: center; background: #f8fafc;
  border-bottom: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 2px;
  position: relative;
}
.day-card.today .day-card-head { background: #2563eb; color: white; }
.dname { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
.day-card.today .dname { color: rgba(255,255,255,0.8); }
.ddate { font-size: 18px; font-weight: 900; color: #1e293b; }
.day-card.today .ddate { color: white; }
.today-tag {
  position: absolute; top: 0; right: 0; background: #fbbf24; color: #92400e;
  font-size: 9px; font-weight: 900; padding: 2px 6px; border-bottom-left-radius: 8px;
  text-transform: uppercase;
}

.day-card-body { padding: 20px 16px; min-height: 160px; display: flex; flex-direction: column; }

.assignment-info { display: flex; flex-direction: column; gap: 12px; height: 100%; }
.shift-pill {
  padding: 8px 12px; border-radius: 12px; font-size: 13px; font-weight: 800;
  display: flex; align-items: center; gap: 8px; justify-content: center;
  border: 2px solid transparent;
}
.shift-color-0 { background: #eff6ff; color: #2563eb; border-color: #dbeafe; }
.shift-color-1 { background: #ecfdf5; color: #10b981; border-color: #d1fae5; }
.shift-color-2 { background: #fffbeb; color: #f59e0b; border-color: #fef3c7; }
.shift-color-3 { background: #f5f3ff; color: #8b5cf6; border-color: #ede9fe; }

.time-range { font-size: 14px; font-weight: 700; color: #1e293b; text-align: center; }
.lot-info {
  margin-top: auto; display: flex; align-items: center; gap: 6px;
  font-size: 11px; color: #64748b; font-weight: 700;
  background: #f8fafc; padding: 10px; border-radius: 10px;
  border: 1px solid #e2e8f0;
}
.lot-info i { color: #ef4444; }

.no-assignment {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; color: #cbd5e1; gap: 10px;
}
.off-icon { font-size: 24px; }
.no-assignment p { font-size: 12px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }

/* ── Loading ── */
.loading-state { height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: #64748b; }
.spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }

.animated { animation-duration: 0.4s; animation-fill-mode: both; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.fade-in { animation-name: fadeIn; }

/* ── Responsive ── */
@media (max-width: 1200px) {
  .days-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 800px) {
  .days-grid { grid-template-columns: repeat(2, 1fr); }
  .toolbar { flex-direction: column; align-items: flex-start; }
}
</style>
