import { useParams } from 'react-router-dom'
import { useAthletePlan } from '../hooks/useAthletePlan'
import { WeekAccordion } from '../components/WeekAccordion'

function isCurrentWeek(startDate: string, endDate: string): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return today >= startDate && today <= endDate
}

export default function AthletePlanView() {
  const { athleteId } = useParams<{ athleteId: string }>()
  const id = athleteId ? Number(athleteId) : undefined
  const { data, loading, error } = useAthletePlan(id)

  if (loading) return <div className="text-gray-400 text-center py-20">Loading training plan...</div>
  if (error) return <p className="text-red-400 text-center py-20">{error}</p>
  if (!data) return (
    <div className="text-center py-20">
      <p className="text-gray-400 mb-2">No training plan yet.</p>
      <p className="text-gray-500 text-sm">Use the AI coaching agent to create one.</p>
    </div>
  )

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{data.name}</h1>
          <div className="flex gap-6 mt-2 text-sm text-gray-400">
            {data.raceName && <span>🏁 {data.raceName} — {data.raceDate}</span>}
            {data.tuneUpRaceName && <span>⚡ {data.tuneUpRaceName} — {data.tuneUpRaceDate}</span>}
          </div>
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
