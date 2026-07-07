// ============================================================
// TERMINAL — App Root
// ============================================================

import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { WorkspaceLayout } from '@/components/layout/WorkspaceLayout'
import { CommandPalette } from '@/components/CommandPalette'
import { AppRouter } from '@/router'
import { useKeyboard } from '@/hooks/useKeyboard'

function AppInner() {
  const [paletteOpen, setPaletteOpen] = useState(false)

  useKeyboard({
    onCommandPalette: () => setPaletteOpen(true),
    onQuickSearch: () => setPaletteOpen(true),
  })

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
