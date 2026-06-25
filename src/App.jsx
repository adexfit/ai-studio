// src/App.jsx
import React, { useState, useCallback, useEffect } from 'react'
import { WorkspaceProvider } from './context/WorkspaceContext'
import TopBar from './components/layout/TopBar'
import SettingsModal from './components/layout/SettingsModal'
import Sidebar from './components/sidebar/Sidebar'
import FileTabs from './components/editor/FileTabs'
import EditorToolbar from './components/editor/EditorToolbar'
import CodeEditor from './components/editor/CodeEditor'
import ChatPanel from './components/chat/ChatPanel'
import PromptInjector from './components/chat/PromptInjector'
import MobileNav from './components/layout/MobileNav'

// Breakpoint hook
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return isMobile
}

function Studio() {
  const isMobile = useIsMobile()

  // Desktop panel state
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatOpen, setChatOpen] = useState(true)

  // Mobile state: 'editor' | 'chat' | 'files'
  const [mobileTab, setMobileTab] = useState('editor')
  // Mobile drawer (sidebar)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [showSettings, setShowSettings] = useState(false)
  const [injectedTemplate, setInjectedTemplate] = useState('')

  const handleSelectTemplate = useCallback((prompt) => {
    setInjectedTemplate(prompt)
    if (isMobile) {
      setMobileTab('chat')
      setDrawerOpen(false)
    } else {
      setChatOpen(true)
    }
  }, [isMobile])

  // ── Mobile layout ──────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <TopBar
          onSettings={() => setShowSettings(true)}
          isMobile
          onOpenDrawer={() => setDrawerOpen(true)}
          mobileTab={mobileTab}
        />

        <PromptInjector template={injectedTemplate} onConsumed={() => setInjectedTemplate('')}>
          <div className="flex-1 overflow-hidden relative">
            {/* Editor tab */}
            <div className={`absolute inset-0 flex flex-col ${mobileTab === 'editor' ? 'z-10' : 'z-0 pointer-events-none opacity-0'}`}>
              <FileTabs />
              <CodeEditor />
            </div>
            {/* Chat tab */}
            <div className={`absolute inset-0 flex flex-col ${mobileTab === 'chat' ? 'z-10' : 'z-0 pointer-events-none opacity-0'}`}>
              <ChatPanel />
            </div>
            {/* Files tab */}
            <div className={`absolute inset-0 flex flex-col overflow-y-auto ${mobileTab === 'files' ? 'z-10' : 'z-0 pointer-events-none opacity-0'}`}>
              <Sidebar onSelectTemplate={handleSelectTemplate} fullHeight />
            </div>
          </div>
        </PromptInjector>

        <MobileNav activeTab={mobileTab} onTabChange={setMobileTab} />

        {/* Drawer overlay for templates on mobile */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="w-72 flex flex-col bg-surface-100 border-r border-surface-200 shadow-2xl overflow-y-auto">
              <Sidebar onSelectTemplate={handleSelectTemplate} onClose={() => setDrawerOpen(false)} showClose />
            </div>
            <div className="flex-1 bg-black bg-opacity-50" onClick={() => setDrawerOpen(false)} />
          </div>
        )}

        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      </div>
    )
  }

  // ── Desktop layout ─────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar
        onSettings={() => setShowSettings(true)}
        sidebarOpen={sidebarOpen}
        chatOpen={chatOpen}
        onToggleSidebar={() => setSidebarOpen(s => !s)}
        onToggleChat={() => setChatOpen(s => !s)}
      />

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <div className="w-52 flex-shrink-0 overflow-hidden flex flex-col">
            <Sidebar onSelectTemplate={handleSelectTemplate} />
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <EditorToolbar />
          <FileTabs />
          <CodeEditor />
        </div>

        {chatOpen && (
          <div className="w-80 xl:w-96 flex-shrink-0 flex flex-col overflow-hidden">
            <PromptInjector template={injectedTemplate} onConsumed={() => setInjectedTemplate('')}>
              <ChatPanel />
            </PromptInjector>
          </div>
        )}
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <WorkspaceProvider>
      <Studio />
    </WorkspaceProvider>
  )
}
