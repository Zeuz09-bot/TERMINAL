// ============================================================
// TERMINAL — Algorithm Lab
// ============================================================

import React, { useState, useMemo } from 'react'
import {
  Beaker, Plus, Search, ChevronRight, ChevronDown,
  Check, X, Edit3, Trash2, FlaskConical
} from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Experiment } from '@/db/schema'
import { LAB_SECTIONS } from '@/data/mission'
import './AlgorithmLab.css'

type ExpStatus = Experiment['status']
const STATUSES: { value: ExpStatus; label: string; color: string }[] = [
  { value: 'active',    label: 'Active',    color: 'badge-blue' },
  { value: 'completed', label: 'Completed', color: 'badge-green' },
  { value: 'failed',    label: 'Failed',    color: 'badge-red' },
  { value: 'archived',  label: 'Archived',  color: 'badge-muted' },
]

const EMPTY_EXP: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '', section: LAB_SECTIONS[0], objective: '', variables: '',
  expectedOutcome: '', actualOutcome: '', conclusion: '',
  status: 'active', linkedStrategyIds: [],
}

function ExperimentForm({ exp, onSave, onCancel }: {
  exp: Partial<Experiment>
  onSave: (d: Partial<Experiment>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Partial<Experiment>>({ ...EMPTY_EXP, ...exp })
  const set = (key: keyof Experiment, val: unknown) => setForm(f => ({ ...f, [key]: val }))

  return (
    <form className="paper-form" onSubmit={e => { e.preventDefault(); onSave(form) }}>
      <div className="paper-form-grid">
        <div className="paper-form-field paper-form-full">
          <label className="form-label">Experiment Name *</label>
          <input className="input" required value={form.name ?? ''} onChange={e => set('name', e.target.value)} placeholder="Descriptive experiment name" />
        </div>
        <div className="paper-form-field">
          <label className="form-label">Section</label>
          <select className="input" value={form.section ?? LAB_SECTIONS[0]} onChange={e => set('section', e.target.value)}>
            {LAB_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="paper-form-field">
          <label className="form-label">Status</label>
          <select className="input" value={form.status ?? 'active'} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="paper-form-field paper-form-full">
          <label className="form-label">Objective</label>
          <textarea className="input textarea" rows={3} value={form.objective ?? ''} onChange={e => set('objective', e.target.value)} placeholder="What are you trying to prove or disprove?" />
        </div>
        <div className="paper-form-field paper-form-full">
          <label className="form-label">Variables</label>
          <textarea className="input textarea" rows={2} value={form.variables ?? ''} onChange={e => set('variables', e.target.value)} placeholder="Independent variables, parameters, hyperparameters..." />
        </div>
        <div className="paper-form-field">
          <label className="form-label">Expected Outcome</label>
          <textarea className="input textarea" rows={3} value={form.expectedOutcome ?? ''} onChange={e => set('expectedOutcome', e.target.value)} placeholder="What do you expect to find?" />
        </div>
        <div className="paper-form-field">
          <label className="form-label">Actual Outcome</label>
          <textarea className="input textarea" rows={3} value={form.actualOutcome ?? ''} onChange={e => set('actualOutcome', e.target.value)} placeholder="What actually happened?" />
        </div>
        <div className="paper-form-field paper-form-full">
          <label className="form-label">Conclusion</label>
          <textarea className="input textarea" rows={3} value={form.conclusion ?? ''} onChange={e => set('conclusion', e.target.value)} placeholder="What did you learn? What are the next steps?" />
        </div>
      </div>
      <div className="paper-form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary"><Check size={13} /> {exp.id ? 'Update' : 'Create'}</button>
      </div>
    </form>
  )
}

function ExperimentCard({ exp, expanded, onToggle, onEdit, onDelete, onStatusChange }: {
  exp: Experiment; expanded: boolean; onToggle: () => void
  onEdit: () => void; onDelete: () => void; onStatusChange: (s: ExpStatus) => void
}) {
  const status = STATUSES.find(s => s.value === exp.status)!

  return (
    <div className={`exp-card ${expanded ? 'exp-card--expanded' : ''}`}>
      <div className="exp-card-header" onClick={onToggle}>
        <div className="exp-card-left">
          <span className={`badge ${status.color}`}>{status.label}</span>
          <div>
            <div className="exp-card-name">{exp.name}</div>
            {exp.objective && <div className="exp-card-obj muted">{exp.objective.slice(0, 80)}{exp.objective.length > 80 ? '…' : ''}</div>}
          </div>
        </div>
        <div className="exp-card-right">
          <span className="tag">{exp.section}</span>
          {expanded ? <ChevronDown size={13} className="muted" /> : <ChevronRight size={13} className="muted" />}
        </div>
      </div>

      {expanded && (
        <div className="exp-card-body">
          {/* Status */}
          <div className="paper-status-row">
            <span className="form-label">Status</span>
            <div className="paper-status-btns">
              {STATUSES.map(s => (
                <button key={s.value}
                  className={`btn btn-sm ${exp.status === s.value ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => onStatusChange(s.value)}
                >{s.label}</button>
              ))}
            </div>
          </div>

          <div className="exp-detail-grid">
            {exp.objective && <div className="paper-section"><div className="paper-section-label">Objective</div><div className="paper-section-content">{exp.objective}</div></div>}
            {exp.variables && <div className="paper-section"><div className="paper-section-label">Variables</div><div className="paper-section-content">{exp.variables}</div></div>}
            {exp.expectedOutcome && <div className="paper-section"><div className="paper-section-label">Expected Outcome</div><div className="paper-section-content">{exp.expectedOutcome}</div></div>}
            {exp.actualOutcome && <div className="paper-section"><div className="paper-section-label">Actual Outcome</div><div className="paper-section-content">{exp.actualOutcome}</div></div>}
            {exp.conclusion && (
              <div className="paper-section" style={{ gridColumn: 'span 2' }}>
                <div className="paper-section-label">Conclusion</div>
                <div className="paper-section-content">{exp.conclusion}</div>
              </div>
            )}
          </div>

          <div className="paper-card-actions">
            <button className="btn btn-ghost btn-sm" onClick={onEdit}><Edit3 size={12} /> Edit</button>
            <button className="btn btn-danger btn-sm" onClick={onDelete}><Trash2 size={12} /> Delete</button>
          </div>
        </div>
      )}
    </div>
  )
}

export function AlgorithmLab() {
  const [showForm, setShowForm] = useState(false)
  const [editExp, setEditExp] = useState<Experiment | null>(null)
  const [search, setSearch] = useState('')
  const [activeSection, setActiveSection] = useState<string>('All')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const experiments = useLiveQuery(() => db.experiments.orderBy('updatedAt').reverse().toArray()) ?? []

  const filtered = useMemo(() => {
    return experiments.filter(e => {
      if (activeSection !== 'All' && e.section !== activeSection) return false
      if (search) {
        const q = search.toLowerCase()
        return e.name.toLowerCase().includes(q) || e.objective.toLowerCase().includes(q) || e.section.toLowerCase().includes(q)
      }
      return true
    })
  }, [experiments, activeSection, search])

  const sectionCounts = useMemo(() => {
    const c: Record<string, number> = { All: experiments.length }
    experiments.forEach(e => { c[e.section] = (c[e.section] ?? 0) + 1 })
    return c
  }, [experiments])

  const handleSave = async (data: Partial<Experiment>) => {
    const now = new Date().toISOString()
    if (editExp?.id) {
      await db.experiments.update(editExp.id, { ...data, updatedAt: now })
    } else {
      await db.experiments.add({ ...EMPTY_EXP, ...data, createdAt: now, updatedAt: now } as Experiment)
    }
    setShowForm(false); setEditExp(null)
  }

  const handleStatusChange = async (exp: Experiment, status: ExpStatus) => {
    await db.experiments.update(exp.id!, { status, updatedAt: new Date().toISOString() })
  }

  return (
    <div className="lab-page">
      <div className="module-header">
        <div>
          <div className="module-eyebrow mono muted">Milestone 3</div>
          <h1 className="module-title">Algorithm Lab</h1>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditExp(null); setShowForm(true) }}>
          <Plus size={14} /> New Experiment
        </button>
      </div>

      <div className="lab-layout">
        {/* Section sidebar */}
        <div className="lab-sidebar">
          <div className="vault-folders">
            {['All', ...LAB_SECTIONS].map(section => (
              <button
                key={section}
                className={`vault-folder-btn ${activeSection === section ? 'vault-folder-btn--active' : ''}`}
                onClick={() => setActiveSection(section)}
              >
                <Beaker size={11} />
                <span>{section}</span>
                <span className="vault-folder-count mono">{sectionCounts[section] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="lab-main">
          <div className="research-filters">
            <div className="search-wrap">
              <Search size={13} className="search-icon muted" />
              <input className="input search-input" placeholder="Search experiments…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {(showForm || editExp) && (
            <div className="card">
              <div className="panel-header">
                <span className="panel-title">{editExp ? 'Edit Experiment' : 'New Experiment'}</span>
                <button className="btn btn-icon btn-ghost" onClick={() => { setShowForm(false); setEditExp(null) }}><X size={14} /></button>
              </div>
              <ExperimentForm exp={editExp ?? {}} onSave={handleSave} onCancel={() => { setShowForm(false); setEditExp(null) }} />
            </div>
          )}

          <div className="paper-list">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <Beaker size={32} className="empty-state-icon" />
                <div>{experiments.length === 0 ? 'No experiments yet' : 'No matches'}</div>
                {experiments.length === 0 && (
                  <button className="btn btn-outline btn-sm" onClick={() => setShowForm(true)}><Plus size={12} /> New Experiment</button>
                )}
              </div>
            ) : filtered.map(exp => (
              <ExperimentCard
                key={exp.id} exp={exp}
                expanded={expandedId === exp.id}
                onToggle={() => setExpandedId(expandedId === exp.id ? null : exp.id!)}
                onEdit={() => { setEditExp(exp); setShowForm(false) }}
                onDelete={async () => { if (confirm('Delete experiment?')) await db.experiments.delete(exp.id!) }}
                onStatusChange={s => handleStatusChange(exp, s)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
