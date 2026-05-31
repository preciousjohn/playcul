"use client"

import { useState } from "react"
import Link from "next/link"
import { songs } from "@/app/lib/data"
import { C, discColor } from "@/app/lib/theme"
import PageHeader from "@/app/components/PageHeader"
import { DiscSelectorButton } from "@/app/components/DiscSelector"
import SongPracticeCamera from "@/app/components/SongPracticeCamera"
import StrumVisualizer from "@/app/components/StrumVisualizer"

export default function SongsPage() {
  const [selectedId, setSelectedId] = useState(songs[0].id)
  const selectedSong = songs.find(s => s.id === selectedId)!

  return (
    <div style={{ background: C.cream, height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <PageHeader title="Songs" />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Left — disc selector */}
        <div style={{
          width: "40%",
          flexShrink: 0,
          overflowY: "auto",
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}>
          <p style={{
            fontFamily: "var(--font-instrument), sans-serif",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: C.mut,
            margin: "0 0 4px",
          }}>
            {songs.length} songs · pick one to start
          </p>
          {songs.map((song, i) => (
            <DiscSelectorButton
              key={song.id}
              title={song.title}
              subtitle={song.chords.join(" • ")}
              palette={discColor(i)}
              isActive={song.id === selectedId}
              onClick={() => setSelectedId(song.id)}
            />
          ))}
        </div>

        {/* Right — overview + camera + strumming */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 32px 28px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}>

          {/* Song overview */}
          <div style={{
            background: "rgba(255,255,255,.72)",
            border: `1.5px solid ${C.line}`,
            borderRadius: 20,
            padding: "22px 26px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
              <div style={{ minWidth: 0 }}>
                <h2 style={{
                  fontFamily: "var(--font-recolta), serif",
                  fontSize: 28,
                  color: C.ink,
                  margin: "0 0 6px",
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                }}>
                  {selectedSong.title}
                </h2>
                <p style={{
                  fontFamily: "var(--font-instrument), sans-serif",
                  fontSize: 15,
                  color: C.mut,
                  margin: 0,
                }}>
                  {selectedSong.artist}
                </p>
              </div>
              <span style={{
                flexShrink: 0,
                fontFamily: "var(--font-instrument), sans-serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "4px 12px",
                borderRadius: 999,
                background: selectedSong.difficulty === "easy" ? "#dcf5dc" : "#ede0f5",
                color: selectedSong.difficulty === "easy" ? "#2a6b2a" : "#5a2a7a",
              }}>
                {selectedSong.difficulty}
              </span>
            </div>
            <p style={{
              fontFamily: "var(--font-instrument), sans-serif",
              fontSize: 15,
              lineHeight: 1.65,
              color: C.ink,
              margin: 0,
              opacity: 0.88,
            }}>
              {selectedSong.description}
            </p>

            <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1.5px solid ${C.line}` }}>
              <p style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.mut, marginBottom: 10 }}>
                Chords you'll need
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {selectedSong.chords.map(ch => (
                  <Link
                    key={ch}
                    href={`/chords/${ch}`}
                    style={{
                      fontFamily: "var(--font-recolta), serif",
                      fontSize: 15,
                      padding: "5px 14px",
                      borderRadius: 999,
                      border: `1.5px solid ${C.ink}`,
                      color: C.ink,
                      background: C.cream2,
                      textDecoration: "none",
                    }}
                  >
                    {ch}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <SongPracticeCamera
            key={selectedId}
            chords={selectedSong.chords}
            songTitle={selectedSong.title}
          />
          <StrumVisualizer key={selectedId} pattern={selectedSong.strumPattern} />
        </div>
      </div>
    </div>
  )
}
