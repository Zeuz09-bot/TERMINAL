// ============================================================
// TERMINAL — Prop Firms Command Center
// ============================================================

import React, { useState, useMemo } from 'react'
import {
  Building2, Plus, ChevronRight, ChevronDown, Check, X,
  Edit3, Trash2, ExternalLink, Target, TrendingDown,
  DollarSign, BarChart3, AlertCircle
} from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, PropFirm } from '@/db/schema'
import { PROP_FIRM_STATUSES, PROP_FIRM_PROVIDERS } from '@/data/mission'
import './PropFirms.css'

type PFStatus = PropFirm['status']
const STATUS_COLORS: Record<PFStatus, string> = {
  'researching':  'badge-muted',
  'attempting':   'badge-blue',
  'funded':       'badge-green',
  'failed':       'badge-red',
  'passed':       'badge-yellow',
  'withdrawn':    'badge-muted',
}

const EMPTY_FIRM: Omit<PropFirm, 'id' | 'createdAt' | 'updatedAt'> = {
  firmName: '', accountSize: 0, challengeFee: 0, profitTarget: 0,
  maxDailyLoss: 0, maxTotalLoss: 0, minTradingDays: 0, status: 'researching',
  phase: 1, attempts: 0, notes: '', website: '', startDate: null, passDate: null,
}

// ── Prop Firm Form ────────────────────────────────────────────
function PropFirmForm({ firm, onSave, onCancel }: {
  firm: Partial<PropFirm>; onSave: (d: Partial<PropFirm>) => void; onCancel: () => void
}) {
  const [form, setForm] = useState<Partial<PropFirm>>({ ...EMPTY_FIRM, ...firm })
  const set = (key: keyof PropFirm, val: unknown) => setForm(f => ({ ...f, [key]: val }))
  const [customFirm, setCustomFirm] = useState(!PROP_FIRM_PROVIDERS.includes(firm.firmName ?? ''))

  return (
    <form className="paper-form" onSubmit={e => { e.preventDefault(); onSave(form) }}>
      <div className="paper-form-grid">
        {/* Firm name */}
        <div className="paper-form-field paper-form-full">
          <label className="form-label">Prop Firm</label>
          {!customFirm ? (
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <select className="input" style={{ flex: 1 }} value={form.firmName ?? ''} onChange={e => set('firmName', e.target.value)}>
                <option value="">Select firm…</option>
                {PROP_FIRM_PROVIDERS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCustomFirm(true)}>Custom</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input className="input" style={{ flex: 1 }} value={form.firmName ?? ''} onChange={e => set('firmName', e.target.value)} placeholder="Firm name" />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCustomFirm(false)}>Pick from list</button>
            </div>
          )}
        </div>

        {/* Status + Phase */}
        <div className="paper-form-field">
          <label className="form-label">Status</label>
          <select className="input" value={form.status ?? 'researching'} onChange={e => set('status', e.target.value)}>
            {PROP_FIRM_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div className="paper-form-field">
          <label className="form-label">Phase</label>
          <select className="input" value={form.phase ?? 1} onChange={e => set('phase', parseInt(e.target.value))}>
            <option value={1}>Phase 1</option>
            <option value={2}>Phase 2</option>
            <option value={3}>Funded / Live</option>
          </select>
        </div>

        {/* Financial */}
        <div className="paper-form-field">
          <label className="form-label">Account Size ($)</label>
          <input className="input" type="number" value={form.accountSize ?? ''} onChange={e => set('accountSize', parseFloat(e.target.value) || 0)} placeholder="100000" />
        </div>
        <div className="paper-form-field">
          <label className="form-label">Challenge Fee ($)</label>
          <input className="input" type="number" value={form.challengeFee ?? ''} onChange={e => set('challengeFee', parseFloat(e.target.value) || 0)} placeholder="500" />
        </div>
        <div className="paper-form-field">
          <label className="form-label">Profit Target (%)</label>
          <input className="input" type="number" step="0.1" value={form.profitTarget ?? ''} onChange={e => set('profitTarget', parseFloat(e.target.value) || 0)} placeholder="8" />
        </div>
        <div className="paper-form-field">
          <label className="form-label">Max Daily Loss (%)</label>
          <input className="input" type="number" step="0.1" value={form.maxDailyLoss ?? ''} onChange={e => set('maxDailyLoss', parseFloat(e.target.value) || 0)} placeholder="5" />
        </div>
        <div className="paper-form-field">
          <label className="form-label">Max Total Loss (%)</label>
          <input className="input" type="number" step="0.1" value={form.maxTotalLoss ?? ''} onChange={e => set('maxTotalLoss', parseFloat(e.target.value) || 0)} placeholder="10" />
        </div>
        <div className="paper-form-field">
          <label className="form-label">Min Trading Days</label>
          <input className="input" type="number" value={form.minTradingDays ?? ''} onChange={e => set('minTradingDays', parseInt(e.target.value) || 0)} placeholder="10" />
        </div>
        <div className="paper-form-field">
          <label className="form-label">Attempts</label>
          <input className="input" type="number" min="0" value={form.attempts ?? 0} onChange={e => set('attempts', parseInt(e.target.value) || 0)} />
        </div>
        <div className="paper-form-field">
          <label className="form-label">Website</label>
          <input className="input" value={form.website ?? ''} onChange={e => set('website', e.target.value)} placeholder="https://..." />
        </div>
        <div className="paper-form-field">
          <label className="form-label">Start Date</label>
          <input className="input" type="date" value={form.startDate ?? ''} onChange={e => set('startDate', e.target.value || null)} />
        </div>
        <div className="paper-form-field">
          <label className="form-label">Pass Date</label>
          <input className="input" type="date" value={form.passDate ?? ''} onChange={e => set('passDate', e.target.value || null)} />
        </div>
        <div className="paper-form-field paper-form-full">
          <label className="form-label">Notes</label>
          <textarea className="input textarea" rows={3} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} placeholder="Strategy plan, risk rules, observations..." />
        </div>
      </div>
      <div className="paper-form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary"><Check size={13} /> {firm.id ? 'Update' : 'Add Firm'}</button>
      </div>
    </form>
  )
}

// ── Firm Card ─────────────────────────────────────────────────
function PropFirmCard({ firm, expanded, onToggle, onEdit, onDelete, onStatusChange }: {
  firm: PropFirm; expanded: boolean; onToggle: () => void
  onEdit: () => void; onDelete: () => void; onStatusChange: (s: PFStatus) => void
}) {
  const badgeClass = STATUS_COLORS[firm.status]
  const profitTargetAmt = (firm.accountSize * firm.profitTarget) / 100
  const maxLossAmt = (firm.accountSize * firm.maxTotalLoss) / 100
  const riskReward = firm.maxTotalLoss > 0 ? (firm.profitTarget / firm.maxTotalLoss).toFixed(2) : '—'

  return (
    <div className={`pf-card ${expanded ? 'pf-card--expanded' : ''} ${firm.status === 'funded' ? 'pf-card--funded' : ''}`}>
      <div className="pf-card-header" onClick={onToggle}>
        <div className="pf-card-left">
          <div className="pf-firm-initial">{firm.firmName.charAt(0).toUpperCase()}</div>
          <div>
            <div className="pf-firm-name">{firm.firmName}</div>
            <div className="pf-firm-sub mono muted">
              ${firm.accountSize.toLocaleString()} · Phase {firm.phase}
              {firm.attempts > 0 && ` · ${firm.attempts} attempt${firm.attempts > 1 ? 's' : ''}`}
            </div>
          </div>
        </div>
        <div className="pf-card-right">
          <span className={`badge ${badgeClass}`}>{firm.status}</span>
          {firm.status === 'attempting' && firm.profitTarget > 0 && (
            <div className="pf-mini-stats">
              <span className="mono muted" style={{ fontSize: 'var(--text-xs)' }}>
                Target {firm.profitTarget}% · DD {firm.maxTotalLoss}%
              </span>
            </div>
          )}
          {expanded ? <ChevronDown size={13} className="muted" /> : <ChevronRight size={13} className="muted" />}
        </div>
      </div>

      {expanded && (
        <div className="pf-card-body">
          {/* Status selector */}
          <div className="paper-status-row">
            <span className="form-label">Status</span>
            <div className="paper-status-btns">
              {PROP_FIRM_STATUSES.map(s => (
                <button key={s} className={`btn btn-sm ${firm.status === s ? 'btn-primary' : 'btn-outline'}`} onClick={() => onStatusChange(s)}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Key stats */}
          <div className="pf-stats-grid">
            <div className="pf-stat">
              <div className="pf-stat-icon"><DollarSign size={12} /></div>
              <div className="pf-stat-body">
                <div className="pf-stat-val mono">${firm.accountSize.toLocaleString()}</div>
                <div className="pf-stat-label">Account Size</div>
              </div>
            </div>
            <div className="pf-stat">
              <div className="pf-stat-icon"><Target size={12} /></div>
              <div className="pf-stat-body">
                <div className="pf-stat-val mono status-green">{firm.profitTarget}% (${profitTargetAmt.toLocaleString()})</div>
                <div className="pf-stat-label">Profit Target</div>
              </div>
            </div>
            <div className="pf-stat">
              <div className="pf-stat-icon"><TrendingDown size={12} /></div>
              <div className="pf-stat-body">
                <div className="pf-stat-val mono status-red">{firm.maxDailyLoss}% daily / {firm.maxTotalLoss}% total</div>
                <div className="pf-stat-label">Max Drawdown</div>
              </div>
            </div>
            <div className="pf-stat">
              <div className="pf-stat-icon"><BarChart3 size={12} /></div>
              <div className="pf-stat-body">
                <div className="pf-stat-val mono">{riskReward}x · {firm.minTradingDays} min days</div>
                <div className="pf-stat-label">R/R Ratio · Min Days</div>
              </div>
            </div>
            {firm.challengeFee > 0 && (
              <div className="pf-stat">
                <div className="pf-stat-icon"><AlertCircle size={12} /></div>
                <div className="pf-stat-body">
                  <div className="pf-stat-val mono">${firm.challengeFee}</div>
                  <div className="pf-stat-label">Challenge Fee</div>
                </div>
              </div>
            )}
            {firm.attempts > 0 && (
              <div className="pf-stat">
                <div className="pf-stat-icon"><AlertCircle size={12} /></div>
                <div className="pf-stat-body">
                  <div className="pf-stat-val mono">{firm.attempts} · ${(firm.attempts * firm.challengeFee).toLocaleString()} spent</div>
                  <div className="pf-stat-label">Attempts · Total Cost</div>
                </div>
              </div>
            )}
          </div>

          {firm.startDate && (
            <div className="mono muted" style={{ fontSize: 'var(--text-xs)' }}>
              Started: {new Date(firm.startDate).toLocaleDateString()}{firm.passDate ? ` · Passed: ${new Date(firm.passDate).toLocaleDateString()}` : ''}
            </div>
          )}

          {firm.notes && (
            <div className="paper-section">
              <div className="paper-section-label">Notes</div>
              <div className="paper-section-content">{firm.notes}</div>
            </div>
          )}

          {firm.website && (
            <a href={firm.website} target="_blank" rel="noreferrer" className="paper-link">
              <ExternalLink size={12} /> Visit {firm.firmName}
            </a>
          )}

          <div className="paper-card-actions">
            <button className="btn btn-ghost btn-sm" onClick={onEdit}><Edit3 size={12} /> Edit</button>
            <button className="btn btn-danger btn-sm" onClick={onDelete}><Trash2 size={12} /> Delete</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────
export function PropFirms() {
  const [showForm, setShowForm] = useState(false)
  const [editFirm, setEditFirm] = useState<PropFirm | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [filterStatus, setFilterStatus] = useState<PFStatus | 'all'>('all')

  const firms = useLiveQuery(() => db.propFirms.orderBy('updatedAt').reverse().toArray()) ?? []
  const filtered = firms.filter(f => filterStatus === 'all' || f.status === filterStatus)

  const fundedFirms = firms.filter(f => f.status === 'funded')
  const attemptingFirms = firms.filter(f => f.status === 'attempting')
  const totalCost = firms.reduce((sum, f) => sum + f.attempts * f.challengeFee, 0)
  const totalFundedCapital = fundedFirms.reduce((sum, f) => sum + f.accountSize, 0)

  const handleSave = async (data: Partial<PropFirm>) => {
    const now = new Date().toISOString()
    if (editFirm?.id) {
      await db.propFirms.update(editFirm.id, { ...data, updatedAt: now })
    } else {
      await db.propFirms.add({ ...EMPTY_FIRM, ...data, createdAt: now, updatedAt: now } as PropFirm)
    }
    setShowForm(false); setEditFirm(null)
  }

  return (
    <div className="propfirms-page">
      <div className="module-header">
        <div>
          <div className="module-eyebrow mono muted">Milestone 3</div>
          <h1 className="module-title">Prop Firm Command Center</h1>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditFirm(null); setShowForm(true) }}>
          <Plus size={14} /> Add Firm
        </button>
      </div>

      {/* Summary */}
      <div className="research-stats">
        <div className="research-stat">
          <div className="research-stat-val mono">{firms.length}</div>
          <div className="research-stat-label">Tracked</div>
        </div>
        <div className="research-stat">
          <div className="research-stat-val mono status-green">{fundedFirms.length}</div>
          <div className="research-stat-label">Funded</div>
        </div>
        <div className="research-stat">
          <div className="research-stat-val mono status-blue">{attemptingFirms.length}</div>
          <div className="research-stat-label">Attempting</div>
        </div>
        {totalFundedCapital > 0 && (
          <div className="research-stat">
            <div className="research-stat-val mono status-green">${totalFundedCapital.toLocaleString()}</div>
            <div className="research-stat-label">Total Capital</div>
          </div>
        )}
        {totalCost > 0 && (
          <div className="research-stat">
            <div className="research-stat-val mono status-red">${totalCost.toLocaleString()}</div>
            <div className="research-stat-label">Total Cost</div>
          </div>
        )}
      </div>

      {/* Status filter */}
      <div className="filter-tabs">
        <button className={`filter-tab ${filterStatus === 'all' ? 'filter-tab--active' : ''}`} onClick={() => setFilterStatus('all')}>All</button>
        {PROP_FIRM_STATUSES.map(s => (
          <button key={s} className={`filter-tab ${filterStatus === s ? 'filter-tab--active' : ''}`} onClick={() => setFilterStatus(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Form */}
      {(showForm || editFirm) && (
        <div className="card" style={{ maxWidth: 800 }}>
          <div className="panel-header">
            <span className="panel-title">{editFirm ? `Edit: ${editFirm.firmName}` : 'Add Prop Firm'}</span>
            <button className="btn btn-icon btn-ghost" onClick={() => { setShowForm(false); setEditFirm(null) }}><X size={14} /></button>
          </div>
          <PropFirmForm firm={editFirm ?? {}} onSave={handleSave} onCancel={() => { setShowForm(false); setEditFirm(null) }} />
        </div>
      )}

      {/* List */}
      <div className="paper-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Building2 size={32} className="empty-state-icon" />
            <div>{firms.length === 0 ? 'No firms tracked yet' : 'No matches'}</div>
            {firms.length === 0 && (
              <button className="btn btn-outline btn-sm" onClick={() => setShowForm(true)}><Plus size={12} /> Add Firm</button>
            )}
          </div>
        ) : filtered.map(firm => (
          <PropFirmCard
            key={firm.id} firm={firm}
            expanded={expandedId === firm.id}
            onToggle={() => setExpandedId(expandedId === firm.id ? null : firm.id!)}
            onEdit={() => { setEditFirm(firm); setShowForm(false) }}
            onDelete={async () => { if (confirm('Delete firm?')) await db.propFirms.delete(firm.id!) }}
            onStatusChange={async s => db.propFirms.update(firm.id!, { status: s, updatedAt: new Date().toISOString() })}
          />
        ))}
      </div>
    </div>
  )
}
