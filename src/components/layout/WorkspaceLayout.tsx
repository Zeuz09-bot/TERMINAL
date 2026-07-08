// ============================================================
// TERMINAL — Workspace Layout
// ============================================================

import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { CommandBar } from './CommandBar'
import './WorkspaceLayout.css'

interface WorkspaceLayoutProps {
  children: React.ReactNode
  onCommandPalette: () => void
}

export function WorkspaceLayout({ children, onCommandPalette }: WorkspaceLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="workspace">
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="workspace-main">
        <CommandBar 
          onSearchClick={onCommandPalette} 
          onMenuClick={() => setMobileMenuOpen(true)} 
        />
        <main className="workspace-content">
          {children}
        </main>
      </div>
    </div>
  )
}
