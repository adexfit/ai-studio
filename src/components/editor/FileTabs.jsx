// src/components/editor/FileTabs.jsx
import React, { useState, useRef } from 'react'
import { X, Plus, Copy, Pencil, Trash2 } from 'lucide-react'
import { useWorkspace } from '../../context/WorkspaceContext'

export default function FileTabs() {
  const { state, setActiveFile, addFile, deleteFile, renameFile, duplicateFile } = useWorkspace()
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [contextMenu, setContextMenu] = useState(null)
  const renameRef = useRef(null)

  function handleRightClick(e, fileId) {
    e.preventDefault()
    setContextMenu({ fileId, x: e.clientX, y: e.clientY })
  }

  // Long-press for mobile context menu
  const pressTimer = useRef(null)
  function handleTouchStart(e, fileId) {
    pressTimer.current = setTimeout(() => {
      const touch = e.touches[0]
      setContextMenu({ fileId, x: touch.clientX, y: touch.clientY })
    }, 500)
  }
  function handleTouchEnd() { clearTimeout(pressTimer.current) }

  function startRename(fileId, currentName) {
    setRenamingId(fileId)
    setRenameValue(currentName)
    setContextMenu(null)
    setTimeout(() => renameRef.current?.focus(), 50)
  }

  function commitRename() {
    if (renamingId && renameValue.trim()) renameFile(renamingId, renameValue.trim())
    setRenamingId(null)
  }

  function handleRenameKey(e) {
    if (e.key === 'Enter') commitRename()
    if (e.key === 'Escape') setRenamingId(null)
  }

  return (
    <>
      <div
        className="flex items-center bg-surface-100 border-b border-surface-200 overflow-x-auto flex-shrink-0"
        style={{ minHeight: 38 }}
        onClick={() => setContextMenu(null)}
      >
        {state.workspace.map(file => (
          <div
            key={file.id}
            onContextMenu={(e) => handleRightClick(e, file.id)}
            onTouchStart={(e) => handleTouchStart(e, file.id)}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchEnd}
            onClick={() => setActiveFile(file.id)}
            className={`tab-btn flex-shrink-0 touch-manipulation ${state.activeFileId === file.id ? 'active' : ''}`}
          >
            {renamingId === file.id ? (
              <input
                ref={renameRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={handleRenameKey}
                onClick={(e) => e.stopPropagation()}
                className="bg-surface-300 text-text-primary outline-none rounded px-1 w-28 text-xs font-mono"
              />
            ) : (
              <span className="font-mono">{file.name}</span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); deleteFile(file.id) }}
              className="ml-1 p-0.5 hover:text-accent-danger rounded transition-colors opacity-60 hover:opacity-100 touch-manipulation"
            >
              <X size={11} />
            </button>
          </div>
        ))}

        <button
          onClick={() => addFile({ name: 'Untitled.mq5', content: '' })}
          className="btn-ghost ml-1 flex-shrink-0 touch-manipulation"
          title="New file"
        >
          <Plus size={14} />
        </button>
      </div>

      {contextMenu && (
        <div
          className="fixed z-50 bg-surface-200 border border-surface-300 rounded-lg shadow-xl py-1 min-w-[160px]"
          style={{ left: Math.min(contextMenu.x, window.innerWidth - 170), top: Math.min(contextMenu.y, window.innerHeight - 140) }}
        >
          {[
            { label: 'Rename',    icon: Pencil, action: () => { const f = state.workspace.find(x => x.id === contextMenu.fileId); startRename(contextMenu.fileId, f?.name ?? '') } },
            { label: 'Duplicate', icon: Copy,   action: () => { duplicateFile(contextMenu.fileId); setContextMenu(null) } },
            { label: 'Delete',    icon: Trash2, action: () => { deleteFile(contextMenu.fileId); setContextMenu(null) }, danger: true },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              className={`flex items-center gap-2 w-full px-3 py-2.5 text-xs hover:bg-surface-300 transition-colors touch-manipulation ${item.danger ? 'text-accent-danger' : 'text-text-secondary hover:text-text-primary'}`}
            >
              <item.icon size={13} />
              {item.label}
            </button>
          ))}
        </div>
      )}
      {contextMenu && <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />}
    </>
  )
}
