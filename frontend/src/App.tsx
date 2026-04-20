import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import AthletesPage from './pages/AthletesPage'
import CreateAthletePage from './pages/CreateAthletePage'
import AthleteDetailPage from './pages/AthleteDetailPage'
import AthleteDashboard from './pages/AthleteDashboard'
import AthletePlanView from './pages/AthletePlanView'
import AthleteActivities from './pages/AthleteActivities'
import AthleteSettings from './pages/AthleteSettings'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950">
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-2">
          <NavLink
            to="/"
            className="text-orange-500 font-bold text-lg mr-6 hover:text-orange-400 transition-colors"
          >
            AI Coach
          </NavLink>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            Athletes
          </NavLink>
        </nav>
        <main className="p-6">
          <Routes>
            <Route path="/" element={<AthletesPage />} />
            <Route path="/athletes/new" element={<CreateAthletePage />} />
            <Route path="/athletes/:athleteId" element={<AthleteDetailPage />}>
              <Route index element={<AthleteDashboard />} />
              <Route path="plan" element={<AthletePlanView />} />
              <Route path="activities" element={<AthleteActivities />} />
              <Route path="settings" element={<AthleteSettings />} />
            </Route>
            {/* Legacy redirects */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/plan" element={<Navigate to="/" replace />} />
            <Route path="/activities" element={<Navigate to="/" replace />} />
            <Route path="/settings" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
