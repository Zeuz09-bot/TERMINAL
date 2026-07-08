// ============================================================
// TERMINAL — Module Stub (Coming in Next Milestone)
// ============================================================

import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'

interface ModuleStubProps {
  name: string
  description: string
  milestone: number
  features: string[]
  icon: LucideIcon
}

export function ModuleStub({ name, description, milestone, features, icon: Icon }: ModuleStubProps) {
  return (
    <div className="module-wip">
      <div className="module-wip-label">Milestone {milestone}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <Icon size={32} style={{ color: 'var(--border-2)' }} />
        <h1 className="module-wip-title">{name}</h1>
      </div>
      <p className="module-wip-desc">{description}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--muted)' }}>
            <ArrowRight size={12} style={{ color: 'var(--border-2)', flexShrink: 0 }} />
            <span style={{ fontSize: 'var(--text-sm)' }}>{f}</span>
          </div>
        ))}
      </div>

      <div className="module-wip-milestone mono">
        Scheduled for Milestone {milestone} · Architecture ready
      </div>
    </div>
  )
}
