import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

/**
 * Triage a batch of emails with a single Claude Haiku call.
 * Returns an array of triage results in the same order as input.
 */
export async function triageEmails(emails) {
  if (emails.length === 0) return []

  const emailList = emails
    .map((e, i) => {
      const senderLine = e.originalFrom
        ? `${e.originalFrom.name} <${e.originalFrom.email}> (forwarded via ${e.from.email})`
        : `${e.from.name} <${e.from.email}>`

      return `Email ${i + 1}:
From: ${senderLine}
Subject: ${e.subject}
Date: ${e.date}
Body: ${e.snippet} ${e.body ?? ''}`
    })
    .join('\n\n---\n\n')

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are an email triage assistant. Triage these ${emails.length} emails.

For each email return a JSON object with:
- "importance": one of:
  - "action" — only if it genuinely requires a personal response, a time-sensitive decision, or involves a financial/account/security matter. Newsletter CTAs, soft suggestions, and "you might want to read this" do NOT qualify.
  - "loop" — informational or newsletter content worth a quick summary but no action needed
  - "noise" — purely promotional, automated notifications with zero informational value, or bulk marketing
- "summary": 2-3 plain sentences. For newsletters, summarise the specific topics, stories, ideas, or insights actually covered in this issue — not just the newsletter's name or general theme. Give enough detail that the reader can decide whether it's worth reading
- "actions": array of specific required actions if importance is "action", otherwise empty array []

Return a JSON array of exactly ${emails.length} objects in the same order as the input emails. No markdown, no explanation — only the JSON array.

${emailList}`,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text')
    throw new Error('Unexpected response type from Claude')

  // Strip markdown code fences if Claude adds them
  const raw = content.text
    .trim()
    .replace(/^```(?:json)?\n?/, '')
    .replace(/\n?```$/, '')

  return JSON.parse(raw)
}
