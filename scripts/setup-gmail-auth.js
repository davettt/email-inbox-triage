/**
 * One-time Gmail OAuth2 setup script.
 * Run: npm run auth
 *
 * Prerequisites:
 * - Download OAuth2 credentials from Google Cloud Console into local_data/gmail_credentials.json
 */
import { google } from 'googleapis'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'http'
import { URL } from 'url'
import open from 'open'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TOKEN_PATH = path.join(__dirname, '../local_data/gmail_token.json')
const CREDENTIALS_PATH = path.join(
  __dirname,
  '../local_data/gmail_credentials.json'
)
const SCOPES = ['https://mail.google.com/']
const REDIRECT_PORT = 3099

async function main() {
  const credRaw = await fs.readFile(CREDENTIALS_PATH, 'utf8').catch(() => null)
  if (!credRaw) {
    console.error('❌ gmail_credentials.json not found in local_data/')
    console.error(
      '   Download it from Google Cloud Console and save to local_data/'
    )
    process.exit(1)
  }

  const creds = JSON.parse(credRaw)
  const { client_id, client_secret } = creds.installed ?? creds.web

  const oauth2 = new google.auth.OAuth2(
    client_id,
    client_secret,
    `http://localhost:${REDIRECT_PORT}/callback`
  )

  const authUrl = oauth2.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  })

  console.log('Opening browser for Gmail authentication…')
  await open(authUrl)

  const code = await new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url, `http://localhost:${REDIRECT_PORT}`)
      const code = url.searchParams.get('code')
      if (code) {
        res.end('<h2>Authentication successful! You can close this tab.</h2>')
        server.close()
        resolve(code)
      } else {
        res.end('No code received.')
        server.close()
        reject(new Error('No code in callback'))
      }
    })

    server.listen(REDIRECT_PORT, () => {
      console.log(`Waiting for auth callback on port ${REDIRECT_PORT}…`)
    })

    setTimeout(() => {
      server.close()
      reject(new Error('Auth timed out after 60 seconds'))
    }, 60_000)
  })

  const { tokens } = await oauth2.getToken(code)
  await fs.mkdir(path.dirname(TOKEN_PATH), { recursive: true })
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2))
  console.log('✅ Gmail token saved to local_data/gmail_token.json')
  console.log('   You can now run: npm run dev')
}

main().catch((err) => {
  console.error('Auth failed:', err.message)
  process.exit(1)
})
