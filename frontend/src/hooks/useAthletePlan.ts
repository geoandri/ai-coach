import { useState, useEffect } from 'react'
import { athleteApi } from '../api/athleteApi'
import { TrainingPlan } from '../types/plan'

export function useAthletePlan(athleteId: number | undefined) {
  const [data, setData] = useState<TrainingPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!athleteId) { setLoading(false); return }
    setLoading(true)
    athleteApi.getPlan(athleteId)
      .then(setData)
      .catch((e: unknown) => {
        const status = (e as { response?: { status?: number } })?.response?.status
        if (status === 404) {
          setData(null)
          setError(null)
        } else {
          setError(e instanceof Error ? e.message : 'Failed to load plan')
        }
      })
      .finally(() => setLoading(false))
  }, [athleteId])

  return { data, loading, error }
}
