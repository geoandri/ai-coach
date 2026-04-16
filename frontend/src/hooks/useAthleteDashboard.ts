import { useState, useEffect } from 'react'
import { athleteApi } from '../api/athleteApi'
import { DashboardSummary } from '../types/dashboard'

export function useAthleteDashboard(athleteId: number | undefined) {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!athleteId) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const result = await athleteApi.getDashboard(athleteId)
      setData(result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [athleteId])
  return { data, loading, error, reload: load }
}
