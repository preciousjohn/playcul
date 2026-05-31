"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import { C } from "@/app/lib/theme"

const ChordCamera = dynamic(() => import("@/app/components/ChordCamera"), { ssr: false })

interface Props {
  chords: string[]
  songTitle: string
}

export default function SongPracticeCamera({ chords, songTitle }: Props) {
  const [index,    setIndex]    = useState(0)
  const [matched,  setMatched]  = useState(false)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentChord = chords[index]
  const isLast       = index === chords.length - 1

  // Reset when song changes (chord list changes)
  useEffect(() => {
    setIndex(0)
    setMatched(false)
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
  }, [songTitle])

  const handleMatchChange = useCallback((isMatch: boolean) => {
    if (!isMatch) return
    setMatched(true)
    // Auto-advance after 1.2 s so user can see the confirmation + strum
    advanceTimer.current = setTimeout(() => {
      setIndex(prev => (prev + 1) % chords.length)
      setMatched(false)
    }, 1200)
  }, [chords.length])

  const handleNext = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    setIndex(prev => (prev + 1) % chords.length)
    setMatched(false)
  }

  const handlePrev = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    setIndex(prev => (prev - 1 + chords.length) % chords.length)
    setMatched(false)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Chord prompt bar */}
      <div style={{
        background: C.ink,
        borderRadius: 16,
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
        {/* Current chord — big */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{
            fontFamily: "var(--font-recolta), serif",
            fontSize: 48,
            lineHeight: 1,
            color: matched ? "#34d399" : C.lime,
            transition: "color .3s",
          }}>
            {currentChord}
          </span>
          <span style={{
            fontFamily: "var(--font-instrument), sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,.45)",
            fontWeight: 600,
          }}>
            {matched ? "✓ Nailed it!" : "play this chord"}
          </span>
        </div>

        {/* Chord sequence strip */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {chords.map((ch, i) => {
            const isCurrent = i === index
            const isDone    = i < index
            return (
              <button
                key={i}
                onClick={() => { if (advanceTimer.current) clearTimeout(advanceTimer.current); setIndex(i); setMatched(false) }}
                style={{
                  fontFamily: "var(--font-recolta), serif",
                  fontSize: 14,
                  padding: "4px 12px",
                  borderRadius: 999,
                  border: `1.5px solid ${isCurrent ? C.lime : isDone ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.12)"}`,
                  background: isCurrent ? C.lime : "transparent",
                  color: isCurrent ? C.ink : isDone ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.55)",
                  cursor: "pointer",
                  transition: "all .15s",
                  textDecoration: isDone ? "line-through" : "none",
                }}
              >
                {ch}
              </button>
            )
          })}
        </div>
      </div>

      {/* Camera with detection */}
      <div style={{ position: "relative" }}>
        <ChordCamera
          expectedChordId={currentChord}
          onMatchChange={handleMatchChange}
        />

        {/* Large chord overlay inside the camera frame */}
        <div style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}>
          <span style={{
            fontFamily: "var(--font-recolta), serif",
            fontSize: 96,
            lineHeight: 1,
            color: matched ? "#34d399" : "rgba(255,255,255,.15)",
            textShadow: matched ? "0 0 40px rgba(52,211,153,.4)" : "none",
            transition: "color .3s, text-shadow .3s",
            userSelect: "none",
          }}>
            {currentChord}
          </span>
          <span style={{
            fontFamily: "var(--font-instrument), sans-serif",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.25)",
          }}>
            form this shape
          </span>
        </div>
      </div>

      {/* Prev / Next controls */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handlePrev}
          style={{
            fontFamily: "var(--font-instrument), sans-serif",
            fontSize: 13,
            fontWeight: 700,
            padding: "10px 18px",
            borderRadius: 999,
            border: `1.5px solid ${C.line}`,
            background: "transparent",
            color: C.mut,
            cursor: "pointer",
          }}
        >
          ← Prev
        </button>
        <button
          onClick={handleNext}
          style={{
            flex: 1,
            fontFamily: "var(--font-instrument), sans-serif",
            fontSize: 14,
            fontWeight: 700,
            padding: "10px 18px",
            borderRadius: 999,
            border: `1.5px solid ${C.ink}`,
            background: matched ? "#34d399" : C.ink,
            color: matched ? C.ink : C.cream,
            cursor: "pointer",
            transition: "background .3s, color .3s",
          }}
        >
          {matched ? `Great! Move to ${chords[(index + 1) % chords.length]} →` : isLast ? "Loop back →" : `Skip to ${chords[index + 1]} →`}
        </button>
      </div>
    </div>
  )
}
