"use client"

import { useState, useRef } from "react"
import dynamic from "next/dynamic"
import FretboardDiagram from "@/app/components/FretboardDiagram"
import { chords as allChords } from "@/app/lib/data"

// ssr:false prevents TF.js + MediaPipe from running on the server during Vercel builds
const ChordCamera = dynamic(() => import("@/app/components/ChordCamera"), { ssr: false })
import { C } from "@/app/lib/theme"
import PageHeader from "@/app/components/PageHeader"

const CORE_IDS = ["C", "Am", "F", "G", "D", "Em"]
const chords = allChords.filter((c) => CORE_IDS.includes(c.id))
  .sort((a, b) => CORE_IDS.indexOf(a.id) - CORE_IDS.indexOf(b.id))

const CORE_ACTIVE = { bg: C.ink, fg: C.cream, border: C.ink }

type Result = "success" | null

function splitTip(tip: string): string[] {
  return tip.split(/\.\s+/).map(s => s.replace(/\.$/, "").trim()).filter(Boolean)
}

export default function ChordPracticePage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<Record<string, Result>>({})
  const chordMatchedRef = useRef(false)

  const chord = chords[currentIndex]
  const isLast = currentIndex === chords.length - 1
  const successCount = Object.values(results).filter((r) => r === "success").length
  const tipPoints = splitTip(chord.tip)

  const handleMatchChange = (isMatch: boolean) => {
    chordMatchedRef.current = isMatch
  }

  const handleGotIt = () => {
    const outcome: Result = chordMatchedRef.current ? "success" : null
    setResults((prev) => ({ ...prev, [chord.id]: outcome }))
    chordMatchedRef.current = false
    if (!isLast) setCurrentIndex((i) => i + 1)
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      chordMatchedRef.current = false
      setCurrentIndex((i) => i - 1)
    }
  }

  const reset = () => {
    setResults({})
    chordMatchedRef.current = false
    setCurrentIndex(0)
  }

  return (
    <div style={{ background: C.cream, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <PageHeader title="Learn Chords" backHref="/chords" backLabel="← Chords" />

      <main style={{ flex: 1, padding: "20px 32px 32px", display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 24, minHeight: 0 }}>
        <ChordCamera expectedChordId={chord.id} onMatchChange={handleMatchChange} />

        <div style={{ background: "rgba(255,255,255,.75)", border: `1.5px solid ${C.line}`, borderRadius: 24, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Top bar — reset inside the card */}
          <div style={{
            padding: "16px 24px",
            borderBottom: `1.5px solid ${C.line}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}>
            <p style={{
              fontFamily: "var(--font-instrument), sans-serif",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: C.mut,
              margin: 0,
            }}>
              Core chord practice
            </p>
            <button
              onClick={reset}
              style={{
                fontFamily: "var(--font-instrument), sans-serif",
                fontSize: 12,
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: 999,
                border: `1.5px solid ${C.line}`,
                background: "transparent",
                color: C.mut,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M1.5 6.5A5 5 0 1 0 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <polyline points="1.5,1 1.5,3.5 4,3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Reset
            </button>
          </div>

          <div style={{ padding: "24px 28px 20px", borderBottom: `1.5px solid ${C.line}`, position: "relative" }}>
            <div style={{ position: "absolute", top: 22, right: 24, fontFamily: "var(--font-instrument), sans-serif", fontSize: 15, color: C.mut }}>
              <span style={{ fontWeight: 700, color: C.ink }}>{successCount}</span>
              <span> / {chords.length} completed</span>
            </div>
            <p style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 14, fontWeight: 600, color: C.mut, margin: "0 0 8px" }}>
              Chord {currentIndex + 1} of {chords.length}
            </p>
            <h2 style={{ fontFamily: "var(--font-recolta), serif", fontSize: 68, color: C.ink, lineHeight: 1, margin: "0 0 6px" }}>{chord.name}</h2>
            <p style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 15, color: C.mut, margin: 0 }}>{chord.fullName}</p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", padding: "24px 0", borderBottom: `1.5px solid ${C.line}` }}>
            <FretboardDiagram fingering={chord.fingering} fingers={chord.fingers} scale={1.45} />
          </div>

          <div style={{ padding: "20px 28px", flex: 1 }}>
            <p style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.mut, marginBottom: 14 }}>
              How to play
            </p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {tipPoints.map((point, i) => (
                <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ marginTop: 7, width: 8, height: 8, borderRadius: "50%", background: C.orange, flexShrink: 0 }} />
                  <p style={{ fontFamily: "var(--font-instrument), sans-serif", color: C.ink, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{point}</p>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ padding: "16px 28px", borderTop: `1.5px solid ${C.line}` }}>
            <p style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.mut, marginBottom: 12 }}>
              Core Chords
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
              {chords.map((c, i) => {
                const done = results[c.id] === "success"
                const isActive = i === currentIndex
                const highlighted = isActive || done
                return (
                  <button
                    key={c.id}
                    onClick={() => { chordMatchedRef.current = false; setCurrentIndex(i) }}
                    style={{
                      aspectRatio: "1",
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1.5px solid ${highlighted ? CORE_ACTIVE.border : C.line}`,
                      cursor: "pointer",
                      position: "relative",
                      background: highlighted ? CORE_ACTIVE.bg : C.cream2,
                      color: highlighted ? CORE_ACTIVE.fg : C.mut,
                      transform: isActive ? "scale(1.06)" : "none",
                      boxShadow: isActive ? "0 3px 12px rgba(0,0,0,.15)" : "none",
                      transition: "transform .15s, box-shadow .15s",
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-recolta), serif", fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{c.name}</span>
                    {done && (
                      <span style={{
                        position: "absolute",
                        top: -5,
                        right: -5,
                        width: 18,
                        height: 18,
                        background: C.lime,
                        border: `1.5px solid ${C.ink}`,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9,
                        color: C.ink,
                        fontWeight: 800,
                      }}>
                        ✓
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ padding: "14px 28px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              style={{
                fontFamily: "var(--font-instrument), sans-serif", fontSize: 14, fontWeight: 600,
                padding: "10px 22px", borderRadius: 999,
                border: `1.5px solid ${C.line}`, background: "transparent", color: C.ink,
                cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                opacity: currentIndex === 0 ? 0.35 : 1,
              }}
            >
              ← Previous
            </button>
            <span style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 14, color: C.mut, fontWeight: 500 }}>
              {currentIndex + 1} / {chords.length}
            </span>
            <button
              onClick={handleGotIt}
              style={{
                fontFamily: "var(--font-instrument), sans-serif", fontSize: 14, fontWeight: 700,
                padding: "10px 24px", borderRadius: 999,
                background: C.lime, color: C.ink, border: `1.5px solid ${C.ink}`,
                cursor: "pointer",
              }}
            >
              {isLast ? "Finish ✓" : "Got it ✓"}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
