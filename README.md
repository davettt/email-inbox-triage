# Email Inbox

Personal email triage app. Fetches unread emails from Gmail, uses Claude AI to classify them as action items or digest, and surfaces them in a clean UI. Supports delete, archive, bulk actions, and inline email preview.

## Setup

### Prerequisites

- Node.js 18+
- Gmail credentials JSON (from Google Cloud Console or copy from `todoist-python/local_data/gmail_credentials.json`)
- Anthropic API key

### First time

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create `.env`**

   ```
   ANTHROPIC_API_KEY=your_key_here
   PORT=3006
   NODE_ENV=production
   ```

3. **Copy Gmail credentials**

   ```bash
   cp ../todoist-python/local_data/gmail_credentials.json local_data/
   ```

4. **Authenticate Gmail** (one-time, opens browser)

   ```bash
   npm run auth
   ```

5. **Build and start**
   ```bash
   npm run build
   pm2 start ecosystem.config.js --only email-inbox
   ```

## Development

```bash
npm run dev
```

Vite runs on `:5173`, Express on `:3006`.

## Scripts

| Command               | Description                        |
| --------------------- | ---------------------------------- |
| `npm run dev`         | Start dev servers (Vite + nodemon) |
| `npm run build`       | Production build                   |
| `npm run restart:pm2` | Build and restart via pm2          |
| `npm run auth`        | Re-authenticate Gmail              |
| `npm run check`       | Lint + format check + type check   |
| `npm run security`    | npm audit                          |
