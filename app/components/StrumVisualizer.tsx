"use client"

import { useState, useRef, useEffect } from "react"
import { C } from "@/app/lib/theme"

type Beat = "D" | "U" | "X"

function parseBeats(pattern: string): Beat[] {
  return pattern.split(/[\s]+/).filter((c) => "DUX".includes(c)) as Beat[]
}

export default function StrumVisualizer({ pattern }: { pattern: string }) {
  const beats = parseBeats(pattern)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpm] = useState(72)
  const beatRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    setIsPlaying(false)
    setActiveIndex(null)
    setBpm(72)
    beatRef.current = 0
  }, [pattern])

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const startTick = (bpmVal: number, startBeat: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    const ms = (60 / bpmVal) * 1000
    beatRef.current = startBeat
    intervalRef.current = setInterval(() => {
      beatRef.current = (beatRef.current + 1) % beats.length
      setActiveIndex(beatRef.current)
    }, ms)
  }

  const toggle = () => {
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null
      setIsPlaying(false)
      setActiveIndex(null)
      beatRef.current = 0
    } else {
      setIsPlaying(true)
      setActiveIndex(0)
      startTick(bpm, 0)
    }
  }

  const handleBpmChange = (val: number) => {
    setBpm(val)
    if (isPlaying) startTick(val, beatRef.current)
  }

  return (
    <div style={{ background: C.ink, borderRadius: 24, padding: "24px 26px" }}>
      <p style={{ color: "rgba(255,255,255,.38)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, marginBottom: 20 }}>
        Strumming pattern
      </p>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 18, marginBottom: 22, flexWrap: "wrap" }}>
        {beats.map((beat, i) => {
          const isActive = i === activeIndex
          const isDown = beat === "D"
          const isMute = beat === "X"
          const activeColor = isDown ? C.orange : isMute ? "#ff6b6b" : "#fff"
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: isActive ? C.orange : "transparent", transition: "background .1s" }} />
              <span style={{
                fontSize: 26, fontWeight: 700, lineHeight: 1,
                color: isActive ? activeColor : "rgba(255,255,255,.18)",
                transform: isActive ? "scale(1.3)" : "scale(1)",
                display: "block",
                transition: "all .1s",
              }}>
                {isDown ? "↓" : isMute ? "✕" : "↑"}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", color: isActive ? activeColor : "rgba(255,255,255,.18)", transition: "color .1s" }}>
                {beat}
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
        <button
          onClick={toggle}
          style={{
            padding: "9px 26px", borderRadius: 999,
            fontWeight: 700, fontSize: 13,
            background: isPlaying ? "rgba(255,255,255,.1)" : C.orange,
            color: "#fff", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 7,
            transition: "background .15s",
          }}
        >
          <span style={{ fontSize: 12 }}>{isPlaying ? "⏹" : "▶"}</span>
          {isPlaying ? "Stop" : "Play"}
        </button>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
          <span style={{ color: "rgba(255,255,255,.3)", fontSize: 11 }}>40 BPM</span>
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 12 }}>
            {bpm} <span style={{ color: "rgba(255,255,255,.35)", fontWeight: 400 }}>BPM</span>
          </span>
          <span style={{ color: "rgba(255,255,255,.3)", fontSize: 11 }}>120 BPM</span>
        </div>
        <input
          type="range" min="40" max="120" value={bpm}
          onChange={(e) => handleBpmChange(Number(e.target.value))}
          style={{
            width: "100%", height: 5, borderRadius: 999,
            appearance: "none", cursor: "pointer",
            background: `linear-gradient(to right, ${C.orange} ${((bpm - 40) / 80) * 100}%, rgba(255,255,255,0.12) 0%)`,
          }}
        />
      </div>
    </div>
  )
}
