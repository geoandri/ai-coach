import { useState, useEffect } from 'react'
import { planApi } from '../api/planApi'
import { TrainingPlan } from '../types/plan'

export function usePlan() {
  const [data, setData] = useState<TrainingPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    planApi.getFullPlan()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load plan'))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}
