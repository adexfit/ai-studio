// src/hooks/useChat.js
import { useCallback, useRef } from 'react'
import { useWorkspace } from '../context/WorkspaceContext'
import { buildMessages, sendMessageStream, sendMessage, parseAIResponse } from '../services/openrouter'

export function useChat() {
  const {
    state, activeFile,
    addMessage, appendStreamChunk, finalizeStream, setStreaming,
    upsertFiles,
  } = useWorkspace()

  const abortRef = useRef(null)

  const sendPrompt = useCallback(async (userText) => {
    if (!userText.trim() || state.isStreaming) return

    const { apiKey, model, streamingEnabled } = state.settings

    if (!apiKey) {
      addMessage({
        role: 'assistant',
        content: JSON.stringify({
          explanation: '⚠️ No API key configured. Open Settings (⚙ top-right) and enter your OpenRouter API key to start coding.',
          files: [],
        }),
      })
      return
    }

    // Add user message
    addMessage({ role: 'user', content: userText })
    setStreaming(true)

    const messages = buildMessages(state.messages, userText, activeFile)

    if (streamingEnabled) {
      // Add empty assistant message for streaming
      addMessage({ role: 'assistant', content: '', streaming: true })

      let accumulated = ''

      abortRef.current = sendMessageStream({
        apiKey,
        model,
        messages,
        onChunk: (chunk) => {
          accumulated += chunk
          appendStreamChunk(chunk)
        },
        onDone: () => {
          finalizeStream()
          processResponse(accumulated)
        },
        onError: (err) => {
          finalizeStream()
          // Replace streaming message with error
          addMessage({
            role: 'assistant',
            content: JSON.stringify({
              explanation: `❌ Error: ${err.message}. Check your API key and model name.`,
              files: [],
            }),
          })
        },
      })
    } else {
      // Non-streaming
      try {
        const raw = await sendMessage({ apiKey, model, messages })
        processResponse(raw, true)
      } catch (err) {
        addMessage({
          role: 'assistant',
          content: JSON.stringify({
            explanation: `❌ Error: ${err.message}`,
            files: [],
          }),
        })
      } finally {
        setStreaming(false)
      }
    }

    function processResponse(raw, addMsg = false) {
      const parsed = parseAIResponse(raw)
      if (addMsg) {
        addMessage({ role: 'assistant', content: raw })
      }
      if (parsed.files?.length > 0) {
        upsertFiles(parsed.files)
      }
    }
  }, [state, activeFile, addMessage, appendStreamChunk, finalizeStream, setStreaming, upsertFiles])

  const cancelStream = useCallback(() => {
    abortRef.current?.abort()
    finalizeStream()
  }, [finalizeStream])

  return { sendPrompt, cancelStream, isStreaming: state.isStreaming }
}
