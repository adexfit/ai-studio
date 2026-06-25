// src/hooks/useFileManager.js
import { useCallback } from 'react'
import { useWorkspace } from '../context/WorkspaceContext'

export function useFileManager() {
  const { state, addFile, deleteFile, renameFile, duplicateFile, updateFileContent, detectLanguage } = useWorkspace()

  const importFiles = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = '.mq5,.mqh,.txt,.pine,.js,.md'
    input.onchange = (e) => {
      for (const file of e.target.files) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          addFile({ name: file.name, content: ev.target.result })
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }, [addFile])

  const exportActiveFile = useCallback((activeFile) => {
    if (!activeFile) return
    downloadText(activeFile.name, activeFile.content)
  }, [])

  const exportAllFiles = useCallback(async () => {
    if (state.workspace.length === 0) return
    if (state.workspace.length === 1) {
      downloadText(state.workspace[0].name, state.workspace[0].content)
      return
    }
    // ZIP export
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      for (const f of state.workspace) {
        zip.file(f.name, f.content)
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      downloadBlob('mt5-project.zip', blob)
    } catch {
      // Fallback: export each file individually
      for (const f of state.workspace) {
        downloadText(f.name, f.content)
      }
    }
  }, [state.workspace])

  return { importFiles, exportActiveFile, exportAllFiles }
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: 'text/plain' })
  downloadBlob(filename, blob)
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
