// src/components/chat/ChatPanel.jsx
import React, { useEffect, useRef } from 'react'
import { Trash2, StopCircle, Bot } from 'lucide-react'
import { useWorkspace } from '../../context/WorkspaceContext'
import ChatMessage from './ChatMessage'
import PromptBar from './PromptBar'
import { useChat } from '../../hooks/useChat'

export default function ChatPanel() {
  const { state, clearMessages } = useWorkspace()
  const { sendPrompt, cancelStream, isStreaming } = useChat()
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages])

  return (
    <div className="flex flex-col h-full bg-surface-50 border-l border-surface-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-surface-200 bg-surface-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot size={14} className="text-accent-primary" />
          <span className="text-xs font-semibold text-text-primary">AI Assistant</span>
          {isStreaming && (
            <span className="text-2xs text-accent-primary animate-pulse">● generating</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isStreaming && (
            <button onClick={cancelStream} className="btn-ghost text-accent-danger touch-manipulation" title="Stop">
              <StopCircle size={14} />
            </button>
          )}
          <button
            onClick={clearMessages}
            className="btn-ghost touch-manipulation"
            title="Clear"
            disabled={isStreaming}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-2 overscroll-contain">
        {state.messages.length === 0 ? (
          <EmptyState />
        ) : (
          state.messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <PromptBar onSend={sendPrompt} isStreaming={isStreaming} />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-5 text-center gap-4 text-text-muted">
      <div className="w-14 h-14 rounded-2xl bg-surface-200 border border-surface-300 flex items-center justify-center">
        <Bot size={24} className="text-accent-primary" />
      </div>
      <div>
        <p className="text-sm font-medium text-text-secondary mb-1">AI MT5 Studio</p>
        <p className="text-xs leading-relaxed">
          Build EAs, indicators, convert Pine Script,<br className="hidden sm:block" />
          debug errors, or explain code.
        </p>
      </div>
      <div className="w-full space-y-1.5 text-left">
        {[
          'Build a Moving Average crossover EA',
          'Convert my Pine Script RSI indicator',
          'Debug this compilation error',
        ].map(hint => (
          <div key={hint} className="px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-2xs text-text-muted">
            "{hint}"
          </div>
        ))}
      </div>
    </div>
  )
}
