// src/components/editor/CodeEditor.jsx
import React, { useRef, useCallback, useEffect, useState } from 'react'
import Editor from '@monaco-editor/react'
import { useWorkspace } from '../../context/WorkspaceContext'

function useIsMobile() {
  const [v, setV] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setV(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return v
}

function buildOptions(isMobile) {
  return {
    theme: 'vs-dark',
    fontSize: isMobile ? 12 : 13,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontLigatures: !isMobile,
    minimap: { enabled: !isMobile },
    wordWrap: 'on',
    lineNumbers: isMobile ? 'off' : 'on',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 3,
    insertSpaces: true,
    renderWhitespace: 'selection',
    smoothScrolling: true,
    cursorBlinking: 'phase',
    cursorSmoothCaretAnimation: isMobile ? 'off' : 'on',
    bracketPairColorization: { enabled: true },
    guides: { bracketPairs: !isMobile, indentation: !isMobile },
    suggest: { showKeywords: true },
    quickSuggestions: !isMobile,
    formatOnPaste: true,
    scrollbar: { verticalScrollbarSize: isMobile ? 3 : 6, horizontalScrollbarSize: isMobile ? 3 : 6 },
    padding: { top: 12, bottom: 12 },
    // Touch-friendly on mobile
    mouseWheelZoom: false,
    overviewRulerLanes: isMobile ? 0 : 3,
    folding: !isMobile,
    glyphMargin: false,
  }
}

function beforeMount(monaco) {
  monaco.languages.registerCompletionItemProvider('cpp', {
    provideCompletionItems: (model, position) => {
      const mql5Keywords = [
        'OnInit','OnDeinit','OnTick','OnTimer','OnTrade','OnCalculate','OnStart',
        'OrderSend','OrderClose','OrderModify','PositionOpen','PositionClose','PositionModify',
        'iMA','iRSI','iMACD','iBands','iATR','iStochastic','iCCI','iADX',
        'AccountInfoDouble','AccountInfoInteger','SymbolInfoDouble','SymbolInfoInteger',
        'NormalizeDouble','MathAbs','MathMax','MathMin','Print','Alert','Comment',
        'ORDER_TYPE_BUY','ORDER_TYPE_SELL','POSITION_TYPE_BUY','POSITION_TYPE_SELL',
        'MODE_SMA','MODE_EMA','PRICE_CLOSE','PRICE_OPEN','PRICE_HIGH','PRICE_LOW',
        'TimeCurrent','CopyRates','CopyClose','iTime','iOpen','iHigh','iLow','iClose',
        'input','sinput','extern',
      ]
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber, endLineNumber: position.lineNumber,
        startColumn: word.startColumn, endColumn: position.column,
      }
      return {
        suggestions: mql5Keywords.map(kw => ({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
          range,
        })),
      }
    },
  })
}

export default function CodeEditor() {
  const { activeFile, updateFileContent } = useWorkspace()
  const editorRef = useRef(null)
  const isMobile = useIsMobile()

  const handleMount = useCallback((editor) => {
    editorRef.current = editor
  }, [])

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-50 text-text-muted flex-col gap-3 px-4">
        <div className="w-12 h-12 rounded-lg bg-surface-200 flex items-center justify-center text-2xl">📄</div>
        <p className="text-sm text-center">No file open. Create or import a file to start coding.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-hidden">
      <Editor
        key={activeFile.id}
        value={activeFile.content}
        language={activeFile.language}
        options={buildOptions(isMobile)}
        beforeMount={beforeMount}
        onMount={handleMount}
        onChange={(val) => updateFileContent(activeFile.id, val ?? '')}
        theme="vs-dark"
      />
    </div>
  )
}
