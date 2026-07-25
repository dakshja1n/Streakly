"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { Habit } from "@/lib/types"
import { isFirebaseConfigured } from "@/lib/firebase"
import { persistAll, persistHabit, removeHabit, subscribeHabits } from "@/lib/storage"
import { todayISO } from "@/lib/habit-utils"

interface HabitsContextValue {
  habits: Habit[]
  loading: boolean
  online: boolean
  addHabit: (habit: Habit) => void
  updateHabit: (habit: Habit) => void
  deleteHabit: (id: string) => void
  toggleCompletion: (habitId: string, iso: string) => void
  setNote: (habitId: string, iso: string, note: string) => void
  reorderHabit: (id: string, direction: "up" | "down") => void
  importHabits: (habits: Habit[]) => void
}

const HabitsContext = createContext<HabitsContextValue | null>(null)

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const habitsRef = useRef<Habit[]>([])

  useEffect(() => {
    habitsRef.current = habits
  }, [habits])

  useEffect(() => {
    const unsub = subscribeHabits((next) => {
      setHabits(next)
      setLoading(false)
    })
    return unsub
  }, [])

  const commit = useCallback((next: Habit[], changed?: Habit) => {
    next.sort((a, b) => a.order - b.order)
    setHabits(next)
    habitsRef.current = next
    if (changed) {
      void persistHabit(changed, next)
    } else {
      void persistAll(next)
    }
  }, [])

  const addHabit = useCallback(
    (habit: Habit) => {
      const next = [...habitsRef.current, habit]
      commit(next, habit)
    },
    [commit],
  )

  const updateHabit = useCallback(
    (habit: Habit) => {
      const next = habitsRef.current.map((h) => (h.id === habit.id ? habit : h))
      commit(next, habit)
    },
    [commit],
  )

  const deleteHabit = useCallback((id: string) => {
    const remaining = habitsRef.current.filter((h) => h.id !== id)
    remaining.sort((a, b) => a.order - b.order)
    setHabits(remaining)
    habitsRef.current = remaining
    void removeHabit(id, remaining)
  }, [])

  const toggleCompletion = useCallback(
    (habitId: string, iso: string) => {
      const target = habitsRef.current.find((h) => h.id === habitId)
      if (!target) return
      const completions = { ...target.completions }
      if (completions[iso]) {
        delete completions[iso]
      } else {
        completions[iso] = true
      }
      const updated: Habit = { ...target, completions }
      const next = habitsRef.current.map((h) => (h.id === habitId ? updated : h))
      commit(next, updated)
    },
    [commit],
  )

  const setNote = useCallback(
    (habitId: string, iso: string, note: string) => {
      const target = habitsRef.current.find((h) => h.id === habitId)
      if (!target) return
      const notes = { ...target.notes }
      if (note.trim()) {
        notes[iso] = note.trim()
      } else {
        delete notes[iso]
      }
      const updated: Habit = { ...target, notes }
      const next = habitsRef.current.map((h) => (h.id === habitId ? updated : h))
      commit(next, updated)
    },
    [commit],
  )

  const reorderHabit = useCallback(
    (id: string, direction: "up" | "down") => {
      const sorted = [...habitsRef.current].sort((a, b) => a.order - b.order)
      const index = sorted.findIndex((h) => h.id === id)
      if (index === -1) return
      const swapWith = direction === "up" ? index - 1 : index + 1
      if (swapWith < 0 || swapWith >= sorted.length) return
      const temp = sorted[index]
      sorted[index] = sorted[swapWith]
      sorted[swapWith] = temp
      const reindexed = sorted.map((h, i) => ({ ...h, order: i }))
      commit(reindexed)
    },
    [commit],
  )

  const importHabits = useCallback(
    (imported: Habit[]) => {
      const reindexed = imported.map((h, i) => ({ ...h, order: i }))
      commit(reindexed)
    },
    [commit],
  )

  const value = useMemo<HabitsContextValue>(
    () => ({
      habits,
      loading,
      online: isFirebaseConfigured,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleCompletion,
      setNote,
      reorderHabit,
      importHabits,
    }),
    [
      habits,
      loading,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleCompletion,
      setNote,
      reorderHabit,
      importHabits,
    ],
  )

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>
}

export function useHabits(): HabitsContextValue {
  const ctx = useContext(HabitsContext)
  if (!ctx) throw new Error("useHabits must be used within HabitsProvider")
  return ctx
}

/** Create an empty habit with sensible defaults. */
export function createEmptyHabit(order: number): Habit {
  return {
    id: crypto.randomUUID(),
    name: "",
    emoji: "✅",
    color: "emerald",
    schedule: { type: "daily", timesPerWeek: 3 },
    order,
    createdAt: Date.now(),
    reminderEnabled: false,
    reminderTime: "09:00",
    completions: {},
    notes: {},
  }
}

export { todayISO }
