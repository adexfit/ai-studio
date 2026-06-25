// src/components/layout/MobileNav.jsx
import React from 'react'
import { Code2, Bot, FolderOpen } from 'lucide-react'

const TABS = [
  { id: 'editor', label: 'Editor', Icon: Code2 },
  { id: 'chat',   label: 'AI Chat', Icon: Bot },
  { id: 'files',  label: 'Files',  Icon: FolderOpen },
]

export default function MobileNav({ activeTab, onTabChange }) {
  return (
    <nav className="flex-shrink-0 flex items-stretch bg-surface-100 border-t border-surface-200 z-20"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors
            ${activeTab === id
              ? 'text-accent-primary border-t-2 border-accent-primary bg-surface-200'
              : 'text-text-muted hover:text-text-secondary border-t-2 border-transparent'
            }`}
        >
          <Icon size={18} />
          <span className="text-2xs font-medium">{label}</span>
        </button>
      ))}
    </nav>
  )
}
