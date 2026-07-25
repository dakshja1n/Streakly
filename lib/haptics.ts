/** Trigger a light haptic vibration on supported (mobile) devices. */
export function haptic(pattern: number | number[] = 15): void {
  if (typeof navigator === "undefined") return
  try {
    if (typeof navigator.vibrate === "function") {
      navigator.vibrate(pattern)
    }
  } catch {
    // vibration not supported / blocked; ignore
  }
}
