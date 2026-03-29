import { useEmailStore } from '../stores/emailStore'

export default function Header() {
  const { fetchNewEmails, fetching, lastFetched, emails } = useEmailStore()

  const actionCount = emails.filter((e) => e.importance === 'action').length

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-gray-900">Inbox</h1>
            {actionCount > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                {actionCount} action{actionCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {lastFetched && (
            <p className="text-xs text-gray-400">
              Last fetched {new Date(lastFetched).toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={() => void fetchNewEmails()}
          disabled={fetching}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {fetching ? 'Fetching…' : 'Fetch emails'}
        </button>
      </div>
    </header>
  )
}
