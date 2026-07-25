export type FrequencyType = "daily" | "weekdays" | "weekends" | "custom"

export interface HabitSchedule {
  type: FrequencyType
  // For custom: how many times per week is the target
  timesPerWeek?: number
}

export interface Habit {
  id: string
  name: string
  emoji: string
  color: string // palette key
  schedule: HabitSchedule
  order: number
  createdAt: number
  reminderEnabled: boolean
  reminderTime: string // "HH:MM"
  // Map of ISO date (yyyy-mm-dd) -> completed
  completions: Record<string, boolean>
  // Map of ISO date (yyyy-mm-dd) -> note text
  notes: Record<string, string>
}

export interface HabitStats {
  currentStreak: number
  bestStreak: number
  totalCount: number
}
