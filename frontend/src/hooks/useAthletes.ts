import { useState, useEffect } from 'react'
import { athleteApi } from '../api/athleteApi'
import { Athlete } from '../types/athlete'

export function useAthletes() {
  const [data, setData] = useState<Athlete[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await athleteApi.list()
      setData(result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load athletes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  return { data, loading, error, reload: load }
}

export function useAthlete(athleteId: number | undefined) {
  const [data, setData] = useState<Athlete | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!athleteId) { setLoading(false); return }
    setLoading(true)
    athleteApi.get(athleteId)
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load athlete'))
      .finally(() => setLoading(false))
  }, [athleteId])

  return { data, loading, error }
}
