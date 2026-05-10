import { notFound } from "next/navigation"
import Link from "next/link"
import YeleLogo from "@/app/components/YeleLogo"
import FretboardDiagram from "@/app/components/FretboardDiagram"
import { chords } from "@/app/lib/data"

type Beat = "D" | "U" | "X"

function parseBeats(pattern: string): Beat[] {
  return pattern.split("").filter((c) => "DUX".includes(c)) as Beat[]
}

function StrumPattern({ pattern }: { pattern: string }) {
  const beats = parseBeats(pattern)
  return (
    <div className="bg-[#1A1A2E] rounded-2xl p-6">
      <p className="font-sans text-white/40 text-xs uppercase tracking-widest mb-5">
        Strumming pattern
      </p>

      {/* Beat row */}
      <div className="flex items-end gap-4 mb-6">
        {beats.map((beat, i) => {
          const isDown = beat === "D"
          const isMute = beat === "X"
          return (
            <div key={i} className="flex flex-col items-center gap-2">
              {/* Arrow */}
              <span className={`text-2xl leading-none font-bold ${
                isDown ? "text-[#E9A825]" : isMute ? "text-white/30" : "text-white"
              }`}>
                {isDown ? "↓" : isMute ? "✕" : "↑"}
              </span>
              {/* Letter label */}
              <span className={`font-sans text-[11px] font-semibold tracking-wider ${
                isDown ? "text-[#E9A825]" : isMute ? "text-white/30" : "text-white/70"
              }`}>
                {beat}
              </span>
            </div>
          )
        })}
      </div>

      <p className="font-sans text-white/25 text-[11px]">
        ↓ = down &nbsp;·&nbsp; ↑ = up
      </p>
    </div>
  )
}

export default async function ChordDetailPage({
  params,
}: {
  params: Promise<{ chord: string }>
}) {
  const { chord: chordId } = await params
  const chord = chords.find((c) => c.id === chordId)
  if (!chord) notFound()

  return (
    <div className="min-h-screen bg-[#EEF2F8]">
      <header className="px-6 md:px-10 pt-8 pb-6 flex items-center justify-between">
        <Link href="/"><YeleLogo /></Link>
        <Link href="/chords" className="font-sans text-sm text-[#1A1A2E]/50 hover:text-[#1A1A2E] transition-colors">
          ← Chords
        </Link>
      </header>

      <main className="px-6 md:px-10 pb-16 max-w-xl mx-auto">
        {/* Title */}
        <div className="mb-8 flex items-baseline gap-3">
          <h1 className="font-serif text-7xl text-[#1A1A2E] leading-none">{chord.name}</h1>
          <span className="font-sans text-lg text-[#9C8B72]">{chord.fullName}</span>
        </div>

        {/* Fretboard */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#EDE6DA] mb-4 flex flex-col items-center gap-4">
          <FretboardDiagram fingering={chord.fingering} fingers={chord.fingers} />
          {/* Legend */}
          <div className="flex gap-5 font-sans text-xs text-[#9C8B72]">
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-[#1A1A2E]/40 inline-block" />
              Open
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#1E50CB] inline-block" />
              Fretted
            </span>
          </div>
        </div>

        {/* Tip */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#EDE6DA] mb-4">
          <p className="font-sans text-xs uppercase tracking-widest text-[#9C8B72] mb-2">How to play it</p>
          <p className="font-sans text-[#3B2A1A] text-base leading-relaxed">{chord.tip}</p>
        </div>

        {/* Strum pattern */}
        <div className="mb-8">
          <StrumPattern pattern={chord.strumPattern} />
        </div>

        {/* Songs link */}
        <div className="text-center">
          <Link href="/songs" className="font-sans text-sm text-[#1E50CB] underline underline-offset-2 hover:no-underline">
            See songs that use {chord.name} →
          </Link>
        </div>
      </main>
    </div>
  )
}
