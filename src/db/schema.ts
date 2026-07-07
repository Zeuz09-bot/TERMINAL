// ============================================================
// TERMINAL — Dexie IndexedDB Schema
// ============================================================

import Dexie, { Table } from 'dexie'
import { XPEventType } from '@/data/mission'
import { StrategyStage } from '@/data/mission'

// ── Table Types ───────────────────────────────────────────────

export interface Profile {
  id?: number
  totalXP: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
  currentPhase: number
  currentObjectiveIndex: number
  currentCertId: string | null
  currentStrategyId: number | null
  deepWorkMinutesToday: number
  researchMinutesToday: number
  codingMinutesToday: number
  studyMinutesToday: number
  deepWorkMinutesTotal: number
  researchMinutesTotal: number
  codingMinutesTotal: number
  studyMinutesTotal: number
  createdAt: string
  updatedAt: string
}

export interface XPLog {
  id?: number
  event: XPEventType
  amount: number
  description: string
  date: string
  createdAt: string
}

export interface JournalEntry {
  id?: number
  date: string // YYYY-MM-DD
  morningPlan: string
  deepWorkLog: string
  researchLog: string
  tradingLog: string
  reflection: string
  wins: string
  failures: string
  lessons: string
  mood: number // 1-5
  energy: number // 1-5
  focus: number // 1-5
  sleep: number // hours
  tomorrowsPlan: string
  xpAwarded: boolean
  createdAt: string
  updatedAt: string
}

export interface Note {
  id?: number
  title: string
  content: string
  folder: string
  tags: string[]
  isFavorite: boolean
  linkedNoteIds: number[]
  linkedStrategyIds: number[]
  linkedResearchIds: number[]
  createdAt: string
  updatedAt: string
}

export interface Strategy {
  id?: number
  name: string
  version: number
  stage: StrategyStage
  priority: 'critical' | 'high' | 'medium' | 'low'
  riskRating: number // 1-5
  markets: string[]
  timeframes: string[]
  description: string
  hypothesis: string
  notes: string
  codeSnippets: string
  researchRefs: number[]
  metrics: {
    sharpe?: number
    maxDrawdown?: number
    winRate?: number
    profitFactor?: number
    expectancy?: number
    totalTrades?: number
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ResearchPaper {
  id?: number
  title: string
  authors: string[]
  year: number
  journal: string
  link: string
  tags: string[]
  summary: string
  importantEquations: string
  implementationIdeas: string
  relatedStrategyIds: number[]
  status: 'unread' | 'reading' | 'implemented' | 'rejected'
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export interface Experiment {
  id?: number
  name: string
  section: string
  objective: string
  variables: string
  expectedOutcome: string
  actualOutcome: string
  conclusion: string
  status: 'active' | 'completed' | 'failed' | 'archived'
  linkedStrategyIds: number[]
  createdAt: string
  updatedAt: string
}

export interface PropFirm {
  id?: number
  name: string
  accountSize: number
  maxDailyDrawdown: number
  maxOverallDrawdown: number
  profitTarget: number
  minTradingDays: number
  newsRestrictions: boolean
  newsDetails: string
  scalingRules: string
  challengeProgress: number // 0-100
  currentProfit: number
  currentDrawdown: number
  status: 'evaluating' | 'passed' | 'failed' | 'funded' | 'inactive'
  notes: string
  journal: string
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
}

export interface CertProgress {
  id?: number
  certId: string
  studyHours: number
  completionPercent: number
  deadline: string | null
  notes: string
  isCompleted: boolean
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CalendarEvent {
  id?: number
  title: string
  description: string
  startTime: string
  endTime: string
  category: 'study' | 'trading' | 'meeting' | 'exercise' | 'personal' | 'deadline'
  isRecurring: boolean
  recurrenceRule: string | null
  externalId: string | null // for Google Calendar sync
  createdAt: string
  updatedAt: string
}

// ── Database Class ─────────────────────────────────────────────

class TerminalDB extends Dexie {
  profiles!: Table<Profile>
  xpLog!: Table<XPLog>
  journalEntries!: Table<JournalEntry>
  notes!: Table<Note>
  strategies!: Table<Strategy>
  researchPapers!: Table<ResearchPaper>
  experiments!: Table<Experiment>
  propFirms!: Table<PropFirm>
  certProgress!: Table<CertProgress>
  calendarEvents!: Table<CalendarEvent>

  constructor() {
    super('TerminalDB')

    this.version(1).stores({
      profiles:       '++id',
      xpLog:          '++id, event, date',
      journalEntries: '++id, date',
      notes:          '++id, folder, *tags, isFavorite, updatedAt',
      strategies:     '++id, stage, priority, isActive, updatedAt',
      researchPapers: '++id, status, isFavorite, year, *tags, updatedAt',
      experiments:    '++id, section, status, updatedAt',
      propFirms:      '++id, status, updatedAt',
      certProgress:   '++id, certId, isCompleted',
      calendarEvents: '++id, startTime, category',
    })
  }
}

export const db = new TerminalDB()

// ── Default Profile ────────────────────────────────────────────

export async function ensureProfile(): Promise<Profile> {
  const count = await db.profiles.count()
  if (count === 0) {
    const now = new Date().toISOString()
    const id = await db.profiles.add({
      totalXP: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      currentPhase: 1,
      currentObjectiveIndex: 0,
      currentCertId: 'bmc',
      currentStrategyId: null,
      deepWorkMinutesToday: 0,
      researchMinutesToday: 0,
      codingMinutesToday: 0,
      studyMinutesToday: 0,
      deepWorkMinutesTotal: 0,
      researchMinutesTotal: 0,
      codingMinutesTotal: 0,
      studyMinutesTotal: 0,
      createdAt: now,
      updatedAt: now,
    })
    return (await db.profiles.get(id))!
  }
  return (await db.profiles.orderBy('id').first())!
}

export async function awardXP(
  event: XPEventType,
  description: string,
  amount: number
): Promise<void> {
  const now = new Date().toISOString()
  const today = now.split('T')[0]

  await db.xpLog.add({ event, amount, description, date: today, createdAt: now })
  const profile = await ensureProfile()
  await db.profiles.update(profile.id!, {
    totalXP: profile.totalXP + amount,
    lastActivityDate: today,
    updatedAt: now,
  })
}
