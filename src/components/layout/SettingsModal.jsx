// src/components/layout/SettingsModal.jsx
import React, { useState } from 'react'
import { X, Eye, EyeOff, ExternalLink, Check } from 'lucide-react'
import { useWorkspace } from '../../context/WorkspaceContext'

const MODELS = [
  { id: 'cohere/north-mini-code:free', label: 'Cohere North Mini Code (Free)' },
  { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
  { id: 'openai/gpt-4o', label: 'GPT-4o' },
  { id: 'anthropic/claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { id: 'deepseek/deepseek-coder', label: 'DeepSeek Coder' },
  { id: 'google/gemini-flash-1.5', label: 'Gemini Flash 1.5' },
  { id: 'meta-llama/llama-3.1-70b-instruct:free', label: 'Llama 3.1 70B (Free)' },
]

export default function SettingsModal({ onClose }) {
  const { state, updateSettings } = useWorkspace()
  const [local, setLocal] = useState({ ...state.settings })
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  function save() {
    updateSettings(local)
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      {/* On mobile: sheet slides up from bottom. On sm+: centered modal */}
      <div className="bg-surface-100 border border-surface-300 shadow-2xl w-full sm:max-w-md sm:mx-4 sm:rounded-xl rounded-t-2xl overflow-hidden">
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-surface-400" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
          <h2 className="text-sm font-semibold text-text-primary">Settings</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 touch-manipulation"><X size={14} /></button>
        </div>

        {/* Body — scrollable on small screens */}
        <div className="px-5 py-4 space-y-5 overflow-y-auto max-h-[70vh] sm:max-h-none">
          {/* API Key */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              OpenRouter API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={local.apiKey}
                onChange={(e) => setLocal(l => ({ ...l, apiKey: e.target.value }))}
                placeholder="sk-or-v1-..."
                className="input-base pr-10 font-mono text-xs"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
              />
              <button
                onClick={() => setShowKey(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary p-1 touch-manipulation"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-2xs text-accent-primary hover:underline mt-1.5"
            >
              Get a free API key at openrouter.ai <ExternalLink size={9} />
            </a>
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Model</label>
            <select
              value={local.model}
              onChange={(e) => setLocal(l => ({ ...l, model: e.target.value }))}
              className="input-base text-xs"
            >
              {MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Custom model */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Custom Model ID <span className="text-text-muted">(optional override)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. mistralai/codestral-mamba"
              value={MODELS.find(m => m.id === local.model) ? '' : local.model}
              onChange={(e) => e.target.value && setLocal(l => ({ ...l, model: e.target.value }))}
              className="input-base font-mono text-xs"
              autoCorrect="off"
              autoCapitalize="none"
            />
          </div>

          {/* Streaming toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-xs font-medium text-text-secondary">Streaming</p>
              <p className="text-2xs text-text-muted">Show tokens as they arrive</p>
            </div>
            <button
              onClick={() => setLocal(l => ({ ...l, streamingEnabled: !l.streamingEnabled }))}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 touch-manipulation ${local.streamingEnabled ? 'bg-accent-primary' : 'bg-surface-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${local.streamingEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-surface-200 flex justify-end gap-2"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
        >
          <button onClick={onClose} className="btn-ghost text-xs px-4 py-2 touch-manipulation">Cancel</button>
          <button onClick={save} className="btn-primary text-xs px-4 py-2 touch-manipulation">
            {saved ? <><Check size={12} /> Saved</> : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
