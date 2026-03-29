import { google } from 'googleapis'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TOKEN_PATH = path.join(__dirname, '../local_data/gmail_token.json')
const CREDENTIALS_PATH = path.join(
  __dirname,
  '../local_data/gmail_credentials.json'
)

async function getOAuth2Client() {
  const credRaw = await fs.readFile(CREDENTIALS_PATH, 'utf8')
  const creds = JSON.parse(credRaw)
  const { client_id, client_secret } = creds.installed ?? creds.web

  const oauth2 = new google.auth.OAuth2(
    client_id,
    client_secret,
    'http://localhost:3099/callback'
  )

  const tokenRaw = await fs.readFile(TOKEN_PATH, 'utf8').catch(() => null)
  if (!tokenRaw) {
    throw new Error('No Gmail token found. Run: npm run auth')
  }

  const tokenData = JSON.parse(tokenRaw)

  // Handle both Python google-auth format and Node.js googleapis format
  const nodeToken = {
    access_token: tokenData.access_token ?? tokenData.token,
    refresh_token: tokenData.refresh_token,
    token_type: tokenData.token_type ?? 'Bearer',
    expiry_date:
      tokenData.expiry_date ??
      (tokenData.expiry ? new Date(tokenData.expiry).getTime() : undefined),
  }

  oauth2.setCredentials(nodeToken)

  // Persist refreshed tokens automatically
  oauth2.on('tokens', async (tokens) => {
    try {
      const existing = JSON.parse(
        await fs.readFile(TOKEN_PATH, 'utf8').catch(() => '{}')
      )
      await fs.writeFile(TOKEN_PATH, JSON.stringify({ ...existing, ...tokens }))
    } catch {
      // Non-fatal
    }
  })

  return oauth2
}

function decodeBody(data) {
  if (!data) return ''
  return Buffer.from(data, 'base64url').toString('utf-8')
}

function extractBody(payload) {
  if (!payload) return ''

  if (payload.parts) {
    let plainText = ''
    let htmlText = ''
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        plainText += decodeBody(part.body.data)
      } else if (
        part.mimeType === 'text/html' &&
        part.body?.data &&
        !plainText
      ) {
        htmlText += decodeBody(part.body.data)
      } else if (part.parts) {
        const nested = extractBody(part)
        if (nested) plainText += nested
      }
    }
    return plainText || htmlText
  }

  return decodeBody(payload.body?.data)
}

function extractSenderInfo(fromHeader) {
  if (!fromHeader) return { name: 'Unknown', email: '' }
  const match = fromHeader.match(/^"?([^"<]+?)"?\s*<([^>]+)>$/)
  if (match && match[1] && match[2]) {
    return { name: match[1].trim(), email: match[2].trim() }
  }
  const email = fromHeader.trim()
  return { name: email.split('@')[0] ?? email, email }
}

function extractUnsubscribeUrl(header) {
  if (!header) return null
  // Prefer HTTPS link, fall back to mailto
  const httpsMatch = header.match(/<(https?:\/\/[^>]+)>/)
  if (httpsMatch?.[1]) return httpsMatch[1]
  const mailtoMatch = header.match(/<(mailto:[^>]+)>/)
  return mailtoMatch?.[1] ?? null
}

function extractOriginalSender(body) {
  if (!body) return null

  const patterns = [
    /(?:-+\s*Forwarded message\s*-+|Begin forwarded message:)[\s\S]*?From:\s*([^<\n]+?)\s*<([^>\n]+)>/i,
    /From:\s*([^<\n]+?)\s*<([^>\n]+)>\s*(?:Sent|Date):/i,
    /From:\s*([^<\n]+?)\s*<([^>\n]+)>/i,
  ]

  for (const pattern of patterns) {
    const match = body.match(pattern)
    if (match?.[1] && match[2]) {
      const name = match[1].trim().replace(/^["']|["']$/g, '')
      const email = match[2].trim()
      return { name, email }
    }
  }

  return null
}

export async function fetchUnreadEmails(maxResults = 50) {
  const auth = await getOAuth2Client()
  const gmail = google.gmail({ version: 'v1', auth })

  const listRes = await gmail.users.messages.list({
    userId: 'me',
    labelIds: ['INBOX', 'UNREAD'],
    maxResults,
  })

  const messages = listRes.data.messages ?? []
  const emails = []

  for (const msg of messages) {
    try {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full',
      })

      const headers = {}
      for (const h of detail.data.payload?.headers ?? []) {
        headers[h.name.toLowerCase()] = h.value
      }

      const body = extractBody(detail.data.payload ?? {})
      const from = extractSenderInfo(headers['from'] ?? '')
      const originalFrom = extractOriginalSender(body)
      const unsubscribeUrl = extractUnsubscribeUrl(
        headers['list-unsubscribe'] ?? ''
      )

      emails.push({
        id: msg.id,
        from,
        originalFrom:
          originalFrom && originalFrom.email !== from.email
            ? originalFrom
            : null,
        subject: headers['subject'] ?? '(No Subject)',
        date: headers['date'] ?? new Date().toISOString(),
        snippet: detail.data.snippet ?? '',
        unsubscribeUrl,
        bodyPreview: body.slice(0, 8000),
        body: body.slice(0, 2000),
      })
    } catch (err) {
      console.warn(`Skipping message ${msg.id}:`, err.message)
    }
  }

  return emails
}

export async function trashEmail(messageId) {
  const auth = await getOAuth2Client()
  const gmail = google.gmail({ version: 'v1', auth })
  await gmail.users.messages.trash({ userId: 'me', id: messageId })
}

export async function archiveEmail(messageId) {
  const auth = await getOAuth2Client()
  const gmail = google.gmail({ version: 'v1', auth })
  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: { removeLabelIds: ['UNREAD', 'INBOX'] },
  })
}
