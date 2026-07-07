// ============================================================
// TERMINAL — Dashboard (Mission Control)
// ============================================================

import React from 'react'
import {
  Flame, Zap, Target, Clock, BookOpen, FlaskConical,
  GraduationCap, CalendarDays, TrendingUp, ChevronRight,
  Activity, Code2, BarChart3, BookMarked
} from 'lucide-react'
import { useProfile, useRecentJournal, useRecentNotes, useUpcomingEvents, useCertProgress, useStrategyCount, useResearchCount } from '@/db/hooks'
import { getLevelInfo, formatXP, formatHours, getYearProgress, getMonthProgress, getWeekProgress } from '@/engine/xp'
import { PHASES, LEVELS, CERTIFICATIONS } from '@/data/mission'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

// ── Subcomponents ─────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'default',
}: {
  icon: React.ComponentType<{ size?: number }>
  label: string
  value: string
  sub?: string
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'default'
}) {
  const colorClass = color !== 'default' ? `status-${color}` : ''
  return (
    <div className="dash-stat-card">
      <div className={`dash-stat-icon ${colorClass}`}>
        <Icon size={14} />
      </div>
      <div className="dash-stat-body">
        <div className="dash-stat-label">{label}</div>
        <div className={`dash-stat-value mono ${colorClass}`}>{value}</div>
        {sub && <div className="dash-stat-sub">{sub}</div>}
      </div>
    </div>
  )
}

function ProgressRing({ label, value, color = 'primary' }: { label: string; value: number; color?: string }) {
  const r = 22
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  const colorMap: Record<string, string> = {
    primary: 'var(--primary)',
    blue: 'var(--blue)',
    yellow: 'var(--yellow)',
  }
  const stroke = colorMap[color] ?? 'var(--primary)'

  return (
    <div className="dash-ring">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
        <circle
          cx="32" cy="32" r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 32 32)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text x="32" y="33" textAnchor="middle" dominantBaseline="middle"
          fontFamily="JetBrains Mono, monospace" fontSize="11" fill="var(--text)" fontWeight="600">
          {value}%
        </text>
      </svg>
      <div className="dash-ring-label">{label}</div>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────

export function Dashboard() {
  const profile = useProfile()
  const recentJournal = useRecentJournal(1)
  const recentNotes = useRecentNotes(3)
  const upcomingEvents = useUpcomingEvents(4)
  const strategyCount = useStrategyCount()
  const researchCount = useResearchCount()
  const navigate = useNavigate()

  const currentCertId = profile?.currentCertId ?? 'bmc'
  const certProgress = useCertProgress(currentCertId)
  const currentCert = CERTIFICATIONS.find((c) => c.id === currentCertId)

  const levelInfo = getLevelInfo(profile?.totalXP ?? 0)
  const currentPhase = PHASES.find((p) => p.id === (profile?.currentPhase ?? 1)) ?? PHASES[0]
  const currentObjective = currentPhase.objectives[profile?.currentObjectiveIndex ?? 0]

  const yearPct = getYearProgress()
  const monthPct = getMonthProgress()
  const weekPct = getWeekProgress()

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="dashboard">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="dash-header">
        <div>
          <div className="dash-header-label mono muted">Mission Control</div>
          <h1 className="dash-header-title">Dashboard</h1>
        </div>
        <div className="dash-header-date mono muted">{today}</div>
      </div>

      {/* ── Mission Banner ───────────────────────────────────── */}
      <div className="dash-mission">
        <div className="dash-mission-phase">
          <span className="badge badge-green">Phase {currentPhase.id}</span>
          <span className="dash-mission-phase-name">{currentPhase.name}</span>
          <ChevronRight size={12} className="muted" />
          <span className="badge badge-blue">Active</span>
        </div>
        <div className="dash-mission-objective">
          <Target size={12} className="status-green" />
          <span>{currentObjective}</span>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────── */}
      <div className="dash-grid">

        {/* ── Col 1: XP + Today's Hours ──────────────────────── */}
        <div className="dash-col">

          {/* XP Card */}
          <div className="card">
            <div className="panel-header">
              <span className="panel-title">XP & Level</span>
              <Zap size={12} className="status-green" />
            </div>
            <div className="dash-level-name mono">{levelInfo.name}</div>
            <div className="dash-level-xp mono muted">
              {formatXP(profile?.totalXP ?? 0)} XP · Lv.{levelInfo.level}
            </div>
            <div className="progress-track" style={{ margin: '12px 0 6px' }}>
              <div className="progress-fill" style={{ width: `${levelInfo.progress}%` }} />
            </div>
            <div className="dash-level-meta mono muted">
              {levelInfo.progress}% to {LEVELS[levelInfo.level]?.name ?? 'Max'} · Lv.{levelInfo.level + 1}
            </div>

            <div className="separator" />

            {/* Streak */}
            <div className="dash-streak-row">
              <div className="dash-streak-item">
                <Flame size={13} className={profile?.currentStreak ? 'status-yellow' : 'muted'} />
                <div>
                  <div className="dash-streak-val mono">{profile?.currentStreak ?? 0}</div>
                  <div className="dash-streak-label">Day Streak</div>
                </div>
              </div>
              <div className="dash-streak-item">
                <TrendingUp size={13} className="status-blue" />
                <div>
                  <div className="dash-streak-val mono">{profile?.longestStreak ?? 0}</div>
                  <div className="dash-streak-label">Best Streak</div>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Hours */}
          <div className="card">
            <div className="panel-header">
              <span className="panel-title">Today's Focus</span>
              <Clock size={12} className="muted" />
            </div>
            <div className="dash-hours-grid">
              <StatCard
                icon={Activity}
                label="Deep Work"
                value={formatHours(profile?.deepWorkMinutesToday ?? 0)}
                color="green"
              />
              <StatCard
                icon={BookOpen}
                label="Research"
                value={formatHours(profile?.researchMinutesToday ?? 0)}
                color="blue"
              />
              <StatCard
                icon={Code2}
                label="Coding"
                value={formatHours(profile?.codingMinutesToday ?? 0)}
                color="yellow"
              />
              <StatCard
                icon={BarChart3}
                label="Study"
                value={formatHours(profile?.studyMinutesToday ?? 0)}
                color="blue"
              />
            </div>
          </div>

          {/* Corpus Stats */}
          <div className="card">
            <div className="panel-header">
              <span className="panel-title">Corpus</span>
            </div>
            <div className="dash-corpus-row">
              <button className="dash-corpus-item" onClick={() => navigate('/alpha-factory')}>
                <FlaskConical size={14} className="status-green" />
                <div className="dash-corpus-val mono">{strategyCount ?? 0}</div>
                <div className="dash-corpus-label">Strategies</div>
              </button>
              <button className="dash-corpus-item" onClick={() => navigate('/research')}>
                <BookOpen size={14} className="status-blue" />
                <div className="dash-corpus-val mono">{researchCount ?? 0}</div>
                <div className="dash-corpus-label">Papers</div>
              </button>
              <button className="dash-corpus-item" onClick={() => navigate('/knowledge-vault')}>
                <BookMarked size={14} className="status-yellow" />
                <div className="dash-corpus-val mono">0</div>
                <div className="dash-corpus-label">Notes</div>
              </button>
            </div>
          </div>
        </div>

        {/* ── Col 2: Progress + Calendar ─────────────────────── */}
        <div className="dash-col">

          {/* Progress Rings */}
          <div className="card">
            <div className="panel-header">
              <span className="panel-title">Progress</span>
            </div>
            <div className="dash-rings">
              <ProgressRing label="Week" value={weekPct} color="primary" />
              <ProgressRing label="Month" value={monthPct} color="blue" />
              <ProgressRing label="Year" value={yearPct} color="yellow" />
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="card">
            <div className="panel-header">
              <span className="panel-title">Schedule</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('/calendar')}
              >
                <CalendarDays size={11} /> View
              </button>
            </div>
            {upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="dash-events">
                {upcomingEvents.map((ev) => (
                  <div key={ev.id} className="dash-event">
                    <div
                      className="dash-event-dot"
                      style={{
                        background: ev.category === 'study' ? 'var(--blue)' :
                          ev.category === 'trading' ? 'var(--primary)' :
                          ev.category === 'deadline' ? 'var(--red)' :
                          'var(--muted-2)',
                      }}
                    />
                    <div className="dash-event-body">
                      <div className="dash-event-title">{ev.title}</div>
                      <div className="dash-event-time mono muted">
                        {new Date(ev.startTime).toLocaleTimeString('en-US', {
                          hour: '2-digit', minute: '2-digit', hour12: false,
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dash-empty-small">No upcoming events</div>
            )}
          </div>

          {/* Active Certification */}
          <div className="card">
            <div className="panel-header">
              <span className="panel-title">Active Certification</span>
              <GraduationCap size={12} className="muted" />
            </div>
            {currentCert ? (
              <>
                <div className="dash-cert-name">{currentCert.name}</div>
                <div className="dash-cert-category mono muted">{currentCert.category}</div>
                <div className="dash-cert-progress-row">
                  <div className="progress-track" style={{ flex: 1 }}>
                    <div
                      className="progress-fill progress-fill-blue"
                      style={{ width: `${certProgress?.completionPercent ?? 0}%` }}
                    />
                  </div>
                  <span className="mono muted" style={{ fontSize: 'var(--text-xs)', minWidth: 32 }}>
                    {certProgress?.completionPercent ?? 0}%
                  </span>
                </div>
                <div className="dash-cert-hours mono muted">
                  {certProgress?.studyHours ?? 0}h studied
                </div>
              </>
            ) : (
              <div className="dash-empty-small">No active certification</div>
            )}
          </div>
        </div>

        {/* ── Col 3: Journal + Notes ─────────────────────────── */}
        <div className="dash-col">

          {/* Recent Journal */}
          <div className="card">
            <div className="panel-header">
              <span className="panel-title">Recent Journal</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('/journal')}
              >
                Open <ChevronRight size={11} />
              </button>
            </div>
            {recentJournal && recentJournal.length > 0 ? (
              <div className="dash-journal-entries">
                {recentJournal.map((entry) => (
                  <div key={entry.id} className="dash-journal-entry">
                    <div className="dash-journal-date mono muted">{entry.date}</div>
                    <div className="dash-journal-preview">
                      {entry.reflection || entry.morningPlan || 'No content yet'}
                    </div>
                    <div className="dash-journal-meta">
                      {entry.mood > 0 && (
                        <span className="badge badge-muted">Mood {entry.mood}/5</span>
                      )}
                      {entry.wins && (
                        <span className="badge badge-green">Has wins</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dash-empty-small">
                <span>No journal entries yet.</span>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => navigate('/journal')}
                  style={{ marginTop: 'var(--space-2)' }}
                >
                  Start Today's Journal
                </button>
              </div>
            )}
          </div>

          {/* Recent Notes */}
          <div className="card">
            <div className="panel-header">
              <span className="panel-title">Recent Notes</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('/knowledge-vault')}
              >
                View All <ChevronRight size={11} />
              </button>
            </div>
            {recentNotes && recentNotes.length > 0 ? (
              <div className="dash-notes">
                {recentNotes.map((note) => (
                  <div key={note.id} className="dash-note">
                    <div className="dash-note-title">{note.title}</div>
                    <div className="dash-note-meta">
                      <span className="tag">{note.folder}</span>
                      <span className="mono muted" style={{ fontSize: 'var(--text-xs)' }}>
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dash-empty-small">No notes yet</div>
            )}
          </div>

          {/* Phase Objectives */}
          <div className="card">
            <div className="panel-header">
              <span className="panel-title">Phase {currentPhase.id} Objectives</span>
            </div>
            <div className="dash-objectives">
              {currentPhase.objectives.map((obj, i) => (
                <div
                  key={i}
                  className={`dash-objective ${i === (profile?.currentObjectiveIndex ?? 0) ? 'dash-objective--active' : ''}`}
                >
                  <div className={`dash-objective-dot ${i < (profile?.currentObjectiveIndex ?? 0) ? 'dash-objective-dot--done' : ''}`} />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
