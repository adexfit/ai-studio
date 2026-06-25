import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

const WorkspaceContext = createContext(null)

const STORAGE_KEYS = {
  WORKSPACE: 'mt5studio_workspace',
  MESSAGES:  'mt5studio_messages',
  ACTIVE:    'mt5studio_active_file',
  SETTINGS:  'mt5studio_settings',
}

const DEFAULT_FILE = {
  id: uuidv4(),
  name: 'EA.mq5',
  language: 'cpp',
  content: `//+------------------------------------------------------------------+
//|  EA.mq5 — New Expert Advisor                                     |
//|  Created with AI MT5 Studio                                      |
//+------------------------------------------------------------------+
#property copyright "AI MT5 Studio"
#property link      ""
#property version   "1.00"
#property strict

//--- Input Parameters
input double LotSize    = 0.1;
input int    StopLoss   = 50;
input int    TakeProfit = 100;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit() {
   Print("EA initialized successfully");
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason) {
   Print("EA deinitialized. Reason: ", reason);
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick() {
   // Your trading logic here
}
//+------------------------------------------------------------------+
`,
}

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function saveToStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

const initialState = {
  workspace: loadFromStorage(STORAGE_KEYS.WORKSPACE, [DEFAULT_FILE]),
  messages:  loadFromStorage(STORAGE_KEYS.MESSAGES, []),
  activeFileId: loadFromStorage(STORAGE_KEYS.ACTIVE, DEFAULT_FILE.id),
  settings: loadFromStorage(STORAGE_KEYS.SETTINGS, {
    apiKey: '',
    model: 'cohere/north-mini-code:free',
    streamingEnabled: true,
  }),
  isStreaming: false,
}

function workspaceReducer(state, action) {
  switch (action.type) {

    // ── Files ──────────────────────────────────────────────────────
    case 'ADD_FILE': {
      const file = {
        id: action.payload.id ?? uuidv4(),
        name: action.payload.name ?? 'Untitled.mq5',
        language: action.payload.language ?? detectLanguage(action.payload.name ?? ''),
        content: action.payload.content ?? '',
      }
      return {
        ...state,
        workspace: [...state.workspace, file],
        activeFileId: file.id,
      }
    }

    case 'UPDATE_FILE_CONTENT':
      return {
        ...state,
        workspace: state.workspace.map(f =>
          f.id === action.payload.id ? { ...f, content: action.payload.content } : f
        ),
      }

    case 'RENAME_FILE':
      return {
        ...state,
        workspace: state.workspace.map(f =>
          f.id === action.payload.id
            ? { ...f, name: action.payload.name, language: detectLanguage(action.payload.name) }
            : f
        ),
      }

    case 'DELETE_FILE': {
      const remaining = state.workspace.filter(f => f.id !== action.payload.id)
      const newActive = state.activeFileId === action.payload.id
        ? (remaining[0]?.id ?? null)
        : state.activeFileId
      return { ...state, workspace: remaining, activeFileId: newActive }
    }

    case 'DUPLICATE_FILE': {
      const src = state.workspace.find(f => f.id === action.payload.id)
      if (!src) return state
      const copy = { ...src, id: uuidv4(), name: `${src.name.replace(/(\.[^.]+)$/, '')}_copy$1` }
      return {
        ...state,
        workspace: [...state.workspace, copy],
        activeFileId: copy.id,
      }
    }

    case 'SET_ACTIVE_FILE':
      return { ...state, activeFileId: action.payload.id }

    case 'UPSERT_FILES': {
      // Called when AI returns files — create or update
      let ws = [...state.workspace]
      let firstNewId = null
      for (const incoming of action.payload.files) {
        const existing = ws.find(f => f.name === incoming.name)
        if (existing) {
          ws = ws.map(f => f.id === existing.id ? { ...f, content: incoming.content } : f)
          if (!firstNewId) firstNewId = existing.id
        } else {
          const file = {
            id: uuidv4(),
            name: incoming.name,
            language: detectLanguage(incoming.name),
            content: incoming.content,
          }
          ws.push(file)
          if (!firstNewId) firstNewId = file.id
        }
      }
      return { ...state, workspace: ws, activeFileId: firstNewId ?? state.activeFileId }
    }

    // ── Messages ───────────────────────────────────────────────────
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, { id: uuidv4(), ...action.payload }],
      }

    case 'APPEND_STREAM_CHUNK': {
      const msgs = state.messages
      const last = msgs[msgs.length - 1]
      if (last && last.role === 'assistant' && last.streaming) {
        return {
          ...state,
          messages: [
            ...msgs.slice(0, -1),
            { ...last, content: last.content + action.payload.chunk },
          ],
        }
      }
      return state
    }

    case 'FINALIZE_STREAM': {
      return {
        ...state,
        isStreaming: false,
        messages: state.messages.map(m =>
          m.streaming ? { ...m, streaming: false } : m
        ),
      }
    }

    case 'SET_STREAMING':
      return { ...state, isStreaming: action.payload.value }

    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] }

    // ── Settings ───────────────────────────────────────────────────
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }

    // ── Workspace ──────────────────────────────────────────────────
    case 'CLEAR_WORKSPACE':
      return { ...state, workspace: [], activeFileId: null, messages: [] }

    default:
      return state
  }
}

function detectLanguage(filename) {
  const ext = filename.split('.').pop()?.toLowerCase()
  const map = { mq5: 'cpp', mqh: 'cpp', pine: 'javascript', pinescript: 'javascript', pine5: 'javascript', md: 'markdown', txt: 'plaintext', json: 'json', js: 'javascript' }
  return map[ext] ?? 'plaintext'
}

export function WorkspaceProvider({ children }) {
  const [state, dispatch] = useReducer(workspaceReducer, initialState)

  // Persist on change
  useEffect(() => { saveToStorage(STORAGE_KEYS.WORKSPACE, state.workspace) }, [state.workspace])
  useEffect(() => { saveToStorage(STORAGE_KEYS.MESSAGES, state.messages) }, [state.messages])
  useEffect(() => { saveToStorage(STORAGE_KEYS.ACTIVE, state.activeFileId) }, [state.activeFileId])
  useEffect(() => { saveToStorage(STORAGE_KEYS.SETTINGS, state.settings) }, [state.settings])

  const activeFile = state.workspace.find(f => f.id === state.activeFileId) ?? null

  const actions = {
    addFile:            useCallback((p) => dispatch({ type: 'ADD_FILE', payload: p }), []),
    updateFileContent:  useCallback((id, content) => dispatch({ type: 'UPDATE_FILE_CONTENT', payload: { id, content } }), []),
    renameFile:         useCallback((id, name) => dispatch({ type: 'RENAME_FILE', payload: { id, name } }), []),
    deleteFile:         useCallback((id) => dispatch({ type: 'DELETE_FILE', payload: { id } }), []),
    duplicateFile:      useCallback((id) => dispatch({ type: 'DUPLICATE_FILE', payload: { id } }), []),
    setActiveFile:      useCallback((id) => dispatch({ type: 'SET_ACTIVE_FILE', payload: { id } }), []),
    upsertFiles:        useCallback((files) => dispatch({ type: 'UPSERT_FILES', payload: { files } }), []),
    addMessage:         useCallback((msg) => dispatch({ type: 'ADD_MESSAGE', payload: msg }), []),
    appendStreamChunk:  useCallback((chunk) => dispatch({ type: 'APPEND_STREAM_CHUNK', payload: { chunk } }), []),
    finalizeStream:     useCallback(() => dispatch({ type: 'FINALIZE_STREAM' }), []),
    setStreaming:       useCallback((v) => dispatch({ type: 'SET_STREAMING', payload: { value: v } }), []),
    clearMessages:      useCallback(() => dispatch({ type: 'CLEAR_MESSAGES' }), []),
    updateSettings:     useCallback((s) => dispatch({ type: 'UPDATE_SETTINGS', payload: s }), []),
    clearWorkspace:     useCallback(() => dispatch({ type: 'CLEAR_WORKSPACE' }), []),
    detectLanguage,
  }

  return (
    <WorkspaceContext.Provider value={{ state, activeFile, ...actions }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider')
  return ctx
}

export { detectLanguage }
