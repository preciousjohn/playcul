"use client"

import { useState } from "react"
import Link from "next/link"
import { chords } from "@/app/lib/data"
import { C, CHORD_LEVELS, type ChordLevel } from "@/app/lib/theme"
import PageHeader from "@/app/components/PageHeader"

function StringDots({ fingering }: { fingering: [number, number, number, number] }) {
  const labels = ["G", "C", "E", "A"]
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
      {fingering.map((fret, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700,
            ...(fret === 0
              ? { border: `2px solid ${C.line}`, color: "transparent" }
              : { background: C.ink, color: C.cream }),
          }}>
            {fret > 0 ? fret : ""}
          </div>
          <span style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 9, color: C.mut }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

function ChordCard({ chord }: { chord: typeof chords[number] }) {
  return (
    <Link href={`/chords/${chord.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: "rgba(255,255,255,.55)",
        color: C.ink,
        border: `1.5px solid ${C.ink}`,
        borderRadius: 16,
        padding: "22px 24px",
        height: "100%",
        transition: "transform .15s ease, box-shadow .15s ease, background .15s",
        boxShadow: "0 2px 0 rgba(36,31,27,.12)",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.transform = "translateY(-2px)"
        el.style.boxShadow = "0 4px 0 rgba(36,31,27,.18)"
        el.style.background = "rgba(255,255,255,.85)"
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.transform = ""
        el.style.boxShadow = "0 2px 0 rgba(36,31,27,.12)"
        el.style.background = "rgba(255,255,255,.55)"
      }}
      >
        <p style={{ fontFamily: "var(--font-recolta), serif", fontSize: 48, lineHeight: 1, margin: "0 0 4px" }}>
          {chord.name}
        </p>
        <p style={{
          fontFamily: "var(--font-instrument), sans-serif",
          fontSize: 11, fontWeight: 600,
          letterSpacing: "0.1em", textTransform: "uppercase",
          color: C.mut, marginBottom: 18,
        }}>
          {chord.fullName}
        </p>
        <StringDots fingering={chord.fingering} />
      </div>
    </Link>
  )
}

export default function ChordsPage() {
  const [level, setLevel] = useState<ChordLevel>("beginner")
  const activeLevel = CHORD_LEVELS.find(l => l.key === level)!
  const filtered = chords.filter(c => c.difficulty === level)

  return (
    <div style={{ background: C.cream, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <PageHeader title="Chords" backHref="/" backLabel="← Home" />

      <main style={{ padding: "28px 36px 48px", flex: 1, maxWidth: 900, margin: "0 auto", width: "100%" }}>

        {/* Intro + practice CTA */}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 480 }}>
            <h1 style={{ fontFamily: "var(--font-recolta), serif", fontSize: 38, color: C.ink, margin: "0 0 8px", lineHeight: 1.1 }}>
              Chord Library
            </h1>
            <p style={{ fontFamily: "var(--font-instrument), sans-serif", color: C.mut, fontSize: 16, margin: 0, lineHeight: 1.55 }}>
              Browse every chord by level, then tap one to see the fingering and strumming pattern.
            </p>
          </div>
          <Link
            href="/chords/practice"
            style={{
              fontFamily: "var(--font-instrument), sans-serif",
              fontSize: 14, fontWeight: 700,
              padding: "11px 24px", borderRadius: 999,
              background: C.ink, color: C.cream,
              textDecoration: "none", flexShrink: 0,
            }}
          >
            Practice Mode →
          </Link>
        </div>

        {/* Level selectors */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 28 }}>
          {CHORD_LEVELS.map((l) => {
            const isActive = l.key === level
            const count = chords.filter(c => c.difficulty === l.key).length
            return (
              <button
                key={l.key}
                onClick={() => setLevel(l.key)}
                style={{
                  background: isActive ? l.bg : "rgba(255,255,255,.45)",
                  color: isActive ? l.fg : C.ink,
                  border: `1.5px solid ${C.ink}`,
                  borderRadius: 14,
                  padding: "16px 18px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "transform .15s, box-shadow .15s",
                  boxShadow: isActive ? `0 4px 0 ${C.ink}` : "0 2px 0 rgba(36,31,27,.15)",
                  transform: isActive ? "translateY(-1px)" : "none",
                }}
              >
                <div style={{ fontFamily: "var(--font-recolta), serif", fontSize: 20, marginBottom: 4 }}>
                  {l.label}
                </div>
                <div style={{
                  fontFamily: "var(--font-instrument), sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  opacity: isActive ? 0.85 : 0.55,
                  marginBottom: 6,
                }}>
                  {count} chords
                </div>
                <div style={{
                  fontFamily: "var(--font-instrument), sans-serif",
                  fontSize: 12,
                  lineHeight: 1.4,
                  opacity: isActive ? 0.8 : 0.5,
                }}>
                  {l.description}
                </div>
              </button>
            )
          })}
        </div>

        {/* Active level label */}
        <p style={{
          fontFamily: "var(--font-instrument), sans-serif",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: C.mut,
          margin: "0 0 14px",
        }}>
          {activeLevel.label} · {filtered.length} chords
        </p>

        {/* Chord grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(168px, 1fr))",
          gap: 12,
        }}>
          {filtered.map(chord => (
            <ChordCard key={chord.id} chord={chord} />
          ))}
        </div>
      </main>
    </div>
  )
}
