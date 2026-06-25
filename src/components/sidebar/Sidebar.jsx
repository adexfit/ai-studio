// src/components/sidebar/Sidebar.jsx
import React, { useState } from 'react'
import {
  ChevronDown, ChevronRight, Bot, ArrowRightLeft, Bug, Zap,
  BookOpen, PlusCircle, BarChart2, TrendingUp, Shield, ClipboardList,
  MessageSquare, Plus, Trash2, FileCode, X,
} from 'lucide-react'
import { useWorkspace } from '../../context/WorkspaceContext'
import { PROMPT_TEMPLATES, CATEGORIES } from '../../utils/templates'

const ICONS = { Bot, ArrowRightLeft, Bug, Zap, BookOpen, PlusCircle, BarChart2, TrendingUp, Shield, ClipboardList }

function SidebarSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 w-full px-3 py-2 text-2xs font-semibold uppercase tracking-widest text-text-muted hover:text-text-secondary transition-colors"
      >
        {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        {title}
      </button>
      {open && <div className="pb-1">{children}</div>}
    </div>
  )
}

export default function Sidebar({ onSelectTemplate, onNewConversation, showClose, onClose, fullHeight }) {
  const { state, clearMessages, addFile, setActiveFile, deleteFile } = useWorkspace()

  const byCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = PROMPT_TEMPLATES.filter(t => t.category === cat)
    return acc
  }, {})

  return (
    <aside className={`flex flex-col bg-surface-100 border-r border-surface-200 w-full ${fullHeight ? 'h-full' : 'h-full'} overflow-hidden`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-surface-200 flex items-center gap-2 flex-shrink-0">
        <div className="w-6 h-6 rounded bg-accent-primary flex items-center justify-center">
          <FileCode size={13} className="text-surface-50" />
        </div>
        <span className="text-sm font-semibold text-text-primary font-mono flex-1">MT5 Studio</span>
        {showClose && (
          <button onClick={onClose} className="btn-ghost p-1">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-2">
        <SidebarSection title="Templates">
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat} className="mb-1">
              <div className="px-3 py-0.5 text-2xs text-text-muted uppercase tracking-wider">{cat}</div>
              {items.map(tpl => {
                const Icon = ICONS[tpl.icon] ?? Bot
                return (
                  <button
                    key={tpl.id}
                    onClick={() => onSelectTemplate(tpl.prompt)}
                    className="sidebar-item w-full text-left py-2"
                  >
                    <Icon size={13} className="text-accent-primary flex-shrink-0" />
                    <span className="truncate">{tpl.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </SidebarSection>

        <SidebarSection title="Workspace Files">
          <button
            onClick={() => addFile({ name: 'New.mq5', content: '' })}
            className="sidebar-item w-full text-left py-2"
          >
            <Plus size={13} className="text-accent-primary" />
            <span>New File</span>
          </button>
          {state.workspace.map(file => (
            <div
              key={file.id}
              className="group sidebar-item py-2"
              onClick={() => setActiveFile(file.id)}
            >
              <FileCode size={12} className="text-text-muted flex-shrink-0" />
              <span className={`flex-1 truncate ${state.activeFileId === file.id ? 'text-accent-primary' : ''}`}>
                {file.name}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteFile(file.id) }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-accent-danger transition-opacity"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </SidebarSection>

        <SidebarSection title="Conversation" defaultOpen={false}>
          <button
            onClick={() => { onNewConversation?.(); clearMessages() }}
            className="sidebar-item w-full text-left py-2"
          >
            <Plus size={13} className="text-accent-primary" />
            <span>New Conversation</span>
          </button>
          {state.messages.filter(m => m.role === 'user').slice(-6).map(m => (
            <div key={m.id} className="sidebar-item py-2">
              <MessageSquare size={12} className="text-text-muted flex-shrink-0" />
              <span className="truncate text-2xs">{m.content.slice(0, 40)}…</span>
            </div>
          ))}
        </SidebarSection>
      </div>
    </aside>
  )
}
