import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { WeekAdherence } from '../types/dashboard'

interface Props {
  weeks: WeekAdherence[]
}

export function AdherenceChart({ weeks }: Props) {
  const data = weeks.map(w => ({
    name: `W${w.weekNumber}`,
    planned: w.plannedKm,
    actual: w.isFutureWeek ? null : parseFloat(w.actualKm.toFixed(1)),
    isCurrentWeek: w.isCurrentWeek,
  }))

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h3 className="text-sm font-semibold text-gray-400 mb-4">Weekly Volume — Planned vs Actual (km)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#f9fafb' }}
            itemStyle={{ color: '#d1d5db' }}
          />
          <Bar dataKey="planned" name="Planned km" fill="#374151" radius={[3, 3, 0, 0]} />
          <Bar dataKey="actual" name="Actual km" radius={[3, 3, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.isCurrentWeek ? '#f97316' : entry.actual !== null && entry.planned > 0 && (entry.actual / entry.planned) >= 0.9 ? '#22c55e' : '#3b82f6'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
