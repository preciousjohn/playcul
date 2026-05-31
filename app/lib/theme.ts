export const C = {
  cream:  "#f4ebd8",
  cream2: "#efe3cb",
  ink:    "#241f1b",
  blue:   "#1c3a8c",
  lime:   "#c8e85a",
  orange: "#ea6a2e",
  mut:    "#6f6451",
  line:   "#d9cbac",
  dark:   "#161310",
} as const

export type DiscColor = { bg: string; fg: string }

export const DISC_COLORS: DiscColor[] = [
  { bg: "#e7456a", fg: "#fff" },
  { bg: "#2f7d5b", fg: "#fff" },
  { bg: "#ea6a2e", fg: "#fff" },
  { bg: "#d4a62a", fg: "#241f1b" },
  { bg: "#4a90c4", fg: "#fff" },
  { bg: "#c8e85a", fg: "#241f1b" },
  { bg: "#7b5ea7", fg: "#fff" },
  { bg: "#c0534a", fg: "#fff" },
  { bg: "#3d7a6b", fg: "#fff" },
  { bg: "#e7456a", fg: "#fff" },
]

export function discColor(index: number): DiscColor {
  return DISC_COLORS[index % DISC_COLORS.length]
}

export type ChordLevel = "beginner" | "intermediate" | "advanced"

export const CHORD_LEVELS: {
  key: ChordLevel
  label: string
  description: string
  bg: string
  fg: string
}[] = [
  { key: "beginner",     label: "Beginner",     description: "Open chords every player starts with", bg: "#2f7d5b", fg: "#fff" },
  { key: "intermediate", label: "Intermediate", description: "Sevenths, minors, and richer voicings", bg: "#ea6a2e", fg: "#fff" },
  { key: "advanced",     label: "Expert",       description: "Barre chords and complex shapes",       bg: "#7b5ea7", fg: "#fff" },
]
