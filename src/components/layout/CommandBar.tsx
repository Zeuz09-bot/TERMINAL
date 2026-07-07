// ============================================================
// TERMINAL — Command Bar (Top)
// ============================================================

import React from 'react'
import { Search, Settings } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useProfile } from '@/db/hooks'
import { formatHours } from '@/engine/xp'
import { NAV_MODULES } from '@/data/mission'
import './CommandBar.css'

function useCurrentModule() {
  const location = useLocation()
  return NAV_MODULES.find(
    (m) => m.path === location.pathname || (m.path !== '/' && location.pathname.startsWith(m.path))
  ) ?? NAV_MODULES[0]
}

function useClock() {
  const [time, setTime] = React.useState(new Date())
  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return time
}

interface CommandBarProps {
  onSearchClick: () => void
}

export function CommandBar({ onSearchClick }: CommandBarProps) {
  const profile = useProfile()
  const mod = useCurrentModule()
  const now = useClock()

  const deepWorkH = formatHours(profile?.deepWorkMinutesToday ?? 0)

  const timeStr = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <header className="commandbar">
      {/* Left: breadcrumb */}
      <div className="commandbar-breadcrumb">
        <span className="commandbar-app mono muted">TERMINAL</span>
        <span className="commandbar-sep muted">/</span>
        <span className="commandbar-module">{mod.name}</span>
      </div>

      {/* Center: search trigger */}
      <button className="commandbar-search" onClick={onSearchClick}>
        <Search size={13} />
        <span>Search or press Ctrl+K</span>
        <kbd className="commandbar-kbd">⌃K</kbd>
      </button>

      {/* Right: quick stats + clock */}
      <div className="commandbar-right">
        <div className="commandbar-stat">
          <span className="commandbar-stat-label">Deep Work</span>
          <span className="commandbar-stat-value mono">{deepWorkH}</span>
        </div>
        <div className="commandbar-divider" />
        <div className="commandbar-time mono">
          <span className="commandbar-date muted">{dateStr}</span>
          <span className="commandbar-clock">{timeStr}</span>
        </div>
        <button className="btn btn-icon btn-ghost commandbar-settings">
          <Settings size={14} />
        </button>
      </div>
    </header>
  )
}
