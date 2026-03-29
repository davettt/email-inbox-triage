import { useEffect, useRef, useState } from 'react'
import type { ProcessedEmail } from '../types'
import EmailCard from './EmailCard'
import { useEmailStore } from '../stores/emailStore'

interface Props {
  emails: ProcessedEmail[]
}

export default function DigestSection({ emails }: Props) {
  const { loading, bulkArchive, bulkDelete } = useEmailStore()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const selectAllRef = useRef<HTMLInputElement>(null)

  const allSelected = emails.length > 0 && selectedIds.size === emails.length
  const someSelected = selectedIds.size > 0 && !allSelected

  // Keep indeterminate state in sync
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected
    }
  }, [someSelected])

  // Drop selections for emails that are removed
  useEffect(() => {
    const emailIds = new Set(emails.map((e) => e.id))
    setSelectedIds(
      (prev) => new Set([...prev].filter((id) => emailIds.has(id)))
    )
  }, [emails])

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(emails.map((e) => e.id)))
  }

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleBulkArchive = async () => {
    await bulkArchive([...selectedIds])
    setSelectedIds(new Set())
  }

  const handleBulkDelete = async () => {
    await bulkDelete([...selectedIds])
    setSelectedIds(new Set())
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {emails.length > 0 && (
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-blue-600"
            />
          )}
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            In the loop
          </h2>
          {emails.length > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
              {emails.length}
            </span>
          )}
        </div>

        {selectedIds.size > 0 && (
          <div className="flex gap-3">
            <button
              onClick={() => void handleBulkArchive()}
              className="text-xs text-gray-500 transition-colors hover:text-gray-700"
            >
              Archive ({selectedIds.size})
            </button>
            <button
              onClick={() => void handleBulkDelete()}
              className="text-xs text-red-400 transition-colors hover:text-red-600"
            >
              Delete ({selectedIds.size})
            </button>
          </div>
        )}
      </div>

      {loading && emails.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
          Loading…
        </div>
      ) : emails.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
          Nothing to catch up on
        </div>
      ) : (
        <div className="space-y-3">
          {emails.map((email) => (
            <EmailCard
              key={email.id}
              email={email}
              compact
              showCheckbox
              isSelected={selectedIds.has(email.id)}
              onToggle={() => toggleOne(email.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
