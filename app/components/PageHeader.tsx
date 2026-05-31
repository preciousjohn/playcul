import Link from "next/link"
import Logo from "@/app/components/Logo"
import { C } from "@/app/lib/theme"

export default function PageHeader({
  title,
  backHref = "/",
  backLabel = "← Back",
}: {
  title: string
  backHref?: string
  backLabel?: string
}) {
  return (
    <header style={{
      flexShrink: 0,
      borderBottom: `1.5px solid ${C.line}`,
      padding: "14px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: C.cream,
    }}>
      <Link href="/" style={{ textDecoration: "none" }}>
        <Logo size={26} />
      </Link>
      <h1 style={{
        fontFamily: "var(--font-recolta), serif",
        fontSize: 18,
        color: C.ink,
        margin: 0,
        letterSpacing: "-0.01em",
      }}>
        {title}
      </h1>
      <Link
        href={backHref}
        style={{
          fontFamily: "var(--font-instrument), sans-serif",
          fontSize: 13,
          fontWeight: 600,
          padding: "7px 16px",
          borderRadius: 999,
          border: `1.5px solid ${C.line}`,
          color: C.mut,
          textDecoration: "none",
        }}
      >
        {backLabel}
      </Link>
    </header>
  )
}
