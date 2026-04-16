import { useState } from 'react'
import { useActivities } from '../hooks/useActivities'
import { ActivityList } from '../components/ActivityList'
import { activitiesApi } from '../api/activitiesApi'

export default function Activities() {
  const { data, loading, error, page, setPage, reload } = useActivities()
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)

  const handleSync = async () => {
    setSyncing(true)
    setSyncMsg(null)
    try {
      const result = await activitiesApi.sync()
      setSyncMsg(result.message)
      reload()
    } catch (e: unknown) {
      setSyncMsg(e instanceof Error ? e.message : 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Activities</h1>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 text-white text-sm rounded-lg transition-colors"
        >
          {syncing ? 'Syncing...' : 'Sync from Strava'}
        </button>
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
