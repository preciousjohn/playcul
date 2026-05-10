"use client"

import type { ChordFingering } from "@/app/lib/data"

type FretboardDiagramProps = {
  fingering: [number, number, number, number] // [G, C, E, A], 0=open, -1=muted
  fingers: ChordFingering[]
  scale?: number
}

// Layout constants
const W = 200
const STRING_X = [30, 80, 130, 180]   // G, C, E, A (left → right)
const NUT_Y = 68
const FRET_SPACING = 52
const ABOVE_NUT_Y = 44
const MAX_FRETS = 4
const DOT_R = 15
const STRING_LABELS = ["G", "C", "E", "A"]
// Slight thickness variation — G string is thickest
const STRING_W = [2.2, 1.8, 1.4, 1.0]

const fretLineY = (fret: number) => NUT_Y + fret * FRET_SPACING
const dotY = (fret: number) => NUT_Y + (fret - 0.5) * FRET_SPACING

const totalH = NUT_Y + MAX_FRETS * FRET_SPACING + 18

export default function FretboardDiagram({ fingering, fingers, scale = 1 }: FretboardDiagramProps) {
  return (
    <svg
      width={W * scale}
      height={totalH * scale}
      viewBox={`0 0 ${W} ${totalH}`}
      aria-label="Ukulele chord diagram"
    >
      {/* Warm fretboard background */}
      <rect
        x={STRING_X[0] - 12}
        y={NUT_Y - 2}
        width={STRING_X[3] - STRING_X[0] + 24}
        height={MAX_FRETS * FRET_SPACING + 4}
        rx={4}
        fill="#F5ECD7"
      />

      {/* String labels */}
      {STRING_LABELS.map((label, i) => (
        <text
          key={label}
          x={STRING_X[i]}
          y={20}
          textAnchor="middle"
          fontSize="13"
          fontWeight="600"
          fill="#1A1A2E"
          fontFamily="Instrument Sans, sans-serif"
        >
          {label}
        </text>
      ))}

      {/* Open (○) or muted (✕) markers above the nut */}
      {fingering.map((fret, i) => {
        const cx = STRING_X[i]
        if (fret === 0) {
          return (
            <circle
              key={i}
              cx={cx}
              cy={ABOVE_NUT_Y}
              r={7}
              stroke="#1A1A2E"
              strokeWidth="1.8"
              fill="none"
            />
          )
        }
        if (fret === -1) {
          return (
            <g key={i}>
              <line x1={cx - 6} y1={ABOVE_NUT_Y - 6} x2={cx + 6} y2={ABOVE_NUT_Y + 6} stroke="#1A1A2E" strokeWidth="1.8" strokeLinecap="round" />
              <line x1={cx + 6} y1={ABOVE_NUT_Y - 6} x2={cx - 6} y2={ABOVE_NUT_Y + 6} stroke="#1A1A2E" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          )
        }
        return null
      })}

      {/* Nut — thick bar */}
      <rect
        x={STRING_X[0] - 10}
        y={NUT_Y - 5}
        width={STRING_X[3] - STRING_X[0] + 20}
        height={9}
        rx={3}
        fill="#1A1A2E"
      />

      {/* Fret lines */}
      {Array.from({ length: MAX_FRETS }, (_, i) => (
        <line
          key={i}
          x1={STRING_X[0]}
          y1={fretLineY(i + 1)}
          x2={STRING_X[3]}
          y2={fretLineY(i + 1)}
          stroke="#9C8B72"
          strokeWidth="1.4"
        />
      ))}

      {/* Strings (vertical lines) */}
      {STRING_X.map((x, i) => (
        <line
          key={i}
          x1={x}
          y1={NUT_Y}
          x2={x}
          y2={fretLineY(MAX_FRETS)}
          stroke="#6B4F35"
          strokeWidth={STRING_W[i]}
        />
      ))}

      {/* Fret number labels (left side) */}
      {Array.from({ length: MAX_FRETS }, (_, i) => (
        <text
          key={i}
          x={STRING_X[0] - 20}
          y={dotY(i + 1) + 4}
          textAnchor="middle"
          fontSize="11"
          fill="#8B7355"
          fontFamily="Instrument Sans, sans-serif"
        >
          {i + 1}
        </text>
      ))}

      {/* Finger dots */}
      {fingers.map((f, i) => {
        const x = STRING_X[f.string - 1]
        const y = dotY(f.fret)
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={DOT_R} fill="#1E50CB" />
            <text
              x={x}
              y={y + 5}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="white"
              fontFamily="Instrument Sans, sans-serif"
            >
              {f.finger}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
