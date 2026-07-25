import type { Habit } from "./types"

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function stamp(): string {
  return new Date().toISOString().slice(0, 10)
}

export function exportJSON(habits: Habit[]): void {
  download(`habitkit-backup-${stamp()}.json`, JSON.stringify(habits, null, 2), "application/json")
}

export function exportCSV(habits: Habit[]): void {
  const rows: string[] = ["habit,date,completed,note"]
  for (const habit of habits) {
    const dates = new Set([...Object.keys(habit.completions), ...Object.keys(habit.notes)])
    for (const date of Array.from(dates).sort()) {
      const completed = habit.completions[date] ? "yes" : "no"
      const note = (habit.notes[date] ?? "").replace(/"/g, '""')
      const name = habit.name.replace(/"/g, '""')
      rows.push(`"${name}","${date}","${completed}","${note}"`)
    }
  }
  download(`habitkit-logs-${stamp()}.csv`, rows.join("\n"), "text/csv")
}

export function parseImport(text: string): Habit[] {
  const parsed = JSON.parse(text)
  if (!Array.isArray(parsed)) throw new Error("Invalid backup file")
  // Basic validation / normalization
  return parsed.map((h: Partial<Habit>, i: number) => ({
    id: h.id ?? crypto.randomUUID(),
    name: h.name ?? "Untitled",
    emoji: h.emoji ?? "✅",
    color: h.color ?? "emerald",
    schedule: h.schedule ?? { type: "daily", timesPerWeek: 3 },
    order: typeof h.order === "number" ? h.order : i,
    createdAt: h.createdAt ?? Date.now(),
    reminderEnabled: Boolean(h.reminderEnabled),
    reminderTime: h.reminderTime ?? "09:00",
    completions: h.completions ?? {},
    notes: h.notes ?? {},
  }))
}
