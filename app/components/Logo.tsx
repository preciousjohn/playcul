import { C } from "@/app/lib/theme"

export default function Logo({ size = 28, color = C.ink }: { size?: number; color?: string }) {
  return (
    <span style={{ fontFamily: "var(--font-recolta), serif", fontSize: size, lineHeight: 1, display: "inline-flex", alignItems: "center", gap: 7, color }}>
      Yele
      <span style={{ width: size * 0.38, height: size * 0.38, borderRadius: "50%", background: C.orange, display: "inline-block", marginTop: 3, flexShrink: 0 }} />
    </span>
  )
}
