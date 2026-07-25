export interface AccentColor {
  key: string
  label: string
  hex: string
}

export const ACCENT_COLORS: AccentColor[] = [
  { key: "emerald", label: "Emerald Green", hex: "#10b981" },
  { key: "violet", label: "Electric Violet", hex: "#8b5cf6" },
  { key: "orange", label: "Neon Orange", hex: "#f97316" },
  { key: "rose", label: "Rose Pink", hex: "#f43f5e" },
  { key: "cyan", label: "Cyan", hex: "#06b6d4" },
  { key: "amber", label: "Amber Gold", hex: "#f59e0b" },
  { key: "mint", label: "Mint", hex: "#34d399" },
  { key: "sky", label: "Sky Blue", hex: "#0ea5e9" },
  { key: "crimson", label: "Crimson", hex: "#dc2626" },
  { key: "indigo", label: "Indigo", hex: "#6366f1" },
  { key: "coral", label: "Coral", hex: "#fb7185" },
  { key: "teal", label: "Teal", hex: "#14b8a6" },
  { key: "lime", label: "Lime", hex: "#84cc16" },
  { key: "lavender", label: "Lavender", hex: "#a78bfa" },
]

export function getColorHex(key: string): string {
  return ACCENT_COLORS.find((c) => c.key === key)?.hex ?? ACCENT_COLORS[0].hex
}
