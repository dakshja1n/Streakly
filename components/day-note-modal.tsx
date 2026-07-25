"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import type { Habit } from "@/lib/types"
import { getColorHex } from "@/lib/colors"
import { parseISO } from "@/lib/habit-utils"
import { useHabits } from "@/hooks/use-habits"
import { haptic } from "@/lib/haptics"
import { Modal } from "./modal"

interface DayNoteModalProps {
  open: boolean
  onClose: () => void
  habit: Habit | null
  iso: string | null
}

export function DayNoteModal({ open, onClose, habit, iso }: DayNoteModalProps) {
  const { setNote, toggleCompletion } = useHabits()
  const [text, setText] = useState("")

  useEffect(() => {
    if (habit && iso) setText(habit.notes[iso] ?? "")
  }, [habit, iso])

  if (!habit || !iso) return null

  const accent = getColorHex(habit.color)
  const completed = Boolean(habit.completions[iso])
  const dateLabel = parseISO(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  function handleSave() {
    if (!habit || !iso) return
    setNote(habit.id, iso, text)
    onClose()
  }

  function handleToggle() {
    if (!habit || !iso) return
    haptic(20)
    toggleCompletion(habit.id, iso)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${habit.emoji} ${habit.name}`}
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
            onClick={handleSave}
            className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-zinc-950"
            style={{ backgroundColor: accent }}
          >
            Save Note
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-zinc-400">{dateLabel}</p>

        <button
          type="button"
          onClick={handleToggle}
          className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]"
          style={
            completed
              ? { backgroundColor: accent, color: "#09090b" }
              : { backgroundColor: "#27272a", color: "#e4e4e7", border: `1px solid ${accent}55` }
          }
          aria-pressed={completed}
        >
          <Check className="h-4 w-4" />
          {completed ? "Completed" : "Mark as complete"}
        </button>

        <div>
          <label htmlFor="day-note" className="mb-1.5 block text-xs font-medium text-zinc-400">
            Daily note
          </label>
          <textarea
            id="day-note"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Ran 5km, Read Chapter 4..."
            rows={4}
            className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
            autoFocus
          />
        </div>
      </div>
    </Modal>
  )
}
