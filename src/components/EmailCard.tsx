import { useState } from 'react'
import type { ProcessedEmail } from '../types'
import { useEmailStore } from '../stores/emailStore'

interface Props {
  email: ProcessedEmail
  compact?: boolean
  showCheckbox?: boolean
  isSelected?: boolean
  onToggle?: () => void
}

export default function EmailCard({
  email,
  compact = false,
  showCheckbox = false,
  isSelected = false,
  onToggle,
}: Props) {
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
    <div
      className={`rounded-lg border bg-white p-4 shadow-sm transition-colors ${
        isSelected ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {showCheckbox && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            className="mt-0.5 h-4 w-4 cursor-pointer rounded border-gray-300 accent-blue-600"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-sm font-medium text-gray-900">
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
              <p className="mt-0.5 text-sm leading-snug text-gray-700">
                {email.subject}
              </p>
            </div>
            <span className="shrink-0 text-xs text-gray-400">{date}</span>
          </div>
        </div>
      </div>

      <p
        className={`mt-2 text-sm leading-relaxed text-gray-600 ${showCheckbox ? 'ml-7' : ''}`}
      >
        {email.summary}
      </p>

      {!compact && email.actions.length > 0 && (
        <ul className={`mt-2.5 space-y-1 ${showCheckbox ? 'ml-7' : ''}`}>
          {email.actions.map((action, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-gray-700"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
              {action}
            </li>
          ))}
        </ul>
      )}

      {email.bodyPreview && (
        <div className={showCheckbox ? 'ml-7' : ''}>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-xs text-gray-400 transition-colors hover:text-gray-600"
          >
            {expanded ? '↑ Show less' : '↓ Show more'}
          </button>
          {expanded && (
            <div className="mt-2 whitespace-pre-line break-words rounded-md bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
              {email.bodyPreview}
            </div>
          )}
        </div>
      )}

      <div
        className={`mt-3 flex justify-end gap-1 ${showCheckbox ? 'ml-7' : ''}`}
      >
        {email.unsubscribeUrl && (
          <a
            href={email.unsubscribeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded px-2.5 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            Unsubscribe
          </a>
        )}
        <button
          onClick={() => void archiveEmail(email.id)}
          className="rounded px-2.5 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-100"
        >
          Archive
        </button>
        <button
          onClick={() => void deleteEmail(email.id)}
          className="rounded px-2.5 py-1 text-xs text-red-500 transition-colors hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
