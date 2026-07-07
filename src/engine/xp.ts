// ============================================================
// TERMINAL — XP & Level Engine
// ============================================================

import { LEVELS, XP_AWARDS, XPEventType } from '@/data/mission'

export interface LevelInfo {
  level: number
  name: string
  xpRequired: number
  xpNext: number
  progress: number // 0-100
}

export function getLevelInfo(totalXP: number): LevelInfo {
  let currentLevel = LEVELS[0]
  let nextLevel = LEVELS[1]

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xpRequired) {
      currentLevel = LEVELS[i]
      nextLevel = LEVELS[i + 1] ?? null!
      break
    }
  }

  const isMaxLevel = !nextLevel
  const xpInLevel = isMaxLevel ? 0 : totalXP - currentLevel.xpRequired
  const xpNeeded = isMaxLevel ? 1 : nextLevel.xpRequired - currentLevel.xpRequired
  const progress = isMaxLevel ? 100 : Math.min(100, Math.floor((xpInLevel / xpNeeded) * 100))

  return {
    level: currentLevel.level,
    name: currentLevel.name,
    xpRequired: currentLevel.xpRequired,
    xpNext: isMaxLevel ? currentLevel.xpRequired : nextLevel.xpRequired,
    progress,
  }
}

export function getXPForEvent(event: XPEventType): number {
  return XP_AWARDS[event] ?? 0
}

export function formatXP(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
  return xp.toString()
}

export function calculateStreak(lastActivityDate: string | null): number {
  if (!lastActivityDate) return 0
  const last = new Date(lastActivityDate)
  const today = new Date()
  const diff = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
  return diff <= 1 ? 1 : 0
}

export function getYearProgress(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const end = new Date(now.getFullYear() + 1, 0, 0)
  return Math.floor(((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100)
}

export function getMonthProgress(): number {
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return Math.floor((now.getDate() / daysInMonth) * 100)
}

export function getWeekProgress(): number {
  const now = new Date()
  const day = now.getDay() === 0 ? 7 : now.getDay()
  return Math.floor((day / 7) * 100)
}

export function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function todayKey(): string {
  return new Date().toISOString().split('T')[0]
}
