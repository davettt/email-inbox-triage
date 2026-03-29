export interface EmailSender {
  name: string
  email: string
}

export type EmailImportance = 'action' | 'loop' | 'noise'

export interface ProcessedEmail {
  id: string
  from: EmailSender
  originalFrom?: EmailSender
  subject: string
  date: string
  snippet: string
  summary: string
  actions: string[]
  importance: EmailImportance
  unsubscribeUrl?: string
  bodyPreview?: string
  processedAt: string
}

export interface FetchResult {
  emails: ProcessedEmail[]
  newCount: number
}
