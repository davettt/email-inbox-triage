import { useEffect, useState } from 'react'
import { useEmailStore } from './stores/emailStore'
import Header from './components/Header'
import ActionSection from './components/ActionSection'
import DigestSection from './components/DigestSection'
import NoiseSection from './components/NoiseSection'

export default function App() {
  const { loadEmails, emails, error, clearError } = useEmailStore()
  const [buildStale, setBuildStale] = useState(false)

  useEffect(() => {
    void loadEmails()
    void fetch('/api/build-status')
      .then((r) => r.json())
      .then((d) => setBuildStale(d.stale === true))
      .catch(() => {})
  }, [loadEmails])

  const actionEmails = emails.filter((e) => e.importance === 'action')
  const loopEmails = emails.filter((e) => e.importance === 'loop')
  const noiseEmails = emails.filter((e) => e.importance === 'noise')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-2xl space-y-8 px-4 py-6">
        {buildStale && (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Source files have changed since the last build. Run{' '}
            <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">
              npm run restart:pm2
            </code>{' '}
            to apply updates.
          </div>
        )}
        {error && (
          <div className="flex items-start justify-between rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="ml-3 shrink-0 text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        )}
        <ActionSection emails={actionEmails} />
        <DigestSection emails={loopEmails} />
        <NoiseSection emails={noiseEmails} />
      </main>
    </div>
  )
}
