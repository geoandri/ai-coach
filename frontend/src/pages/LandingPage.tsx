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
          generates periodized training plans, and tracks week-by-week adherence. The AI runs
          entirely in Claude — this UI is the coaching dashboard. Strava integration is optional —
          it lets the coach import your training history automatically, but the app works fully
          without it.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white">How it works</h2>

        <Step number={1} title="Configure the MCP server">
          <p className="text-gray-400 text-sm">
            The MCP server starts automatically alongside the app and is reachable at{' '}
            <code className="text-orange-400 text-xs">http://localhost:3001/mcp</code>.
            In Claude Desktop, open <span className="text-white font-medium">Settings → Developer → Edit Config</span> to
            open the config file, then add the following:
          </p>
          <Code>{`{
  "mcpServers": {
    "ai-coach": {
      "command": "npx",
      "args": ["mcp-remote", "http://localhost:3001/mcp"]
    }
  }
}`}</Code>
          <p className="text-gray-400 text-sm mt-3">
            For Claude Code, run once:
          </p>
          <Code>{`claude mcp add --transport http ai-coach http://localhost:3001/mcp`}</Code>
          <p className="text-gray-500 text-xs mt-2">
            Make sure the app is running before starting a coaching session.
          </p>
        </Step>

        <Step number={2} title="Select a coach persona in Claude">
          <p className="text-gray-400 text-sm mb-3">
            The MCP server exposes coach personas as named prompts. Selecting one injects the full
            coaching instructions — role, information-gathering workflow, plan generation logic, and
            tone — into Claude's context. Without this step Claude has the tools but no coaching behaviour.
          </p>
          <div className="space-y-2">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <p className="text-white text-xs font-semibold mb-2">Claude Desktop</p>
              <ol className="text-gray-400 text-xs space-y-1.5 list-none">
                <li><span className="text-orange-400 font-medium">1.</span> Start a new conversation</li>
                <li><span className="text-orange-400 font-medium">2.</span> Click the <span className="text-white font-medium">Add from AI Coach</span> option in the connector menu (the plug icon near the message input)</li>
                <li><span className="text-orange-400 font-medium">3.</span> Choose a coach persona from the list (e.g. <code className="text-orange-400">trail-running-coach</code>)</li>
              </ol>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <p className="text-white text-xs font-semibold mb-1">Claude Code</p>
              <p className="text-gray-400 text-xs mb-1">
                Type <code className="text-orange-400">/</code> to browse available prompts, or load one directly using the double-underscore format:
              </p>
              <code className="text-green-300 text-xs">/mcp__ai-coach__trail-running-coach</code>
            </div>
          </div>
        </Step>

        <Step number={3} title="Start coaching">
          <p className="text-gray-400 text-sm">
            Claude will ask for the athlete's name, load their profile if one exists, and guide the
            session from there. New athletes are created through the conversation; their profiles and
            training plans appear here automatically. If Strava is connected the coach will import
            your training history automatically — otherwise it will ask a few questions instead.
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
        <h2 className="text-lg font-semibold text-white mb-1">Available coach personas</h2>        <p className="text-gray-400 text-sm mb-4">
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
          <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
            <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
            <div>
              <p className="text-white text-sm font-medium">road-running-coach</p>
              <p className="text-gray-400 text-xs mt-0.5">
                Road running coach specialised in 5 km, 10 km, half-marathon, and marathon. Covers Strava intake, distance-specific periodized plans, race day strategy, and ongoing check-ins.
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

      {/* Disclaimer */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 mb-2">Disclaimer</h2>
        <p className="text-gray-500 text-xs leading-relaxed">
          AI Coach uses large language models to generate training plans and coaching advice.
          The output is intended as a starting point and a coaching aid —{' '}
          <span className="text-gray-400">not a substitute for professional advice from a
          certified coach, physician, or physiotherapist</span>. Always use your own judgement
          before following any training recommendation. If you have a medical condition, injury,
          or health concern, consult a qualified professional before starting or modifying a
          training programme.
        </p>
      </div>

    </div>
  )
}
