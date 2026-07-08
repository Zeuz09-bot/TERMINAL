// ============================================================
// TERMINAL — Command Palette (Ctrl+K)
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Search, LayoutDashboard, FlaskConical, BookOpen, Beaker,
         Building2, GraduationCap, BookMarked, NotebookPen,
         CalendarDays, BarChart3, ArrowRight, Zap } from 'lucide-react'
import { NAV_MODULES, XP_AWARDS } from '@/data/mission'
import { awardXP } from '@/db/schema'
import './CommandPalette.css'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

const NAV_ICONS: Record<string, LucideIcon> = {
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

interface Command {
  id: string
  label: string
  description?: string
  group: string
  icon?: LucideIcon
  action: () => void
  shortcut?: string
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const commands: Command[] = [
    // Navigation
    ...NAV_MODULES.map((mod) => ({
      id: `nav-${mod.id}`,
      label: mod.name,
      description: `Navigate to ${mod.name}`,
      group: 'Navigation',
      icon: NAV_ICONS[mod.id],
      shortcut: mod.shortcut ?? undefined,
      action: () => { navigate(mod.path); onClose() },
    })),
    // Quick Actions
    {
      id: 'action-journal',
      label: 'Open Today\'s Journal',
      description: 'Create or continue today\'s journal entry',
      group: 'Quick Actions',
      icon: NotebookPen,
      action: () => { navigate('/journal'); onClose() },
    },
    {
      id: 'action-new-note',
      label: 'New Note',
      description: 'Create a new note in Knowledge Vault',
      group: 'Quick Actions',
      icon: BookMarked,
      action: () => { navigate('/knowledge-vault'); onClose() },
    },
    {
      id: 'action-new-strategy',
      label: 'New Strategy',
      description: 'Add a new strategy to Alpha Factory',
      group: 'Quick Actions',
      icon: FlaskConical,
      action: () => { navigate('/alpha-factory'); onClose() },
    },
    {
      id: 'action-new-paper',
      label: 'Add Research Paper',
      description: 'Log a new research paper',
      group: 'Quick Actions',
      icon: BookOpen,
      action: () => { navigate('/research'); onClose() },
    },
    // XP Events
    {
      id: 'xp-exercise',
      label: 'Log Exercise (+40 XP)',
      description: 'Award XP for completing a workout',
      group: 'Log XP',
      icon: Zap,
      action: async () => {
        await awardXP('exercise', 'Exercise logged', XP_AWARDS.exercise)
        onClose()
      },
    },
    {
      id: 'xp-reading',
      label: 'Log Reading Session (+30 XP)',
      description: 'Award XP for a reading session',
      group: 'Log XP',
      icon: Zap,
      action: async () => {
        await awardXP('reading', 'Reading session logged', XP_AWARDS.reading)
        onClose()
      },
    },
  ]

  const filtered = query.trim() === ''
    ? commands
    : commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description?.toLowerCase().includes(query.toLowerCase()) ||
          c.group.toLowerCase().includes(query.toLowerCase())
      )

  // Group commands
  const groups = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = []
    acc[cmd.group].push(cmd)
    return acc
  }, {})

  // Clamp selected index
  useEffect(() => {
    setSelected(0)
  }, [query])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((s) => Math.min(s + 1, filtered.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((s) => Math.max(s - 1, 0))
      }
      if (e.key === 'Enter') {
        filtered[selected]?.action()
      }
    },
    [filtered, selected, onClose]
  )

  if (!isOpen) return null

  let flatIndex = 0

  return (
    <div className="palette-overlay" onClick={onClose}>
      <div
        className="palette"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="palette-search">
          <Search size={14} className="palette-search-icon" />
          <input
            ref={inputRef}
            className="palette-input"
            placeholder="Search commands, modules, actions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="palette-esc">ESC</kbd>
        </div>

        {/* Results */}
        <div className="palette-results">
          {filtered.length === 0 && (
            <div className="palette-empty">No results for "{query}"</div>
          )}
          {Object.entries(groups).map(([group, cmds]) => (
            <div key={group} className="palette-group">
              <div className="palette-group-label">{group}</div>
              {cmds.map((cmd) => {
                const Icon = cmd.icon
                const idx = flatIndex++
                const isSelected = idx === selected
                return (
                  <button
                    key={cmd.id}
                    className={`palette-item ${isSelected ? 'palette-item--selected' : ''}`}
                    onClick={cmd.action}
                    onMouseEnter={() => setSelected(idx)}
                  >
                    <span className="palette-item-icon">
                      {Icon && <Icon size={13} />}
                    </span>
                    <span className="palette-item-label">{cmd.label}</span>
                    {cmd.description && (
                      <span className="palette-item-desc">{cmd.description}</span>
                    )}
                    {cmd.shortcut && (
                      <kbd className="palette-item-kbd">{cmd.shortcut}</kbd>
                    )}
                    {isSelected && (
                      <ArrowRight size={12} className="palette-item-arrow" />
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="palette-footer">
          <span className="mono">↑↓ navigate</span>
          <span className="mono">↵ select</span>
          <span className="mono">ESC close</span>
        </div>
      </div>
    </div>
  )
}
