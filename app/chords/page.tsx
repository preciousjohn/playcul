import Link from "next/link"
import YeleLogo from "@/app/components/YeleLogo"
import { chords } from "@/app/lib/data"

function StringDots({ fingering }: { fingering: [number, number, number, number] }) {
  const labels = ["G", "C", "E", "A"]
  return (
    <div className="flex gap-3 items-end">
      {fingering.map((fret, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${fret === 0
                ? "border-2 border-[#1A1A2E]/30 text-transparent"
                : "bg-[#1E50CB] text-white shadow-sm"
              }`}
          >
            {fret > 0 ? fret : ""}
          </div>
          <span className="font-sans text-[9px] text-[#9C8B72] tracking-wide">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

function ChordCard({ chord }: { chord: typeof chords[number] }) {
  return (
    <Link href={`/chords/${chord.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#EDE6DA] hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
        <div className="p-5">
          {/* Chord name */}
          <p className="font-serif text-[64px] leading-none text-[#1A1A2E] group-hover:text-[#1E50CB] transition-colors duration-200 mb-1">
            {chord.name}
          </p>
          <p className="font-sans text-xs text-[#9C8B72] mb-5 tracking-wide uppercase">
            {chord.fullName}
          </p>

          {/* String dot preview */}
          <StringDots fingering={chord.fingering} />

          <div className="flex justify-end mt-4 pt-4 border-t border-[#F0EBE1]">
            <span className="text-[#1E50CB] opacity-0 group-hover:opacity-100 transition-opacity text-sm">
              Learn →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function ChordsPage() {
  return (
    <div className="min-h-screen bg-[#EEF2F8]">
      <header className="px-6 md:px-10 pt-8 pb-6 flex items-center justify-between">
        <Link href="/"><YeleLogo /></Link>
        <Link href="/" className="font-sans text-sm text-[#1A1A2E]/50 hover:text-[#1A1A2E] transition-colors">
          ← Home
        </Link>
      </header>

      <main className="px-6 md:px-10 pb-16">
        <div className="mb-10 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl text-[#1A1A2E] mb-2">Chords</h1>
            <p className="font-sans text-[#6B5B4E] text-base md:text-lg">
              Six essential ukulele chords. Learn them and you can play hundreds of songs.
            </p>
          </div>
          <Link
            href="/chords/practice"
            className="font-sans text-sm font-semibold px-5 py-2.5 bg-[#1A1A2E] text-white rounded-full hover:bg-[#2a2a4e] transition-colors shrink-0"
          >
            Practice Mode →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl">
          {chords.map((chord) => (
            <ChordCard key={chord.id} chord={chord} />
          ))}
        </div>
      </main>
    </div>
  )
}
