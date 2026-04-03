import { Router } from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { fetchUnreadEmails, trashEmail, archiveEmail } from '../gmail.js'
import { triageEmails } from '../triage.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = path.join(
  __dirname,
  '../../local_data/processed_emails.json'
)

const router = Router()

async function loadCache() {
  try {
    const raw = await fs.readFile(CACHE_PATH, 'utf8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

async function saveCache(emails) {
  await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true })
  await fs.writeFile(CACHE_PATH, JSON.stringify(emails, null, 2))
}

// GET /api/emails — return cached processed emails
router.get('/', async (_req, res) => {
  try {
    const emails = await loadCache()
    res.json(emails)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// POST /api/emails/fetch — fetch unread from Gmail, triage new ones, return all
router.post('/fetch', async (_req, res) => {
  try {
    const cached = await loadCache()
    const cachedIds = new Set(cached.map((e) => e.id))

    const gmailEmails = await fetchUnreadEmails(50)
    const newEmails = gmailEmails.filter((e) => !cachedIds.has(e.id))

    let processed = [...cached]

    if (newEmails.length > 0) {
      console.log(`Triaging ${newEmails.length} new email(s)…`)
      const triaged = await triageEmails(newEmails)

      const newProcessed = newEmails.map((email, i) => ({
        id: email.id,
        from: email.from,
        ...(email.to ? { to: email.to } : {}),
        ...(email.originalFrom ? { originalFrom: email.originalFrom } : {}),
        subject: email.subject,
        date: email.date,
        snippet: email.snippet,
        ...(email.unsubscribeUrl
          ? { unsubscribeUrl: email.unsubscribeUrl }
          : {}),
        ...(email.bodyPreview ? { bodyPreview: email.bodyPreview } : {}),
        summary: triaged[i]?.summary ?? '',
        actions: triaged[i]?.actions ?? [],
        importance: triaged[i]?.importance ?? 'loop',
        processedAt: new Date().toISOString(),
      }))

      // Prepend new emails (most recent first) — noise included so user can delete
      processed = [...newProcessed, ...cached]
      await saveCache(processed)
    }

    res.json(processed)
  } catch (err) {
    console.error('Fetch error:', err)
    res.status(500).json({ error: String(err) })
  }
})

// DELETE /api/emails/:id — trash in Gmail + remove from cache
router.delete('/:id', async (req, res) => {
  try {
    await trashEmail(req.params.id)
    const emails = await loadCache()
    await saveCache(emails.filter((e) => e.id !== req.params.id))
    res.json({ ok: true })
  } catch (err) {
    console.error('Delete error:', err)
    res.status(500).json({ error: String(err) })
  }
})

// POST /api/emails/bulk-archive — archive multiple emails at once
router.post('/bulk-archive', async (req, res) => {
  const { ids } = req.body
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids must be a non-empty array' })
  }
  try {
    await Promise.all(ids.map((id) => archiveEmail(id)))
    const emails = await loadCache()
    const idSet = new Set(ids)
    await saveCache(emails.filter((e) => !idSet.has(e.id)))
    res.json({ ok: true, archived: ids.length })
  } catch (err) {
    console.error('Bulk archive error:', err)
    res.status(500).json({ error: String(err) })
  }
})

// POST /api/emails/:id/archive — archive in Gmail + remove from cache
router.post('/:id/archive', async (req, res) => {
  try {
    await archiveEmail(req.params.id)
    const emails = await loadCache()
    await saveCache(emails.filter((e) => e.id !== req.params.id))
    res.json({ ok: true })
  } catch (err) {
    console.error('Archive error:', err)
    res.status(500).json({ error: String(err) })
  }
})

export default router
