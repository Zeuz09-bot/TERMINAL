// ============================================================
// TERMINAL — Sidebar
// ============================================================

import { NavLink, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard, FlaskConical, BookOpen, Beaker,
  Building2, GraduationCap, BookMarked, NotebookPen,
  CalendarDays, BarChart3, Zap, Flame, X
} from 'lucide-react'
import { useProfile } from '@/db/hooks'
import { getLevelInfo, formatXP } from '@/engine/xp'
import { NAV_MODULES } from '@/data/mission'
import './Sidebar.css'

const ICONS: Record<string, LucideIcon> = {
  'dashboard':       LayoutDashboard,
  'alpha-factory':   FlaskConical,
  'research':        BookOpen,
  'algorithm-lab':   Beaker,
  'prop-firms':      Building2,
  'certifications':  GraduationCap,
  'knowledge-vault': BookMarked,
  'journal':         NotebookPen,
  'calendar':        CalendarDays,
  'analytics':       BarChart3,
}

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation()
  const profile = useProfile()
  const levelInfo = getLevelInfo(profile?.totalXP ?? 0)

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        {/* Wordmark */}
        <div className="sidebar-header">
          <span className="sidebar-wordmark">TERMINAL</span>
          <span className="sidebar-version mono muted">v1.0</span>
          {/* Mobile close button */}
          <button className="sidebar-close btn btn-icon btn-ghost" onClick={onClose} aria-label="Close menu">
            <X size={16} />
          </button>
        </div>

        {/* Phase indicator */}
        <div className="sidebar-phase">
          <span className="sidebar-phase-label">Phase</span>
          <span className="sidebar-phase-value mono">
            {profile?.currentPhase ?? 1} — Foundation
          </span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Modules</div>
          {NAV_MODULES.map((mod) => {
            const Icon = ICONS[mod.id]
            const isActive = location.pathname === mod.path ||
              (mod.path !== '/' && location.pathname.startsWith(mod.path))

            return (
              <NavLink
                key={mod.id}
                to={mod.path}
                className={`sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
                onClick={onClose}
              >
                {Icon && <Icon size={14} />}
                <span>{mod.name}</span>
                {mod.shortcut && (
                  <kbd className="sidebar-kbd">{mod.shortcut}</kbd>
                )}
                {mod.milestone > 1 && !isActive && (
                  <span className="sidebar-milestone">M{mod.milestone}</span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom: XP + Streak */}
        <div className="sidebar-footer">
          <div className="sidebar-xp">
            <div className="sidebar-xp-row">
              <div className="sidebar-xp-level">
                <Zap size={11} />
                <span className="mono">{levelInfo.name}</span>
              </div>
              <span className="sidebar-xp-amount mono">{formatXP(profile?.totalXP ?? 0)} XP</span>
            </div>
            <div className="progress-track" style={{ marginTop: '6px' }}>
              <div
                className="progress-fill"
                style={{ width: `${levelInfo.progress}%` }}
              />
            </div>
            <div className="sidebar-xp-meta mono muted">
              Lv.{levelInfo.level} · {levelInfo.progress}% to Lv.{levelInfo.level + 1}
            </div>
          </div>

          <div className="sidebar-streak">
            <Flame size={12} className={profile?.currentStreak ? 'status-yellow' : ''} />
            <span className="mono">
              {profile?.currentStreak ?? 0} day streak
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}
