import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAthletePlan } from '../hooks/useAthletePlan'
import { WeekAccordion } from '../components/WeekAccordion'
import { athleteApi } from '../api/athleteApi'

export default function AthletePlanView() {
  const { athleteId } = useParams<{ athleteId: string }>()
  const id = athleteId ? Number(athleteId) : undefined
  const { data, loading, error } = useAthletePlan(id)
  const [downloading, setDownloading] = useState<'quick' | 'full' | null>(null)

  const handleDownload = async (type: 'quick' | 'full') => {
    if (!id || !data) return
    setDownloading(type)
    try {
      if (type === 'quick') {
        await athleteApi.downloadQuickPdf(id, data.id)
      } else {
        await athleteApi.downloadFullPdf(id, data.id)
      }
    } catch (e) {
      console.error('PDF download failed', e)
    } finally {
      setDownloading(null)
    }
  }

  if (loading) return <div className="text-gray-400 text-center py-20">Loading training plan...</div>
  if (error) return <p className="text-red-400 text-center py-20">{error}</p>
  if (!data) return (
    <div className="text-center py-20">
      <p className="text-gray-400 mb-2">No training plan yet.</p>
      <p className="text-gray-500 text-sm">Use the AI coaching agent to create one.</p>
    </div>
  )

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{data.name}</h1>
          <div className="flex gap-6 mt-2 text-sm text-gray-400">
            {data.raceName && <span>🏁 {data.raceName} — {data.raceDate}</span>}
            {data.tuneUpRaceName && <span>⚡ {data.tuneUpRaceName} — {data.tuneUpRaceDate}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleDownload('quick')}
            disabled={downloading !== null}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800/50 text-sm text-gray-300 rounded-lg transition-colors"
          >
            {downloading === 'quick' ? 'Generating...' : 'Quick PDF'}
          </button>
          <button
            onClick={() => handleDownload('full')}
            disabled={downloading !== null}
            className="px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 text-sm text-white rounded-lg transition-colors"
          >
            {downloading === 'full' ? 'Generating...' : 'Full Plan PDF'}
          </button>
        </div>
      </div>
      <div>
        {data.weeks.map(week => (
          <WeekAccordion key={week.weekNumber} week={week} />
        ))}
      </div>
    </div>
  )
}
