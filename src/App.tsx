// ============================================================
// TERMINAL — App Root
// ============================================================

import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { WorkspaceLayout } from '@/components/layout/WorkspaceLayout'
import { CommandPalette } from '@/components/CommandPalette'
import { AppRouter } from '@/router'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useSyncStore } from '@/db/sync'
import { useEffect } from 'react'

function AppInner() {
  const [paletteOpen, setPaletteOpen] = useState(false)

  useKeyboard({
    onCommandPalette: () => setPaletteOpen(true),
    onQuickSearch: () => setPaletteOpen(true),
  })

  const sync = useSyncStore(s => s.sync)

  useEffect(() => {
    sync()
    const interval = setInterval(sync, 30000)
    const onFocus = () => sync()
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [sync])

  return (
    <>
      <WorkspaceLayout onCommandPalette={() => setPaletteOpen(true)}>
        <AppRouter />
      </WorkspaceLayout>
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
