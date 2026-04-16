import { Activity } from '../types/activity'

interface Props {
  activities: Activity[]
}

function formatPace(distKm: number, movingTimeS: number | null): string {
  if (!movingTimeS || distKm === 0) return '—'
  const secsPerKm = movingTimeS / distKm
  const mins = Math.floor(secsPerKm / 60)
  const secs = Math.round(secsPerKm % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}/km`
}

function formatDuration(s: number | null): string {
  if (!s) return '—'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function ActivityList({ activities }: Props) {
  if (activities.length === 0) {
    return <p className="text-gray-500 text-sm py-8 text-center">No activities found. Sync from Strava to get started.</p>
  }

  return (
    <div className="space-y-2">
      {activities.map(a => (
        <div key={a.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex justify-between items-center">
          <div>
            <p className="font-medium text-sm">{a.name ?? 'Run'}</p>
            <p className="text-xs text-gray-400">
              {new Date(a.activityDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
              {' · '}{a.sportType}
            </p>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-sm font-bold">{a.distanceKm.toFixed(1)} km</p>
              <p className="text-xs text-gray-400">{formatDuration(a.movingTimeS)}</p>
            </div>
            <div>
              <p className="text-sm">{a.totalElevationM != null ? `+${Math.round(Number(a.totalElevationM))}m` : '—'}</p>
              <p className="text-xs text-gray-400">{formatPace(a.distanceKm, a.movingTimeS)}</p>
            </div>
            {a.averageHeartrate && (
              <div>
                <p className="text-sm">{Math.round(Number(a.averageHeartrate))} bpm</p>
                <p className="text-xs text-gray-400">avg HR</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
