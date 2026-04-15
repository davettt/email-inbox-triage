# Email Inbox

Personal email triage app. Fetches unread emails from Gmail, uses Claude AI to classify them into three tiers — action needed, in the loop (digest), and noise — and surfaces them in a clean UI. Supports delete, archive, bulk actions, and inline email preview.

## Setup

### Prerequisites

- Node.js 18+
- Gmail credentials JSON from [Google Cloud Console](https://console.cloud.google.com/) (OAuth2 credentials for a Desktop app with Gmail API enabled)
- Anthropic API key ([console.anthropic.com](https://console.anthropic.com/))

### First time

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create `.env`**

   ```
   ANTHROPIC_API_KEY=your_key_here
   ```

   The Express server defaults to port `3006`. To change it, set `PORT` in `.env` and update the proxy in `vite.config.ts`.

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

   ```bash
   npm run dev
   ```

   Vite runs on `:5173`, Express on `:3006` (default).

## Development

```bash
npm run dev
```

Vite runs on `:5173`, Express on `:3006` (default). Hot reload is enabled for both frontend and backend.

### Production

Requires [pm2](https://pm2.keymetrics.io/). Build the frontend and run the server directly:

```bash
npm run build
PORT=3006 NODE_ENV=production pm2 start npm --name email-inbox -- start
```

Or use your own `ecosystem.config.js`.

## Scripts

| Command            | Description                           |
| ------------------ | ------------------------------------- |
| `npm run dev`      | Start dev servers (Vite + nodemon)    |
| `npm run build`    | Production build (writes `.last-build` marker for stale-build detection) |
| `npm start`        | Start Express server                  |
| `npm run auth`     | Authenticate or re-authenticate Gmail |
| `npm run check`    | Lint + format check + type check      |
| `npm run security` | npm audit                             |

## Data & Privacy

- Email data is stored locally in `local_data/` — gitignored, never committed
- Gmail OAuth credentials and tokens also live in `local_data/`
- Email metadata (sender, subject, date, and a body preview) is sent to the Anthropic API for triage classification — nothing else
- Actions (delete, archive) are performed directly via the Gmail API — no third-party services involved

## Personal Project Notice

This is a personal project. While you're welcome to fork it and customize it for your own needs, I'm not accepting pull requests or feature contributions. This keeps the project simple and focused on my personal requirements.

If you'd like to use this project:

- ✅ **Fork it** — Make your own version
- ✅ **Customize it** — Modify the code as needed
- ✅ **Report bugs** — File issues for actual bugs
- ❌ **Submit pull requests** — I won't be reviewing these
- ❌ **Request features** — Feature requests won't be considered
