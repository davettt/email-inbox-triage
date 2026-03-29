import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import emailsRouter from './routes/emails.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT ?? 3006
const IS_PROD = process.env.NODE_ENV === 'production'

const app = express()

app.use(cors({ origin: IS_PROD ? false : 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/emails', emailsRouter)

// Serve built frontend in production
if (IS_PROD) {
  const distPath = path.join(__dirname, '../dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(
    `Email Inbox server running on port ${PORT} [${IS_PROD ? 'production' : 'development'}]`
  )
})
