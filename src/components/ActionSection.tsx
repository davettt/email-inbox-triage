import type { ProcessedEmail } from '../types'
import EmailCard from './EmailCard'
import { useEmailStore } from '../stores/emailStore'

interface Props {
  emails: ProcessedEmail[]
}

export default function ActionSection({ emails }: Props) {
  const { loading } = useEmailStore()

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Action needed
        </h2>
        {emails.length > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            {emails.length}
          </span>
        )}
      </div>

      {loading && emails.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
          Loading…
        </div>
      ) : emails.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
          No action items
        </div>
      ) : (
        <div className="space-y-3">
          {emails.map((email) => (
            <EmailCard key={email.id} email={email} />
          ))}
        </div>
      )}
    </section>
  )
}
