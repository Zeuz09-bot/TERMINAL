// ============================================================
// TERMINAL — Calendar
// ============================================================

import React, { useState, useMemo } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ChevronLeft, ChevronRight, Plus, X, Check, Clock,
  BookOpen, TrendingUp, Users, Dumbbell, User, AlertCircle
} from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, CalendarEvent } from '@/db/schema'
import './Calendar.css'

type ViewMode = 'month' | 'week' | 'day' | 'agenda'
type Category = CalendarEvent['category']

const CATEGORY_CONFIG: Record<Category, { label: string; color: string; icon: LucideIcon }> = {
  study:    { label: 'Study',    color: 'var(--blue)',    icon: BookOpen },
  trading:  { label: 'Trading',  color: 'var(--primary)', icon: TrendingUp },
  meeting:  { label: 'Meeting',  color: 'var(--yellow)',  icon: Users },
  exercise: { label: 'Exercise', color: 'var(--primary)', icon: Dumbbell },
  personal: { label: 'Personal', color: 'var(--muted)',   icon: User },
  deadline: { label: 'Deadline', color: 'var(--red)',     icon: AlertCircle },
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function pad(n: number) { return String(n).padStart(2, '0') }
function dateKey(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}` }
function timeStr(iso: string) {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ── Event Form ────────────────────────────────────────────────
function EventForm({ event, defaultDate, onSave, onCancel }: {
  event?: CalendarEvent
  defaultDate?: string
  onSave: (data: Partial<CalendarEvent>) => void
  onCancel: () => void
}) {
  const today = defaultDate ?? dateKey(new Date())
  const [title, setTitle] = useState(event?.title ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [date, setDate] = useState(event ? event.startTime.split('T')[0] : today)
  const [startTime, setStartTime] = useState(event ? timeStr(event.startTime) : '09:00')
  const [endTime, setEndTime] = useState(event ? timeStr(event.endTime) : '10:00')
  const [category, setCategory] = useState<Category>(event?.category ?? 'study')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title, description, category,
      startTime: `${date}T${startTime}:00`,
      endTime: `${date}T${endTime}:00`,
      isRecurring: false, recurrenceRule: null, externalId: null,
    })
  }

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="paper-form-field">
        <label className="form-label">Title *</label>
        <input className="input" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Event title" />
      </div>
      <div className="event-form-row">
        <div className="paper-form-field">
          <label className="form-label">Date</label>
          <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="paper-form-field">
          <label className="form-label">Start</label>
          <input className="input" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
        </div>
        <div className="paper-form-field">
          <label className="form-label">End</label>
          <input className="input" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
        </div>
      </div>
      <div className="paper-form-field">
        <label className="form-label">Category</label>
        <div className="event-category-grid">
          {(Object.entries(CATEGORY_CONFIG) as [Category, typeof CATEGORY_CONFIG[Category]][]).map(([key, cfg]) => (
            <button
              key={key} type="button"
              className={`event-cat-btn ${category === key ? 'event-cat-btn--active' : ''}`}
              style={{ '--cat-color': cfg.color } as React.CSSProperties}
              onClick={() => setCategory(key)}
            >
              <cfg.icon size={11} /> {cfg.label}
            </button>
          ))}
        </div>
      </div>
      <div className="paper-form-field">
        <label className="form-label">Description</label>
        <textarea className="input textarea" rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional notes..." />
      </div>
      <div className="paper-form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">
          <Check size={13} /> {event ? 'Update' : 'Add Event'}
        </button>
      </div>
    </form>
  )
}

// ── Event Pill ────────────────────────────────────────────────
function EventPill({ event, onClick }: { event: CalendarEvent; onClick: () => void }) {
  const cfg = CATEGORY_CONFIG[event.category]
  return (
    <div
      className="event-pill"
      style={{ '--cat-color': cfg.color } as React.CSSProperties}
      onClick={e => { e.stopPropagation(); onClick() }}
      title={event.title}
    >
      <span className="event-pill-dot" />
      <span className="event-pill-title">{event.title}</span>
      <span className="event-pill-time mono">{timeStr(event.startTime)}</span>
    </div>
  )
}

// ── Month View ────────────────────────────────────────────────
function MonthView({ year, month, events, onDayClick, onEventClick }: {
  year: number; month: number; events: CalendarEvent[]
  onDayClick: (d: string) => void; onEventClick: (e: CalendarEvent) => void
}) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = dateKey(new Date())

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const eventsByDay = useMemo(() => {
    const m: Record<string, CalendarEvent[]> = {}
    events.forEach(ev => {
      const d = ev.startTime.split('T')[0]
      if (!m[d]) m[d] = []
      m[d].push(ev)
    })
    return m
  }, [events])

  return (
    <div className="month-view">
      <div className="month-weekdays">
        {WEEKDAYS.map(d => <div key={d} className="month-weekday">{d}</div>)}
      </div>
      <div className="month-grid">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="month-cell month-cell--empty" />
          const key = `${year}-${pad(month+1)}-${pad(day)}`
          const dayEvents = eventsByDay[key] ?? []
          const isToday = key === today
          return (
            <div
              key={key}
              className={`month-cell ${isToday ? 'month-cell--today' : ''}`}
              onClick={() => onDayClick(key)}
            >
              <div className={`month-day-num mono ${isToday ? 'status-green' : ''}`}>{day}</div>
              <div className="month-events">
                {dayEvents.slice(0, 3).map(ev => (
                  <EventPill key={ev.id} event={ev} onClick={() => onEventClick(ev)} />
                ))}
                {dayEvents.length > 3 && (
                  <div className="month-more mono muted">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Agenda View ───────────────────────────────────────────────
function AgendaView({ events, onEventClick }: { events: CalendarEvent[]; onEventClick: (e: CalendarEvent) => void }) {
  const now = new Date().toISOString()
  const upcoming = [...events].filter(e => e.startTime >= now).sort((a, b) => a.startTime.localeCompare(b.startTime))

  const grouped = useMemo(() => {
    const g: Record<string, CalendarEvent[]> = {}
    upcoming.forEach(ev => {
      const d = ev.startTime.split('T')[0]
      if (!g[d]) g[d] = []
      g[d].push(ev)
    })
    return g
  }, [upcoming])

  if (upcoming.length === 0) {
    return (
      <div className="empty-state">
        <Clock size={24} className="muted" />
        <div>No upcoming events</div>
      </div>
    )
  }

  return (
    <div className="agenda-view">
      {Object.entries(grouped).map(([date, evs]) => {
        const d = new Date(date + 'T12:00:00')
        const isToday = date === dateKey(new Date())
        return (
          <div key={date} className="agenda-day">
            <div className="agenda-day-header">
              <span className={`agenda-day-label mono ${isToday ? 'status-green' : 'muted'}`}>
                {isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <span className="mono muted" style={{ fontSize: 'var(--text-xs)' }}>{date}</span>
            </div>
            {evs.map(ev => {
              const cfg = CATEGORY_CONFIG[ev.category]
              const Icon = cfg.icon
              return (
                <div key={ev.id} className="agenda-event" onClick={() => onEventClick(ev)}>
                  <div className="agenda-event-time mono muted">
                    {timeStr(ev.startTime)} — {timeStr(ev.endTime)}
                  </div>
                  <div className="agenda-event-body" style={{ '--cat-color': cfg.color } as React.CSSProperties}>
                    <cfg.icon size={12} style={{ color: cfg.color, flexShrink: 0 } as React.CSSProperties} />
                    <div>
                      <div className="agenda-event-title">{ev.title}</div>
                      {ev.description && <div className="agenda-event-desc">{ev.description}</div>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────
export function Calendar() {
  const today = new Date()
  const [view, setView] = useState<ViewMode>('month')
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [showForm, setShowForm] = useState(false)
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const events = useLiveQuery(() =>
    db.calendarEvents.orderBy('startTime').toArray()
  ) ?? []

  // Filter to current month for month view
  const monthStart = `${year}-${pad(month+1)}-01`
  const monthEnd = `${year}-${pad(month+1)}-${pad(new Date(year, month+1, 0).getDate())}`
  const monthEvents = events.filter(e => e.startTime.slice(0, 10) >= monthStart && e.startTime.slice(0, 10) <= monthEnd)

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1) }

  const handleSave = async (data: Partial<CalendarEvent>) => {
    const now = new Date().toISOString()
    if (editEvent?.id) {
      await db.calendarEvents.update(editEvent.id, { ...data, updatedAt: now })
    } else {
      await db.calendarEvents.add({ ...data, createdAt: now, updatedAt: now } as CalendarEvent)
    }
    setShowForm(false)
    setEditEvent(null)
    setSelectedDate(null)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Delete this event?')) {
      await db.calendarEvents.delete(id)
      setSelectedEvent(null)
    }
  }

  return (
    <div className="calendar-page">
      {/* Header */}
      <div className="module-header">
        <div>
          <div className="module-eyebrow mono muted">Knowledge System</div>
          <h1 className="module-title">Calendar</h1>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <div className="filter-tabs">
            {(['month', 'week', 'day', 'agenda'] as ViewMode[]).map(v => (
              <button key={v} className={`filter-tab ${view === v ? 'filter-tab--active' : ''}`} onClick={() => setView(v)}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => { setEditEvent(null); setShowForm(true) }}>
            <Plus size={14} /> Add Event
          </button>
        </div>
      </div>

      {/* Month Navigator */}
      <div className="cal-nav">
        <button className="btn btn-icon btn-ghost" onClick={prevMonth}><ChevronLeft size={16} /></button>
        <div className="cal-nav-label mono">{MONTHS[month]} {year}</div>
        <button className="btn btn-icon btn-ghost" onClick={nextMonth}><ChevronRight size={16} /></button>
        <button className="btn btn-ghost btn-sm" onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()) }}>Today</button>
      </div>

      {/* Legend */}
      <div className="cal-legend">
        {(Object.entries(CATEGORY_CONFIG) as [Category, typeof CATEGORY_CONFIG[Category]][]).map(([key, cfg]) => (
          <div key={key} className="cal-legend-item">
            <div className="cal-legend-dot" style={{ background: cfg.color }} />
            <span>{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Form */}
      {(showForm || editEvent) && (
        <div className="card" style={{ maxWidth: 600 }}>
          <div className="panel-header">
            <span className="panel-title">{editEvent ? 'Edit Event' : 'New Event'}</span>
            <button className="btn btn-icon btn-ghost" onClick={() => { setShowForm(false); setEditEvent(null) }}><X size={14} /></button>
          </div>
          <EventForm
            event={editEvent ?? undefined}
            defaultDate={selectedDate ?? undefined}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditEvent(null) }}
          />
        </div>
      )}

      {/* Selected Event Detail */}
      {selectedEvent && !showForm && !editEvent && (
        <div className="card event-detail" style={{ maxWidth: 400 }}>
          <div className="panel-header">
            <span className="panel-title">{selectedEvent.title}</span>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => { setEditEvent(selectedEvent); setShowForm(false) }}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedEvent.id!)}>Delete</button>
              <button className="btn btn-icon btn-ghost" onClick={() => setSelectedEvent(null)}><X size={13} /></button>
            </div>
          </div>
          <div className="event-detail-body">
            <div className="mono muted" style={{ fontSize: 'var(--text-xs)' }}>
              {timeStr(selectedEvent.startTime)} — {timeStr(selectedEvent.endTime)} · {selectedEvent.startTime.split('T')[0]}
            </div>
            <span className="badge badge-muted">{CATEGORY_CONFIG[selectedEvent.category].label}</span>
            {selectedEvent.description && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginTop: 'var(--space-2)' }}>{selectedEvent.description}</p>}
          </div>
        </div>
      )}

      {/* Views */}
      {view === 'month' && (
        <MonthView
          year={year} month={month} events={monthEvents}
          onDayClick={(d) => { setSelectedDate(d); setShowForm(true); setEditEvent(null) }}
          onEventClick={(ev) => { setSelectedEvent(ev); setShowForm(false); setEditEvent(null) }}
        />
      )}
      {view === 'agenda' && (
        <AgendaView events={events} onEventClick={(ev) => { setSelectedEvent(ev) }} />
      )}
      {(view === 'week' || view === 'day') && (
        <div className="empty-state">
          <Clock size={24} className="muted" />
          <div>Switch to Month or Agenda view</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-2)' }}>Week and Day views coming in Milestone 4</div>
        </div>
      )}
    </div>
  )
}
