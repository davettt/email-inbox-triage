import { useState } from 'react'
import type { ProcessedEmail } from '../types'
import { useEmailStore } from '../stores/emailStore'

interface Props {
  emails: ProcessedEmail[]
}

export default function NoiseSection({ emails }: Props) {
  const { deleteEmail, archiveEmail, bulkDelete } = useEmailStore()
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
          {emails.map((email) => {
            const sender = email.originalFrom ?? email.from
            const date = new Date(email.date).toLocaleDateString('en-AU', {
              day: 'numeric',
              month: 'short',
            })
            return (
              <div
                key={email.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-gray-500">
                      {sender.name}
                    </span>
                    <span className="truncate text-xs text-gray-400">
                      {email.subject}
                    </span>
                  </div>
                </div>
                <div className="ml-3 flex shrink-0 items-center gap-1">
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
            )
          })}
        </div>
      )}
    </section>
  )
}
