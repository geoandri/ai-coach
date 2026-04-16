import { useState, useEffect } from 'react'
import { dashboardApi } from '../api/dashboardApi'
import { DashboardSummary } from '../types/dashboard'

export function useDashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await dashboardApi.getSummary()
      setData(result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  return { data, loading, error, reload: load }
}
