"use client"

import { useState } from "react"
import Link from "next/link"
import FretboardDiagram from "@/app/components/FretboardDiagram"
import { chords, songs } from "@/app/lib/data"
import { C, CHORD_LEVELS, discColor } from "@/app/lib/theme"
import PageHeader from "@/app/components/PageHeader"

type Level = "all" | "beginner" | "intermediate" | "advanced"

type Beat = "D" | "U" | "X"

function parseBeats(pattern: string): Beat[] {
  return pattern.split(/[\s]+/).filter((c) => "DUX".includes(c)) as Beat[]
}

function splitTip(tip: string): string[] {
  return tip.split(/\.\s+/).map((s) => s.replace(/\.$/, "").trim()).filter(Boolean)
}

const FILTERS: { key: Level; label: string }[] = [
  { key: "all",          label: "All" },
  { key: "beginner",     label: "Beginner" },
  { key: "intermediate", label: "Intermediate" },
  { key: "advanced",     label: "Expert" },
]

export default function ChordLibraryPage() {
  const [filter,     setFilter]     = useState<Level>("all")
  const [selectedId, setSelectedId] = useState(chords[0].id)

  const filtered = filter === "all" ? chords : chords.filter(c => c.difficulty === filter)

  // If current selection got filtered out, fall back to first visible chord
  const chord = filtered.find(c => c.id === selectedId) ?? filtered[0]

  const tipPoints    = splitTip(chord.tip)
  const beats        = parseBeats(chord.strumPattern)
  const relatedSongs = songs.filter(s => s.chords.includes(chord.id))
  const chordIndex   = chords.findIndex(c => c.id === chord.id)

  return (
    <div style={{ background: C.cream, height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <PageHeader title="Chord Library" backHref="/chords/practice" backLabel="← Back" />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Left — filter tabs + disc selector */}
        <div style={{ width: "38%", flexShrink: 0, borderRight: `1.5px solid ${C.line}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Filter tabs */}
          <div style={{ flexShrink: 0, padding: "14px 18px 10px", borderBottom: `1.5px solid ${C.line}`, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FILTERS.map(f => {
              const isActive = filter === f.key
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    padding: "6px 14px", borderRadius: 999,
                    fontFamily: "var(--font-instrument), sans-serif",
                    fontSize: 12, fontWeight: 700,
                    border: `1.5px solid ${isActive ? C.ink : C.line}`,
                    background: isActive ? C.ink : "transparent",
                    color: isActive ? C.cream : C.mut,
                    cursor: "pointer",
                    transition: "all .12s",
                  }}
                >
                  {f.label}
                </button>
              )
            })}
          </div>

          {/* Chord list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((c, i) => {
              const isActive = c.id === chord.id
              const palette  = discColor(i)
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  style={{
                    background: palette.bg,
                    color: palette.fg,
                    border: `1.5px solid ${C.ink}`,
                    borderRadius: 12,
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                    transition: "transform .15s ease, box-shadow .15s ease",
                    boxShadow: isActive ? `0 4px 0 ${C.ink}, 0 6px 20px rgba(0,0,0,.15)` : "0 2px 0 rgba(36,31,27,.25)",
                    transform: isActive ? "translateY(-1px)" : "none",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-recolta), serif", fontSize: 24, lineHeight: 1 }}>{c.name}</span>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    border: `1.5px solid ${palette.fg}55`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, color: palette.fg, paddingLeft: 2,
                  }}>▶</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right — chord detail */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px 28px 20px" }}>
          <div style={{ maxWidth: 600 }}>

            {/* Chord name + difficulty */}
            <div style={{ marginBottom: 22, display: "flex", alignItems: "flex-end", gap: 16 }}>
              <h1 style={{ fontFamily: "var(--font-recolta), serif", fontSize: 72, color: C.ink, lineHeight: 1, margin: 0 }}>
                {chord.name}
              </h1>
              <div style={{ paddingBottom: 10 }}>
                <p style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 16, color: C.mut, margin: "0 0 6px" }}>{chord.fullName}</p>
                <span style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 999, background: C.cream2, border: `1.5px solid ${C.line}`, color: C.mut }}>
                  {chord.difficulty}
                </span>
              </div>
            </div>

            {/* Fretboard */}
            <div style={{ background: "rgba(255,255,255,.7)", border: `1.5px solid ${C.line}`, borderRadius: 20, padding: "28px 32px", marginBottom: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
              <FretboardDiagram fingering={chord.fingering} fingers={chord.fingers} scale={1.6} />
              <div style={{ display: "flex", gap: 24, fontFamily: "var(--font-instrument), sans-serif", fontSize: 13, color: C.mut }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid rgba(36,31,27,.35)`, display: "inline-block" }} />
                  Open string
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", background: C.blue, display: "inline-block" }} />
                  Fretted note
                </span>
              </div>
            </div>

            {/* How to play */}
            <div style={{ background: "rgba(255,255,255,.7)", border: `1.5px solid ${C.line}`, borderRadius: 20, padding: "22px 26px", marginBottom: 16 }}>
              <p style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.mut, marginBottom: 16 }}>
                How to play
              </p>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                {tipPoints.map((point, i) => (
                  <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ marginTop: 7, width: 8, height: 8, borderRadius: "50%", background: C.orange, flexShrink: 0 }} />
                    <p style={{ fontFamily: "var(--font-instrument), sans-serif", color: C.ink, fontSize: 16, lineHeight: 1.6, margin: 0 }}>{point}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Strumming pattern */}
            <div style={{ background: C.ink, borderRadius: 24, padding: "22px 26px", marginBottom: 16 }}>
              <p style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,.38)", marginBottom: 18 }}>
                Strumming pattern
              </p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap", marginBottom: 12 }}>
                {beats.map((beat, i) => {
                  const isDown = beat === "D"
                  const isMute = beat === "X"
                  return (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, color: isDown ? C.orange : isMute ? "rgba(255,255,255,.3)" : "#fff" }}>
                        {isDown ? "↓" : isMute ? "✕" : "↑"}
                      </span>
                      <span style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: isDown ? C.orange : isMute ? "rgba(255,255,255,.3)" : "rgba(255,255,255,.7)" }}>
                        {beat}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p style={{ fontFamily: "var(--font-instrument), sans-serif", color: "rgba(255,255,255,.25)", fontSize: 11, margin: 0 }}>↓ down · ↑ up · ✕ mute</p>
            </div>

            {/* Songs using this chord */}
            {relatedSongs.length > 0 && (
              <div style={{ background: "rgba(255,255,255,.7)", border: `1.5px solid ${C.line}`, borderRadius: 20, padding: "22px 26px" }}>
                <p style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.mut, marginBottom: 14 }}>
                  Songs using {chord.name}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {relatedSongs.map((s, i) => {
                    const palette = discColor((chordIndex + i + 1) % 10)
                    return (
                      <Link
                        key={s.id}
                        href="/songs"
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderRadius: 12, background: palette.bg, color: palette.fg, border: `1.5px solid ${C.ink}`, textDecoration: "none" }}
                      >
                        <div>
                          <p style={{ fontFamily: "var(--font-recolta), serif", fontSize: 18, margin: "0 0 2px" }}>{s.title}</p>
                          <p style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 12, opacity: 0.75, margin: 0 }}>{s.artist}</p>
                        </div>
                        <span style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 13, fontWeight: 600, opacity: 0.85 }}>Practice →</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
