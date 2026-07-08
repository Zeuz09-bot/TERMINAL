// ============================================================
// TERMINAL — Certifications
// ============================================================

import React, { useState } from 'react'
import { GraduationCap, Clock, ChevronDown, ChevronRight, Plus, Check, Edit3 } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, CertProgress, awardXP } from '@/db/schema'
import { CERTIFICATIONS, XP_AWARDS } from '@/data/mission'
import { ensureProfile } from '@/db/schema'
import './Certifications.css'

const CATEGORIES = ['Finance', 'Software Engineering', 'Networking', 'Cybersecurity']

function useCertProgressAll() {
  return useLiveQuery(() => db.certProgress.toArray()) ?? []
}

function CertCard({ cert, progress, isActive, onSetActive, onUpdate }: {
  cert: typeof CERTIFICATIONS[0]
  progress: CertProgress | undefined
  isActive: boolean
  onSetActive: () => void
  onUpdate: (data: Partial<CertProgress>) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [hoursInput, setHoursInput] = useState('')
  const [pctInput, setPctInput] = useState('')
  const [deadlineInput, setDeadlineInput] = useState('')
  const [notesInput, setNotesInput] = useState('')

  const pct = progress?.completionPercent ?? 0
  const hours = progress?.studyHours ?? 0
  const isCompleted = progress?.isCompleted ?? false

  const startEdit = () => {
    setHoursInput(String(progress?.studyHours ?? 0))
    setPctInput(String(progress?.completionPercent ?? 0))
    setDeadlineInput(progress?.deadline ?? '')
    setNotesInput(progress?.notes ?? '')
    setEditing(true)
    setExpanded(true)
  }

  const saveEdit = async () => {
    const wasComplete = progress?.isCompleted
    const nowComplete = parseInt(pctInput) >= 100
    await onUpdate({
      studyHours: parseFloat(hoursInput) || 0,
      completionPercent: Math.min(100, parseInt(pctInput) || 0),
      deadline: deadlineInput || null,
      notes: notesInput,
      isCompleted: nowComplete,
      completedAt: nowComplete && !wasComplete ? new Date().toISOString() : (progress?.completedAt ?? null),
    })
    if (nowComplete && !wasComplete) {
      await awardXP('certification_module_completed', `Completed ${cert.name}`, XP_AWARDS.certification_module_completed)
    }
    setEditing(false)
  }

  return (
    <div className={`cert-card ${isActive ? 'cert-card--active' : ''} ${isCompleted ? 'cert-card--done' : ''}`}>
      <div className="cert-card-header" onClick={() => setExpanded(e => !e)}>
        <div className="cert-card-left">
          <div className="cert-card-indicator">
            {isCompleted ? (
              <Check size={13} className="status-green" />
            ) : (
              <div className={`cert-card-dot ${isActive ? 'cert-card-dot--active' : ''}`} />
            )}
          </div>
          <div>
            <div className="cert-card-name">{cert.name}</div>
            <div className="cert-card-meta mono muted">
              {hours}h studied · {pct}% complete
              {progress?.deadline && ` · Due ${new Date(progress.deadline).toLocaleDateString()}`}
            </div>
          </div>
        </div>
        <div className="cert-card-right">
          {isActive && <span className="badge badge-green">Active</span>}
          {isCompleted && <span className="badge badge-muted">Completed</span>}
          <div className="cert-mini-progress">
            <div className="progress-track" style={{ width: 80 }}>
              <div className={`progress-fill ${isCompleted ? '' : 'progress-fill-blue'}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="mono muted" style={{ fontSize: 'var(--text-xs)', minWidth: 28 }}>{pct}%</span>
          </div>
          {expanded ? <ChevronDown size={13} className="muted" /> : <ChevronRight size={13} className="muted" />}
        </div>
      </div>

      {expanded && (
        <div className="cert-card-body">
          {!isActive && !isCompleted && (
            <button className="btn btn-outline btn-sm" onClick={onSetActive}>
              Set as Active Certification
            </button>
          )}

          {editing ? (
            <div className="cert-edit-form">
              <div className="cert-edit-row">
                <div className="paper-form-field">
                  <label className="form-label">Study Hours</label>
                  <input className="input" type="number" step="0.5" value={hoursInput} onChange={e => setHoursInput(e.target.value)} />
                </div>
                <div className="paper-form-field">
                  <label className="form-label">Completion %</label>
                  <input className="input" type="number" min="0" max="100" value={pctInput} onChange={e => setPctInput(e.target.value)} />
                </div>
                <div className="paper-form-field">
                  <label className="form-label">Deadline</label>
                  <input className="input" type="date" value={deadlineInput} onChange={e => setDeadlineInput(e.target.value)} />
                </div>
              </div>
              <div className="paper-form-field" style={{ marginTop: 'var(--space-2)' }}>
                <label className="form-label">Notes</label>
                <textarea className="input textarea" rows={3} value={notesInput} onChange={e => setNotesInput(e.target.value)} placeholder="Study materials, resources, key topics..." />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                <button className="btn btn-primary btn-sm" onClick={saveEdit}><Check size={12} /> Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="cert-detail">
              {progress?.notes && (
                <div className="paper-section">
                  <div className="paper-section-label">Notes</div>
                  <div className="paper-section-content">{progress.notes}</div>
                </div>
              )}
              <button className="btn btn-ghost btn-sm" onClick={startEdit}>
                <Edit3 size={12} /> Update Progress
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function Certifications() {
  const allProgress = useCertProgressAll()
  const profile = useLiveQuery(() => ensureProfile())

  const progressMap = Object.fromEntries(allProgress.map(p => [p.certId, p]))

  const ensureCertProgress = async (certId: string) => {
    const existing = await db.certProgress.where('certId').equals(certId).first()
    if (!existing) {
      const now = new Date().toISOString()
      await db.certProgress.add({
        certId, studyHours: 0, completionPercent: 0,
        deadline: null, notes: '', isCompleted: false,
        completedAt: null, createdAt: now, updatedAt: now,
      })
    }
  }

  const handleUpdate = async (certId: string, data: Partial<CertProgress>) => {
    await ensureCertProgress(certId)
    const existing = await db.certProgress.where('certId').equals(certId).first()
    if (existing) {
      await db.certProgress.update(existing.id!, { ...data, updatedAt: new Date().toISOString() })
    }
  }

  const handleSetActive = async (certId: string) => {
    await db.profiles.toCollection().modify({ currentCertId: certId, updatedAt: new Date().toISOString() })
  }

  // Totals
  const totalHours = allProgress.reduce((s, p) => s + p.studyHours, 0)
  const completed = allProgress.filter(p => p.isCompleted).length

  return (
    <div className="certs-page">
      <div className="module-header">
        <div>
          <div className="module-eyebrow mono muted">Knowledge System</div>
          <h1 className="module-title">Certifications</h1>
        </div>
        <div className="certs-summary">
          <div className="research-stat">
            <div className="research-stat-val mono status-green">{completed}</div>
            <div className="research-stat-label">Completed</div>
          </div>
          <div className="research-stat">
            <div className="research-stat-val mono">{CERTIFICATIONS.length}</div>
            <div className="research-stat-label">Total</div>
          </div>
          <div className="research-stat">
            <div className="research-stat-val mono status-blue">{totalHours.toFixed(1)}h</div>
            <div className="research-stat-label">Study Hours</div>
          </div>
        </div>
      </div>

      {/* Overall progress */}
      <div className="card">
        <div className="panel-header">
          <span className="panel-title">Overall Roadmap Progress</span>
          <span className="mono muted" style={{ fontSize: 'var(--text-xs)' }}>
            {completed} / {CERTIFICATIONS.length} certifications
          </span>
        </div>
        <div className="progress-track" style={{ height: 6 }}>
          <div className="progress-fill" style={{ width: `${Math.round((completed / CERTIFICATIONS.length) * 100)}%` }} />
        </div>
        <div className="mono muted" style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}>
          {Math.round((completed / CERTIFICATIONS.length) * 100)}% of certification roadmap complete
        </div>
      </div>

      {/* Categories */}
      {CATEGORIES.map(cat => {
        const certs = CERTIFICATIONS.filter(c => c.category === cat).sort((a, b) => a.priority - b.priority)
        return (
          <div key={cat} className="cert-category">
            <div className="cert-category-header">
              <GraduationCap size={13} className="muted" />
              <span className="cert-category-label">{cat}</span>
              <span className="mono muted" style={{ fontSize: 'var(--text-xs)' }}>
                {certs.filter(c => progressMap[c.id]?.isCompleted).length} / {certs.length}
              </span>
            </div>
            <div className="cert-list">
              {certs.map(cert => (
                <CertCard
                  key={cert.id}
                  cert={cert}
                  progress={progressMap[cert.id]}
                  isActive={profile?.currentCertId === cert.id}
                  onSetActive={() => handleSetActive(cert.id)}
                  onUpdate={(data) => handleUpdate(cert.id, data)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
