// ============================================================
// TERMINAL — Daily Journal
// ============================================================

import React, { useState, useEffect, useRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  NotebookPen, ChevronLeft, ChevronRight, Check,
  Sun, Moon, Zap, BookOpen, TrendingUp, AlertCircle,
  Lightbulb, Calendar
} from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, JournalEntry, awardXP } from '@/db/schema'
import { XP_AWARDS } from '@/data/mission'
import { todayKey } from '@/engine/xp'
import './Journal.css'

// ── Helpers ───────────────────────────────────────────────────
function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateStr === todayKey()) return 'Today'
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function navigateDate(dateStr: string, delta: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + delta)
  return d.toISOString().split('T')[0]
}

// ── Mood/Rating Component ─────────────────────────────────────
function RatingRow({ label, icon: Icon, value, onChange }: {
  label: string
  icon: LucideIcon
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="rating-row">
      <div className="rating-label">
        <Icon size={12} className="muted" />
        <span>{label}</span>
      </div>
      <div className="rating-dots">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            className={`rating-dot ${n <= value ? 'rating-dot--active' : ''}`}
            onClick={() => onChange(n)}
            title={`${n}/5`}
          />
        ))}
        <span className="mono muted rating-val">{value > 0 ? `${value}/5` : '—'}</span>
      </div>
    </div>
  )
}

// ── Section Component ─────────────────────────────────────────
function JournalSection({ label, icon: Icon, value, onChange, placeholder, rows = 4 }: {
  label: string
  icon: LucideIcon
  value: string
  onChange: (v: string) => void
  placeholder: string
  rows?: number
}) {
  return (
    <div className="journal-section">
      <div className="journal-section-header">
        <Icon size={13} className="muted" />
        <span className="journal-section-label">{label}</span>
      </div>
      <textarea
        className="journal-textarea"
        rows={rows}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────
const EMPTY_ENTRY = (date: string): Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'> => ({
  date,
  morningPlan: '', deepWorkLog: '', researchLog: '', tradingLog: '',
  reflection: '', wins: '', failures: '', lessons: '',
  mood: 0, energy: 0, focus: 0, sleep: 0,
  tomorrowsPlan: '', xpAwarded: false,
})

export function Journal() {
  const [currentDate, setCurrentDate] = useState(todayKey())
  const isToday = currentDate === todayKey()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const entry = useLiveQuery(
    () => db.journalEntries.where('date').equals(currentDate).first(),
    [currentDate]
  )

  const recentDates = useLiveQuery(async () => {
    const entries = await db.journalEntries.orderBy('date').reverse().limit(30).toArray()
    return entries.map(e => e.date)
  }) ?? []

  // Local edit state
  const [form, setForm] = useState(EMPTY_ENTRY(currentDate))

  useEffect(() => {
    if (entry) {
      setForm({ ...entry })
    } else {
      setForm(EMPTY_ENTRY(currentDate))
    }
    setSaved(false)
  }, [entry, currentDate])

  const set = (key: keyof JournalEntry, val: unknown) => {
    setForm(f => ({ ...f, [key]: val }))
    scheduleSave({ ...form, [key]: val })
  }

  const scheduleSave = (data: typeof form) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(data), 1200)
  }

  const save = async (data: typeof form) => {
    setSaving(true)
    const now = new Date().toISOString()
    const existing = await db.journalEntries.where('date').equals(currentDate).first()

    const isComplete = data.morningPlan.trim() && data.reflection.trim() && data.tomorrowsPlan.trim()

    if (existing) {
      await db.journalEntries.update(existing.id!, { ...data, updatedAt: now })
      // Award XP once if journal becomes complete
      if (isComplete && !existing.xpAwarded) {
        await awardXP('journal_completed', `Journal completed: ${currentDate}`, XP_AWARDS.journal_completed)
        await db.journalEntries.update(existing.id!, { xpAwarded: true })
      }
    } else {
      await db.journalEntries.add({ ...data, createdAt: now, updatedAt: now })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleManualSave = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    save(form)
  }

  const completionPct = (() => {
    const fields = [form.morningPlan, form.reflection, form.tomorrowsPlan, form.wins, form.deepWorkLog]
    const filled = fields.filter(f => f?.trim()).length
    return Math.round((filled / fields.length) * 100)
  })()

  return (
    <div className="journal-page">
      {/* Header */}
      <div className="journal-header">
        <div>
          <div className="module-eyebrow mono muted">Knowledge System</div>
          <h1 className="module-title">Daily Journal</h1>
        </div>
        <div className="journal-header-actions">
          <div className={`journal-save-status mono ${saving ? 'status-yellow' : saved ? 'status-green' : 'muted'}`}>
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Auto-save on'}
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleManualSave}>
            <Check size={12} /> Save Now
          </button>
        </div>
      </div>

      {/* Date Navigator */}
      <div className="journal-nav">
        <button className="btn btn-icon btn-ghost" onClick={() => setCurrentDate(d => navigateDate(d, -1))}>
          <ChevronLeft size={16} />
        </button>
        <div className="journal-date-center">
          <div className="journal-date-label">{formatDateLabel(currentDate)}</div>
          <div className="journal-date-key mono muted">{currentDate}</div>
        </div>
        <button
          className="btn btn-icon btn-ghost"
          onClick={() => setCurrentDate(d => navigateDate(d, 1))}
          disabled={isToday}
        >
          <ChevronRight size={16} />
        </button>
        {!isToday && (
          <button className="btn btn-outline btn-sm" onClick={() => setCurrentDate(todayKey())}>
            <Calendar size={12} /> Today
          </button>
        )}
      </div>

      {/* Completion bar */}
      <div className="journal-completion">
        <div className="journal-completion-label">
          <span className="mono muted">Entry completion</span>
          <span className="mono">{completionPct}%</span>
        </div>
        <div className="progress-track" style={{ height: 4 }}>
          <div
            className={`progress-fill ${completionPct === 100 ? '' : 'progress-fill-blue'}`}
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      <div className="journal-body">
        {/* Left column: Morning + Work logs */}
        <div className="journal-col">
          <div className="card">
            <div className="panel-header">
              <span className="panel-title"><Sun size={11} style={{ marginRight: 4 }} />Morning Plan</span>
            </div>
            <JournalSection
              label="Morning Plan"
              icon={Sun}
              value={form.morningPlan}
              onChange={v => set('morningPlan', v)}
              placeholder="What are your priorities today? What will you focus on?"
              rows={5}
            />
          </div>

          <div className="card">
            <div className="panel-header">
              <span className="panel-title">Work Logs</span>
            </div>
            <div className="journal-logs">
              <JournalSection label="Deep Work" icon={Zap} value={form.deepWorkLog} onChange={v => set('deepWorkLog', v)} placeholder="What did you build, code, or create?" rows={3} />
              <JournalSection label="Research" icon={BookOpen} value={form.researchLog} onChange={v => set('researchLog', v)} placeholder="Papers read, concepts studied, insights gained..." rows={3} />
              <JournalSection label="Trading" icon={TrendingUp} value={form.tradingLog} onChange={v => set('tradingLog', v)} placeholder="Market observations, strategy tests, execution notes..." rows={3} />
            </div>
          </div>

          <div className="card">
            <div className="panel-header">
              <span className="panel-title"><Moon size={11} style={{ marginRight: 4 }} />Tomorrow's Plan</span>
            </div>
            <JournalSection
              label="Tomorrow's Plan"
              icon={Moon}
              value={form.tomorrowsPlan}
              onChange={v => set('tomorrowsPlan', v)}
              placeholder="Top 3 priorities for tomorrow. What must get done?"
              rows={4}
            />
          </div>
        </div>

        {/* Right column: Reflection + Metrics */}
        <div className="journal-col">
          <div className="card">
            <div className="panel-header">
              <span className="panel-title">Evening Reflection</span>
            </div>
            <div className="journal-logs">
              <JournalSection label="Wins" icon={TrendingUp} value={form.wins} onChange={v => set('wins', v)} placeholder="What went well? What are you proud of?" rows={3} />
              <JournalSection label="Failures" icon={AlertCircle} value={form.failures} onChange={v => set('failures', v)} placeholder="What didn't work? Where did you fall short?" rows={3} />
              <JournalSection label="Lessons" icon={Lightbulb} value={form.lessons} onChange={v => set('lessons', v)} placeholder="What did you learn? What will you do differently?" rows={3} />
              <JournalSection label="Reflection" icon={NotebookPen} value={form.reflection} onChange={v => set('reflection', v)} placeholder="How was today overall? Any insights about your mindset or approach?" rows={4} />
            </div>
          </div>

          {/* Biometrics */}
          <div className="card">
            <div className="panel-header">
              <span className="panel-title">Daily Metrics</span>
            </div>
            <div className="journal-metrics">
              <RatingRow label="Mood" icon={Sun} value={form.mood} onChange={v => set('mood', v)} />
              <RatingRow label="Energy" icon={Zap} value={form.energy} onChange={v => set('energy', v)} />
              <RatingRow label="Focus" icon={TrendingUp} value={form.focus} onChange={v => set('focus', v)} />
              <div className="rating-row">
                <div className="rating-label">
                  <Moon size={12} className="muted" />
                  <span>Sleep (hrs)</span>
                </div>
                <input
                  className="input"
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={form.sleep || ''}
                  onChange={e => set('sleep', parseFloat(e.target.value) || 0)}
                  style={{ width: 80, textAlign: 'center' }}
                />
              </div>
            </div>
          </div>

          {/* Recent entries */}
          {recentDates.length > 0 && (
            <div className="card">
              <div className="panel-header">
                <span className="panel-title">Recent Entries</span>
              </div>
              <div className="journal-history">
                {recentDates.slice(0, 10).map(d => (
                  <button
                    key={d}
                    className={`journal-history-item ${d === currentDate ? 'journal-history-item--active' : ''}`}
                    onClick={() => setCurrentDate(d)}
                  >
                    <div className="journal-history-dot" />
                    <span className="mono">{d}</span>
                    <span className="muted">{d === todayKey() ? 'Today' : ''}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
