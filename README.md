# Email Inbox

Personal email triage app. Fetches unread emails from Gmail, uses Claude AI to classify them as action items or digest, and surfaces them in a clean UI. Supports delete, archive, bulk actions, and inline email preview.

## Setup

### Prerequisites

- Node.js 18+
- Gmail credentials JSON from [Google Cloud Console](https://console.cloud.google.com/) (OAuth2 credentials for a Desktop app with Gmail API enabled)
- Anthropic API key

### First time

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create `.env`**

   ```
   ANTHROPIC_API_KEY=your_key_here
   ```

   The Express server defaults to port `3006`. If you change it, also update the proxy in `vite.config.ts`.

3. **Add Gmail credentials**

   In [Google Cloud Console](https://console.cloud.google.com/):
   - Create a project and enable the **Gmail API**
   - Create OAuth2 credentials for a **Desktop app**
   - Download the credentials JSON and save it to `local_data/gmail_credentials.json`

4. **Authenticate Gmail** (one-time, opens browser)

   ```bash
   npm run auth
   ```

5. **Start**

   For local development:
   ```bash
   npm run dev
   ```
   Vite runs on `:5173`, Express on `:3006` (default).

   For production (requires [pm2](https://pm2.keyv.io/)):
   ```bash
   npm run build
   pm2 start ecosystem.config.js --only email-inbox
   ```

## Development

```bash
npm run dev
```

Vite runs on `:5173`, Express on `:3006` (default). Hot reload is enabled for both frontend and backend.

## Scripts

| Command               | Description                        |
| --------------------- | ---------------------------------- |
| `npm run dev`         | Start dev servers (Vite + nodemon) |
| `npm run build`       | Production build                   |
| `npm run restart:pm2` | Build and restart via pm2 (production) |
| `npm run auth`        | Re-authenticate Gmail              |
| `npm run check`       | Lint + format check + type check   |
| `npm run security`    | npm audit                          |

## Data & Privacy

- Email data is stored locally in `local_data/processed_emails.json` — gitignored, never committed
- Gmail OAuth credentials and tokens live in `local_data/` — also gitignored
- No email content is sent anywhere except to the Anthropic API for triage (subject + body preview only)
- Actions (delete, archive) are performed directly via the Gmail API — no third-party services involved

## Notes

This is a personal productivity tool built for my own use. The code is public but this is not an open-source project accepting contributions — it's built around my specific email workflow and Gmail setup. Feel free to fork and adapt it for your own needs.
