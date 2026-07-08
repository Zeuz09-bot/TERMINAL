// ============================================================
// TERMINAL — Research Center
// ============================================================

import React, { useState, useMemo } from 'react'
import {
  BookOpen, Plus, Search, Star, ExternalLink, Tag,
  ChevronDown, ChevronRight, Filter, X, Check, Trash2, Edit3
} from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, ResearchPaper, awardXP } from '@/db/schema'
import { XP_AWARDS } from '@/data/mission'
import './ResearchCenter.css'

// ── Types ─────────────────────────────────────────────────────
type Status = ResearchPaper['status']
const STATUSES: { value: Status; label: string; color: string }[] = [
  { value: 'unread',      label: 'Unread',      color: 'muted' },
  { value: 'reading',     label: 'Reading',     color: 'yellow' },
  { value: 'implemented', label: 'Implemented', color: 'green' },
  { value: 'rejected',    label: 'Rejected',    color: 'red' },
]

const EMPTY_PAPER: Omit<ResearchPaper, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '', authors: [], year: new Date().getFullYear(), journal: '',
  link: '', tags: [], summary: '', importantEquations: '',
  implementationIdeas: '', relatedStrategyIds: [], status: 'unread', isFavorite: false,
}

// ── Paper Form ────────────────────────────────────────────────
function PaperForm({ paper, onSave, onCancel }: {
  paper: Partial<ResearchPaper>
  onSave: (p: Partial<ResearchPaper>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Partial<ResearchPaper>>({
    ...EMPTY_PAPER, ...paper
  })
  const [tagInput, setTagInput] = useState('')
  const [authorInput, setAuthorInput] = useState(
    Array.isArray(paper.authors) ? paper.authors.join(', ') : ''
  )

  const set = (key: keyof ResearchPaper, val: unknown) =>
    setForm(f => ({ ...f, [key]: val }))

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !form.tags?.includes(t)) {
      set('tags', [...(form.tags ?? []), t])
    }
    setTagInput('')
  }

  const removeTag = (t: string) =>
    set('tags', (form.tags ?? []).filter(x => x !== t))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...form, authors: authorInput.split(',').map(a => a.trim()).filter(Boolean) })
  }

  return (
    <form className="paper-form" onSubmit={handleSubmit}>
      <div className="paper-form-grid">
        <div className="paper-form-field paper-form-full">
          <label className="form-label">Title *</label>
          <input className="input" value={form.title ?? ''} onChange={e => set('title', e.target.value)} required placeholder="Paper title" />
        </div>
        <div className="paper-form-field">
          <label className="form-label">Authors</label>
          <input className="input" value={authorInput} onChange={e => setAuthorInput(e.target.value)} placeholder="Author 1, Author 2" />
        </div>
        <div className="paper-form-field">
          <label className="form-label">Year</label>
          <input className="input" type="number" value={form.year ?? ''} onChange={e => set('year', parseInt(e.target.value))} />
        </div>
        <div className="paper-form-field">
          <label className="form-label">Journal / Venue</label>
          <input className="input" value={form.journal ?? ''} onChange={e => set('journal', e.target.value)} placeholder="e.g. Journal of Finance" />
        </div>
        <div className="paper-form-field">
          <label className="form-label">Link / DOI</label>
          <input className="input" value={form.link ?? ''} onChange={e => set('link', e.target.value)} placeholder="https://arxiv.org/..." />
        </div>
        <div className="paper-form-field">
          <label className="form-label">Status</label>
          <select className="input" value={form.status ?? 'unread'} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Tags */}
        <div className="paper-form-field paper-form-full">
          <label className="form-label">Tags</label>
          <div className="tag-input-row">
            <input
              className="input" value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              placeholder="Add tag, press Enter"
            />
            <button type="button" className="btn btn-outline btn-sm" onClick={addTag}>Add</button>
          </div>
          <div className="tag-list">
            {(form.tags ?? []).map(t => (
              <span key={t} className="tag tag-removable">
                {t}
                <button type="button" onClick={() => removeTag(t)}><X size={10} /></button>
              </span>
            ))}
          </div>
        </div>

        <div className="paper-form-field paper-form-full">
          <label className="form-label">Summary</label>
          <textarea className="input textarea" rows={4} value={form.summary ?? ''} onChange={e => set('summary', e.target.value)} placeholder="Key findings, methodology, contributions..." />
        </div>
        <div className="paper-form-field paper-form-full">
          <label className="form-label">Important Equations</label>
          <textarea className="input textarea" rows={3} value={form.importantEquations ?? ''} onChange={e => set('importantEquations', e.target.value)} placeholder="Key formulas, notation, derivations..." />
        </div>
        <div className="paper-form-field paper-form-full">
          <label className="form-label">Implementation Ideas</label>
          <textarea className="input textarea" rows={3} value={form.implementationIdeas ?? ''} onChange={e => set('implementationIdeas', e.target.value)} placeholder="How to translate this into a strategy or experiment..." />
        </div>
      </div>

      <div className="paper-form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">
          <Check size={13} /> {paper.id ? 'Update Paper' : 'Add Paper'}
        </button>
      </div>
    </form>
  )
}

// ── Paper Card ────────────────────────────────────────────────
function PaperCard({ paper, onEdit, onDelete, onStatusChange, onFavorite, expanded, onToggle }: {
  paper: ResearchPaper
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (s: Status) => void
  onFavorite: () => void
  expanded: boolean
  onToggle: () => void
}) {
  const status = STATUSES.find(s => s.value === paper.status)!

  return (
    <div className={`paper-card ${expanded ? 'paper-card--expanded' : ''}`}>
      <div className="paper-card-header" onClick={onToggle}>
        <div className="paper-card-left">
          <div className={`paper-status-dot status-${status.color}`} />
          <div className="paper-card-meta">
            <div className="paper-card-title">{paper.title}</div>
            <div className="paper-card-byline mono muted">
              {paper.authors.slice(0, 2).join(', ')}{paper.authors.length > 2 ? ' et al.' : ''}
              {paper.year ? ` · ${paper.year}` : ''}
              {paper.journal ? ` · ${paper.journal}` : ''}
            </div>
          </div>
        </div>
        <div className="paper-card-right">
          <div className="paper-card-tags">
            {paper.tags.slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
            {paper.tags.length > 3 && <span className="tag">+{paper.tags.length - 3}</span>}
          </div>
          <button
            className={`btn btn-icon btn-ghost ${paper.isFavorite ? 'status-yellow' : ''}`}
            onClick={e => { e.stopPropagation(); onFavorite() }}
            title="Favorite"
          >
            <Star size={13} fill={paper.isFavorite ? 'currentColor' : 'none'} />
          </button>
          {expanded ? <ChevronDown size={14} className="muted" /> : <ChevronRight size={14} className="muted" />}
        </div>
      </div>

      {expanded && (
        <div className="paper-card-body">
          {/* Status selector */}
          <div className="paper-status-row">
            <span className="form-label">Status</span>
            <div className="paper-status-btns">
              {STATUSES.map(s => (
                <button
                  key={s.value}
                  className={`btn btn-sm ${paper.status === s.value ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => onStatusChange(s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {paper.link && (
            <a href={paper.link} target="_blank" rel="noreferrer" className="paper-link">
              <ExternalLink size={12} /> View Paper
            </a>
          )}

          {paper.summary && (
            <div className="paper-section">
              <div className="paper-section-label">Summary</div>
              <div className="paper-section-content">{paper.summary}</div>
            </div>
          )}
          {paper.importantEquations && (
            <div className="paper-section">
              <div className="paper-section-label">Key Equations</div>
              <pre className="paper-equations">{paper.importantEquations}</pre>
            </div>
          )}
          {paper.implementationIdeas && (
            <div className="paper-section">
              <div className="paper-section-label">Implementation Ideas</div>
              <div className="paper-section-content">{paper.implementationIdeas}</div>
            </div>
          )}

          <div className="paper-card-actions">
            <button className="btn btn-ghost btn-sm" onClick={onEdit}>
              <Edit3 size={12} /> Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={onDelete}>
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export function ResearchCenter() {
  const [showForm, setShowForm] = useState(false)
  const [editPaper, setEditPaper] = useState<ResearchPaper | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all')
  const [filterFav, setFilterFav] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const papers = useLiveQuery(() =>
    db.researchPapers.orderBy('updatedAt').reverse().toArray()
  ) ?? []

  const filtered = useMemo(() => {
    return papers.filter(p => {
      if (filterStatus !== 'all' && p.status !== filterStatus) return false
      if (filterFav && !p.isFavorite) return false
      if (search) {
        const q = search.toLowerCase()
        return p.title.toLowerCase().includes(q) ||
          p.authors.some(a => a.toLowerCase().includes(q)) ||
          p.tags.some(t => t.includes(q)) ||
          p.summary.toLowerCase().includes(q)
      }
      return true
    })
  }, [papers, filterStatus, filterFav, search])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: papers.length }
    STATUSES.forEach(s => { c[s.value] = papers.filter(p => p.status === s.value).length })
    return c
  }, [papers])

  const handleSave = async (data: Partial<ResearchPaper>) => {
    const now = new Date().toISOString()
    if (editPaper?.id) {
      await db.researchPapers.update(editPaper.id, { ...data, updatedAt: now })
      // Award XP if marking as implemented
      if (data.status === 'implemented' && editPaper.status !== 'implemented') {
        await awardXP('research_paper_reviewed', `Implemented: ${data.title}`, XP_AWARDS.research_paper_reviewed)
      }
    } else {
      await db.researchPapers.add({ ...EMPTY_PAPER, ...data, createdAt: now, updatedAt: now } as ResearchPaper)
    }
    setShowForm(false)
    setEditPaper(null)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Delete this paper?')) await db.researchPapers.delete(id)
  }

  const handleStatusChange = async (paper: ResearchPaper, status: Status) => {
    const now = new Date().toISOString()
    await db.researchPapers.update(paper.id!, { status, updatedAt: now })
    if (status === 'implemented' && paper.status !== 'implemented') {
      await awardXP('research_paper_reviewed', `Implemented: ${paper.title}`, XP_AWARDS.research_paper_reviewed)
    }
  }

  const handleFavorite = async (paper: ResearchPaper) => {
    await db.researchPapers.update(paper.id!, { isFavorite: !paper.isFavorite, updatedAt: new Date().toISOString() })
  }

  return (
    <div className="research-page">
      {/* Header */}
      <div className="module-header">
        <div>
          <div className="module-eyebrow mono muted">Knowledge System</div>
          <h1 className="module-title">Research Center</h1>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditPaper(null); setShowForm(true) }}>
          <Plus size={14} /> Add Paper
        </button>
      </div>

      {/* Stats Bar */}
      <div className="research-stats">
        {[{ label: 'Total', value: counts.all, color: '' },
          { label: 'Reading', value: counts.reading, color: 'status-yellow' },
          { label: 'Implemented', value: counts.implemented, color: 'status-green' },
          { label: 'Unread', value: counts.unread, color: 'status-muted' },
          { label: 'Rejected', value: counts.rejected, color: 'status-red' },
        ].map(s => (
          <div key={s.label} className="research-stat">
            <div className={`research-stat-val mono ${s.color}`}>{s.value ?? 0}</div>
            <div className="research-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="research-filters">
        <div className="search-wrap">
          <Search size={13} className="search-icon muted" />
          <input
            className="input search-input"
            placeholder="Search title, authors, tags, summary…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filterStatus === 'all' ? 'filter-tab--active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >All</button>
          {STATUSES.map(s => (
            <button
              key={s.value}
              className={`filter-tab ${filterStatus === s.value ? 'filter-tab--active' : ''}`}
              onClick={() => setFilterStatus(s.value)}
            >{s.label}</button>
          ))}
        </div>
        <button
          className={`btn btn-sm ${filterFav ? 'btn-outline' : 'btn-ghost'}`}
          onClick={() => setFilterFav(f => !f)}
        >
          <Star size={12} fill={filterFav ? 'currentColor' : 'none'} /> Favorites
        </button>
      </div>

      {/* Form */}
      {(showForm || editPaper) && (
        <div className="paper-form-wrap card">
          <div className="panel-header">
            <span className="panel-title">{editPaper ? 'Edit Paper' : 'Add Research Paper'}</span>
            <button className="btn btn-icon btn-ghost" onClick={() => { setShowForm(false); setEditPaper(null) }}>
              <X size={14} />
            </button>
          </div>
          <PaperForm
            paper={editPaper ?? {}}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditPaper(null) }}
          />
        </div>
      )}

      {/* Paper List */}
      <div className="paper-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={32} className="empty-state-icon" />
            <div>No papers found</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-2)' }}>
              {papers.length === 0 ? 'Add your first research paper to get started.' : 'Try adjusting your filters.'}
            </div>
            {papers.length === 0 && (
              <button className="btn btn-outline btn-sm" onClick={() => setShowForm(true)}>
                <Plus size={12} /> Add Paper
              </button>
            )}
          </div>
        ) : (
          filtered.map(paper => (
            <PaperCard
              key={paper.id}
              paper={paper}
              expanded={expandedId === paper.id}
              onToggle={() => setExpandedId(expandedId === paper.id ? null : paper.id!)}
              onEdit={() => { setEditPaper(paper); setShowForm(false) }}
              onDelete={() => handleDelete(paper.id!)}
              onStatusChange={s => handleStatusChange(paper, s)}
              onFavorite={() => handleFavorite(paper)}
            />
          ))
        )}
      </div>
    </div>
  )
}
