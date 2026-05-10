"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import YeleLogo from "@/app/components/YeleLogo"
import FretboardDiagram from "@/app/components/FretboardDiagram"
import ChordCamera from "@/app/components/ChordCamera"
import { chords as allChords } from "@/app/lib/data"

// Only the 6 core beginner chords for this practice session
const CORE_IDS = ["C", "Am", "F", "G", "D", "Em"]
const chords = allChords.filter((c) => CORE_IDS.includes(c.id))
  .sort((a, b) => CORE_IDS.indexOf(a.id) - CORE_IDS.indexOf(b.id))

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
    <div className="min-h-screen bg-[#EEF2F8] flex flex-col">

      {/* Header — logo on top row, controls below */}
      <header className="px-8 md:px-12 pt-6 pb-4 shrink-0">
        {/* Top row: logo centred */}
        <div className="flex justify-center mb-4">
          <Link href="/"><YeleLogo /></Link>
        </div>

        {/* Bottom row: Back (left) · Chord Library (centre-left) · Reset (right) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Back — styled button */}
            <Link
              href="/"
              className="font-sans text-base font-semibold px-5 py-2.5 rounded-full border-2 border-[#1A1A2E]/25 text-[#1A1A2E] hover:bg-[#1A1A2E] hover:text-white hover:border-[#1A1A2E] flex items-center gap-2 transition-all"
            >
              ← Back
            </Link>

            {/* Chord Library */}
            <Link
              href="/chords/library"
              className="font-sans text-base font-semibold px-5 py-2.5 rounded-full bg-[#1A1A2E] text-white hover:bg-[#2a2a4e] flex items-center gap-2 transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="2" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.4"/>
                <rect x="9" y="2" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.4"/>
              </svg>
              Chord Library
            </Link>
          </div>

          {/* Reset */}
          <button
            onClick={reset}
            className="font-sans text-base font-semibold px-5 py-2.5 rounded-full border-2 border-[#1A1A2E]/20 text-[#1A1A2E]/70 hover:border-[#1A1A2E] hover:text-[#1A1A2E] flex items-center gap-2 transition-all"
          >
            <svg width="15" height="15" viewBox="0 0 13 13" fill="none">
              <path d="M1.5 6.5A5 5 0 1 0 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <polyline points="1.5,1 1.5,3.5 4,3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Reset
          </button>
        </div>
      </header>

      {/* Two-column layout */}
      <main className="flex-1 px-8 md:px-12 pb-8 grid md:grid-cols-[1.2fr_1fr] gap-6 min-h-0">

        {/* LEFT — chord detection camera */}
        <ChordCamera expectedChordId={chord.id} onMatchChange={handleMatchChange} />

        {/* RIGHT — chord info card */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#EDE6DA] flex flex-col overflow-hidden">

          {/* Chord name + progress */}
          <div className="px-8 pt-8 pb-6 border-b border-[#F0EBE1] relative">
            <div className="absolute top-7 right-8 font-sans text-2xl text-[#9C8B72]">
              <span className="font-bold text-emerald-600">{successCount}</span>
              <span> / {chords.length} completed</span>
            </div>
            <p className="font-sans text-2xl font-semibold text-[#9C8B72] mb-3">
              Chord {currentIndex + 1} of {chords.length}
            </p>
            <h2 className="font-serif text-8xl text-[#1A1A2E] leading-none mb-2">{chord.name}</h2>
            <p className="font-sans text-xl text-[#9C8B72]">{chord.fullName}</p>
          </div>

          {/* Fretboard */}
          <div className="flex justify-center py-8 border-b border-[#F0EBE1]">
            <FretboardDiagram fingering={chord.fingering} fingers={chord.fingers} scale={1.45} />
          </div>

          {/* How to play */}
          <div className="px-8 py-7 flex-1">
            <p className="font-sans text-base font-bold uppercase tracking-widest text-[#9C8B72] mb-5">
              How to play
            </p>
            <ul className="flex flex-col gap-4">
              {tipPoints.map((point, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="mt-2 w-2.5 h-2.5 rounded-full bg-[#E9A825] shrink-0" />
                  <p className="font-sans text-[#3B2A1A] text-lg leading-relaxed">{point}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* 6 core chord tiles */}
          <div className="px-8 pt-5 pb-5 border-t border-[#F0EBE1]">
            <p className="font-sans text-sm uppercase tracking-widest text-[#9C8B72] mb-4">Core Chords</p>
            <div className="grid grid-cols-6 gap-3">
              {chords.map((c, i) => {
                const done = results[c.id] === "success"
                const isActive = i === currentIndex
                return (
                  <button
                    key={c.id}
                    onClick={() => { chordMatchedRef.current = false; setCurrentIndex(i) }}
                    className={`relative aspect-square rounded-2xl flex items-center justify-center border-2 transition-all duration-200 ${
                      isActive
                        ? "bg-[#1A1A2E] border-[#1A1A2E] shadow-lg scale-105"
                        : done
                        ? "bg-emerald-50 border-emerald-300 hover:border-emerald-400"
                        : "bg-[#EEF2F8] border-[#C5D0E8] hover:border-[#9BADD4]"
                    }`}
                  >
                    <span className={`font-serif text-2xl font-bold leading-none ${
                      isActive ? "text-white" : done ? "text-emerald-700" : "text-[#9C8B72]"
                    }`}>
                      {c.name}
                    </span>
                    {done && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 2" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="px-8 pb-8 pt-2 flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="font-sans text-base font-semibold px-7 py-3.5 rounded-full border-2 border-[#EDE6DA] text-[#1A1A2E] hover:bg-[#EEF2F8] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <span className="font-sans text-lg text-[#9C8B72] tabular-nums font-medium">
              {currentIndex + 1} / {chords.length}
            </span>
            <button
              onClick={handleGotIt}
              className="font-sans text-base font-semibold px-8 py-3.5 rounded-full bg-[#E9A825] text-[#1A1A2E] hover:bg-[#d99b20] transition-colors"
            >
              {isLast ? "Finish ✓" : "Got it ✓"}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
