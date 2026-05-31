"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { notFound } from "next/navigation"
import { songs, chords } from "@/app/lib/data"
import { C } from "@/app/lib/theme"
import PageHeader from "@/app/components/PageHeader"
import CameraStage from "@/app/components/CameraStage"
import StrumVisualizer from "@/app/components/StrumVisualizer"

export default function SongPracticePage() {
  const params = useParams()
  const id = params.id as string
  const song = songs.find((s) => s.id === id)
  if (!song) notFound()

  return (
    <div style={{ background: C.cream, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <PageHeader title={song.title} backHref="/songs" backLabel="← Songs" />

      <main style={{ padding: "24px 32px 48px", maxWidth: 640, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <p style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 14, color: C.mut, margin: 0 }}>{song.artist}</p>
          <span style={{
            marginLeft: "auto",
            fontFamily: "var(--font-instrument), sans-serif",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "3px 10px", borderRadius: 999,
            background: song.difficulty === "easy" ? "#dcf5dc" : "#ede0f5",
            color: song.difficulty === "easy" ? "#2a6b2a" : "#5a2a7a",
          }}>
            {song.difficulty}
          </span>
        </div>

        <CameraStage songTitle={song.title} />
        <StrumVisualizer pattern={song.strumPattern} />

        <div style={{ background: "rgba(255,255,255,.7)", border: `1.5px solid ${C.line}`, borderRadius: 16, padding: "16px 18px" }}>
          <p style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.mut, marginBottom: 10 }}>
            Chords you'll need
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {song.chords.map((cId) => {
              const chord = chords.find((c) => c.id === cId)
              return (
                <Link
                  key={cId}
                  href={`/chords/${cId}`}
                  style={{
                    fontFamily: "var(--font-recolta), serif",
                    fontSize: 15, padding: "5px 14px",
                    borderRadius: 999,
                    border: `1.5px solid ${C.line}`,
                    color: C.ink,
                    background: C.cream2,
                    textDecoration: "none",
                  }}
                >
                  {cId}{chord ? ` · ${chord.fullName}` : ""}
                </Link>
              )
            })}
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,.7)", border: `1.5px solid ${C.line}`, borderRadius: 16, padding: "16px 18px" }}>
          <p style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.mut, marginBottom: 8 }}>About</p>
          <p style={{ fontFamily: "var(--font-instrument), sans-serif", color: C.ink, fontSize: 15, lineHeight: 1.65, margin: 0 }}>{song.description}</p>
        </div>
      </main>
    </div>
  )
}
