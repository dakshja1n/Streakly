"use client"

import { earnedMilestones } from "@/lib/habit-utils"

export function StreakBadges({ bestStreak }: { bestStreak: number }) {
  const badges = earnedMilestones(bestStreak)
  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {badges.map((badge) => (
        <span
          key={badge.key}
          title={badge.label}
          className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800/80 px-2 py-0.5 text-xs font-medium text-zinc-200"
        >
          <span aria-hidden="true">{badge.emoji}</span>
          <span className="tabular-nums">{badge.threshold}</span>
        </span>
      ))}
    </div>
  )
}
