 "use client"

  import type { Habit } from "@/lib/types"
  import { daysInMonth, leadingBlanks, toISODate, todayISO } from "@/lib/habit-utils"
  import { getColorHex } from "@/lib/colors"

  const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]

  interface MonthlyHeatmapProps {
    habit: Habit
    year: number
    month: number
  }

  export function MonthlyHeatmap({ habit, year, month }: MonthlyHeatmapProps) {
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
            const isToday = iso === today
            return (
              <div
                key={iso}
                aria-label={`${iso}${active ? ", completed" : ""}`}
                className="aspect-square rounded-[5px]"
                style={{
                  backgroundColor: active ? accent : "#27272a",
                  boxShadow: isToday ? `0 0 0 2px #09090b, 0 0 0 3.5px ${accent}, 0 0 8px ${accent}` : undefined,
                }}
              />
            )
          })}
        </div>
      </div>
    )
  }
