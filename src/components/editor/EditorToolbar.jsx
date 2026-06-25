// src/components/editor/EditorToolbar.jsx
import React from 'react'
import { Download, Upload, Package, FileCode } from 'lucide-react'
import { useWorkspace } from '../../context/WorkspaceContext'
import { useFileManager } from '../../hooks/useFileManager'

export default function EditorToolbar() {
  const { activeFile } = useWorkspace()
  const { importFiles, exportActiveFile, exportAllFiles } = useFileManager()

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-surface-100 border-b border-surface-200 flex-shrink-0">
      {/* File info — truncates on small screens */}
      <div className="flex items-center gap-1.5 text-xs text-text-muted font-mono mr-auto min-w-0 overflow-hidden">
        {activeFile ? (
          <>
            <FileCode size={12} className="text-accent-primary flex-shrink-0" />
            <span className="text-text-secondary truncate">{activeFile.name}</span>
            <span className="text-surface-400 hidden sm:inline">·</span>
            <span className="hidden sm:inline">{activeFile.language === 'cpp' ? 'MQL5' : activeFile.language}</span>
          </>
        ) : (
          <span className="text-text-muted text-2xs">No file open</span>
        )}
      </div>

      {/* Action buttons — icon-only on mobile */}
      <button onClick={importFiles} className="btn-ghost touch-manipulation" title="Import files">
        <Upload size={13} />
        <span className="hidden md:inline">Import</span>
      </button>
      <button
        onClick={() => exportActiveFile(activeFile)}
        className="btn-ghost touch-manipulation"
        title="Export active file"
        disabled={!activeFile}
      >
        <Download size={13} />
        <span className="hidden md:inline">Export</span>
      </button>
      <button onClick={exportAllFiles} className="btn-ghost touch-manipulation" title="Export all as ZIP">
        <Package size={13} />
        <span className="hidden md:inline">ZIP</span>
      </button>
    </div>
  )
}
