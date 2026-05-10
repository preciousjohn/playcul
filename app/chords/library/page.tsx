"use client"

import { useState } from "react"
import Link from "next/link"
import YeleLogo from "@/app/components/YeleLogo"
import FretboardDiagram from "@/app/components/FretboardDiagram"
import { chords, songs } from "@/app/lib/data"

type Beat = "D" | "U" | "X"

function parseBeats(pattern: string): Beat[] {
  return pattern.split("").filter((c) => "DUX".includes(c)) as Beat[]
}

function splitTip(tip: string): string[] {
  return tip.split(/\.\s+/).map((s) => s.replace(/\.$/, "").trim()).filter(Boolean)
}

const GROUPS = [
  {
    key: "beginner",
    label: "Beginner",
    description: "Core open chords every player must know",
    textColor: "text-emerald-700",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200",
    activeBg: "bg-emerald-500",
    dot: "bg-emerald-400",
  },
  {
    key: "intermediate",
    label: "Intermediate",
    description: "Seventh chords and minor variations",
    textColor: "text-violet-700",
    badgeBg: "bg-violet-50",
    badgeText: "text-violet-700",
    badgeBorder: "border-violet-200",
    activeBg: "bg-violet-500",
    dot: "bg-violet-400",
  },
  {
    key: "advanced",
    label: "Advanced",
    description: "Barre chords and complex voicings",
    textColor: "text-orange-600",
    badgeBg: "bg-orange-50",
    badgeText: "text-orange-600",
    badgeBorder: "border-orange-200",
    activeBg: "bg-orange-500",
    dot: "bg-orange-400",
  },
]

export default function ChordLibraryPage() {
  const [selectedId, setSelectedId] = useState(chords[0].id)

  const chord = chords.find((c) => c.id === selectedId) ?? chords[0]
  const tipPoints = splitTip(chord.tip)
  const beats = parseBeats(chord.strumPattern)
  const relatedSongs = songs.filter((s) => s.chords.includes(chord.id))
  const group = GROUPS.find((g) => g.key === chord.difficulty)

  return (
    <div className="h-screen bg-[#EEF2F8] flex flex-col overflow-hidden">

      {/* Header */}
      <header className="px-8 md:px-10 pt-6 pb-4 shrink-0 border-b border-[#E4DDD4] bg-[#EEF2F8]">
        <div className="flex justify-center mb-4">
          <Link href="/"><YeleLogo /></Link>
        </div>
        <div className="flex items-center justify-between">
          <Link
            href="/chords/practice"
            className="font-sans text-base font-semibold px-5 py-2.5 rounded-full border-2 border-[#1A1A2E]/25 text-[#1A1A2E] hover:bg-[#1A1A2E] hover:text-white hover:border-[#1A1A2E] flex items-center gap-2 transition-all"
          >
            ← Back
          </Link>
          <p className="font-serif text-2xl text-[#1A1A2E]">Chord Library</p>
          <div className="w-32" />
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT PANEL — wide ── */}
        <aside className="w-[360px] shrink-0 bg-white border-r border-[#EDE6DA] flex flex-col overflow-hidden">

          {/* Panel header */}
          <div className="px-6 py-4 border-b border-[#F0EBE1]">
            <p className="font-sans text-xs uppercase tracking-widest text-[#9C8B72]">
              {chords.length} chords · 3 levels
            </p>
          </div>

          {/* Scrollable chord list */}
          <div className="flex-1 overflow-y-auto">
            {GROUPS.map((g) => {
              const groupChords = chords.filter((c) => c.difficulty === g.key)
              if (!groupChords.length) return null
              return (
                <div key={g.key}>

                  {/* Sticky section header */}
                  <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-[#F5F0EA]">
                    <div className="flex items-center gap-3 mb-0.5">
                      <span className={`font-sans text-sm font-bold uppercase tracking-widest ${g.textColor}`}>
                        {g.label}
                      </span>
                      <span className={`font-sans text-[11px] font-semibold px-2 py-0.5 rounded-full border ${g.badgeBg} ${g.badgeText} ${g.badgeBorder}`}>
                        {groupChords.length} chords
                      </span>
                    </div>
                    <p className="font-sans text-xs text-[#9C8B72]">{g.description}</p>
                  </div>

                  {/* Chord rows */}
                  {groupChords.map((c) => {
                    const isActive = c.id === selectedId
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedId(c.id)}
                        className={`w-full text-left px-6 py-4 flex items-center gap-4 border-b border-[#F5F0EA] transition-all duration-150 group ${
                          isActive ? "bg-[#1A1A2E]" : "hover:bg-[#F7F3EE]"
                        }`}
                      >
                        {/* Accent bar */}
                        <span className={`w-1 h-9 rounded-full shrink-0 transition-all ${
                          isActive ? g.activeBg : `bg-transparent group-hover:${g.dot} group-hover:opacity-40`
                        }`} />

                        {/* Chord name */}
                        <span className={`font-serif text-4xl leading-none font-bold w-16 shrink-0 transition-colors ${
                          isActive ? "text-white" : "text-[#1A1A2E]"
                        }`}>
                          {c.name}
                        </span>

                        {/* Full name */}
                        <span className={`font-sans text-sm leading-snug transition-colors ${
                          isActive ? "text-white/60" : "text-[#9C8B72]"
                        }`}>
                          {c.fullName}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </aside>

        {/* ── RIGHT PANEL ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-10 py-10">

            {/* Chord title */}
            <div className="mb-8 flex items-end gap-5">
              <h1 className="font-serif text-[100px] text-[#1A1A2E] leading-none">{chord.name}</h1>
              <div className="pb-4">
                <p className="font-sans text-xl text-[#9C8B72] mb-2">{chord.fullName}</p>
                {group && (
                  <span className={`font-sans text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${group.badgeBg} ${group.badgeText} ${group.badgeBorder}`}>
                    {group.label}
                  </span>
                )}
              </div>
            </div>

            {/* Fretboard */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#EDE6DA] mb-6 flex flex-col items-center gap-6">
              <FretboardDiagram fingering={chord.fingering} fingers={chord.fingers} scale={1.6} />
              <div className="flex gap-8 font-sans text-sm text-[#9C8B72]">
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-[#1A1A2E]/40 inline-block" />
                  Open string
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#1E50CB] inline-block" />
                  Fretted note
                </span>
              </div>
            </div>

            {/* How to play */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#EDE6DA] mb-6">
              <p className="font-sans text-sm font-bold uppercase tracking-widest text-[#9C8B72] mb-6">
                How to play
              </p>
              <ul className="flex flex-col gap-5">
                {tipPoints.map((point, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="mt-2 w-2.5 h-2.5 rounded-full bg-[#E9A825] shrink-0" />
                    <p className="font-sans text-[#3B2A1A] text-lg leading-relaxed">{point}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Strumming pattern */}
            <div className="bg-[#1A1A2E] rounded-3xl p-8 mb-6">
              <p className="font-sans text-sm font-bold uppercase tracking-widest text-white/40 mb-6">
                Strumming pattern
              </p>
              <div className="flex items-end gap-6 flex-wrap mb-5">
                {beats.map((beat, i) => {
                  const isDown = beat === "D"
                  const isMute = beat === "X"
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <span className={`text-4xl leading-none font-bold ${
                        isDown ? "text-[#E9A825]" : isMute ? "text-white/30" : "text-white"
                      }`}>
                        {isDown ? "↓" : isMute ? "✕" : "↑"}
                      </span>
                      <span className={`font-sans text-sm font-semibold tracking-wider ${
                        isDown ? "text-[#E9A825]" : isMute ? "text-white/30" : "text-white/70"
                      }`}>
                        {beat}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className="font-sans text-white/25 text-xs">↓ down &nbsp;·&nbsp; ↑ up &nbsp;·&nbsp; ✕ mute</p>
            </div>

            {/* Related songs */}
            {relatedSongs.length > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#EDE6DA]">
                <p className="font-sans text-sm font-bold uppercase tracking-widest text-[#9C8B72] mb-5">
                  Songs using {chord.name}
                </p>
                <div className="flex flex-col gap-3">
                  {relatedSongs.map((s) => (
                    <Link
                      key={s.id}
                      href={`/songs/${s.id}`}
                      className="flex items-center justify-between p-5 rounded-2xl border border-[#EDE6DA] hover:border-[#1E50CB] hover:bg-[#EEF2F8] transition-all group"
                    >
                      <div>
                        <p className="font-serif text-xl text-[#1A1A2E] group-hover:text-[#1E50CB] transition-colors mb-0.5">
                          {s.title}
                        </p>
                        <p className="font-sans text-sm text-[#9C8B72]">{s.artist}</p>
                      </div>
                      <span className="font-sans text-sm text-[#1E50CB] opacity-0 group-hover:opacity-100 transition-opacity">
                        Practice →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
