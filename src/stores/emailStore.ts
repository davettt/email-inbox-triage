import { create } from 'zustand'
import type { ProcessedEmail } from '../types'
import { emailsDB } from '../utils/db'

interface EmailStore {
  emails: ProcessedEmail[]
  loading: boolean
  fetching: boolean
  error: string | null
  lastFetched: string | null
  loadEmails: () => Promise<void>
  fetchNewEmails: () => Promise<void>
  deleteEmail: (id: string) => Promise<void>
  archiveEmail: (id: string) => Promise<void>
  bulkArchive: (ids: string[]) => Promise<void>
  bulkDelete: (ids: string[]) => Promise<void>
  clearError: () => void
}

export const useEmailStore = create<EmailStore>((set, get) => ({
  emails: [],
  loading: false,
  fetching: false,
  error: null,
  lastFetched: null,

  loadEmails: async () => {
    set({ loading: true, error: null })

    // Render from IndexedDB immediately for instant display
    try {
      const cached = await emailsDB.getAll()
      if (cached.length > 0) {
        set({ emails: cached })
      }
    } catch {
      // Cache miss — continue to server fetch
    }

    // Sync from server (source of truth)
    try {
      const res = await fetch('/api/emails')
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const emails: ProcessedEmail[] = await res.json()
      if (emails.length > 0) {
        await emailsDB.putAll(emails)
        set({ emails, loading: false })
      } else {
        // Server cache is empty — keep IndexedDB state visible until user fetches fresh
        set({ loading: false })
      }
    } catch (err) {
      set({ error: String(err), loading: false })
    }
  },

  fetchNewEmails: async () => {
    set({ fetching: true, error: null })
    try {
      const res = await fetch('/api/emails/fetch', { method: 'POST' })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? `Server error: ${res.status}`)
      }
      const emails: ProcessedEmail[] = await res.json()
      await emailsDB.clear()
      await emailsDB.putAll(emails)
      set({ emails, fetching: false, lastFetched: new Date().toISOString() })
    } catch (err) {
      set({ error: String(err), fetching: false })
    }
  },

  deleteEmail: async (id: string) => {
    const previous = get().emails
    set({ emails: previous.filter((e) => e.id !== id) })
    try {
      const res = await fetch(`/api/emails/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Failed to delete: ${res.status}`)
      await emailsDB.delete(id)
    } catch (err) {
      set({ emails: previous, error: String(err) })
    }
  },

  archiveEmail: async (id: string) => {
    const previous = get().emails
    set({ emails: previous.filter((e) => e.id !== id) })
    try {
      const res = await fetch(`/api/emails/${id}/archive`, { method: 'POST' })
      if (!res.ok) throw new Error(`Failed to archive: ${res.status}`)
      await emailsDB.delete(id)
    } catch (err) {
      set({ emails: previous, error: String(err) })
    }
  },

  bulkArchive: async (ids: string[]) => {
    if (ids.length === 0) return
    const previous = get().emails
    const idSet = new Set(ids)
    set({ emails: previous.filter((e) => !idSet.has(e.id)) })
    try {
      const res = await fetch('/api/emails/bulk-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      if (!res.ok) throw new Error(`Failed to bulk archive: ${res.status}`)
      await Promise.all(ids.map((id) => emailsDB.delete(id)))
    } catch (err) {
      set({ emails: previous, error: String(err) })
    }
  },

  bulkDelete: async (ids: string[]) => {
    if (ids.length === 0) return
    const previous = get().emails
    const idSet = new Set(ids)
    set({ emails: previous.filter((e) => !idSet.has(e.id)) })
    try {
      await Promise.all(
        ids.map((id) => fetch(`/api/emails/${id}`, { method: 'DELETE' }))
      )
      await Promise.all(ids.map((id) => emailsDB.delete(id)))
    } catch (err) {
      set({ emails: previous, error: String(err) })
    }
  },

  clearError: () => set({ error: null }),
}))
