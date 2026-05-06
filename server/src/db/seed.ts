import { db } from './client.js'
import { trainingPlans, weeklyBlocks, dailyWorkouts, athletes } from './schema.js'
import { eq } from 'drizzle-orm'

interface WorkoutRow {
  date: string
  dayOfWeek: string
  workoutType: string
  description: string
  plannedKm: number
  plannedVertM: number
  isRestDay: boolean
  isRaceDay: boolean
}

interface WeekRow {
  weekNumber: number
  phase: string
  startDate: string
  endDate: string
  plannedKm: number
  plannedVertM: number
  notes: string
  workouts: WorkoutRow[]
}

const WEEKS: WeekRow[] = [
  {
    weekNumber: 0, phase: 'Partial Week', startDate: '2026-04-09', endDate: '2026-04-12',
    plannedKm: 38.0, plannedVertM: 600, notes: 'Partial week — plan starts mid-week',
    workouts: [
      { date: '2026-04-09', dayOfWeek: 'Thursday', workoutType: 'E(p)', description: '12km easy, park trails', plannedKm: 12.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-04-10', dayOfWeek: 'Friday', workoutType: 'T', description: '14km with 8km tempo, park trails', plannedKm: 14.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-04-11', dayOfWeek: 'Saturday', workoutType: 'E(p)', description: '16km easy, park trails, ~350m gain', plannedKm: 16.0, plannedVertM: 350, isRestDay: false, isRaceDay: false },
      { date: '2026-04-12', dayOfWeek: 'Sunday', workoutType: 'L', description: '20km, mountain terrain, ~800m gain', plannedKm: 20.0, plannedVertM: 800, isRestDay: false, isRaceDay: false },
    ],
  },
  {
    weekNumber: 1, phase: 'Base Building', startDate: '2026-04-13', endDate: '2026-04-19',
    plannedKm: 100.0, plannedVertM: 1600, notes: 'Base Building Week 1',
    workouts: [
      { date: '2026-04-13', dayOfWeek: 'Monday', workoutType: 'REST', description: 'Full rest', plannedKm: 0.0, plannedVertM: 0, isRestDay: true, isRaceDay: false },
      { date: '2026-04-14', dayOfWeek: 'Tuesday', workoutType: 'E(p)+S', description: '14km easy park trails (~300m gain) + 30min strength', plannedKm: 14.0, plannedVertM: 300, isRestDay: false, isRaceDay: false },
      { date: '2026-04-15', dayOfWeek: 'Wednesday', workoutType: 'HR', description: '8×steepest segment (~30-40m climb per rep), jog down. ~16km total, ~350m gain', plannedKm: 16.0, plannedVertM: 350, isRestDay: false, isRaceDay: false },
      { date: '2026-04-16', dayOfWeek: 'Thursday', workoutType: 'E(p)', description: '12km easy, park trails', plannedKm: 12.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-04-17', dayOfWeek: 'Friday', workoutType: 'T', description: '14km with 8km tempo, park trails', plannedKm: 14.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-04-18', dayOfWeek: 'Saturday', workoutType: 'B2B', description: '18km park trails, ~400m gain — easy/moderate', plannedKm: 18.0, plannedVertM: 400, isRestDay: false, isRaceDay: false },
      { date: '2026-04-19', dayOfWeek: 'Sunday', workoutType: 'L', description: '26km, mountain terrain, ~1,200m gain', plannedKm: 26.0, plannedVertM: 1200, isRestDay: false, isRaceDay: false },
    ],
  },
  {
    weekNumber: 2, phase: 'Base Building', startDate: '2026-04-20', endDate: '2026-04-26',
    plannedKm: 105.0, plannedVertM: 1800, notes: 'Base Building Week 2',
    workouts: [
      { date: '2026-04-20', dayOfWeek: 'Monday', workoutType: 'REST', description: 'Full rest', plannedKm: 0.0, plannedVertM: 0, isRestDay: true, isRaceDay: false },
      { date: '2026-04-21', dayOfWeek: 'Tuesday', workoutType: 'E(p)+S', description: '14km easy park trails + 30min strength (single-leg focus)', plannedKm: 14.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-04-22', dayOfWeek: 'Wednesday', workoutType: 'E(p)', description: '18km easy/moderate park run, natural terrain, ~400m gain', plannedKm: 18.0, plannedVertM: 400, isRestDay: false, isRaceDay: false },
      { date: '2026-04-23', dayOfWeek: 'Thursday', workoutType: 'E(p)', description: '12km easy, park trails', plannedKm: 12.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-04-24', dayOfWeek: 'Friday', workoutType: 'T', description: '15km with 10km tempo, park trails', plannedKm: 15.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-04-25', dayOfWeek: 'Saturday', workoutType: 'B2B', description: '20km park trails, ~440m gain, moderate', plannedKm: 20.0, plannedVertM: 440, isRestDay: false, isRaceDay: false },
      { date: '2026-04-26', dayOfWeek: 'Sunday', workoutType: 'L', description: '26km, mountain terrain, ~1,400m gain', plannedKm: 26.0, plannedVertM: 1400, isRestDay: false, isRaceDay: false },
    ],
  },
  {
    weekNumber: 3, phase: 'Base Building (Peak Base)', startDate: '2026-04-27', endDate: '2026-05-03',
    plannedKm: 110.0, plannedVertM: 2000, notes: 'Peak base week — longest run to date',
    workouts: [
      { date: '2026-04-27', dayOfWeek: 'Monday', workoutType: 'REST', description: 'Full rest', plannedKm: 0.0, plannedVertM: 0, isRestDay: true, isRaceDay: false },
      { date: '2026-04-28', dayOfWeek: 'Tuesday', workoutType: 'E(p)+S', description: '15km easy park trails + 35min strength', plannedKm: 15.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-04-29', dayOfWeek: 'Wednesday', workoutType: 'HR', description: '10×steepest segment, jog down recovery. ~18km total, ~400m gain', plannedKm: 18.0, plannedVertM: 400, isRestDay: false, isRaceDay: false },
      { date: '2026-04-30', dayOfWeek: 'Thursday', workoutType: 'E(p)', description: '13km easy, park trails', plannedKm: 13.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-05-01', dayOfWeek: 'Friday', workoutType: 'I', description: '14km: warm-up + 6×5min hard, 2min jog recovery + cool-down', plannedKm: 14.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-05-02', dayOfWeek: 'Saturday', workoutType: 'B2B', description: '20km park trails, ~440m gain', plannedKm: 20.0, plannedVertM: 440, isRestDay: false, isRaceDay: false },
      { date: '2026-05-03', dayOfWeek: 'Sunday', workoutType: 'L', description: '28km, mountain terrain, ~1,600m gain — longest run to date', plannedKm: 28.0, plannedVertM: 1600, isRestDay: false, isRaceDay: false },
    ],
  },
  {
    weekNumber: 4, phase: 'Recovery Week', startDate: '2026-05-04', endDate: '2026-05-10',
    plannedKm: 70.0, plannedVertM: 1000, notes: 'Scheduled recovery — reduced volume',
    workouts: [
      { date: '2026-05-04', dayOfWeek: 'Monday', workoutType: 'REST', description: 'Full rest', plannedKm: 0.0, plannedVertM: 0, isRestDay: true, isRaceDay: false },
      { date: '2026-05-05', dayOfWeek: 'Tuesday', workoutType: 'E(p)+S', description: '12km easy park trails + 30min strength', plannedKm: 12.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-05-06', dayOfWeek: 'Wednesday', workoutType: 'E(p)', description: '14km easy park run, flat, no pressure', plannedKm: 14.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-05-07', dayOfWeek: 'Thursday', workoutType: 'R', description: '8km recovery, very easy, park trails', plannedKm: 8.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-05-08', dayOfWeek: 'Friday', workoutType: 'T', description: '12km with 6km tempo, park trails', plannedKm: 12.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-05-09', dayOfWeek: 'Saturday', workoutType: 'E(p)', description: '12km easy park trails, ~260m gain', plannedKm: 12.0, plannedVertM: 260, isRestDay: false, isRaceDay: false },
      { date: '2026-05-10', dayOfWeek: 'Sunday', workoutType: 'L', description: '22km, mountain terrain, ~900m gain, easy effort', plannedKm: 22.0, plannedVertM: 900, isRestDay: false, isRaceDay: false },
    ],
  },
  {
    weekNumber: 5, phase: 'Evrytania Pre-Taper', startDate: '2026-05-11', endDate: '2026-05-17',
    plannedKm: 95.0, plannedVertM: 1800, notes: 'Pre-taper for Evrytania race',
    workouts: [
      { date: '2026-05-11', dayOfWeek: 'Monday', workoutType: 'REST', description: 'Full rest', plannedKm: 0.0, plannedVertM: 0, isRestDay: true, isRaceDay: false },
      { date: '2026-05-12', dayOfWeek: 'Tuesday', workoutType: 'E(p)+S', description: '15km easy park trails (~330m gain) + 35min strength', plannedKm: 15.0, plannedVertM: 330, isRestDay: false, isRaceDay: false },
      { date: '2026-05-13', dayOfWeek: 'Wednesday', workoutType: 'E(p)', description: '20km moderate park run, ~440m gain', plannedKm: 20.0, plannedVertM: 440, isRestDay: false, isRaceDay: false },
      { date: '2026-05-14', dayOfWeek: 'Thursday', workoutType: 'E(p)', description: '13km easy, park trails', plannedKm: 13.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-05-15', dayOfWeek: 'Friday', workoutType: 'T', description: '15km with 10km tempo, park trails', plannedKm: 15.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-05-16', dayOfWeek: 'Saturday', workoutType: 'B2B', description: '20km park trails, ~440m gain, moderate', plannedKm: 20.0, plannedVertM: 440, isRestDay: false, isRaceDay: false },
      { date: '2026-05-17', dayOfWeek: 'Sunday', workoutType: 'L', description: '26km, mountain terrain, ~1,400m gain', plannedKm: 26.0, plannedVertM: 1400, isRestDay: false, isRaceDay: false },
    ],
  },
  {
    weekNumber: 6, phase: 'Evrytania Taper', startDate: '2026-05-18', endDate: '2026-05-24',
    plannedKm: 58.0, plannedVertM: 700, notes: 'Taper for Evrytania Trail 42km',
    workouts: [
      { date: '2026-05-18', dayOfWeek: 'Monday', workoutType: 'REST', description: 'Full rest', plannedKm: 0.0, plannedVertM: 0, isRestDay: true, isRaceDay: false },
      { date: '2026-05-19', dayOfWeek: 'Tuesday', workoutType: 'E(p)+S', description: '12km easy park trails + 20min light strength', plannedKm: 12.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-05-20', dayOfWeek: 'Wednesday', workoutType: 'HR', description: '6×steepest segment, jog down. ~12km total, ~250m gain', plannedKm: 12.0, plannedVertM: 250, isRestDay: false, isRaceDay: false },
      { date: '2026-05-21', dayOfWeek: 'Thursday', workoutType: 'R', description: '8km very easy, park trails', plannedKm: 8.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-05-22', dayOfWeek: 'Friday', workoutType: 'R', description: '6km easy + 4×30sec strides, flat', plannedKm: 6.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-05-23', dayOfWeek: 'Saturday', workoutType: 'E(p)', description: '10km easy or rest — travel to Evrytania if needed', plannedKm: 10.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-05-24', dayOfWeek: 'Sunday', workoutType: 'E(p)', description: '8km easy, flat — final shakeout', plannedKm: 8.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
    ],
  },
  {
    weekNumber: 7, phase: 'Evrytania Race Week', startDate: '2026-05-25', endDate: '2026-05-31',
    plannedKm: 30.0, plannedVertM: 400, notes: 'EVRYTANIA TRAIL RACE — 42km / +2,500m',
    workouts: [
      { date: '2026-05-25', dayOfWeek: 'Monday', workoutType: 'REST', description: 'Full rest', plannedKm: 0.0, plannedVertM: 0, isRestDay: true, isRaceDay: false },
      { date: '2026-05-26', dayOfWeek: 'Tuesday', workoutType: 'E(p)', description: '8km very easy, flat', plannedKm: 8.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-05-27', dayOfWeek: 'Wednesday', workoutType: 'E(p)', description: '8km easy + 4×30sec strides', plannedKm: 8.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-05-28', dayOfWeek: 'Thursday', workoutType: 'R', description: '6km very easy', plannedKm: 6.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-05-29', dayOfWeek: 'Friday', workoutType: 'REST', description: 'Travel to Domnista. Gear check. Early dinner. Bed early.', plannedKm: 0.0, plannedVertM: 0, isRestDay: true, isRaceDay: false },
      { date: '2026-05-30', dayOfWeek: 'Saturday', workoutType: 'REST', description: 'Rest or 20min gentle walk. Registration. Race briefing.', plannedKm: 0.0, plannedVertM: 0, isRestDay: true, isRaceDay: false },
      { date: '2026-05-31', dayOfWeek: 'Sunday', workoutType: 'RACE', description: 'EVRYTANIA TRAIL 42km / +2,500m — 10:00 start', plannedKm: 42.0, plannedVertM: 2500, isRestDay: false, isRaceDay: true },
    ],
  },
  {
    weekNumber: 8, phase: 'Post-Race Recovery', startDate: '2026-06-01', endDate: '2026-06-07',
    plannedKm: 55.0, plannedVertM: 700, notes: 'Recovery week after Evrytania race',
    workouts: [
      { date: '2026-06-01', dayOfWeek: 'Monday', workoutType: 'REST', description: 'Complete rest — post-race', plannedKm: 0.0, plannedVertM: 0, isRestDay: true, isRaceDay: false },
      { date: '2026-06-02', dayOfWeek: 'Tuesday', workoutType: 'REST', description: 'Complete rest or 20min gentle walk', plannedKm: 0.0, plannedVertM: 0, isRestDay: true, isRaceDay: false },
      { date: '2026-06-03', dayOfWeek: 'Wednesday', workoutType: 'R', description: '8km very easy, flat park trails — assess legs', plannedKm: 8.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-06-04', dayOfWeek: 'Thursday', workoutType: 'E(p)+S', description: '12km easy park trails + 20min light strength', plannedKm: 12.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-06-05', dayOfWeek: 'Friday', workoutType: 'E(p)', description: '12km easy park trails, ~260m gain', plannedKm: 12.0, plannedVertM: 260, isRestDay: false, isRaceDay: false },
      { date: '2026-06-06', dayOfWeek: 'Saturday', workoutType: 'T', description: '14km with 6km tempo, park trails — diagnostic', plannedKm: 14.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-06-07', dayOfWeek: 'Sunday', workoutType: 'L', description: '14km easy, mountain terrain if possible, ~500m gain', plannedKm: 14.0, plannedVertM: 500, isRestDay: false, isRaceDay: false },
    ],
  },
  {
    weekNumber: 9, phase: 'Build Phase', startDate: '2026-06-08', endDate: '2026-06-14',
    plannedKm: 110.0, plannedVertM: 2200, notes: 'Build Phase — race nutrition practice',
    workouts: [
      { date: '2026-06-08', dayOfWeek: 'Monday', workoutType: 'REST', description: 'Full rest', plannedKm: 0.0, plannedVertM: 0, isRestDay: true, isRaceDay: false },
      { date: '2026-06-09', dayOfWeek: 'Tuesday', workoutType: 'E(p)+S', description: '15km easy park trails (~330m gain) + 35min strength', plannedKm: 15.0, plannedVertM: 330, isRestDay: false, isRaceDay: false },
      { date: '2026-06-10', dayOfWeek: 'Wednesday', workoutType: 'HR', description: '12×steepest segment, jog down. ~20km total, ~450m gain — race nutrition practice', plannedKm: 20.0, plannedVertM: 450, isRestDay: false, isRaceDay: false },
      { date: '2026-06-11', dayOfWeek: 'Thursday', workoutType: 'E(p)', description: '12km easy park trails', plannedKm: 12.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-06-12', dayOfWeek: 'Friday', workoutType: 'T', description: '15km with 3×15min tempo, 3min jog recovery', plannedKm: 15.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-06-13', dayOfWeek: 'Saturday', workoutType: 'B2B', description: '24km park trails, ~530m gain — race nutrition every 40min', plannedKm: 24.0, plannedVertM: 530, isRestDay: false, isRaceDay: false },
      { date: '2026-06-14', dayOfWeek: 'Sunday', workoutType: 'L', description: '24km, mountain terrain, ~1,500m gain', plannedKm: 24.0, plannedVertM: 1500, isRestDay: false, isRaceDay: false },
    ],
  },
  {
    weekNumber: 10, phase: 'Build Phase', startDate: '2026-06-15', endDate: '2026-06-21',
    plannedKm: 115.0, plannedVertM: 2400, notes: 'Build Phase — increasing intensity',
    workouts: [
      { date: '2026-06-15', dayOfWeek: 'Monday', workoutType: 'REST', description: 'Full rest', plannedKm: 0.0, plannedVertM: 0, isRestDay: true, isRaceDay: false },
      { date: '2026-06-16', dayOfWeek: 'Tuesday', workoutType: 'E(p)+S', description: '16km easy park trails (~350m gain) + 35min strength', plannedKm: 16.0, plannedVertM: 350, isRestDay: false, isRaceDay: false },
      { date: '2026-06-17', dayOfWeek: 'Wednesday', workoutType: 'E(p)', description: '22km moderate park run, ~480m gain', plannedKm: 22.0, plannedVertM: 480, isRestDay: false, isRaceDay: false },
      { date: '2026-06-18', dayOfWeek: 'Thursday', workoutType: 'E(p)', description: '12km easy park trails', plannedKm: 12.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-06-19', dayOfWeek: 'Friday', workoutType: 'I', description: '16km: 8×6min hard, 90sec recovery', plannedKm: 16.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-06-20', dayOfWeek: 'Saturday', workoutType: 'B2B', description: '26km park trails, ~570m gain, moderate/firm', plannedKm: 26.0, plannedVertM: 570, isRestDay: false, isRaceDay: false },
      { date: '2026-06-21', dayOfWeek: 'Sunday', workoutType: 'L', description: '24km, mountain terrain, ~1,600m gain', plannedKm: 24.0, plannedVertM: 1600, isRestDay: false, isRaceDay: false },
    ],
  },
  {
    weekNumber: 11, phase: 'Build Peak', startDate: '2026-06-22', endDate: '2026-06-28',
    plannedKm: 120.0, plannedVertM: 2800, notes: 'CROWN JEWEL WEEK — peak training load',
    workouts: [
      { date: '2026-06-22', dayOfWeek: 'Monday', workoutType: 'REST', description: 'Full rest', plannedKm: 0.0, plannedVertM: 0, isRestDay: true, isRaceDay: false },
      { date: '2026-06-23', dayOfWeek: 'Tuesday', workoutType: 'E(p)+S', description: '16km easy park trails + 35min strength', plannedKm: 16.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-06-24', dayOfWeek: 'Wednesday', workoutType: 'HR', description: '15×steepest segment, jog down. ~22km total, ~500m gain — full race kit + poles', plannedKm: 22.0, plannedVertM: 500, isRestDay: false, isRaceDay: false },
      { date: '2026-06-25', dayOfWeek: 'Thursday', workoutType: 'E(p)', description: '13km easy park trails', plannedKm: 13.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-06-26', dayOfWeek: 'Friday', workoutType: 'T', description: '16km with 12km tempo (6km + 2min rest + 6km)', plannedKm: 16.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-06-27', dayOfWeek: 'Saturday', workoutType: 'B2B', description: '28km park trails, ~620m gain', plannedKm: 28.0, plannedVertM: 620, isRestDay: false, isRaceDay: false },
      { date: '2026-06-28', dayOfWeek: 'Sunday', workoutType: 'L', description: '26km, mountain terrain, ~2,000m gain — CROWN JEWEL', plannedKm: 26.0, plannedVertM: 2000, isRestDay: false, isRaceDay: false },
    ],
  },
  {
    weekNumber: 12, phase: 'Build (Controlled Descent)', startDate: '2026-06-29', endDate: '2026-07-05',
    plannedKm: 105.0, plannedVertM: 2200, notes: 'Controlled descent from peak — lighter strength',
    workouts: [
      { date: '2026-06-29', dayOfWeek: 'Monday', workoutType: 'REST', description: 'Full rest', plannedKm: 0.0, plannedVertM: 0, isRestDay: true, isRaceDay: false },
      { date: '2026-06-30', dayOfWeek: 'Tuesday', workoutType: 'E(p)+S', description: '15km easy park trails + 30min strength (lighter)', plannedKm: 15.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-07-01', dayOfWeek: 'Wednesday', workoutType: 'E(p)', description: '20km moderate park run, ~440m gain', plannedKm: 20.0, plannedVertM: 440, isRestDay: false, isRaceDay: false },
      { date: '2026-07-02', dayOfWeek: 'Thursday', workoutType: 'E(p)', description: '12km easy park trails', plannedKm: 12.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-07-03', dayOfWeek: 'Friday', workoutType: 'I', description: '14km: 6×4min hard, 90sec recovery', plannedKm: 14.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-07-04', dayOfWeek: 'Saturday', workoutType: 'B2B', description: '22km park trails, ~480m gain', plannedKm: 22.0, plannedVertM: 480, isRestDay: false, isRaceDay: false },
      { date: '2026-07-05', dayOfWeek: 'Sunday', workoutType: 'L', description: '22km, mountain terrain, ~1,400m gain', plannedKm: 22.0, plannedVertM: 1400, isRestDay: false, isRaceDay: false },
    ],
  },
  {
    weekNumber: 13, phase: 'Taper Week 1', startDate: '2026-07-06', endDate: '2026-07-12',
    plannedKm: 75.0, plannedVertM: 1200, notes: 'Taper — last quality session this week',
    workouts: [
      { date: '2026-07-06', dayOfWeek: 'Monday', workoutType: 'REST', description: 'Full rest', plannedKm: 0.0, plannedVertM: 0, isRestDay: true, isRaceDay: false },
      { date: '2026-07-07', dayOfWeek: 'Tuesday', workoutType: 'E(p)+S', description: '14km easy park trails + 20min light strength', plannedKm: 14.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-07-08', dayOfWeek: 'Wednesday', workoutType: 'HR', description: '8×steepest segment, jog down. ~14km total, ~300m gain', plannedKm: 14.0, plannedVertM: 300, isRestDay: false, isRaceDay: false },
      { date: '2026-07-09', dayOfWeek: 'Thursday', workoutType: 'E(p)', description: '10km easy park trails', plannedKm: 10.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-07-10', dayOfWeek: 'Friday', workoutType: 'T', description: '14km with 8km tempo — LAST QUALITY SESSION', plannedKm: 14.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-07-11', dayOfWeek: 'Saturday', workoutType: 'E(p)', description: '12km easy park trails, ~260m gain', plannedKm: 12.0, plannedVertM: 260, isRestDay: false, isRaceDay: false },
      { date: '2026-07-12', dayOfWeek: 'Sunday', workoutType: 'L', description: '16km easy, mountain terrain, ~600m gain — last long run', plannedKm: 16.0, plannedVertM: 600, isRestDay: false, isRaceDay: false },
    ],
  },
  {
    weekNumber: 14, phase: 'Race Week', startDate: '2026-07-13', endDate: '2026-07-18',
    plannedKm: 30.0, plannedVertM: 300, notes: 'ZAGORI TeRA RACE WEEK — 05:00 Saturday start',
    workouts: [
      { date: '2026-07-13', dayOfWeek: 'Monday', workoutType: 'REST', description: 'Full rest', plannedKm: 0.0, plannedVertM: 0, isRestDay: true, isRaceDay: false },
      { date: '2026-07-14', dayOfWeek: 'Tuesday', workoutType: 'E(p)', description: '8km very easy, flat park trails', plannedKm: 8.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-07-15', dayOfWeek: 'Wednesday', workoutType: 'E(p)', description: '10km easy park trails + 4×30sec strides', plannedKm: 10.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-07-16', dayOfWeek: 'Thursday', workoutType: 'R', description: '6km very easy, flat', plannedKm: 6.0, plannedVertM: 0, isRestDay: false, isRaceDay: false },
      { date: '2026-07-17', dayOfWeek: 'Friday', workoutType: 'REST', description: 'Travel to Tsepelovo. Gear check. Registration. Dinner 18:00. Bed 20:30.', plannedKm: 0.0, plannedVertM: 0, isRestDay: true, isRaceDay: false },
      { date: '2026-07-18', dayOfWeek: 'Saturday', workoutType: 'RACE', description: 'ZAGORI TeRA 60km / +4,000m — 05:00 START', plannedKm: 60.0, plannedVertM: 4000, isRestDay: false, isRaceDay: true },
    ],
  },
]

export async function runSeed() {
  // Check if the plan already exists
  const existing = db.select().from(trainingPlans).where(eq(trainingPlans.id, 1)).all()
  if (existing.length > 0) {
    return
  }

  // Insert placeholder athlete if none exists
  const existingAthletes = db.select().from(athletes).all()
  if (existingAthletes.length === 0) {
    db.insert(athletes).values({
      id: 1,
      name: 'Legacy Athlete',
      trailAccess: false,
      stravaEnabled: false,
    }).run()
  }

  // Insert the training plan
  db.insert(trainingPlans).values({
    id: 1,
    athleteId: 1,
    name: 'Zagori TeRA 60km Training Plan v2',
    raceName: 'Zagori TeRA 60km / +4,000m',
    raceDate: '2026-07-18',
    tuneUpRaceName: 'Evrytania Trail 42km / +2,500m',
    tuneUpRaceDate: '2026-05-31',
    totalWeeks: 15,
  }).run()

  for (const week of WEEKS) {
    const weekResult = db.insert(weeklyBlocks).values({
      trainingPlanId: 1,
      weekNumber: week.weekNumber,
      phase: week.phase,
      startDate: week.startDate,
      endDate: week.endDate,
      plannedKm: week.plannedKm,
      plannedVertM: week.plannedVertM,
      notes: week.notes,
    }).returning({ id: weeklyBlocks.id }).get()

    for (const w of week.workouts) {
      db.insert(dailyWorkouts).values({
        weeklyBlockId: weekResult.id,
        workoutDate: w.date,
        dayOfWeek: w.dayOfWeek,
        workoutType: w.workoutType,
        description: w.description,
        plannedKm: w.plannedKm,
        plannedVertM: w.plannedVertM,
        isRestDay: w.isRestDay,
        isRaceDay: w.isRaceDay,
      }).run()
    }
  }

  console.log('Seed: inserted Zagori TeRA training plan')
}
