// ============================================================
// TERMINAL — Database Hooks
// ============================================================

import { useLiveQuery } from 'dexie-react-hooks'
import { db, ensureProfile, Profile } from '@/db/schema'

// Profile hook — auto-initializes if empty
export function useProfile(): Profile | undefined {
  return useLiveQuery(async () => {
    return await ensureProfile()
  })
}

// Recent journal entries
export function useRecentJournal(limit = 3) {
  return useLiveQuery(async () => {
    return await db.journalEntries
      .orderBy('date')
      .reverse()
      .limit(limit)
      .toArray()
  }, [limit])
}

// Today's journal entry
export function useTodayJournal() {
  const today = new Date().toISOString().split('T')[0]
  return useLiveQuery(async () => {
    return await db.journalEntries.where('date').equals(today).first()
  }, [today])
}

// Recent notes
export function useRecentNotes(limit = 5) {
  return useLiveQuery(async () => {
    return await db.notes
      .orderBy('updatedAt')
      .reverse()
      .limit(limit)
      .toArray()
  }, [limit])
}

// Active strategies
export function useActiveStrategies() {
  return useLiveQuery(async () => {
    return await db.strategies.where('isActive').equals(1).toArray()
  })
}

// Upcoming calendar events
export function useUpcomingEvents(limit = 5) {
  const now = new Date().toISOString()
  return useLiveQuery(async () => {
    return await db.calendarEvents
      .where('startTime')
      .above(now)
      .limit(limit)
      .toArray()
  }, [now])
}

// Cert progress for a specific cert
export function useCertProgress(certId: string | null) {
  return useLiveQuery(async () => {
    if (!certId) return null
    return await db.certProgress.where('certId').equals(certId).first()
  }, [certId])
}

// All cert progress
export function useAllCertProgress() {
  return useLiveQuery(async () => {
    return await db.certProgress.toArray()
  })
}

// Recent XP log
export function useXPLog(limit = 20) {
  return useLiveQuery(async () => {
    return await db.xpLog
      .orderBy('createdAt')
      .reverse()
      .limit(limit)
      .toArray()
  }, [limit])
}

// Strategy count
export function useStrategyCount() {
  return useLiveQuery(async () => {
    return await db.strategies.count()
  })
}

// Research paper count
export function useResearchCount() {
  return useLiveQuery(async () => {
    return await db.researchPapers.count()
  })
}

// Notes count
export function useNotesCount() {
  return useLiveQuery(async () => {
    return await db.notes.count()
  })
}

// All prop firms
export function usePropFirms() {
  return useLiveQuery(async () => {
    return await db.propFirms.orderBy('updatedAt').reverse().toArray()
  })
}
