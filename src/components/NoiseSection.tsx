import { useState } from 'react'
import type { ProcessedEmail } from '../types'
import { useEmailStore } from '../stores/emailStore'

interface Props {
  emails: ProcessedEmail[]
}

function NoiseCard({ email }: { email: ProcessedEmail }) {
  const { deleteEmail, archiveEmail } = useEmailStore()
  const [expanded, setExpanded] = useState(false)

  const sender = email.originalFrom ?? email.from
  const showVia =
    email.to?.email != null &&
    email.to.email.toLowerCase() !== 'dtiong.todoist@gmail.com'
  const date = new Date(email.date).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
  })

  return (
    <div className="rounded-lg border border-gray-100 bg-white px-4 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-xs font-medium text-gray-500">
              {sender.name}
            </span>
            <span className="truncate text-xs text-gray-400">
              {sender.email}
            </span>
            {showVia && (
              <span className="text-xs text-gray-300">
                · via {email.to?.email}
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-gray-400">
            {email.subject}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="mr-2 text-xs text-gray-300">{date}</span>
          <button
            onClick={() => void archiveEmail(email.id)}
            className="rounded px-2 py-0.5 text-xs text-gray-400 transition-colors hover:bg-gray-100"
          >
            Archive
          </button>
          <button
            onClick={() => void deleteEmail(email.id)}
            className="rounded px-2 py-0.5 text-xs text-red-400 transition-colors hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
      {email.bodyPreview && (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-xs text-gray-300 transition-colors hover:text-gray-500"
          >
            {expanded ? '↑ Show less' : '↓ Show more'}
          </button>
          {expanded && (
            <div className="mt-1.5 whitespace-pre-line break-words rounded-md bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">
              {email.bodyPreview}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function NoiseSection({ emails }: Props) {
  const { bulkDelete } = useEmailStore()
  const [open, setOpen] = useState(false)

  if (emails.length === 0) return null

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-300 transition-colors hover:text-gray-400"
        >
          <span>{open ? '▾' : '▸'}</span>
          <span>Noise</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-400">
            {emails.length}
          </span>
        </button>
        {open && emails.length > 1 && (
          <button
            onClick={() => void bulkDelete(emails.map((e) => e.id))}
            className="text-xs text-red-400 transition-colors hover:text-red-600"
          >
            Delete all
          </button>
        )}
      </div>

      {open && (
        <div className="space-y-2">
          {emails.map((email) => (
            <NoiseCard key={email.id} email={email} />
          ))}
        </div>
      )}
    </section>
  )
}
