// src/components/chat/PromptInjector.jsx
// Wraps ChatPanel and injects template text into the PromptBar via context/prop drilling bridge
import React, { createContext, useContext, useEffect, useState } from 'react'

const InjectorCtx = createContext({ pending: '', clear: () => {} })
export const useInjector = () => useContext(InjectorCtx)

export default function PromptInjector({ template, onConsumed, children }) {
  const [pending, setPending] = useState('')

  useEffect(() => {
    if (template) {
      setPending(template)
      onConsumed?.()
    }
  }, [template])

  return (
    <InjectorCtx.Provider value={{ pending, clear: () => setPending('') }}>
      {children}
    </InjectorCtx.Provider>
  )
}
