import { useDashboard } from '../hooks/useDashboard'
import { WeeklyCard } from '../components/WeeklyCard'
import { AdherenceChart } from '../components/AdherenceChart'

export default function Dashboard() {
  const { data, loading, error, reload } = useDashboard()

  if (loading) return <div className="text-gray-400 text-center py-20">Loading dashboard...</div>
  if (error) return (
    <div className="text-center py-20">
      <p className="text-red-400 mb-4">{error}</p>
      <p className="text-gray-500 text-sm">Is the backend running? Try: <code className="bg-gray-800 px-2 py-1 rounded">cd backend && ./gradlew bootRun</code></p>
    </div>
  )
  if (!data) return null

  const currentWeek = data.weeks.find(w => w.isCurrentWeek)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Actual km" value={`${data.totalActualKm.toFixed(0)} km`} />
        <StatCard label="Total Planned km" value={`${data.totalPlannedKm.toFixed(0)} km`} />
        <StatCard
          label="Overall Adherence"
          value={data.totalPlannedKm > 0 ? `${Math.round(data.totalActualKm / data.totalPlannedKm * 100)}%` : '—'}
        />
        <StatCard label="Current Week" value={currentWeek ? `Week ${currentWeek.weekNumber}` : '—'} />
      </div>

      {/* Current week highlight */}
      {currentWeek && (
        <div>
          <h2 className="text-lg font-bold mb-3 text-orange-400">Current Week</h2>
          <div className="max-w-sm">
            <WeeklyCard week={currentWeek} />
          </div>
        </div>
      )}

      {/* Chart */}
      <AdherenceChart weeks={data.weeks} />

      {/* All weeks grid */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">All Weeks</h2>
          <button onClick={reload} className="text-sm text-orange-400 hover:text-orange-300 transition-colors">
            Refresh
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.weeks.map(w => <WeeklyCard key={w.weekNumber} week={w} />)}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  )
}
