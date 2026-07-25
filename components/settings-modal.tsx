"use client"

import { useRef, useState } from "react"
import { Download, Upload, FileSpreadsheet, Cloud, HardDrive } from "lucide-react"
import { useHabits } from "@/hooks/use-habits"
import { exportCSV, exportJSON, parseImport } from "@/lib/backup"
import { Modal } from "./modal"

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { habits, importHabits, online } = useHabits()
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = parseImport(String(reader.result))
        importHabits(imported)
        setMessage(`Imported ${imported.length} habit${imported.length === 1 ? "" : "s"}.`)
      } catch {
        setMessage("Could not read that file. Make sure it is a valid backup.")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="flex flex-col gap-5">
        <div
          className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"
        >
          {online ? (
            <Cloud className="h-5 w-5 text-emerald-400" />
          ) : (
            <HardDrive className="h-5 w-5 text-amber-400" />
          )}
          <div>
            <p className="text-sm font-medium text-zinc-100">
              {online ? "Cloud sync active" : "Local storage mode"}
            </p>
            <p className="text-xs text-zinc-500">
              {online
                ? "Synced with Firebase Firestore across devices."
                : "Firebase not configured — data is saved on this device."}
            </p>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Data & backups</h3>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => exportJSON(habits)}
              className="flex items-center gap-3 rounded-lg border border-zinc-700 px-3 py-2.5 text-left text-sm text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              <Download className="h-4 w-4 text-zinc-400" />
              <span>
                Export backup <span className="text-zinc-500">(.json)</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-3 rounded-lg border border-zinc-700 px-3 py-2.5 text-left text-sm text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              <Upload className="h-4 w-4 text-zinc-400" />
              <span>
                Import backup <span className="text-zinc-500">(.json)</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => exportCSV(habits)}
              className="flex items-center gap-3 rounded-lg border border-zinc-700 px-3 py-2.5 text-left text-sm text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              <FileSpreadsheet className="h-4 w-4 text-zinc-400" />
              <span>
                Export logs <span className="text-zinc-500">(.csv)</span>
              </span>
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        {message && (
          <p className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300">
            {message}
          </p>
        )}
      </div>
    </Modal>
  )
}
