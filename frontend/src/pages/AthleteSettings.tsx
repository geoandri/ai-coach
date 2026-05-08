import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useAthlete } from '../hooks/useAthletes'
import { athleteApi } from '../api/athleteApi'

export default function AthleteSettings() {
  const { athleteId } = useParams<{ athleteId: string }>()
  const id = athleteId ? Number(athleteId) : undefined
  const { data: athlete } = useAthlete(id)
  const [searchParams] = useSearchParams()
  const [stravaStatus, setStravaStatus] = useState<{ connected: boolean; stravaAthleteId?: number } | null>(null)

  const connected = searchParams.get('connected')
  const error = searchParams.get('error')

  useEffect(() => {
    if (!id) return
    athleteApi.getStravaStatus(id)
      .then(setStravaStatus)
      .catch(() => setStravaStatus({ connected: false }))
  }, [id, connected])

  if (!athlete) return <div className="text-gray-400 text-center py-20">Loading...</div>

  const stravaConnectUrl = athleteApi.getStravaConnectUrl(id!)

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Settings</h1>

      {connected && (
        <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded-lg mb-4 text-sm">
          Strava connected successfully!
        </div>
      )}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
          Error: {error.replace(/_/g, ' ')}
        </div>
      )}

      {/* Athlete Profile */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
        <h2 className="text-lg font-semibold mb-4">Athlete Profile</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <ProfileField label="Name" value={athlete.name} />
          <ProfileField label="Email" value={athlete.email} />
          <ProfileField label="Experience" value={athlete.experienceYears ? `${athlete.experienceYears} years` : undefined} />
          <ProfileField label="Fitness Level" value={athlete.fitnessLevel} />
          <ProfileField label="Current Weekly km" value={athlete.currentWeeklyKm ? `${athlete.currentWeeklyKm} km` : undefined} />
          <ProfileField label="Longest Recent Run" value={athlete.longestRecentRunKm ? `${athlete.longestRecentRunKm} km` : undefined} />
          <ProfileField label="Training Days/Week" value={athlete.trainingDaysPerWeek?.toString()} />
          <ProfileField label="Goal Type" value={athlete.goalType?.replace(/_/g, ' ')} />
          <ProfileField label="Target Time" value={athlete.targetFinishTime} />
          <ProfileField label="Trail Access" value={athlete.trailAccess ? 'Yes' : 'No'} />
        </div>
        {athlete.injuries && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <span className="text-gray-500 text-xs">Injuries/Notes</span>
            <p className="text-gray-300 text-sm mt-1">{athlete.injuries}</p>
          </div>
        )}
        {athlete.coachNotes && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <span className="text-gray-500 text-xs">Coach Notes</span>
            <p className="text-gray-300 text-sm mt-1 whitespace-pre-wrap">{athlete.coachNotes}</p>
          </div>
        )}
        {athlete.athleteSummary && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <span className="text-gray-500 text-xs">Athlete Summary</span>
            <p className="text-gray-300 text-sm mt-1 whitespace-pre-wrap">{athlete.athleteSummary}</p>
          </div>
        )}
        <p className="text-gray-600 text-xs mt-4">
          To update profile fields, use the AI coaching agent with the ai-coach MCP server.
        </p>
      </div>

      {/* Goal Race */}
      {(athlete.raceName || athlete.raceDate || athlete.raceDistanceKm || athlete.raceElevationM) && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">Goal Race</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <ProfileField label="Race" value={athlete.raceName} />
            <ProfileField label="Date" value={athlete.raceDate} />
            <ProfileField label="Distance" value={athlete.raceDistanceKm ? `${athlete.raceDistanceKm} km` : undefined} />
            <ProfileField label="Elevation" value={athlete.raceElevationM ? `${athlete.raceElevationM} m` : undefined} />
          </div>
        </div>
      )}

      {/* Strava Connection */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Strava Connection</h2>
        {stravaStatus?.connected ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-green-400 text-sm">Connected</span>
              {stravaStatus.stravaAthleteId && (
                <span className="text-gray-500 text-xs">(Strava ID: {stravaStatus.stravaAthleteId})</span>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Strava is connected. Go to Activities to sync your runs.
            </p>
            <a
              href={stravaConnectUrl}
              className="inline-block px-4 py-2 border border-orange-600 text-orange-400 hover:bg-orange-900 text-sm rounded-lg transition-colors"
            >
              Reconnect Strava
            </a>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-gray-500 rounded-full" />
              <span className="text-gray-400 text-sm">Not connected</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Connect your Strava account to sync running activities.
            </p>
            <a
              href={stravaConnectUrl}
              className="inline-block px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
            >
              Connect Strava
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function ProfileField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <span className="text-gray-500 text-xs">{label}</span>
      <p className="text-gray-300 font-medium">{value ?? '—'}</p>
    </div>
  )
}
