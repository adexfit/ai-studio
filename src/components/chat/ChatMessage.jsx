// src/components/chat/ChatMessage.jsx
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Check, User, Bot, FileCode } from 'lucide-react'
import { parseAIResponse } from '../../services/openrouter'

function CopyButton({ text, className = '' }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      className={`p-1.5 rounded bg-surface-300 hover:bg-surface-400 text-text-secondary hover:text-text-primary transition-colors touch-manipulation ${className}`}
      title="Copy"
    >
      {copied ? <Check size={11} className="text-accent-primary" /> : <Copy size={11} />}
    </button>
  )
}

function CodeBlock({ children, className }) {
  const code = String(children).replace(/\n$/, '')
  return (
    <div className="relative my-2 group">
      <pre className="bg-surface-200 border border-surface-300 rounded-md p-3 overflow-x-auto text-xs font-mono text-text-primary">
        <code className={className}>{code}</code>
      </pre>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={code} />
      </div>
    </div>
  )
}

function AssistantContent({ content, streaming }) {
  let parsed = null
  try { parsed = parseAIResponse(content) } catch {}

  if (!parsed) {
    return (
      <div className={`chat-content ${streaming ? 'streaming-cursor' : ''}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: ({ children, className }) => <CodeBlock className={className}>{children}</CodeBlock> }}>
          {content}
        </ReactMarkdown>
      </div>
    )
  }

  return (
    <div>
      {parsed.explanation && (
        <div className={`chat-content ${streaming && !parsed.files?.length ? 'streaming-cursor' : ''}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: ({ children, className }) => <CodeBlock className={className}>{children}</CodeBlock> }}>
            {parsed.explanation}
          </ReactMarkdown>
        </div>
      )}

      {parsed.files?.length > 0 && (
        <div className="mt-3 space-y-2">
          {parsed.files.map((file, i) => (
            <div key={i} className="border border-surface-300 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-surface-300 border-b border-surface-400">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileCode size={12} className="text-accent-primary flex-shrink-0" />
                  <span className="text-xs font-mono text-text-primary truncate">{file.name}</span>
                  <span className="text-2xs text-text-muted ml-1 flex-shrink-0">
                    {file.content.split('\n').length}L
                  </span>
                </div>
                <CopyButton text={file.content} />
              </div>
              <pre className="p-3 text-xs font-mono overflow-x-auto text-text-secondary max-h-52 overflow-y-auto bg-surface-50">
                {file.content.slice(0, 1500)}{file.content.length > 1500 ? '\n…' : ''}
              </pre>
            </div>
          ))}
          {streaming && <span className="streaming-cursor inline-block" />}
        </div>
      )}
    </div>
  )
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-2.5 px-3 sm:px-4 py-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isUser ? 'bg-accent-primary' : 'bg-surface-300 border border-surface-400'
      }`}>
        {isUser
          ? <User size={13} className="text-surface-50" />
          : <Bot size={13} className="text-accent-primary" />
        }
      </div>

      <div className={`max-w-[88%] rounded-xl px-3.5 py-2.5 ${
        isUser
          ? 'bg-accent-muted border border-accent-primary border-opacity-30 text-text-primary'
          : 'bg-surface-100 border border-surface-300 text-text-secondary'
      }`}>
        {isUser
          ? <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          : <AssistantContent content={message.content} streaming={message.streaming} />
        }
      </div>
    </div>
  )
}
