import type { Habit } from "./types"
import { getDb, isFirebaseConfigured } from "./firebase"

const LS_KEY = "habitkit.habits.v1"
const LOCAL_EVENT = "habitkit:local-update"

/* -------------------- Local storage helpers -------------------- */

export function readLocal(): Habit[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(LS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Habit[]
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.log("[v0] Failed to read local habits:", err)
    return []
  }
}

export function writeLocal(habits: Habit[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(habits))
    window.dispatchEvent(new CustomEvent(LOCAL_EVENT))
  } catch (err) {
    console.log("[v0] Failed to write local habits:", err)
  }
}

/* -------------------- Firestore backing -------------------- */

/**
 * Subscribe to habit changes. Uses Firestore realtime sync when configured,
 * otherwise falls back to localStorage with a same-tab event listener.
 * Always mirrors the latest data into localStorage for offline use.
 */
export function subscribeHabits(callback: (habits: Habit[]) => void): () => void {
  const db = getDb()

  if (db && isFirebaseConfigured) {
    let unsub = () => {}
    ;(async () => {
      try {
        const { collection, onSnapshot } = await import("firebase/firestore")
        unsub = onSnapshot(
          collection(db, "habits"),
          (snap) => {
            const habits = snap.docs.map((d) => d.data() as Habit)
            habits.sort((a, b) => a.order - b.order)
            writeLocal(habits)
            callback(habits)
          },
          (err) => {
            console.log("[v0] Firestore subscription error, using local cache:", err)
            callback(readLocal())
          },
        )
      } catch (err) {
        console.log("[v0] Firestore load failed, using local cache:", err)
        callback(readLocal())
      }
    })()
    return () => unsub()
  }

  // Local-only mode
  callback(readLocal())
  const handler = () => callback(readLocal())
  window.addEventListener(LOCAL_EVENT, handler)
  window.addEventListener("storage", handler)
  return () => {
    window.removeEventListener(LOCAL_EVENT, handler)
    window.removeEventListener("storage", handler)
  }
}

export async function persistHabit(habit: Habit, all: Habit[]): Promise<void> {
  // Always mirror locally first for instant + offline UX
  writeLocal(all)

  const db = getDb()
  if (!db || !isFirebaseConfigured) return
  try {
    const { doc, setDoc } = await import("firebase/firestore")
    await setDoc(doc(db, "habits", habit.id), habit)
  } catch (err) {
    console.log("[v0] Failed to persist habit to Firestore:", err)
  }
}

export async function persistAll(all: Habit[]): Promise<void> {
  writeLocal(all)
  const db = getDb()
  if (!db || !isFirebaseConfigured) return
  try {
    const { doc, setDoc } = await import("firebase/firestore")
    await Promise.all(all.map((h) => setDoc(doc(db, "habits", h.id), h)))
  } catch (err) {
    console.log("[v0] Failed to persist habits to Firestore:", err)
  }
}

export async function removeHabit(id: string, remaining: Habit[]): Promise<void> {
  writeLocal(remaining)
  const db = getDb()
  if (!db || !isFirebaseConfigured) return
  try {
    const { doc, deleteDoc } = await import("firebase/firestore")
    await deleteDoc(doc(db, "habits", id))
  } catch (err) {
    console.log("[v0] Failed to delete habit from Firestore:", err)
  }
}
