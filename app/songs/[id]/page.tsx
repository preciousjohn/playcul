"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { notFound } from "next/navigation"
import YeleLogo from "@/app/components/YeleLogo"
import HandDetector from "@/app/components/HandDetector"
import { songs, chords } from "@/app/lib/data"

type Beat = "D" | "U" | "X"

function parseBeats(pattern: string): Beat[] {
  return pattern.split("").filter((c) => "DUX".includes(c)) as Beat[]
}

const DEFAULT_BPM = 72

function StrumVisualizer({ pattern }: { pattern: string }) {
  const beats = parseBeats(pattern)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpm] = useState(DEFAULT_BPM)
  const beatRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Reset everything when pattern changes (new song)
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    setIsPlaying(false)
    setActiveIndex(null)
    setBpm(DEFAULT_BPM)
    beatRef.current = 0
  }, [pattern])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const startTick = (bpmValue: number, startBeat: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    const ms = (60 / bpmValue) * 1000
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

  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm)
    if (isPlaying) startTick(newBpm, beatRef.current)
  }

  return (
    <div className="bg-[#1A1A2E] rounded-3xl p-6 md:p-8">
      <p className="font-sans text-white/40 text-xs uppercase tracking-widest mb-6">
        Strumming pattern
      </p>

      {/* Beat arrows */}
      <div className="flex items-end justify-center gap-5 mb-8 flex-wrap">
        {beats.map((beat, i) => {
          const isActive = i === activeIndex
          const isDown = beat === "D"
          const isMute = beat === "X"
          return (
            <div key={i} className="flex flex-col items-center gap-2">
              {/* Active indicator dot above arrow */}
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-100 ${isActive ? "bg-[#E9A825]" : "bg-transparent"}`} />
              {/* Arrow */}
              <span
                className={`text-3xl leading-none font-bold transition-all duration-100 ${
                  isActive
                    ? "scale-125 " + (isDown ? "text-[#E9A825]" : isMute ? "text-red-400" : "text-white")
                    : "scale-100 " + (isDown ? "text-white/20" : isMute ? "text-white/15" : "text-white/20")
                }`}
              >
                {isDown ? "↓" : isMute ? "✕" : "↑"}
              </span>
              {/* Letter label */}
              <span
                className={`font-sans text-xs font-bold tracking-wide transition-all duration-100 ${
                  isActive
                    ? isDown ? "text-[#E9A825]" : isMute ? "text-red-400" : "text-white"
                    : "text-white/20"
                }`}
              >
                {beat}
              </span>
            </div>
          )
        })}
      </div>

      {/* Play / Stop button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={toggle}
          className={`flex items-center gap-2 px-8 py-3 rounded-full font-sans text-sm font-semibold transition-all duration-150 ${
            isPlaying
              ? "bg-white/10 text-white hover:bg-white/15"
              : "bg-[#E9A825] text-[#1A1A2E] hover:bg-[#d99b20]"
          }`}
        >
          <span className="text-base">{isPlaying ? "⏹" : "▶"}</span>
          {isPlaying ? "Stop" : "Play"}
        </button>
      </div>

      {/* BPM Slider */}
      <div className="px-2">
        <div className="flex justify-between items-center mb-2">
          <span className="font-sans text-white/40 text-xs">40 BPM</span>
          <span className="font-sans text-white font-semibold text-sm tabular-nums">
            {bpm} <span className="text-white/40 font-normal">BPM</span>
          </span>
          <span className="font-sans text-white/40 text-xs">120 BPM</span>
        </div>
        <input
          type="range"
          min="40"
          max="120"
          value={bpm}
          onChange={(e) => handleBpmChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#E9A825]"
          style={{
            background: `linear-gradient(to right, #E9A825 ${((bpm - 40) / 80) * 100}%, rgba(255,255,255,0.15) 0%)`,
          }}
        />
      </div>
    </div>
  )
}

export default function SongPracticePage() {
  const params = useParams()
  const id = params.id as string
  const song = songs.find((s) => s.id === id)
  if (!song) notFound()

  return (
    <div className="min-h-screen bg-[#EEF2F8]">
      <header className="px-8 md:px-12 pt-6 pb-4 shrink-0">
        <div className="flex justify-center mb-4">
          <Link href="/"><YeleLogo /></Link>
        </div>
        <div className="flex items-center">
          <Link
            href="/songs"
            className="font-sans text-base font-semibold px-5 py-2.5 rounded-full border-2 border-[#1A1A2E]/25 text-[#1A1A2E] hover:bg-[#1A1A2E] hover:text-white hover:border-[#1A1A2E] flex items-center gap-2 transition-all"
          >
            ← Back
          </Link>
        </div>
      </header>

      <main className="px-6 md:px-10 pb-16 max-w-xl mx-auto">
        {/* Song title */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h1 className="font-serif text-3xl md:text-4xl text-[#1A1A2E] leading-tight">{song.title}</h1>
            <span className={`shrink-0 mt-1 font-sans text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              song.difficulty === "easy" ? "bg-emerald-50 text-emerald-600" : "bg-violet-50 text-violet-600"
            }`}>
              {song.difficulty}
            </span>
          </div>
          <p className="font-sans text-[#9C8B72] text-sm">{song.artist}</p>
        </div>

        {/* Chords needed */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#EDE6DA] mb-4">
          <p className="font-sans text-xs uppercase tracking-widest text-[#9C8B72] mb-3">Chords you'll need</p>
          <div className="flex flex-wrap gap-2">
            {song.chords.map((cId) => {
              const chord = chords.find((c) => c.id === cId)
              return (
                <Link
                  key={cId}
                  href={`/chords/${cId}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF2F8] rounded-full border border-[#C5D0E8] hover:bg-[#1E50CB] hover:text-white hover:border-[#1E50CB] transition-all duration-150 group"
                >
                  <span className="font-serif text-base text-[#1E50CB] group-hover:text-white leading-none">{cId}</span>
                  {chord && (
                    <span className="font-sans text-[10px] text-[#9C8B72] group-hover:text-white/70">{chord.fullName}</span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#EDE6DA] mb-4">
          <p className="font-sans text-xs uppercase tracking-widest text-[#9C8B72] mb-2">About</p>
          <p className="font-sans text-[#3B2A1A] text-base leading-relaxed">{song.description}</p>
        </div>

        {/* Hand detection */}
        <div className="mb-4">
          <HandDetector />
        </div>

        {/* Strumming visualizer */}
        <StrumVisualizer pattern={song.strumPattern} />
      </main>
    </div>
  )
}
