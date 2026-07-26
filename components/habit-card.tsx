"use client"

import { useMemo, useState } from "react"
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Flame,
  Pencil,
  Trash2,
} from "lucide-react"
import type { Habit } from "@/lib/types"
import { getColorHex } from "@/lib/colors"
import { computeStats, monthLabel, todayISO } from "@/lib/habit-utils"
import { useHabits } from "@/hooks/use-habits"
import { haptic } from "@/lib/haptics"
import { MonthlyHeatmap } from "./monthly-heatmap"
import { StreakBadges } from "./streak-badges"

const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Every day",
  weekdays: "Weekdays",
  weekends: "Weekends",
  custom: "Weekly target",
}

interface HabitCardProps {
  habit: Habit
  isFirst: boolean
  isLast: boolean
  onEdit: (habit: Habit) => void
}

export function HabitCard({ habit, isFirst, isLast, onEdit }: HabitCardProps) {
  const { toggleCompletion, deleteHabit, reorderHabit } = useHabits()
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  const accent = getColorHex(habit.color)
  const stats = useMemo(() => computeStats(habit), [habit])
  const today = todayISO()
  const doneToday = Boolean(habit.completions[today])

  const frequencyLabel =
    habit.schedule.type === "custom"
      ? `${habit.schedule.timesPerWeek ?? 3}x per week`
      : FREQUENCY_LABELS[habit.schedule.type]

  function shiftMonth(delta: number) {
    let m = viewMonth + delta
    let y = viewYear
    if (m < 0) {
      m = 11
      y -= 1
    } else if (m > 11) {
      m = 0
      y += 1
    }
    setViewMonth(m)
    setViewYear(y)
  }

  function handleComplete() {
    haptic(20)
    toggleCompletion(habit.id, today)
  }

  function handleDelete() {
    if (window.confirm(`Delete "${habit.name}"? This cannot be undone.`)) {
      deleteHabit(habit.id)
    }
  }

  return (
    <article
      className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-2.5 sm:p-3 shadow-lg shadow-black/20"
      style={{ borderTopColor: accent, borderTopWidth: 2 }}
    >
      <header className="mb-2 flex items-start justify-between gap-1">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base"
            style={{ backgroundColor: `${accent}22`, border: `1px solid ${accent}55` }}
            aria-hidden="true"
          >
            {habit.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-xs sm:text-sm font-semibold leading-tight text-zinc-100">{habit.name}</h3>
            <p className="truncate text-[10px] sm:text-xs text-zinc-500">{frequencyLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => reorderHabit(habit.id, "up")}
            disabled={isFirst}
            aria-label="Move habit up"
            className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => reorderHabit(habit.id, "down")}
            disabled={isLast}
            aria-label="Move habit down"
            className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(habit)}
            aria-label="Edit habit"
            className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Delete habit"
            className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <div className="mb-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <Flame className="h-3.5 w-3.5" style={{ color: accent }} />
          <span className="font-semibold tabular-nums text-zinc-100">{stats.currentStreak}</span>
          <span className="text-[10px] text-zinc-500 sm:text-xs">streak</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold tabular-nums text-zinc-100">{stats.totalCount}</span>
          <span className="text-[10px] text-zinc-500 sm:text-xs">total</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold tabular-nums text-zinc-100">{stats.bestStreak}</span>
          <span className="text-[10px] text-zinc-500 sm:text-xs">best</span>
        </div>
      </div>

      <div className="mb-2">
        <StreakBadges bestStreak={stats.bestStreak} />
      </div>

      <button
        type="button"
        onClick={handleComplete}
        className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-[0.98]"
        style={
          doneToday
            ? { backgroundColor: accent, color: "#09090b" }
            : { backgroundColor: "#27272a", color: "#e4e4e7", border: `1px solid ${accent}55` }
        }
        aria-pressed={doneToday}
      >
        <Check className="h-3.5 w-3.5" />
        {doneToday ? "Completed Today" : "Complete Today"}
      </button>

      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] sm:text-xs font-medium text-zinc-400">{monthLabel(viewYear, viewMonth)}</span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="rounded p-0.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="rounded p-0.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <MonthlyHeatmap
        habit={habit}
        year={viewYear}
        month={viewMonth}
        onDayClick={(iso) => toggleCompletion(habit.id, iso)}
      />
    </article>
  )
}
