"use client"

import { HabitsProvider } from "@/hooks/use-habits"
import { HabitTracker } from "@/components/habit-tracker"

export default function Page() {
  return (
    <HabitsProvider>
      <main className="min-h-screen bg-zinc-950">
        <HabitTracker />
      </main>
    </HabitsProvider>
  )
}
