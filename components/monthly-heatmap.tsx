"use client"

import type { Habit } from "@/lib/types"
import { daysInMonth, leadingBlanks, toISODate, todayISO } from "@/lib/habit-utils"
import { getColorHex } from "@/lib/colors"

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]

interface MonthlyHeatmapProps {
  habit: Habit
  year: number
  month: number
  onDayClick: (iso: string) => void
}

export function MonthlyHeatmap({ habit, year, month, onDayClick }: MonthlyHeatmapProps) {
  const days = daysInMonth(year, month)
  const blanks = leadingBlanks(year, month)
  const accent = getColorHex(habit.color)
  const today = todayISO()

  return (
    <div>
      <div className="mb-1.5 grid grid-cols-7 gap-1.5">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-zinc-600">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: blanks }).map((_, i) => (
          <div key={`blank-${i}`} className="aspect-square" aria-hidden="true" />
        ))}
        {days.map((day) => {
          const iso = toISODate(day)
          const active = Boolean(habit.completions[iso])
          const hasNote = Boolean(habit.notes[iso])
          const isToday = iso === today
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onDayClick(iso)}
              aria-label={`${iso}${active ? ", completed" : ""}${hasNote ? ", has note" : ""}`}
              aria-pressed={active}
              className="group relative aspect-square rounded-[5px] transition-transform duration-150 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              style={{
                backgroundColor: active ? accent : "#27272a",
                boxShadow: isToday ? `0 0 0 2px #09090b, 0 0 0 3.5px ${accent}, 0 0 8px ${accent}` : undefined,
              }}
            >
              {hasNote && (
                <span
                  className="absolute right-0.5 top-0.5 h-1 w-1 rounded-full"
                  style={{ backgroundColor: active ? "#09090b" : accent }}
                  aria-hidden="true"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
