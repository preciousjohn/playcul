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
  const [index,   setIndex]   = useState(0)
  const [matched, setMatched] = useState(false)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentChord = chords[index]

  // Reset when song changes
  useEffect(() => {
    setIndex(0)
    setMatched(false)
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
  }, [songTitle])

  const handleMatchChange = useCallback((isMatch: boolean) => {
    if (!isMatch) return
    setMatched(true)
    // Auto-advance after 1.4 s — enough time to strum and hear the chord
    advanceTimer.current = setTimeout(() => {
      setIndex(prev => (prev + 1) % chords.length)
      setMatched(false)
    }, 1400)
  }, [chords.length])

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
        {/* Current chord */}
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
            color: matched ? "#34d399" : "rgba(255,255,255,.45)",
            fontWeight: 600,
            transition: "color .3s",
          }}>
            {matched ? "✓ nailed it!" : "form this chord"}
          </span>
        </div>

        {/* Read-only chord sequence — shows progress, no clicking */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {chords.map((ch, i) => {
            const isCurrent = i === index
            const isDone    = i < index
            return (
              <span
                key={i}
                style={{
                  fontFamily: "var(--font-recolta), serif",
                  fontSize: 14,
                  padding: "4px 12px",
                  borderRadius: 999,
                  border: `1.5px solid ${isCurrent ? C.lime : isDone ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.1)"}`,
                  background: isCurrent ? C.lime : "transparent",
                  color: isCurrent ? C.ink : isDone ? "rgba(255,255,255,.3)" : "rgba(255,255,255,.45)",
                  textDecoration: isDone ? "line-through" : "none",
                  userSelect: "none",
                }}
              >
                {ch}
              </span>
            )
          })}
        </div>
      </div>

      {/* Camera with detection + chord watermark */}
      <div style={{ position: "relative" }}>
        <ChordCamera
          expectedChordId={currentChord}
          onMatchChange={handleMatchChange}
        />

        {/* Ghost chord name inside the frame so eyes stay on hands */}
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
            color: matched ? "#34d399" : "rgba(255,255,255,.12)",
            textShadow: matched ? "0 0 48px rgba(52,211,153,.45)" : "none",
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
            color: "rgba(255,255,255,.2)",
          }}>
            form this shape
          </span>
        </div>
      </div>

    </div>
  )
}
