import { usePlan } from '../hooks/usePlan'
import { WeekAccordion } from '../components/WeekAccordion'

function isCurrentWeek(startDate: string, endDate: string): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return today >= startDate && today <= endDate
}

export default function PlanView() {
  const { data, loading, error } = usePlan()

  if (loading) return <div className="text-gray-400 text-center py-20">Loading training plan...</div>
  if (error) return <p className="text-red-400 text-center py-20">{error}</p>
  if (!data) return null

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{data.name}</h1>
        <div className="flex gap-6 mt-2 text-sm text-gray-400">
          {data.raceName && <span>🏁 {data.raceName} — {data.raceDate}</span>}
          {data.tuneUpRaceName && <span>⚡ {data.tuneUpRaceName} — {data.tuneUpRaceDate}</span>}
        </div>
      </div>
      <div>
        {data.weeks.map(week => (
          <WeekAccordion
            key={week.weekNumber}
            week={week}
            isCurrentWeek={isCurrentWeek(week.startDate, week.endDate)}
          />
        ))}
      </div>
    </div>
  )
}
