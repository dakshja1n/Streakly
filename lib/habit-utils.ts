import type { Habit, HabitStats } from "./types"

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/** Whether a given date is a scheduled/target day for the habit. */
export function isScheduledDay(habit: Habit, date: Date): boolean {
  const dow = date.getDay() // 0 = Sun ... 6 = Sat
  switch (habit.schedule.type) {
    case "daily":
      return true
    case "weekdays":
      return dow >= 1 && dow <= 5
    case "weekends":
      return dow === 0 || dow === 6
    case "custom":
      return true // custom is a weekly target, every day counts as an option
    default:
      return true
  }
}

/**
 * Compute current streak, best streak, and total completions.
 * For daily/weekday/weekend habits streak counts consecutive scheduled days completed.
 * For custom (X per week) we count consecutive weeks meeting the target.
 */
export function computeStats(habit: Habit): HabitStats {
  const completedDates = Object.keys(habit.completions).filter((k) => habit.completions[k])
  const totalCount = completedDates.length

  if (habit.schedule.type === "custom") {
    return computeWeeklyStats(habit, totalCount)
  }

  const completedSet = new Set(completedDates)

  // Best streak: walk all scheduled days from creation to today
  let bestStreak = 0
  let running = 0
  const start = new Date(habit.createdAt)
  start.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let d = new Date(start); d <= today; d = addDays(d, 1)) {
    if (!isScheduledDay(habit, d)) continue
    if (completedSet.has(toISODate(d))) {
      running += 1
      bestStreak = Math.max(bestStreak, running)
    } else {
      running = 0
    }
  }

  // Current streak: walk backwards from today over scheduled days
  let currentStreak = 0
  let cursor = new Date(today)
  // If today is scheduled but not yet completed, streak can still be alive from yesterday
  if (isScheduledDay(habit, cursor) && !completedSet.has(toISODate(cursor))) {
    cursor = addDays(cursor, -1)
  }
  while (cursor >= start) {
    if (isScheduledDay(habit, cursor)) {
      if (completedSet.has(toISODate(cursor))) {
        currentStreak += 1
      } else {
        break
      }
    }
    cursor = addDays(cursor, -1)
  }

  return { currentStreak, bestStreak, totalCount }
}

function getWeekKey(date: Date): string {
  // Week starting Monday
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7 // 0 = Monday
  d.setDate(d.getDate() - day)
  return toISODate(d)
}

function computeWeeklyStats(habit: Habit, totalCount: number): HabitStats {
  const target = habit.schedule.timesPerWeek ?? 3
  const counts: Record<string, number> = {}
  for (const iso of Object.keys(habit.completions)) {
    if (!habit.completions[iso]) continue
    const wk = getWeekKey(parseISO(iso))
    counts[wk] = (counts[wk] ?? 0) + 1
  }

  const weeks = Object.keys(counts).sort()
  let bestStreak = 0
  let running = 0
  let prevWeek: Date | null = null
  for (const wk of weeks) {
    const met = counts[wk] >= target
    const wkDate = parseISO(wk)
    if (met) {
      if (prevWeek && Math.round((wkDate.getTime() - prevWeek.getTime()) / (7 * 86400000)) === 1) {
        running += 1
      } else {
        running = 1
      }
      bestStreak = Math.max(bestStreak, running)
      prevWeek = wkDate
    } else {
      running = 0
      prevWeek = null
    }
  }

  // Current streak of weeks ending this or last week
  let currentStreak = 0
  let cursor = parseISO(getWeekKey(new Date()))
  const thisWeekMet = (counts[toISODate(cursor)] ?? 0) >= target
  if (!thisWeekMet) cursor = addDays(cursor, -7)
  while ((counts[toISODate(cursor)] ?? 0) >= target) {
    currentStreak += 1
    cursor = addDays(cursor, -7)
  }

  return { currentStreak, bestStreak, totalCount }
}

export interface Milestone {
  key: string
  emoji: string
  label: string
  threshold: number
}

export const MILESTONES: Milestone[] = [
  { key: "flame", emoji: "🔥", label: "7-day streak", threshold: 7 },
  { key: "star", emoji: "⭐", label: "14-day streak", threshold: 14 },
  { key: "trophy", emoji: "🏆", label: "30-day streak", threshold: 30 },
  { key: "medal", emoji: "🥇", label: "50-day streak", threshold: 50 },
  { key: "diamond", emoji: "💎", label: "100-day status", threshold: 100 },
]

export function earnedMilestones(bestStreak: number): Milestone[] {
  return MILESTONES.filter((m) => bestStreak >= m.threshold)
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function monthLabel(year: number, month: number): string {
  return `${MONTH_NAMES[month]} ${year}`
}

/** Returns an array of Date objects for each day in the given month. */
export function daysInMonth(year: number, month: number): Date[] {
  const result: Date[] = []
  const date = new Date(year, month, 1)
  while (date.getMonth() === month) {
    result.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return result
}

/** Leading empty cells (Mon-start) before the first of the month. */
export function leadingBlanks(year: number, month: number): number {
  const first = new Date(year, month, 1).getDay() // 0 Sun..6 Sat
  return (first + 6) % 7 // convert to Monday-start
}
