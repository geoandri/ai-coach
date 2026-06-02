import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAthleteActivities } from '../hooks/useAthleteActivities'
import { useAthlete } from '../hooks/useAthletes'
import { ActivityList } from '../components/ActivityList'
import { athleteApi } from '../api/athleteApi'

export default function AthleteActivities() {
  const { athleteId } = useParams<{ athleteId: string }>()
  const id = athleteId ? Number(athleteId) : undefined
  const { data, loading, error, page, setPage, reload } = useAthleteActivities(id)
  const { data: athlete } = useAthlete(id)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<'strava' | 'intervals_icu' | undefined>(undefined)

  const bothActive = Boolean(athlete?.stravaEnabled && athlete?.intervalsIcuEnabled)

  const handleSync = async () => {
    if (!id) return
    if (bothActive && !selectedProvider) {
      setSyncMsg('Please select a provider to sync from.')
      return
    }
    setSyncing(true)
    setSyncMsg(null)
    try {
      const result = await athleteApi.syncActivities(id, selectedProvider)
      setSyncMsg(result.message)
      reload()
    } catch (e: unknown) {
      setSyncMsg(e instanceof Error ? e.message : 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  function syncButtonLabel() {
    if (syncing) return 'Syncing...'
    if (bothActive) {
      if (selectedProvider === 'strava') return 'Sync from Strava'
      if (selectedProvider === 'intervals_icu') return 'Sync from intervals.icu'
      return 'Sync...'
    }
    if (athlete?.intervalsIcuEnabled) return 'Sync from intervals.icu'
    return 'Sync from Strava'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Activities</h1>
        <div className="flex items-center gap-2">
          {bothActive && (
            <>
              <button
                onClick={() => setSelectedProvider('strava')}
                className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                  selectedProvider === 'strava'
                    ? 'bg-orange-600 border-orange-600 text-white'
                    : 'border-gray-600 text-gray-400 hover:border-orange-600 hover:text-orange-400'
                }`}
              >
                Strava
              </button>
              <button
                onClick={() => setSelectedProvider('intervals_icu')}
                className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                  selectedProvider === 'intervals_icu'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-600 text-gray-400 hover:border-blue-600 hover:text-blue-400'
                }`}
              >
                intervals.icu
              </button>
            </>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 text-white text-sm rounded-lg transition-colors"
          >
            {syncButtonLabel()}
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded-lg mb-4 text-sm">
          {syncMsg}
        </div>
      )}

      {loading && <p className="text-gray-400 text-center py-20">Loading activities...</p>}
      {error && <p className="text-red-400 text-center py-20">{error}</p>}

      {data && (
        <>
          <ActivityList activities={data.content} />
          {data.totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-800 disabled:opacity-50 rounded-lg text-sm"
              >
                Previous
              </button>
              <span className="text-gray-400 text-sm py-2">
                Page {page + 1} of {data.totalPages} ({data.totalElements} total)
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                disabled={page >= data.totalPages - 1}
                className="px-4 py-2 bg-gray-800 disabled:opacity-50 rounded-lg text-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
