import type { Habit } from "./types"
import { addDays, isScheduledDay, toISODate } from "./habit-utils"

/**
 * Build a consistency series over the last `days` days across all habits.
 * Each output point is the average completion ratio for a bucket of days.
 * Returns { points, overall } where overall is the period completion percentage.
 */
export function consistencySeries(
  habits: Habit[],
  days: number,
  buckets: number,
): { points: number[]; overall: number } {
  if (habits.length === 0) return { points: new Array(buckets).fill(0), overall: 0 }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = addDays(today, -(days - 1))

  const bucketSize = days / buckets
  const bucketScheduled = new Array(buckets).fill(0)
  const bucketCompleted = new Array(buckets).fill(0)
  let totalScheduled = 0
  let totalCompleted = 0

  for (let i = 0; i < days; i++) {
    const date = addDays(start, i)
    const iso = toISODate(date)
    const bucketIndex = Math.min(buckets - 1, Math.floor(i / bucketSize))
    for (const habit of habits) {
      const created = new Date(habit.createdAt)
      created.setHours(0, 0, 0, 0)
      if (date < created) continue
      if (!isScheduledDay(habit, date)) continue
      bucketScheduled[bucketIndex] += 1
      totalScheduled += 1
      if (habit.completions[iso]) {
        bucketCompleted[bucketIndex] += 1
        totalCompleted += 1
      }
    }
  }

  const points = bucketScheduled.map((s, i) => (s > 0 ? bucketCompleted[i] / s : 0))
  const overall = totalScheduled > 0 ? totalCompleted / totalScheduled : 0
  return { points, overall }
}
