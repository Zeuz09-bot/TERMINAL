// ============================================================
// TERMINAL — Workspace Layout
// ============================================================

import React from 'react'
import { Sidebar } from './Sidebar'
import { CommandBar } from './CommandBar'
import './WorkspaceLayout.css'

interface WorkspaceLayoutProps {
  children: React.ReactNode
  onCommandPalette: () => void
}

export function WorkspaceLayout({ children, onCommandPalette }: WorkspaceLayoutProps) {
  return (
    <div className="workspace">
      <Sidebar />
      <div className="workspace-main">
        <CommandBar onSearchClick={onCommandPalette} />
        <main className="workspace-content">
          {children}
        </main>
      </div>
    </div>
  )
}
