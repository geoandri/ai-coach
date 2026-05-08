import { useNavigate } from 'react-router-dom'

export default function CreateAthletePage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">New Athlete</h1>
      </div>

      <div className="bg-orange-900/20 border border-orange-700/50 rounded-xl p-6 mb-6">
        <h2 className="text-orange-400 font-semibold mb-2">AI-First Onboarding</h2>
        <p className="text-gray-300 text-sm">
          Athletes are created through the AI coaching workflow using Claude with the ai-coach MCP server.
          This ensures all profile data is captured accurately through a guided conversation.
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
        <h2 className="text-lg font-semibold mb-4">How to Create an Athlete via Claude</h2>
        <ol className="space-y-4 text-sm text-gray-300">
          <li className="flex gap-3">
            <span className="text-orange-500 font-bold">1.</span>
            <div>
              <p className="font-medium text-white mb-1">Configure the MCP server</p>
              <p className="text-gray-400">Add the ai-coach MCP server to your Claude Desktop or Claude Code config:</p>
              <pre className="bg-gray-800 rounded p-3 mt-2 text-xs overflow-x-auto text-green-300">{`{
  "ai-coach": {
    "command": "node",
    "args": ["<project_root>/mcp/dist/index.js"],
    "env": { "BACKEND_URL": "http://localhost:8080/api" }
  }
}`}</pre>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-orange-500 font-bold">2.</span>
            <div>
              <p className="font-medium text-white mb-1">Start a coaching conversation</p>
              <p className="text-gray-400">Open Claude and describe the athlete:</p>
              <pre className="bg-gray-800 rounded p-3 mt-2 text-xs overflow-x-auto text-blue-300">{`"Create a new athlete profile for Maria. She's an advanced
trail runner targeting Zagori TeRA 60km in July 2026,
training 6 days/week, current volume ~90km/week."`}</pre>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-orange-500 font-bold">3.</span>
            <div>
              <p className="font-medium text-white mb-1">Generate a training plan</p>
              <p className="text-gray-400">Once the athlete is created, ask Claude to generate a plan:</p>
              <pre className="bg-gray-800 rounded p-3 mt-2 text-xs overflow-x-auto text-blue-300">{`"Create a 15-week training plan for Maria targeting
Zagori TeRA on July 18, 2026."`}</pre>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-orange-500 font-bold">4.</span>
            <div>
              <p className="font-medium text-white mb-1">View in the dashboard</p>
              <p className="text-gray-400">Navigate back to the Athletes page — the new athlete will appear with their plan.</p>
            </div>
          </li>
        </ol>
      </div>

      <button
        onClick={() => navigate('/')}
        className="text-sm text-gray-400 hover:text-white transition-colors"
      >
        ← Return to Athletes list
      </button>
    </div>
  )
}
