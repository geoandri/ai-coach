import { useState, useEffect, useRef } from 'react'
import { WeeklyBlock, DailyWorkout } from '../types/plan'

interface Props {
  week: WeeklyBlock
  isCurrentWeek?: boolean
}

const typeColors: Record<string, string> = {
  'REST': 'text-gray-500',
  'E(p)': 'text-blue-400',
  'E(p)+S': 'text-blue-400',
  'T': 'text-yellow-400',
  'HR': 'text-orange-400',
  'I': 'text-red-400',
  'B2B': 'text-purple-400',
  'L': 'text-green-400',
  'R': 'text-teal-400',
  'RACE': 'text-red-500 font-bold',
}

function WorkoutRow({ w }: { w: DailyWorkout }) {
  const color = typeColors[w.workoutType ?? ''] ?? 'text-gray-300'
  return (
    <div className={`flex gap-3 py-2 border-b border-gray-800 last:border-0 ${w.isRestDay ? 'opacity-50' : ''}`}>
      <span className="w-10 text-xs text-gray-500 pt-0.5">{w.dayOfWeek?.slice(0, 3)}</span>
      <span className={`w-16 text-xs font-mono pt-0.5 ${color}`}>{w.workoutType}</span>
      <span className="flex-1 text-sm text-gray-300">{w.description}</span>
      {!w.isRestDay && (
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {w.plannedKm}km {w.plannedVertM ? `+${w.plannedVertM}m` : ''}
        </span>
      )}
    </div>
  )
}

export function WeekAccordion({ week, isCurrentWeek = false }: Props) {
  const [open, setOpen] = useState(isCurrentWeek)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isCurrentWeek && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [isCurrentWeek])

  return (
    <div
      ref={ref}
      className={`rounded-xl overflow-hidden mb-2 ${
        isCurrentWeek
          ? 'border-2 border-orange-500'
          : 'border border-gray-800'
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-3 bg-gray-900 hover:bg-gray-800 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-12">Week {week.weekNumber}</span>
          {isCurrentWeek && (
            <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-medium">
              Current
            </span>
          )}
          <span className="text-sm font-medium">{week.phase}</span>
          <span className="text-xs text-gray-500">{week.startDate} – {week.endDate}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{week.plannedKm}km / +{week.workouts.reduce((sum, w) => sum + (w.plannedVertM ?? 0), 0)}m</span>
          <span className="text-gray-500 text-lg">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="bg-gray-950 px-4 py-2">
          {week.workouts.map(w => <WorkoutRow key={w.id} w={w} />)}
        </div>
      )}
    </div>
  )
}
