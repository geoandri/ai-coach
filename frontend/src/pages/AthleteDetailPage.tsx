import { useParams, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAthlete } from '../hooks/useAthletes'

function TabLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
          isActive
            ? 'border-orange-500 text-orange-400'
            : 'border-transparent text-gray-400 hover:text-white'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export default function AthleteDetailPage() {
  const { athleteId } = useParams<{ athleteId: string }>()
  const id = athleteId ? Number(athleteId) : undefined
  const { data: athlete, loading } = useAthlete(id)
  const navigate = useNavigate()

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          ← Athletes
        </button>
        <span className="text-gray-600">/</span>
        <span className="text-white font-medium">
          {loading ? '...' : (athlete?.name ?? 'Athlete')}
        </span>
      </div>

      <div className="border-b border-gray-800 mb-6 flex gap-0">
        <TabLink to={`/athletes/${athleteId}`} label="Dashboard" />
        <TabLink to={`/athletes/${athleteId}/plan`} label="Training Plan" />
        <TabLink to={`/athletes/${athleteId}/activities`} label="Activities" />
        <TabLink to={`/athletes/${athleteId}/settings`} label="Settings" />
      </div>

      <Outlet />
    </div>
  )
}
