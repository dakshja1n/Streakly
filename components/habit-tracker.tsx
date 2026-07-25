"use client"

import { useMemo, useState } from "react"
import { Plus, Settings, Sparkles } from "lucide-react"
import type { Habit } from "@/lib/types"
import { createEmptyHabit, useHabits } from "@/hooks/use-habits"
import { useReminders } from "@/hooks/use-reminders"
import { HabitCard } from "./habit-card"
import { HabitModal } from "./habit-modal"
import { DayNoteModal } from "./day-note-modal"
import { SettingsModal } from "./settings-modal"
import { ConsistencyOverview } from "./consistency-overview"

export function HabitTracker() {
  const { habits, loading, addHabit, updateHabit } = useHabits()
  useReminders(habits)

  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [habitModalOpen, setHabitModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [noteTarget, setNoteTarget] = useState<{ habit: Habit; iso: string } | null>(null)

  const sorted = useMemo(() => [...habits].sort((a, b) => a.order - b.order), [habits])

  function openNew() {
    setEditingHabit(createEmptyHabit(habits.length))
    setHabitModalOpen(true)
  }

  function openEdit(habit: Habit) {
    setEditingHabit(habit)
    setHabitModalOpen(true)
  }

  function handleSave(habit: Habit) {
    const exists = habits.some((h) => h.id === habit.id)
    if (exists) {
      updateHabit(habit)
    } else {
      addHabit(habit)
    }
    setHabitModalOpen(false)
    setEditingHabit(null)
  }

  // Keep the note modal habit in sync with latest data
  const noteHabit = noteTarget ? habits.find((h) => h.id === noteTarget.habit.id) ?? null : null

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-zinc-100">HabitKit</h1>
            <p className="text-xs text-zinc-500">Build better routines</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
            className="rounded-lg border border-zinc-800 p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Habit</span>
          </button>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/40" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState onCreate={openNew} />
      ) : (
        <div className="flex flex-col gap-6">
          <ConsistencyOverview habits={sorted} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sorted.map((habit, i) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                isFirst={i === 0}
                isLast={i === sorted.length - 1}
                onEdit={openEdit}
                onDayClick={(h, iso) => setNoteTarget({ habit: h, iso })}
              />
            ))}
          </div>
        </div>
      )}

      <HabitModal
        open={habitModalOpen}
        onClose={() => {
          setHabitModalOpen(false)
          setEditingHabit(null)
        }}
        onSave={handleSave}
        initial={editingHabit}
      />

      <DayNoteModal
        open={Boolean(noteTarget)}
        onClose={() => setNoteTarget(null)}
        habit={noteHabit}
        iso={noteTarget?.iso ?? null}
      />

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
        <Sparkles className="h-7 w-7" />
      </div>
      <h2 className="mb-1 text-lg font-semibold text-zinc-100">Start your first habit</h2>
      <p className="mb-6 max-w-xs text-pretty text-sm text-zinc-500">
        Track daily routines, build streaks, and watch your consistency grow over time.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400"
      >
        <Plus className="h-4 w-4" />
        Create a habit
      </button>
    </div>
  )
}
