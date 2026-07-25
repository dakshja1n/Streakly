"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import type { FrequencyType, Habit } from "@/lib/types"
import { ACCENT_COLORS, getColorHex } from "@/lib/colors"
import { Modal } from "./modal"

const EMOJI_CHOICES = [
  "✅", "🏃", "💧", "📚", "🧘", "💪", "🥗", "😴", "🎯", "✍️",
  "🎸", "🧹", "💰", "🌱", "☀️", "🚭", "🍎", "🦷", "🧠", "❤️",
]

const FREQUENCIES: { value: FrequencyType; label: string; hint: string }[] = [
  { value: "daily", label: "Daily", hint: "Every day" },
  { value: "weekdays", label: "Weekdays", hint: "Mon – Fri" },
  { value: "weekends", label: "Weekends", hint: "Sat & Sun" },
  { value: "custom", label: "Custom", hint: "X times / week" },
]

interface HabitModalProps {
  open: boolean
  onClose: () => void
  onSave: (habit: Habit) => void
  initial: Habit | null
}

export function HabitModal({ open, onClose, onSave, initial }: HabitModalProps) {
  const [draft, setDraft] = useState<Habit | null>(initial)

  useEffect(() => {
    setDraft(initial)
  }, [initial])

  if (!draft) return null

  const accent = getColorHex(draft.color)

  async function handleReminderToggle(enabled: boolean) {
    if (!draft) return
    if (enabled && typeof Notification !== "undefined" && Notification.permission !== "granted") {
      try {
        await Notification.requestPermission()
      } catch {
        // ignore
      }
    }
    setDraft({ ...draft, reminderEnabled: enabled })
  }

  function handleSubmit() {
    if (!draft) return
    const name = draft.name.trim()
    if (!name) return
    onSave({ ...draft, name })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial && initial.name ? "Edit Habit" : "New Habit"}
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!draft.name.trim()}
            className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-zinc-950 transition-opacity disabled:opacity-40"
            style={{ backgroundColor: accent }}
          >
            Save Habit
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor="habit-name" className="mb-1.5 block text-xs font-medium text-zinc-400">
            Habit name
          </label>
          <input
            id="habit-name"
            type="text"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="e.g. Drink water"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
            autoFocus
          />
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-zinc-400">Icon</span>
          <div className="grid grid-cols-10 gap-1.5">
            {EMOJI_CHOICES.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setDraft({ ...draft, emoji })}
                className="flex aspect-square items-center justify-center rounded-lg border text-lg transition-colors"
                style={{
                  borderColor: draft.emoji === emoji ? accent : "#3f3f46",
                  backgroundColor: draft.emoji === emoji ? `${accent}22` : "transparent",
                }}
                aria-label={`Select icon ${emoji}`}
                aria-pressed={draft.emoji === emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-zinc-400">Accent color</span>
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.key}
                type="button"
                onClick={() => setDraft({ ...draft, color: color.key })}
                title={color.label}
                aria-label={color.label}
                aria-pressed={draft.color === color.key}
                className="h-8 w-8 rounded-full transition-transform hover:scale-110"
                style={{
                  backgroundColor: color.hex,
                  boxShadow: draft.color === color.key ? `0 0 0 2px #09090b, 0 0 0 4px ${color.hex}` : undefined,
                }}
              />
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-zinc-400">Frequency</span>
          <div className="grid grid-cols-2 gap-2">
            {FREQUENCIES.map((freq) => (
              <button
                key={freq.value}
                type="button"
                onClick={() => setDraft({ ...draft, schedule: { ...draft.schedule, type: freq.value } })}
                className="rounded-lg border px-3 py-2 text-left transition-colors"
                style={{
                  borderColor: draft.schedule.type === freq.value ? accent : "#3f3f46",
                  backgroundColor: draft.schedule.type === freq.value ? `${accent}22` : "transparent",
                }}
                aria-pressed={draft.schedule.type === freq.value}
              >
                <span className="block text-sm font-medium text-zinc-100">{freq.label}</span>
                <span className="block text-xs text-zinc-500">{freq.hint}</span>
              </button>
            ))}
          </div>
          {draft.schedule.type === "custom" && (
            <div className="mt-3 flex items-center gap-3">
              <label htmlFor="times-per-week" className="text-sm text-zinc-300">
                Target
              </label>
              <input
                id="times-per-week"
                type="number"
                min={1}
                max={7}
                value={draft.schedule.timesPerWeek ?? 3}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    schedule: {
                      ...draft.schedule,
                      timesPerWeek: Math.min(7, Math.max(1, Number(e.target.value) || 1)),
                    },
                  })
                }
                className="w-16 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-center text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
              />
              <span className="text-sm text-zinc-500">times per week</span>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-200">Daily reminder</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={draft.reminderEnabled}
              onClick={() => handleReminderToggle(!draft.reminderEnabled)}
              className="relative h-6 w-11 rounded-full transition-colors"
              style={{ backgroundColor: draft.reminderEnabled ? accent : "#3f3f46" }}
            >
              <span
                className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
                style={{ transform: draft.reminderEnabled ? "translateX(22px)" : "translateX(2px)" }}
              />
            </button>
          </div>
          {draft.reminderEnabled && (
            <div className="mt-3 flex items-center gap-3">
              <label htmlFor="reminder-time" className="text-sm text-zinc-300">
                Time
              </label>
              <input
                id="reminder-time"
                type="time"
                value={draft.reminderTime}
                onChange={(e) => setDraft({ ...draft, reminderTime: e.target.value })}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none [color-scheme:dark]"
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
