// src/components/layout/TopBar.jsx
import React from 'react'
import {
  Settings, PanelLeftOpen, PanelLeftClose,
  PanelRightOpen, PanelRightClose, FileCode, Menu
} from 'lucide-react'
import { useWorkspace } from '../../context/WorkspaceContext'

export default function TopBar({
  onSettings,
  // desktop
  sidebarOpen, chatOpen, onToggleSidebar, onToggleChat,
  // mobile
  isMobile, onOpenDrawer, mobileTab,
}) {
  const { state } = useWorkspace()

  return (
    <header className="flex items-center px-3 h-11 bg-surface-100 border-b border-surface-200 flex-shrink-0 z-10 gap-2"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        minHeight: 'calc(44px + safe-area-inset-top)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-2">
        {isMobile ? (
          <button onClick={onOpenDrawer} className="btn-ghost p-1.5" title="Templates">
            <Menu size={16} />
          </button>
        ) : (
          <button onClick={onToggleSidebar} className="btn-ghost p-1.5" title="Toggle sidebar">
            {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
          </button>
        )}
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-accent-primary flex items-center justify-center flex-shrink-0">
            <FileCode size={11} className="text-surface-50" />
          </div>
          <span className="text-xs font-semibold font-mono text-text-primary hidden sm:block">AI MT5 Studio</span>
        </div>
      </div>

      {/* Center — model badge */}
      <div className="flex-1 flex items-center justify-center min-w-0">
        <span className="text-2xs text-text-muted font-mono bg-surface-200 border border-surface-300 px-2 py-0.5 rounded-full truncate max-w-[180px] sm:max-w-xs">
          {state.settings.model || 'No model — open Settings'}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {!isMobile && (
          <div className="text-2xs text-text-muted mr-1 hidden md:block whitespace-nowrap">
            {state.workspace.length} file{state.workspace.length !== 1 ? 's' : ''}
          </div>
        )}
        <button onClick={onSettings} className="btn-ghost p-1.5" title="Settings">
          <Settings size={14} />
        </button>
        {!isMobile && (
          <button onClick={onToggleChat} className="btn-ghost p-1.5" title="Toggle AI panel">
            {chatOpen ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
          </button>
        )}
      </div>
    </header>
  )
}
