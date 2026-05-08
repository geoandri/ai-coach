import { useState, useEffect } from 'react'
import { authApi } from '../api/authApi'
import { useSearchParams } from 'react-router-dom'

export default function Settings() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<{ connected: boolean; athleteId?: number } | null>(null)
  const [loading, setLoading] = useState(true)

  const connected = searchParams.get('connected')
  const error = searchParams.get('error')

  useEffect(() => {
    authApi.getStatus()
      .then(setStatus)
      .catch(() => setStatus({ connected: false }))
      .finally(() => setLoading(false))
  }, [connected])

  const stravaConnectUrl = import.meta.env.VITE_STRAVA_CONNECT_URL ?? '/api/auth/strava'

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

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

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Strava Connection</h2>

        {loading ? (
          <p className="text-gray-400">Checking status...</p>
        ) : status?.connected ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-green-400 text-sm">Connected</span>
              {status.athleteId && <span className="text-gray-500 text-xs">(Athlete ID: {status.athleteId})</span>}
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Your Strava account is connected. Go to the Activities page to sync your runs.
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
              Connect your Strava account to sync running activities and track plan adherence.
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

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-4">
        <h2 className="text-lg font-semibold mb-3">About</h2>
        <p className="text-gray-400 text-sm">
          Personal training dashboard for <strong className="text-white">Zagori TeRA 60km / +4,000m</strong> on July 18, 2026.
          Tune-up race: Evrytania Trail 42km on May 31, 2026.
        </p>
        <p className="text-gray-500 text-xs mt-3">
          Plan: 15 weeks (Apr 9 – Jul 18, 2026) · Target: Sub-10 hours
        </p>
      </div>
    </div>
  )
}
