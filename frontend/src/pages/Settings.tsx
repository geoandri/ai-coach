export default function Settings() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
        <h2 className="text-lg font-semibold mb-3">intervals.icu Global Credentials</h2>
        <p className="text-gray-400 text-sm mb-3">
          You can set server-level intervals.icu credentials in your <code className="text-orange-400 text-xs">.env</code> file.
          This lets the coach sync activity data immediately after creating a new athlete profile,
          before per-athlete credentials are entered in the athlete's Settings page.
        </p>
        <pre className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs text-green-300 mb-3">{`INTERVALS_ICU_ATHLETE_ID=i12345
INTERVALS_ICU_API_KEY=your_api_key`}</pre>
        <p className="text-gray-500 text-xs">
          Find your Athlete ID and API key at{' '}
          <a
            href="https://intervals.icu/settings"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            intervals.icu/settings
          </a>{' '}
          under <span className="text-gray-400">API Access</span>.
          Per-athlete credentials (set in each athlete's Settings page) take priority over these global values.
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-3">About</h2>
        <p className="text-gray-400 text-sm">
          Personal training dashboard for <strong className="text-white">Zagori TeRA 60km / +4,000m</strong> on July 18, 2026.
          Tune-up race: Evrytania Trail 42km on May 31, 2026.
        </p>
        <p className="text-gray-500 text-xs mt-3">
          Plan: 15 weeks (Apr 9 – Jul 18, 2026) · Target: Sub-10 hours
        </p>
      </div>
    </div>
  )
}
