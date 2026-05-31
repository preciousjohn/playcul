import { notFound } from "next/navigation"
import FretboardDiagram from "@/app/components/FretboardDiagram"
import { chords } from "@/app/lib/data"
import { C } from "@/app/lib/theme"
import PageHeader from "@/app/components/PageHeader"

type Beat = "D" | "U" | "X"

function parseBeats(pattern: string): Beat[] {
  return pattern.split(/[\s]+/).filter((c) => "DUX".includes(c)) as Beat[]
}

function StrumPattern({ pattern }: { pattern: string }) {
  const beats = parseBeats(pattern)
  return (
    <div style={{ background: C.ink, borderRadius: 24, padding: "22px 26px" }}>
      <p style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,.38)", marginBottom: 18 }}>
        Strumming pattern
      </p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 14 }}>
        {beats.map((beat, i) => {
          const isDown = beat === "D"
          const isMute = beat === "X"
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 24, fontWeight: 700, lineHeight: 1, color: isDown ? C.orange : isMute ? "rgba(255,255,255,.3)" : "#fff" }}>
                {isDown ? "↓" : isMute ? "✕" : "↑"}
              </span>
              <span style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", color: isDown ? C.orange : isMute ? "rgba(255,255,255,.3)" : "rgba(255,255,255,.7)" }}>
                {beat}
              </span>
            </div>
          )
        })}
      </div>
      <p style={{ fontFamily: "var(--font-instrument), sans-serif", color: "rgba(255,255,255,.25)", fontSize: 11, margin: 0 }}>↓ = down · ↑ = up</p>
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
    <div style={{ background: C.cream, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <PageHeader title={chord.name} backHref="/chords" backLabel="← Chords" />

      <main style={{ padding: "28px 32px 48px", maxWidth: 520, margin: "0 auto", width: "100%" }}>
        <div style={{ marginBottom: 24, display: "flex", alignItems: "baseline", gap: 12 }}>
          <h1 style={{ fontFamily: "var(--font-recolta), serif", fontSize: 64, color: C.ink, lineHeight: 1, margin: 0 }}>{chord.name}</h1>
          <span style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 16, color: C.mut }}>{chord.fullName}</span>
        </div>

        <div style={{ background: "rgba(255,255,255,.7)", border: `1.5px solid ${C.line}`, borderRadius: 20, padding: "28px 32px", marginBottom: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <FretboardDiagram fingering={chord.fingering} fingers={chord.fingers} />
          <div style={{ display: "flex", gap: 20, fontFamily: "var(--font-instrument), sans-serif", fontSize: 12, color: C.mut }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", border: `2px solid rgba(36,31,27,.35)`, display: "inline-block" }} />
              Open
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: C.blue, display: "inline-block" }} />
              Fretted
            </span>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,.7)", border: `1.5px solid ${C.line}`, borderRadius: 16, padding: "18px 22px", marginBottom: 16 }}>
          <p style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.mut, marginBottom: 8 }}>How to play it</p>
          <p style={{ fontFamily: "var(--font-instrument), sans-serif", color: C.ink, fontSize: 15, lineHeight: 1.65, margin: 0 }}>{chord.tip}</p>
        </div>

        <StrumPattern pattern={chord.strumPattern} />
      </main>
    </div>
  )
}
