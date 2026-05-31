"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { C } from "@/app/lib/theme"

const ChordCamera = dynamic(() => import("@/app/components/ChordCamera"), { ssr: false })

interface Props {
  chords: string[]
  songTitle: string
}

// Each chord lasts 4 beats. At 80 BPM → 3 s per chord.
const BEATS_PER_CHORD = 4

export default function SongPracticeCamera({ chords, songTitle }: Props) {
  const [isPlaying,  setIsPlaying]  = useState(false)
  const [index,      setIndex]      = useState(0)
  const [bpm,        setBpm]        = useState(80)
  const [progress,   setProgress]   = useState(0) // 0→1 within current chord
  const [isMatched,  setIsMatched]  = useState(false)

  const indexRef     = useRef(0)
  const startTimeRef = useRef<number>(0)
  const rafRef       = useRef<number | null>(null)
  const chordMs      = (BEATS_PER_CHORD / bpm) * 60_000

  const currentChord = chords[index]
  const nextChord    = chords[(index + 1) % chords.length]

  // Tick: update progress bar and advance chord when time is up
  const tick = useCallback(() => {
    const elapsed = performance.now() - startTimeRef.current
    const msPerChord = (BEATS_PER_CHORD / bpm) * 60_000
    const pct = Math.min(elapsed / msPerChord, 1)
    setProgress(pct)

    if (pct >= 1) {
      const next = (indexRef.current + 1) % chords.length
      indexRef.current = next
      setIndex(next)
      setIsMatched(false)
      startTimeRef.current = performance.now()
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [bpm, chords.length])

  // Start / stop playback
  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = performance.now()
      rafRef.current = requestAnimationFrame(tick)
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [isPlaying, tick])

  // Reset when song changes
  useEffect(() => {
    setIsPlaying(false)
    setIndex(0)
    indexRef.current = 0
    setProgress(0)
    setIsMatched(false)
  }, [songTitle])

  // BPM change restarts the current chord timer
  useEffect(() => {
    if (isPlaying) startTimeRef.current = performance.now()
  }, [bpm, isPlaying])

  const handleMatchChange = useCallback((matched: boolean) => {
    if (matched) setIsMatched(true)
  }, [])

  const handlePlay = () => {
    indexRef.current = 0
    setIndex(0)
    setProgress(0)
    setIsMatched(false)
    startTimeRef.current = performance.now()
    setIsPlaying(true)
  }

  const handleStop = () => {
    setIsPlaying(false)
    setIndex(0)
    indexRef.current = 0
    setProgress(0)
    setIsMatched(false)
  }

  const changeBpm = (delta: number) => {
    setBpm(prev => Math.min(160, Math.max(40, prev + delta)))
  }

  // Progress bar colour shifts green as chord is confirmed
  const barColor = isMatched ? "#34d399" : C.orange

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, borderRadius: 24, overflow: "hidden", border: `1.5px solid ${C.line}` }}>

      {/* ── Chord header ─────────────────────────────────────────── */}
      <div style={{ background: C.ink, padding: "16px 20px 0" }}>

        {/* Now / Next */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <p style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,.35)", margin: "0 0 4px" }}>
              Now playing
            </p>
            <span style={{
              fontFamily: "var(--font-recolta), serif",
              fontSize: 56,
              lineHeight: 1,
              color: isMatched ? "#34d399" : C.lime,
              transition: "color .25s",
            }}>
              {currentChord}
            </span>
          </div>

          {isPlaying && (
            <div style={{ textAlign: "right", paddingBottom: 6 }}>
              <p style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,.3)", margin: "0 0 4px" }}>
                Up next
              </p>
              <span style={{ fontFamily: "var(--font-recolta), serif", fontSize: 28, color: "rgba(255,255,255,.35)" }}>
                {nextChord}
              </span>
            </div>
          )}
        </div>

        {/* Chord sequence dots */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {chords.map((ch, i) => {
            const isCurrent = i === index
            const isPast    = isPlaying && i < index
            return (
              <span key={i} style={{
                fontFamily: "var(--font-recolta), serif",
                fontSize: 13,
                padding: "3px 10px",
                borderRadius: 999,
                border: `1.5px solid ${isCurrent ? C.lime : "rgba(255,255,255,.12)"}`,
                background: isCurrent ? C.lime : "transparent",
                color: isCurrent ? C.ink : isPast ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.45)",
                transition: "all .2s",
              }}>
                {ch}
              </span>
            )
          })}
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: "rgba(255,255,255,.08)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${isPlaying ? progress * 100 : 0}%`,
            background: barColor,
            borderRadius: 2,
            transition: "background .3s",
          }} />
        </div>
      </div>

      {/* ── Camera ───────────────────────────────────────────────── */}
      <div style={{ position: "relative" }}>
        <ChordCamera
          expectedChordId={currentChord}
          onMatchChange={handleMatchChange}
        />

        {/* Ghost chord watermark */}
        <div style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: "var(--font-recolta), serif",
            fontSize: 104,
            lineHeight: 1,
            color: isMatched ? "rgba(52,211,153,.3)" : "rgba(255,255,255,.08)",
            textShadow: isMatched ? "0 0 60px rgba(52,211,153,.35)" : "none",
            transition: "color .3s, text-shadow .3s",
            userSelect: "none",
          }}>
            {currentChord}
          </div>
        </div>
      </div>

      {/* ── Controls ─────────────────────────────────────────────── */}
      <div style={{
        background: C.ink,
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>

        {/* Play / Stop */}
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            style={{
              fontFamily: "var(--font-instrument), sans-serif",
              fontSize: 14,
              fontWeight: 700,
              padding: "10px 28px",
              borderRadius: 999,
              background: C.lime,
              color: C.ink,
              border: "none",
              cursor: "pointer",
            }}
          >
            ▶ Play song
          </button>
        ) : (
          <button
            onClick={handleStop}
            style={{
              fontFamily: "var(--font-instrument), sans-serif",
              fontSize: 14,
              fontWeight: 700,
              padding: "10px 28px",
              borderRadius: 999,
              background: "rgba(255,255,255,.1)",
              color: C.cream,
              border: `1.5px solid rgba(255,255,255,.2)`,
              cursor: "pointer",
            }}
          >
            ■ Stop
          </button>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* BPM control */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,.35)" }}>
            BPM
          </span>
          <button onClick={() => changeBpm(-5)} style={bpmBtnStyle}>−</button>
          <span style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 16, fontWeight: 700, color: C.cream, minWidth: 32, textAlign: "center" }}>
            {bpm}
          </span>
          <button onClick={() => changeBpm(5)} style={bpmBtnStyle}>+</button>
        </div>

      </div>
    </div>
  )
}

const bpmBtnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  border: "1.5px solid rgba(255,255,255,.2)",
  background: "transparent",
  color: "rgba(255,255,255,.6)",
  fontSize: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  lineHeight: 1,
}
