import { NavLink } from 'react-router-dom'

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 text-white text-sm font-bold flex items-center justify-center">
        {number}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-white mb-2">{title}</p>
        {children}
      </div>
    </div>
  )
}

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-gray-800 border border-gray-700 rounded-lg p-4 mt-2 text-xs overflow-x-auto text-green-300 leading-relaxed">
      {children}
    </pre>
  )
}

export default function LandingPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Hero */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-3">Welcome to AI Coach</h1>
        <p className="text-gray-400 text-base leading-relaxed">
          AI Coach is a platform where an AI agent acts as a personal coach. It interviews athletes,
          pulls their training history from Strava, generates periodized training plans, and tracks
          week-by-week adherence. The AI runs entirely in Claude — this UI is the coaching dashboard.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white">How it works</h2>

        <Step number={1} title="Start the platform">
          <p className="text-gray-400 text-sm">
            Run the Docker stack — this starts the backend, database, and serves this UI.
          </p>
          <Code>{`docker compose -f docker-compose.prod.yml up -d`}</Code>
        </Step>

        <Step number={2} title="Configure the MCP server">
          <p className="text-gray-400 text-sm">
            The MCP server connects Claude to the platform. Build it once, then add it to your
            Claude Desktop config at{' '}
            <code className="text-orange-400 text-xs">
              ~/Library/Application Support/Claude/claude_desktop_config.json
            </code>
            :
          </p>
          <Code>{`cd mcp && npm install && npm run build`}</Code>
          <Code>{`{
  "mcpServers": {
    "ai-coach": {
      "command": "node",
      "args": ["/absolute/path/to/ai_coach/mcp/dist/index.js"],
      "env": { "BACKEND_URL": "http://localhost:8080/api" }
    }
  }
}`}</Code>
          <p className="text-gray-500 text-xs mt-2">
            For Claude Code: <code className="text-orange-400">claude mcp add ai-coach -- node /absolute/path/to/ai_coach/mcp/dist/index.js</code>
          </p>
        </Step>

        <Step number={3} title="Select a coach persona in Claude">
          <p className="text-gray-400 text-sm">
            The MCP server exposes coach personas as named prompts. In Claude Desktop, open a new
            conversation, type <code className="text-orange-400 text-xs font-mono">@ai-coach</code> and
            select a persona from the list (e.g. <span className="text-white">trail-running-coach</span>).
            Claude will load the full coaching instructions as its context.
          </p>
          <div className="bg-orange-900/20 border border-orange-700/40 rounded-lg p-3 mt-3">
            <p className="text-orange-300 text-xs font-medium mb-1">What this does</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              Selecting a persona injects the coaching instructions — role, information-gathering
              workflow, plan generation logic, and tone — into Claude's context. Without this step
              Claude has the tools but no coaching behaviour.
            </p>
          </div>
        </Step>

        <Step number={4} title="Start coaching">
          <p className="text-gray-400 text-sm">
            Claude will ask for the athlete's name, load their profile if one exists, and guide the
            session from there. New athletes are created through the conversation; their profiles and
            training plans appear here automatically.
          </p>
          <NavLink
            to="/athletes"
            className="inline-block mt-3 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            View Athletes
          </NavLink>
        </Step>
      </div>

      {/* Personas */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-1">Available coach personas</h2>
        <p className="text-gray-400 text-sm mb-4">
          Each persona defines a coaching role, information-gathering workflow, and plan generation
          logic for a specific sport. They are served automatically by the MCP server from{' '}
          <code className="text-orange-400 text-xs">docs/personas/</code>.
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
            <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
            <div>
              <p className="text-white text-sm font-medium">trail-running-coach</p>
              <p className="text-gray-400 text-xs mt-0.5">
                Expert trail running and ultramarathon coach. Covers Strava intake, periodized plan
                generation, race day strategy, and ongoing check-ins.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div className="w-2 h-2 rounded-full bg-gray-600 mt-1.5 flex-shrink-0" />
            <div>
              <p className="text-gray-500 text-sm font-medium">More personas coming</p>
              <p className="text-gray-600 text-xs mt-0.5">
                Add a new file to <code className="text-gray-500">docs/personas/</code> using the
                provided template and it will appear here automatically on next MCP server restart.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
