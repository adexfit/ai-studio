// src/components/chat/PromptBar.jsx
import React, { useState, useRef, useEffect } from 'react'
import { SendHorizonal } from 'lucide-react'
import { useInjector } from './PromptInjector'

export default function PromptBar({ onSend, isStreaming }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)
  const { pending, clear } = useInjector()

  useEffect(() => {
    if (pending) {
      setText(pending)
      clear()
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }, [pending])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [text])

  function handleKeyDown(e) {
    // On mobile (virtual keyboard), always allow Enter as newline
    const isMobileKbd = window.innerWidth < 768
    if (e.key === 'Enter' && !e.shiftKey && !isMobileKbd) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return
    onSend(trimmed)
    setText('')
    textareaRef.current && (textareaRef.current.style.height = 'auto')
  }

  return (
    <div className="flex-shrink-0 border-t border-surface-200 bg-surface-100 px-3 py-2.5"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 10px)' }}
    >
      <div className="flex items-end gap-2 bg-surface-200 border border-surface-300 focus-within:border-accent-primary rounded-xl px-3 py-2 transition-colors">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI to build, convert, or debug MQL5…"
          rows={1}
          disabled={isStreaming}
          className="flex-1 resize-none bg-transparent text-sm text-text-primary placeholder-text-muted outline-none leading-relaxed max-h-40 font-sans disabled:opacity-50"
        />
        <button
          onClick={submit}
          disabled={!text.trim() || isStreaming}
          className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center disabled:opacity-40 hover:bg-opacity-80 active:scale-95 transition-all flex-shrink-0 touch-manipulation"
          title="Send"
        >
          <SendHorizonal size={14} className="text-surface-50" />
        </button>
      </div>
      <p className="text-2xs text-text-muted mt-1 text-center hidden sm:block">
        Shift+Enter for newline · Templates in sidebar
      </p>
    </div>
  )
}
