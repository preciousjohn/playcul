"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { C } from "@/app/lib/theme"

interface Props {
  chords: string[]
  songTitle: string
}

const BEATS_PER_CHORD = 4

export default function SongPracticeCamera({ chords, songTitle }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [index,     setIndex]     = useState(0)
  const [bpm,       setBpm]       = useState(80)
  const [progress,  setProgress]  = useState(0)
  const [camReady,  setCamReady]  = useState(false)

  const videoRef     = useRef<HTMLVideoElement>(null)
  const streamRef    = useRef<MediaStream | null>(null)
  const indexRef     = useRef(0)
  const startTimeRef = useRef<number>(0)
  const rafRef       = useRef<number | null>(null)

  const currentChord = chords[index]
  const nextChord    = chords[(index + 1) % chords.length]

  // Start camera on mount — plain mirror, no detection
  useEffect(() => {
    let active = true
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then(stream => {
        if (!active) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().then(() => setCamReady(true)).catch(() => {})
        }
      })
      .catch(() => {})
    return () => {
      active = false
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  // rAF tick: advance chord on timer
  const tick = useCallback(() => {
    const elapsed    = performance.now() - startTimeRef.current
    const msPerChord = (BEATS_PER_CHORD / bpm) * 60_000
    const pct        = Math.min(elapsed / msPerChord, 1)
    setProgress(pct)

    if (pct >= 1) {
      const next = (indexRef.current + 1) % chords.length
      indexRef.current = next
      setIndex(next)
      startTimeRef.current = performance.now()
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [bpm, chords.length])

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
  }, [songTitle])

  // BPM change restarts current chord timer
  useEffect(() => {
    if (isPlaying) startTimeRef.current = performance.now()
  }, [bpm, isPlaying])

  const handlePlay = () => {
    indexRef.current = 0
    setIndex(0)
    setProgress(0)
    startTimeRef.current = performance.now()
    setIsPlaying(true)
  }

  const handleStop = () => {
    setIsPlaying(false)
    setIndex(0)
    indexRef.current = 0
    setProgress(0)
  }

  const changeBpm = (delta: number) => setBpm(prev => Math.min(160, Math.max(40, prev + delta)))

  return (
    <div style={{
      flex: 1,
      minHeight: 0,
      position: "relative",
      borderRadius: 20,
      overflow: "hidden",
      background: "#111",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* Plain camera mirror — no detection */}
      <video
        ref={videoRef}
        autoPlay playsInline muted
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scaleX(-1)",
          opacity: camReady ? 1 : 0,
          transition: "opacity .5s",
        }}
      />

      {/* Gradient so text is readable over the feed */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,.65) 0%, transparent 38%, transparent 55%, rgba(0,0,0,.72) 100%)",
        pointerEvents: "none",
      }} />

      {/* ── Top: progress bar + chord name ─────────────────────── */}
      <div style={{ position: "relative", zIndex: 2, padding: "20px 24px 0" }}>

        {/* Progress bar */}
        <div style={{ height: 3, background: "rgba(255,255,255,.15)", borderRadius: 2, overflow: "hidden", marginBottom: 14 }}>
          <div style={{
            height: "100%",
            width: `${isPlaying ? progress * 100 : 0}%`,
            background: C.lime,
            borderRadius: 2,
          }} />
        </div>

        {/* Current chord + Up next */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{
              fontFamily: "var(--font-instrument), sans-serif",
              fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "rgba(255,255,255,.5)", margin: "0 0 2px",
            }}>
              Play this chord
            </p>
            <span style={{
              fontFamily: "var(--font-recolta), serif",
              fontSize: 84,
              lineHeight: 1,
              color: C.lime,
              textShadow: "0 2px 24px rgba(0,0,0,.8)",
              display: "block",
            }}>
              {currentChord}
            </span>
          </div>

          {isPlaying && (
            <div style={{ textAlign: "right" }}>
              <p style={{
                fontFamily: "var(--font-instrument), sans-serif",
                fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
                textTransform: "uppercase", color: "rgba(255,255,255,.3)", margin: "0 0 2px",
              }}>
                Up next
              </p>
              <span style={{
                fontFamily: "var(--font-recolta), serif",
                fontSize: 36,
                color: "rgba(255,255,255,.35)",
              }}>
                {nextChord}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Middle spacer — user's hands fill this area */}
      <div style={{ flex: 1 }} />

      {/* ── Bottom: chord dots + controls ──────────────────────── */}
      <div style={{ position: "relative", zIndex: 2, padding: "0 24px 20px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Chord sequence */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {chords.map((ch, i) => {
            const isCurrent = i === index
            const isPast    = isPlaying && i < index
            return (
              <span key={i} style={{
                fontFamily: "var(--font-recolta), serif",
                fontSize: 13,
                padding: "3px 10px",
                borderRadius: 999,
                border: `1.5px solid ${isCurrent ? C.lime : "rgba(255,255,255,.22)"}`,
                background: isCurrent ? C.lime : "rgba(0,0,0,.3)",
                color: isCurrent ? C.ink : isPast ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.55)",
                transition: "all .2s",
                backdropFilter: "blur(6px)",
              }}>
                {ch}
              </span>
            )
          })}
        </div>

        {/* Play / Stop + BPM */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {!isPlaying ? (
            <button onClick={handlePlay} style={{
              fontFamily: "var(--font-instrument), sans-serif",
              fontSize: 14, fontWeight: 700,
              padding: "11px 30px", borderRadius: 999,
              background: C.lime, color: C.ink, border: "none", cursor: "pointer",
            }}>
              ▶ Play song
            </button>
          ) : (
            <button onClick={handleStop} style={{
              fontFamily: "var(--font-instrument), sans-serif",
              fontSize: 14, fontWeight: 700,
              padding: "11px 30px", borderRadius: 999,
              background: "rgba(255,255,255,.12)", color: "white",
              border: "1.5px solid rgba(255,255,255,.3)", cursor: "pointer",
            }}>
              ■ Stop
            </button>
          )}

          <div style={{ flex: 1 }} />

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,.4)" }}>
              BPM
            </span>
            <button onClick={() => changeBpm(-5)} style={bpmBtnStyle}>−</button>
            <span style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 16, fontWeight: 700, color: "white", minWidth: 32, textAlign: "center" }}>
              {bpm}
            </span>
            <button onClick={() => changeBpm(5)} style={bpmBtnStyle}>+</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const bpmBtnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: "50%",
  border: "1.5px solid rgba(255,255,255,.3)",
  background: "transparent", color: "rgba(255,255,255,.7)",
  fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", lineHeight: 1,
}
