import { useAthletes } from '../hooks/useAthletes'
import { useNavigate } from 'react-router-dom'
import { Athlete } from '../types/athlete'


function fitnessLevelColor(level?: string) {
  switch (level) {
    case 'ELITE': return 'text-purple-400'
    case 'ADVANCED': return 'text-orange-400'
    case 'INTERMEDIATE': return 'text-blue-400'
    case 'BEGINNER': return 'text-green-400'
    default: return 'text-gray-400'
  }
}

function goalTypeLabel(goal?: string) {
  switch (goal) {
    case 'FINISH_COMFORTABLY': return 'Finish Comfortably'
    case 'TARGET_TIME': return 'Target Time'
    case 'PODIUM': return 'Podium'
    default: return '—'
  }
}

function AthleteCard({ athlete }: { athlete: Athlete }) {
  const navigate = useNavigate()
  return (
    <div
      className="bg-gray-900 border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-orange-600 transition-colors"
      onClick={() => navigate(`/athletes/${athlete.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg">{athlete.name}</h3>
          {athlete.email && <p className="text-gray-500 text-xs">{athlete.email}</p>}
        </div>
        <div className="flex items-center gap-1">
          {athlete.stravaEnabled && (
            <span className="text-xs bg-orange-900 text-orange-300 px-2 py-0.5 rounded-full">
              Strava
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500 text-xs">Fitness</span>
          <p className={`font-medium ${fitnessLevelColor(athlete.fitnessLevel)}`}>
            {athlete.fitnessLevel ?? '—'}
          </p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Goal</span>
          <p className="text-gray-300 font-medium">{goalTypeLabel(athlete.goalType)}</p>
        </div>
        {athlete.currentWeeklyKm && (
          <div>
            <span className="text-gray-500 text-xs">Weekly km</span>
            <p className="text-gray-300">{athlete.currentWeeklyKm} km</p>
          </div>
        )}
        {athlete.targetFinishTime && (
          <div>
            <span className="text-gray-500 text-xs">Target time</span>
            <p className="text-gray-300">{athlete.targetFinishTime}</p>
          </div>
        )}
        {athlete.raceName && (
          <div className="col-span-2">
            <span className="text-gray-500 text-xs">Goal Race</span>
            <p className="text-gray-300">
              {athlete.raceName}
              {athlete.raceDate && <span className="text-gray-500 ml-2 text-xs">{athlete.raceDate}</span>}
            </p>
          </div>
        )}
        {(athlete.raceDistanceKm || athlete.raceElevationM) && (
          <div className="col-span-2 flex gap-3">
            {athlete.raceDistanceKm && (
              <span className="text-gray-400 text-xs">{athlete.raceDistanceKm} km</span>
            )}
            {athlete.raceElevationM && (
              <span className="text-gray-400 text-xs">↑{athlete.raceElevationM} m</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AthletesPage() {
  const { data: athletes, loading, error } = useAthletes()

  if (loading) return <div className="text-gray-400 text-center py-20">Loading athletes...</div>

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Athletes</h1>
      </div>

      {error && (
        <div className="text-center py-20">
          <p className="text-red-400 mb-2">{error}</p>
          <p className="text-gray-500 text-sm">Is the backend running?</p>
        </div>
      )}

      {!error && athletes.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-4">No athletes yet.</p>
          <p className="text-gray-500 text-sm">
            Start a conversation with your AI coach in Claude to create your first athlete profile.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {athletes.map(a => <AthleteCard key={a.id} athlete={a} />)}
      </div>
    </div>
  )
}
