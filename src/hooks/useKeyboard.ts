// ============================================================
// TERMINAL — Global Keyboard Shortcuts
// ============================================================

import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

interface UseKeyboardOptions {
  onCommandPalette: () => void
  onQuickSearch: () => void
}

export function useKeyboard({ onCommandPalette, onQuickSearch }: UseKeyboardOptions) {
  const navigate = useNavigate()

  const handler = useCallback(
    (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea/contenteditable
      const target = e.target as HTMLElement
      const isEditing =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable

      // Ctrl+K — command palette (always active)
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault()
        onCommandPalette()
        return
      }

      // Space — quick search (not in edit context)
      if (!isEditing && e.key === ' ') {
        e.preventDefault()
        onQuickSearch()
        return
      }

      // Single-letter navigation (not in edit context, no modifier keys)
      if (!isEditing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key) {
          case 'n':
          case 'N':
            navigate('/knowledge-vault')
            break
          case 'j':
          case 'J':
            navigate('/journal')
            break
          case 'r':
          case 'R':
            navigate('/research')
            break
          case 'a':
          case 'A':
            navigate('/algorithm-lab')
            break
          case 's':
          case 'S':
            navigate('/alpha-factory')
            break
          case 'c':
          case 'C':
            navigate('/calendar')
            break
        }
      }
    },
    [navigate, onCommandPalette, onQuickSearch]
  )

  useEffect(() => {
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handler])
}
