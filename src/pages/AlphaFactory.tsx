// ============================================================
// TERMINAL — Alpha Factory
// Full strategy lifecycle tracker
// ============================================================

import React, { useState, useMemo } from 'react'
import {
  FlaskConical, Plus, Search, ChevronRight, ChevronDown,
  TrendingUp, AlertCircle, Check, X, Edit3, Trash2,
  Star, GitBranch, BarChart2, Code2, BookOpen, Clock
} from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Strategy, awardXP } from '@/db/schema'
import { STRATEGY_STAGES, XP_AWARDS, StrategyStage } from '@/data/mission'
import './AlphaFactory.css'

// ── Types ─────────────────────────────────────────────────────
type Priority = Strategy['priority']
const PRIORITIES: Priority[] = ['critical', 'high', 'medium', 'low']
const PRIORITY_COLORS: Record<Priority, string> = {
  critical: 'status-red', high: 'status-yellow', medium: 'status-blue', low: 'status-muted'
}
const MARKETS = ['Forex', 'Futures', 'Equities', 'Crypto', 'Options', 'Commodities', 'Indices']
const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w']

const EMPTY_STRATEGY: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '', version: 1, stage: 'Idea', priority: 'medium', riskRating: 3,
  markets: [], timeframes: [], description: '', hypothesis: '',
  notes: '', codeSnippets: '', researchRefs: [], metrics: {}, isActive: true,
}

// ── Stage Pipeline ────────────────────────────────────────────
function StagePipeline({ current, onChange }: { current: StrategyStage; onChange: (s: StrategyStage) => void }) {
  const currentIdx = STRATEGY_STAGES.indexOf(current)
  return (
    <div className="pipeline">
      {STRATEGY_STAGES.map((stage, i) => {
        const isDone = i < currentIdx
        const isActive = i === currentIdx
        return (
          <React.Fragment key={stage}>
            <button
              className={`pipeline-step ${isDone ? 'pipeline-step--done' : ''} ${isActive ? 'pipeline-step--active' : ''}`}
              onClick={() => onChange(stage)}
              title={stage}
            >
              <div className="pipeline-dot">
                {isDone && <Check size={8} />}
              </div>
              <span className="pipeline-label">{stage}</span>
            </button>
            {i < STRATEGY_STAGES.length - 1 && (
              <div className={`pipeline-line ${i < currentIdx ? 'pipeline-line--done' : ''}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ── Metric Grid ───────────────────────────────────────────────
function MetricGrid({ metrics, onChange }: {
  metrics: Strategy['metrics']
  onChange: (m: Strategy['metrics']) => void
}) {
  const set = (key: keyof Strategy['metrics'], val: string) =>
    onChange({ ...metrics, [key]: val === '' ? undefined : parseFloat(val) })

  const fields: { key: keyof Strategy['metrics']; label: string; suffix?: string }[] = [
    { key: 'sharpe',       label: 'Sharpe Ratio' },
    { key: 'maxDrawdown',  label: 'Max DD',        suffix: '%' },
    { key: 'winRate',      label: 'Win Rate',      suffix: '%' },
    { key: 'profitFactor', label: 'Profit Factor' },
    { key: 'expectancy',   label: 'Expectancy' },
    { key: 'totalTrades',  label: 'Total Trades' },
  ]

  return (
    <div className="metric-grid">
      {fields.map(f => (
        <div key={f.key} className="metric-field">
          <label className="form-label">{f.label}{f.suffix ? ` (${f.suffix})` : ''}</label>
          <input
            className="input"
            type="number"
            step="0.01"
            value={metrics[f.key] ?? ''}
            onChange={e => set(f.key, e.target.value)}
            placeholder="—"
          />
        </div>
      ))}
    </div>
  )
}

// ── Strategy Form ─────────────────────────────────────────────
function StrategyForm({ strategy, onSave, onCancel }: {
  strategy: Partial<Strategy>
  onSave: (s: Partial<Strategy>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Partial<Strategy>>({ ...EMPTY_STRATEGY, ...strategy })
  const [tab, setTab] = useState<'overview' | 'metrics' | 'code'>('overview')

  const set = (key: keyof Strategy, val: unknown) => setForm(f => ({ ...f, [key]: val }))

  const toggleMulti = (key: 'markets' | 'timeframes', val: string) => {
    const arr = (form[key] ?? []) as string[]
    set(key, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  return (
    <form className="strategy-form" onSubmit={e => { e.preventDefault(); onSave(form) }}>
      {/* Tabs */}
      <div className="form-tabs">
        {(['overview', 'metrics', 'code'] as const).map(t => (
          <button key={t} type="button"
            className={`filter-tab ${tab === t ? 'filter-tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="paper-form-grid">
          <div className="paper-form-field paper-form-full">
            <label className="form-label">Strategy Name *</label>
            <input className="input" value={form.name ?? ''} onChange={e => set('name', e.target.value)} required placeholder="e.g. Mean Reversion on ES Futures" />
          </div>
          <div className="paper-form-field">
            <label className="form-label">Priority</label>
            <select className="input" value={form.priority ?? 'medium'} onChange={e => set('priority', e.target.value)}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
          <div className="paper-form-field">
            <label className="form-label">Risk Rating (1–5)</label>
            <input className="input" type="number" min="1" max="5" value={form.riskRating ?? 3} onChange={e => set('riskRating', parseInt(e.target.value))} />
          </div>
          <div className="paper-form-field paper-form-full">
            <label className="form-label">Description</label>
            <textarea className="input textarea" rows={3} value={form.description ?? ''} onChange={e => set('description', e.target.value)} placeholder="What is this strategy? High-level overview..." />
          </div>
          <div className="paper-form-field paper-form-full">
            <label className="form-label">Hypothesis</label>
            <textarea className="input textarea" rows={3} value={form.hypothesis ?? ''} onChange={e => set('hypothesis', e.target.value)} placeholder="What market inefficiency does this exploit? What is your edge?" />
          </div>
          <div className="paper-form-field">
            <label className="form-label">Markets</label>
            <div className="multi-select">
              {MARKETS.map(m => (
                <button key={m} type="button"
                  className={`multi-tag ${(form.markets ?? []).includes(m) ? 'multi-tag--active' : ''}`}
                  onClick={() => toggleMulti('markets', m)}
                >{m}</button>
              ))}
            </div>
          </div>
          <div className="paper-form-field">
            <label className="form-label">Timeframes</label>
            <div className="multi-select">
              {TIMEFRAMES.map(t => (
                <button key={t} type="button"
                  className={`multi-tag ${(form.timeframes ?? []).includes(t) ? 'multi-tag--active' : ''}`}
                  onClick={() => toggleMulti('timeframes', t)}
                >{t}</button>
              ))}
            </div>
          </div>
          <div className="paper-form-field paper-form-full">
            <label className="form-label">Notes</label>
            <textarea className="input textarea" rows={3} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} placeholder="Research notes, observations, ideas..." />
          </div>
        </div>
      )}

      {tab === 'metrics' && (
        <div>
          <div className="strategy-metrics-header">
            <span className="form-label">Performance Metrics</span>
            <span className="muted" style={{ fontSize: 'var(--text-xs)' }}>Backtesting results, walk-forward results, etc.</span>
          </div>
          <MetricGrid metrics={form.metrics ?? {}} onChange={m => set('metrics', m)} />
        </div>
      )}

      {tab === 'code' && (
        <div className="paper-form-field">
          <label className="form-label">Code Snippets / Implementation Notes</label>
          <textarea
            className="input textarea"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', minHeight: 300 }}
            rows={16}
            value={form.codeSnippets ?? ''}
            onChange={e => set('codeSnippets', e.target.value)}
            placeholder="# Strategy implementation&#10;&#10;def calculate_signal(data):&#10;    ..."
          />
        </div>
      )}

      <div className="paper-form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">
          <Check size={13} /> {strategy.id ? 'Update Strategy' : 'Create Strategy'}
        </button>
      </div>
    </form>
  )
}

// ── Strategy Card ─────────────────────────────────────────────
function StrategyCard({ strategy, expanded, onToggle, onEdit, onDelete, onStageChange }: {
  strategy: Strategy
  expanded: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  onStageChange: (s: StrategyStage) => void
}) {
  const stageIdx = STRATEGY_STAGES.indexOf(strategy.stage)
  const stageProgress = Math.round((stageIdx / (STRATEGY_STAGES.length - 1)) * 100)
  const hasMetrics = Object.values(strategy.metrics).some(v => v !== undefined)

  return (
    <div className={`strategy-card ${expanded ? 'strategy-card--expanded' : ''}`}>
      {/* Header */}
      <div className="strategy-card-header" onClick={onToggle}>
        <div className="strategy-card-left">
          <div className={`strategy-priority-bar ${PRIORITY_COLORS[strategy.priority]}`} />
          <div className="strategy-card-meta">
            <div className="strategy-card-name">{strategy.name}</div>
            <div className="strategy-card-sub mono muted">
              v{strategy.version}
              {strategy.markets.length > 0 && ` · ${strategy.markets.join(', ')}`}
              {strategy.timeframes.length > 0 && ` · ${strategy.timeframes.join(' ')}`}
            </div>
          </div>
        </div>
        <div className="strategy-card-right">
          <div className="strategy-stage-mini">
            <div className="progress-track" style={{ width: 80 }}>
              <div className="progress-fill" style={{ width: `${stageProgress}%` }} />
            </div>
            <span className="mono muted" style={{ fontSize: 'var(--text-xs)', minWidth: 120 }}>{strategy.stage}</span>
          </div>
          <span className={`badge ${strategy.priority === 'critical' ? 'badge-red' : strategy.priority === 'high' ? 'badge-yellow' : strategy.priority === 'medium' ? 'badge-blue' : 'badge-muted'}`}>
            {strategy.priority}
          </span>
          {expanded ? <ChevronDown size={14} className="muted" /> : <ChevronRight size={14} className="muted" />}
        </div>
      </div>

      {expanded && (
        <div className="strategy-card-body">
          {/* Pipeline */}
          <div>
            <div className="form-label" style={{ marginBottom: 'var(--space-3)' }}>Lifecycle Stage</div>
            <StagePipeline current={strategy.stage} onChange={onStageChange} />
          </div>

          {strategy.description && (
            <div className="paper-section">
              <div className="paper-section-label">Description</div>
              <div className="paper-section-content">{strategy.description}</div>
            </div>
          )}
          {strategy.hypothesis && (
            <div className="paper-section">
              <div className="paper-section-label">Hypothesis</div>
              <div className="paper-section-content">{strategy.hypothesis}</div>
            </div>
          )}

          {/* Metrics */}
          {hasMetrics && (
            <div className="strategy-metrics-display">
              <div className="paper-section-label" style={{ marginBottom: 'var(--space-3)' }}>Performance</div>
              <div className="strategy-metrics-row">
                {strategy.metrics.sharpe !== undefined && (
                  <div className="strategy-metric-item">
                    <div className="strategy-metric-val mono">{strategy.metrics.sharpe?.toFixed(2)}</div>
                    <div className="strategy-metric-label">Sharpe</div>
                  </div>
                )}
                {strategy.metrics.maxDrawdown !== undefined && (
                  <div className="strategy-metric-item">
                    <div className="strategy-metric-val mono status-red">{strategy.metrics.maxDrawdown?.toFixed(1)}%</div>
                    <div className="strategy-metric-label">Max DD</div>
                  </div>
                )}
                {strategy.metrics.winRate !== undefined && (
                  <div className="strategy-metric-item">
                    <div className="strategy-metric-val mono status-green">{strategy.metrics.winRate?.toFixed(1)}%</div>
                    <div className="strategy-metric-label">Win Rate</div>
                  </div>
                )}
                {strategy.metrics.profitFactor !== undefined && (
                  <div className="strategy-metric-item">
                    <div className="strategy-metric-val mono">{strategy.metrics.profitFactor?.toFixed(2)}</div>
                    <div className="strategy-metric-label">PF</div>
                  </div>
                )}
                {strategy.metrics.expectancy !== undefined && (
                  <div className="strategy-metric-item">
                    <div className="strategy-metric-val mono">{strategy.metrics.expectancy?.toFixed(2)}</div>
                    <div className="strategy-metric-label">Expectancy</div>
                  </div>
                )}
                {strategy.metrics.totalTrades !== undefined && (
                  <div className="strategy-metric-item">
                    <div className="strategy-metric-val mono">{strategy.metrics.totalTrades}</div>
                    <div className="strategy-metric-label">Trades</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {strategy.codeSnippets && (
            <div className="paper-section">
              <div className="paper-section-label">Code</div>
              <pre className="paper-equations">{strategy.codeSnippets}</pre>
            </div>
          )}
          {strategy.notes && (
            <div className="paper-section">
              <div className="paper-section-label">Notes</div>
              <div className="paper-section-content">{strategy.notes}</div>
            </div>
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
export function AlphaFactory() {
  const [showForm, setShowForm] = useState(false)
  const [editStrategy, setEditStrategy] = useState<Strategy | null>(null)
  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState<StrategyStage | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const strategies = useLiveQuery(() =>
    db.strategies.orderBy('updatedAt').reverse().toArray()
  ) ?? []

  const filtered = useMemo(() => {
    return strategies.filter(s => {
      if (filterStage !== 'all' && s.stage !== filterStage) return false
      if (filterPriority !== 'all' && s.priority !== filterPriority) return false
      if (search) {
        const q = search.toLowerCase()
        return s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.hypothesis.toLowerCase().includes(q)
      }
      return true
    })
  }, [strategies, filterStage, filterPriority, search])

  // Stage counts
  const stageCounts = useMemo(() => {
    const c: Record<string, number> = {}
    strategies.forEach(s => { c[s.stage] = (c[s.stage] ?? 0) + 1 })
    return c
  }, [strategies])

  const handleSave = async (data: Partial<Strategy>) => {
    const now = new Date().toISOString()
    if (editStrategy?.id) {
      const wasImplemented = editStrategy.stage !== 'Production' && data.stage === 'Production'
      await db.strategies.update(editStrategy.id, { ...data, updatedAt: now })
      if (wasImplemented) {
        await awardXP('strategy_implemented', `Strategy in Production: ${data.name}`, XP_AWARDS.strategy_implemented)
      }
      if (data.stage === 'Backtesting' && editStrategy.stage !== 'Backtesting') {
        await awardXP('backtest_completed', `Backtest started: ${data.name}`, XP_AWARDS.backtest_completed)
      }
    } else {
      await db.strategies.add({ ...EMPTY_STRATEGY, ...data, createdAt: now, updatedAt: now } as Strategy)
    }
    setShowForm(false)
    setEditStrategy(null)
  }

  const handleStageChange = async (strategy: Strategy, stage: StrategyStage) => {
    const now = new Date().toISOString()
    await db.strategies.update(strategy.id!, { stage, updatedAt: now })
    if (stage === 'Production' && strategy.stage !== 'Production') {
      await awardXP('strategy_implemented', `Strategy reached Production: ${strategy.name}`, XP_AWARDS.strategy_implemented)
    }
    if (stage === 'Backtesting' && STRATEGY_STAGES.indexOf(strategy.stage) < STRATEGY_STAGES.indexOf('Backtesting')) {
      await awardXP('backtest_completed', `Backtest: ${strategy.name}`, XP_AWARDS.backtest_completed)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Delete this strategy?')) await db.strategies.delete(id)
  }

  // Summary stats
  const inProduction = strategies.filter(s => s.stage === 'Production').length
  const inDev = strategies.filter(s => ['Implementation', 'Backtesting', 'Walk Forward Test', 'Monte Carlo', 'Paper Trading'].includes(s.stage)).length
  const avgSharpe = strategies
    .filter(s => s.metrics.sharpe !== undefined)
    .reduce((sum, s, _, arr) => sum + (s.metrics.sharpe ?? 0) / arr.length, 0)

  return (
    <div className="alpha-page">
      {/* Header */}
      <div className="module-header">
        <div>
          <div className="module-eyebrow mono muted">Milestone 3</div>
          <h1 className="module-title">Alpha Factory</h1>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditStrategy(null); setShowForm(true) }}>
          <Plus size={14} /> New Strategy
        </button>
      </div>

      {/* Stats */}
      <div className="research-stats">
        <div className="research-stat">
          <div className="research-stat-val mono">{strategies.length}</div>
          <div className="research-stat-label">Total</div>
        </div>
        <div className="research-stat">
          <div className="research-stat-val mono status-green">{inProduction}</div>
          <div className="research-stat-label">Production</div>
        </div>
        <div className="research-stat">
          <div className="research-stat-val mono status-blue">{inDev}</div>
          <div className="research-stat-label">In Development</div>
        </div>
        <div className="research-stat">
          <div className="research-stat-val mono status-yellow">
            {avgSharpe > 0 ? avgSharpe.toFixed(2) : '—'}
          </div>
          <div className="research-stat-label">Avg Sharpe</div>
        </div>
      </div>

      {/* Filters */}
      <div className="research-filters">
        <div className="search-wrap" style={{ maxWidth: 320 }}>
          <Search size={13} className="search-icon muted" />
          <input className="input search-input" placeholder="Search strategies…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          <button className={`filter-tab ${filterStage === 'all' ? 'filter-tab--active' : ''}`} onClick={() => setFilterStage('all')}>All Stages</button>
          {STRATEGY_STAGES.filter(s => stageCounts[s]).map(s => (
            <button key={s} className={`filter-tab ${filterStage === s ? 'filter-tab--active' : ''}`} onClick={() => setFilterStage(s)}>
              {s} <span className="mono" style={{ fontSize: 9 }}>({stageCounts[s]})</span>
            </button>
          ))}
        </div>
        <div className="filter-tabs">
          <button className={`filter-tab ${filterPriority === 'all' ? 'filter-tab--active' : ''}`} onClick={() => setFilterPriority('all')}>All</button>
          {PRIORITIES.map(p => (
            <button key={p} className={`filter-tab ${filterPriority === p ? 'filter-tab--active' : ''}`} onClick={() => setFilterPriority(p)}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      {(showForm || editStrategy) && (
        <div className="card">
          <div className="panel-header">
            <span className="panel-title">{editStrategy ? `Edit: ${editStrategy.name}` : 'New Strategy'}</span>
            <button className="btn btn-icon btn-ghost" onClick={() => { setShowForm(false); setEditStrategy(null) }}><X size={14} /></button>
          </div>
          {editStrategy && (
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <StagePipeline current={editStrategy.stage} onChange={s => setEditStrategy(e => e ? { ...e, stage: s } : null)} />
            </div>
          )}
          <StrategyForm
            strategy={editStrategy ?? {}}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditStrategy(null) }}
          />
        </div>
      )}

      {/* Strategy List */}
      <div className="paper-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <FlaskConical size={32} className="empty-state-icon" />
            <div>{strategies.length === 0 ? 'No strategies yet' : 'No matches'}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-2)' }}>
              {strategies.length === 0 ? 'Create your first algorithmic strategy.' : 'Adjust filters'}
            </div>
            {strategies.length === 0 && (
              <button className="btn btn-outline btn-sm" onClick={() => setShowForm(true)}><Plus size={12} /> New Strategy</button>
            )}
          </div>
        ) : filtered.map(s => (
          <StrategyCard
            key={s.id}
            strategy={s}
            expanded={expandedId === s.id}
            onToggle={() => setExpandedId(expandedId === s.id ? null : s.id!)}
            onEdit={() => { setEditStrategy(s); setShowForm(false) }}
            onDelete={() => handleDelete(s.id!)}
            onStageChange={stage => handleStageChange(s, stage)}
          />
        ))}
      </div>
    </div>
  )
}
