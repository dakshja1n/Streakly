"use client"

import { useEffect, useRef } from "react"
import type { Habit } from "@/lib/types"
import { todayISO } from "@/lib/habit-utils"

/**
 * Checks every minute for habits with reminders due and fires a local
 * notification (once per habit per day) when the reminder time is reached.
 */
export function useReminders(habits: Habit[]) {
  const habitsRef = useRef<Habit[]>(habits)
  const firedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    habitsRef.current = habits
  }, [habits])

  useEffect(() => {
    function check() {
      if (typeof Notification === "undefined" || Notification.permission !== "granted") return
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, "0")
      const mm = String(now.getMinutes()).padStart(2, "0")
      const current = `${hh}:${mm}`
      const today = todayISO()

      for (const habit of habitsRef.current) {
        if (!habit.reminderEnabled) continue
        if (habit.completions[today]) continue
        if (habit.reminderTime !== current) continue
        const fireKey = `${habit.id}:${today}`
        if (firedRef.current.has(fireKey)) continue
        firedRef.current.add(fireKey)
        try {
          new Notification(`${habit.emoji} ${habit.name}`, {
            body: "Time to complete your habit!",
            icon: "/icon-192.png",
          })
        } catch {
          // ignore
        }
      }
    }

    check()
    const interval = setInterval(check, 60_000)
    return () => clearInterval(interval)
  }, [])
}
