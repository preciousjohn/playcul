"use client"

import { C, type DiscColor } from "@/app/lib/theme"

export function PlayIcon({ color = "#fff" }: { color?: string }) {
  return (
    <div style={{
      width: 40,
      height: 40,
      borderRadius: "50%",
      flexShrink: 0,
      border: `1.5px solid ${color}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingLeft: 2,
    }}>
      <span style={{ fontSize: 12, color, lineHeight: 1 }}>▶</span>
    </div>
  )
}

export function DiscSelectorButton({
  title,
  subtitle,
  palette,
  isActive,
  onClick,
}: {
  title: string
  subtitle: string
  palette: DiscColor
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: palette.bg,
        color: palette.fg,
        border: `1.5px solid ${C.ink}`,
        borderRadius: 12,
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        transition: "transform .15s ease, box-shadow .15s ease",
        boxShadow: isActive ? `0 4px 0 ${C.ink}, 0 6px 20px rgba(0,0,0,.15)` : "0 2px 0 rgba(36,31,27,.25)",
        transform: isActive ? "translateY(-1px)" : "none",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "var(--font-recolta), serif",
          fontSize: 22,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: "var(--font-instrument), sans-serif",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.1em",
          opacity: 0.85,
          marginTop: 5,
          textTransform: "uppercase",
        }}>
          {subtitle}
        </div>
      </div>
      <PlayIcon color={palette.fg} />
    </button>
  )
}
