import Link from "next/link"
import YeleLogo from "@/app/components/YeleLogo"
import { songs } from "@/app/lib/data"

function SongCard({ song }: { song: typeof songs[number] }) {
  return (
    <Link href={`/songs/${song.id}`} className="group block">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EDE6DA] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-xl md:text-2xl text-[#1A1A2E] leading-snug group-hover:text-[#1E50CB] transition-colors">
              {song.title}
            </h2>
            <p className="font-sans text-sm text-[#9C8B72] mt-0.5">{song.artist}</p>
          </div>
          <span className={`shrink-0 font-sans text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
            song.difficulty === "easy"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-violet-50 text-violet-600"
          }`}>
            {song.difficulty}
          </span>
        </div>

        <p className="font-sans text-[#6B5B4E] text-sm leading-relaxed mb-4">{song.description}</p>

        <div className="flex items-center justify-between">
          {/* Chord pills */}
          <div className="flex flex-wrap gap-1.5">
            {song.chords.map((c) => (
              <span
                key={c}
                className="font-sans text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EEF2F8] text-[#1E50CB] border border-[#C5D0E8]"
              >
                {c}
              </span>
            ))}
          </div>
          <span className="font-sans text-xs text-[#1E50CB] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
            Practice →
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function SongsPage() {
  return (
    <div className="min-h-screen bg-[#EEF2F8]">
      <header className="px-8 md:px-12 pt-6 pb-4 shrink-0">
        <div className="flex justify-center mb-4">
          <Link href="/"><YeleLogo /></Link>
        </div>
        <div className="flex items-center">
          <Link
            href="/"
            className="font-sans text-base font-semibold px-5 py-2.5 rounded-full border-2 border-[#1A1A2E]/25 text-[#1A1A2E] hover:bg-[#1A1A2E] hover:text-white hover:border-[#1A1A2E] flex items-center gap-2 transition-all"
          >
            ← Back
          </Link>
        </div>
      </header>

      <main className="px-6 md:px-10 pb-16 max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl text-[#1A1A2E] mb-2">Songs</h1>
          <p className="font-sans text-[#6B5B4E] text-base md:text-lg">
            Real songs you'll want to play. Tap one to practise with a strumming guide.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      </main>
    </div>
  )
}
