import { WeekAdherence } from '../types/dashboard'

interface Props {
  week: WeekAdherence
}

function phaseColor(phase: string | null | undefined): string {
  const p = (phase ?? '').toLowerCase()
  if (p.includes('race') && !p.includes('pre') && !p.includes('post')) return 'bg-red-900 border-red-700'
  if (p.includes('taper') || p.includes('pre-taper') || p.includes('pre taper')) return 'bg-yellow-900 border-yellow-700'
  if (p.includes('recovery') || p.includes('post-race') || p.includes('post race')) return 'bg-green-900 border-green-700'
  if (p.includes('peak')) return 'bg-orange-900 border-orange-700'
  if (p.includes('build')) return 'bg-purple-900 border-purple-700'
  if (p.includes('base')) return 'bg-blue-900 border-blue-700'
  return 'bg-gray-800 border-gray-600'
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
}

export function WeeklyCard({ week }: Props) {
  const colorClass = phaseColor(week.phase)
  const adherencePct = Math.min(week.adherencePercent, 100)
  const barColor = adherencePct >= 90 ? 'bg-green-500' : adherencePct >= 70 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className={`rounded-xl border p-4 ${colorClass} ${week.isCurrentWeek ? 'ring-2 ring-orange-500' : ''} ${week.isFutureWeek ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-xs text-gray-400">Week {week.weekNumber}</span>
          {week.isCurrentWeek && <span className="ml-2 text-xs bg-orange-600 text-white px-2 py-0.5 rounded-full">Current</span>}
          <p className="font-semibold text-sm mt-0.5">{week.phase}</p>
          <p className="text-xs text-gray-400">{formatDate(week.startDate)} – {formatDate(week.endDate)}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{week.actualKm.toFixed(1)}<span className="text-sm font-normal text-gray-400">/{week.plannedKm}km</span></p>
          <p className="text-xs text-gray-400">{Math.round(week.actualVertM)}m↑ / {week.plannedVertM}m↑</p>
        </div>
      </div>
      <div className="mt-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{week.activityCount} activities</span>
          <span>{week.isFutureWeek ? '—' : `${Math.round(week.adherencePercent)}%`}</span>
        </div>
        {!week.isFutureWeek && (
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${adherencePct}%` }} />
          </div>
        )}
      </div>
    </div>
  )
}
