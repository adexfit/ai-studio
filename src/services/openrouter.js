// src/services/openrouter.js
// OpenRouter API service — handles normal + streaming completions

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

const SYSTEM_PROMPT = `You are an expert MQL5 and Pine Script developer integrated into AI MT5 Studio.

You MUST always respond with valid JSON in this exact format:
{
  "explanation": "Clear explanation of what you did and why",
  "files": [
    {
      "name": "filename.mq5",
      "content": "full file content here"
    }
  ]
}

Rules:
- Always return valid, parseable JSON — no markdown fences, no preamble
- "explanation" is required and should be clear and helpful
- "files" is an array — can be empty [] if no code was generated
- Each file must have "name" (with correct extension) and "content"
- For MQL5 code: use proper MQL5 syntax, include all required headers and properties
- For conversions: convert completely, don't truncate
- Never leave placeholder comments like "// your code here"
- Write production-quality, compilable MQL5 code
- Include proper error handling and comments`

/**
 * Build the messages array for the API call.
 * Injects the current active file content if available.
 */
export function buildMessages(conversationHistory, userMessage, activeFile) {
  const msgs = []

  // Inject workspace context if a file is open
  if (activeFile) {
    msgs.push({
      role: 'user',
      content: `Current open file: ${activeFile.name}\n\`\`\`\n${activeFile.content}\n\`\`\``,
    })
    msgs.push({
      role: 'assistant',
      content: JSON.stringify({ explanation: 'I can see your current file.', files: [] }),
    })
  }

  // Previous conversation (skip streaming placeholders)
  for (const msg of conversationHistory) {
    if (!msg.streaming) {
      msgs.push({ role: msg.role, content: msg.content })
    }
  }

  msgs.push({ role: 'user', content: userMessage })
  return msgs
}

/**
 * Standard (non-streaming) completion
 */
export async function sendMessage({ apiKey, model, messages }) {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://ai-mt5-studio.local',
      'X-Title': 'AI MT5 Studio',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.2,
      max_tokens: 8000,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `API error ${res.status}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

/**
 * Streaming completion — calls onChunk for each token, onDone when complete.
 * Returns abort controller so callers can cancel.
 */
export function sendMessageStream({ apiKey, model, messages, onChunk, onDone, onError }) {
  const controller = new AbortController()

  const run = async () => {
    try {
      const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ai-mt5-studio.local',
          'X-Title': 'AI MT5 Studio',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
          temperature: 0.2,
          max_tokens: 8000,
          stream: true,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message ?? `API error ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete line

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') continue
          if (!trimmed.startsWith('data: ')) continue

          try {
            const json = JSON.parse(trimmed.slice(6))
            const delta = json.choices?.[0]?.delta?.content
            if (delta) onChunk(delta)
          } catch { /* skip malformed */ }
        }
      }

      onDone()
    } catch (err) {
      if (err.name !== 'AbortError') {
        onError(err)
      }
    }
  }

  run()
  return controller
}

/**
 * Parse AI response — attempts JSON parse with fallback extraction.
 */
export function parseAIResponse(raw) {
  // Try direct parse
  try {
    const parsed = JSON.parse(raw)
    if (parsed.explanation !== undefined) return parsed
  } catch {}

  // Try to extract JSON from the response
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.explanation !== undefined) return parsed
    } catch {}
  }

  // Fallback — treat entire response as explanation
  return {
    explanation: raw,
    files: [],
  }
}
