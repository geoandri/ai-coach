import { useState, useEffect, useCallback } from 'react'
import { activitiesApi } from '../api/activitiesApi'
import { Activity, PagedResponse } from '../types/activity'

export function useActivities() {
  const [data, setData] = useState<PagedResponse<Activity> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)

  const load = useCallback(async (p: number) => {
    setLoading(true)
    setError(null)
    try {
      const result = await activitiesApi.list(p)
      setData(result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load activities')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [page, load])

  return { data, loading, error, page, setPage, reload: () => load(page) }
}
