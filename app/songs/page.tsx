"use client"

import { useState } from "react"
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

        {/* Left — song selector */}
        <div style={{
          width: "36%",
          flexShrink: 0,
          overflowY: "auto",
          padding: "20px 20px 20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}>
          <p style={{
            fontFamily: "var(--font-instrument), sans-serif",
            fontSize: 10, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase",
            color: C.mut, margin: "0 0 4px",
          }}>
            {songs.length} songs · pick one to start
          </p>
          {songs.map((song, i) => (
            <DiscSelectorButton
              key={song.id}
              title={song.title}
              subtitle={song.chords.join(" · ")}
              palette={discColor(i)}
              isActive={song.id === selectedId}
              onClick={() => setSelectedId(song.id)}
            />
          ))}
        </div>

        {/* Right — camera practice + strum (camera fills the space) */}
        <div style={{
          flex: 1,
          overflow: "hidden",
          padding: "16px 24px 16px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}>

          {/* Compact song header */}
          <div style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 4px",
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{
                fontFamily: "var(--font-recolta), serif",
                fontSize: 22, color: C.ink, margin: 0,
                lineHeight: 1.2, overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {selectedSong.title}
              </h2>
              <p style={{
                fontFamily: "var(--font-instrument), sans-serif",
                fontSize: 13, color: C.mut, margin: "2px 0 0",
              }}>
                {selectedSong.artist}
              </p>
            </div>
            <span style={{
              flexShrink: 0,
              fontFamily: "var(--font-instrument), sans-serif",
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "4px 12px", borderRadius: 999,
              background: selectedSong.difficulty === "easy" ? "#dcf5dc" : "#ede0f5",
              color: selectedSong.difficulty === "easy" ? "#2a6b2a" : "#5a2a7a",
            }}>
              {selectedSong.difficulty}
            </span>
          </div>

          {/* Camera — fills remaining height */}
          <SongPracticeCamera
            key={selectedId}
            chords={selectedSong.chords}
            songTitle={selectedSong.title}
          />

          {/* Strum guide */}
          <StrumVisualizer key={selectedId + "-strum"} pattern={selectedSong.strumPattern} />
        </div>

      </div>
    </div>
  )
}
