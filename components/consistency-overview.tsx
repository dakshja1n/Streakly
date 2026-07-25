"use client"

import { useMemo } from "react"
import type { Habit } from "@/lib/types"
import { consistencySeries } from "@/lib/analytics"

function Sparkline({ points, color }: { points: number[]; color: string }) {
  const width = 100
  const height = 32
  if (points.length < 2) {
    return <div className="h-8 w-full rounded bg-zinc-800/50" />
  }
  const stepX = width / (points.length - 1)
  const coords = points.map((p, i) => [i * stepX, height - p * (height - 4) - 2])
  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ")
  const area = `${line} L${width},${height} L0,${height} Z`
  const gradId = `spark-${color.replace("#", "")}`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-8 w-full"
      role="img"
      aria-label="Consistency trend"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

interface RangeConfig {
  key: string
  label: string
  days: number
  buckets: number
  color: string
}

const RANGES: RangeConfig[] = [
  { key: "year", label: "Yearly", days: 365, buckets: 52, color: "#10b981" },
  { key: "6mo", label: "6-Month", days: 182, buckets: 26, color: "#0ea5e9" },
  { key: "3mo", label: "3-Month", days: 91, buckets: 13, color: "#f59e0b" },
]

export function ConsistencyOverview({ habits }: { habits: Habit[] }) {
  const data = useMemo(
    () =>
      RANGES.map((range) => ({
        ...range,
        ...consistencySeries(habits, range.days, range.buckets),
      })),
    [habits],
  )

  return (
    <section aria-label="Consistency overview" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {data.map((range) => (
        <div key={range.key} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-xs font-medium text-zinc-400">{range.label}</span>
            <span className="text-lg font-semibold tabular-nums text-zinc-100">
              {Math.round(range.overall * 100)}%
            </span>
          </div>
          <Sparkline points={range.points} color={range.color} />
        </div>
      ))}
    </section>
  )
}
