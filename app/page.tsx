"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Link from "next/link"

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  cream:  "#f4ebd8",
  cream2: "#efe3cb",
  ink:    "#241f1b",
  blue:   "#1c3a8c",
  lime:   "#c8e85a",
  orange: "#ea6a2e",
  mut:    "#6f6451",
  line:   "#d9cbac",
}

// ─── Ukulele chord frequencies Hz, low→high strum (Karplus-Strong) ───────────
const CHORD_FREQS: Record<string, number[]> = {
  C:  [392.00, 261.63, 329.63, 523.25],
  Am: [392.00, 261.63, 329.63, 440.00],
  F:  [440.00, 261.63, 349.23, 523.25],
  G:  [392.00, 293.66, 392.00, 493.88],
  Em: [392.00, 329.63, 392.00, 493.88],
}

function makePluck(ctx: AudioContext, freq: number, dur: number): AudioBuffer {
  const sr = ctx.sampleRate
  const N  = Math.max(2, Math.round(sr / freq))
  const len = Math.floor(sr * dur)
  const buf = ctx.createBuffer(1, len, sr)
  const out = buf.getChannelData(0)
  const ring = new Float32Array(N)
  for (let i = 0; i < N; i++) ring[i] = Math.random() * 2 - 1
  let idx = 0; const damp = 0.9965
  for (let i = 0; i < len; i++) {
    const cur = ring[idx], nxt = ring[(idx + 1) % N]
    out[i] = cur
    ring[idx] = damp * 0.5 * (cur + nxt)
    idx = (idx + 1) % N
  }
  return buf
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ size = 30, color = C.ink }: { size?: number; color?: string }) {
  return (
    <span style={{ fontFamily: "var(--font-recolta), serif", fontSize: size, lineHeight: 1, display: "inline-flex", alignItems: "center", gap: 7, color }}>
      Yele
      <span style={{ width: size * 0.38, height: size * 0.38, borderRadius: "50%", background: C.orange, display: "inline-block", marginTop: 3, flexShrink: 0 }} />
    </span>
  )
}

// ─── Ticker ───────────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { text: "FOUR STRINGS, ZERO PRESSURE", accent: false },
  { text: "YOUR FIRST CHORD IN 3 MINUTES", accent: true },
  { text: "PLAY ALONG WITH REAL SONGS", accent: false },
  { text: "NO MUSIC THEORY REQUIRED", accent: true },
  { text: "GROOVE · SMILE · REPEAT", accent: false },
]

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div style={{ background: C.ink, color: C.cream, fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", overflow: "hidden", whiteSpace: "nowrap", borderBottom: `1px solid #000` }}>
      <div className="ticker-track">
        {items.map((item, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 18 }}>
            <span style={{ color: item.accent ? C.lime : undefined }}>{item.text}</span>
            <span style={{ color: C.orange, fontSize: 10 }}>✺</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Strum poster ─────────────────────────────────────────────────────────────
function StrumPoster() {
  const acRef     = useRef<AudioContext | null>(null)
  const bigRef    = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState("C")

  useEffect(() => () => { acRef.current?.close() }, [])

  function getAC() {
    if (!acRef.current) acRef.current = new AudioContext()
    return acRef.current
  }

  function strum(name: string) {
    const ctx = getAC()

    const schedule = () => {
      const freqs = CHORD_FREQS[name] || CHORD_FREQS["C"]
      const master = ctx.createGain(); master.gain.value = 0.5
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 4200
      master.connect(lp); lp.connect(ctx.destination)
      const now = ctx.currentTime
      freqs.forEach((f, i) => {
        const src = ctx.createBufferSource()
        src.buffer = makePluck(ctx, f, 1.8)
        const g = ctx.createGain()
        const t = now + i * 0.055
        g.gain.setValueAtTime(0, t)
        g.gain.linearRampToValueAtTime(0.9, t + 0.005)
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.7)
        src.connect(g); g.connect(master)
        src.start(t); src.stop(t + 1.8)
      })
    }

    // Schedule audio only after context is confirmed running
    if (ctx.state === "running") {
      schedule()
    } else {
      ctx.resume().then(schedule)
    }

    if (bigRef.current) {
      const el = bigRef.current
      el.style.transition = "transform .12s ease"
      el.style.transform = "scale(1.015) rotate(-.4deg)"
      setTimeout(() => { el.style.transform = "none" }, 150)
    }
  }

  const strumLabel = active === "C" ? "Hear it — strum a C" : `Hear it — strum ${active}`

  return (
    <section style={{ background: C.lime, borderTop: `2px solid ${C.ink}`, borderBottom: `2px solid ${C.ink}`, padding: "70px 0 64px", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 30, flexWrap: "wrap" }}>

          {/* Left — play button + description */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 700, fontSize: 14, letterSpacing: "0.12em", textTransform: "uppercase", color: C.ink }}>
              <button
                onClick={() => strum(active)}
                aria-label="Strum a chord"
                style={{ width: 46, height: 46, borderRadius: "50%", border: `2px solid ${C.ink}`, background: C.cream, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, transition: "transform .15s, background .15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.08)"; (e.currentTarget as HTMLElement).style.background = "#fff" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.background = C.cream }}
              >
                <svg width="14" height="16" viewBox="0 0 14 16" fill="none" style={{ marginLeft: 2 }}>
                  <path d="M1 1.5v13l12-6.5L1 1.5z" fill={C.ink} />
                </svg>
              </button>
              <span>{strumLabel}</span>
            </div>
            <p style={{ maxWidth: 340, fontSize: 15.5, lineHeight: 1.5, marginTop: 10, color: C.ink }}>
              Tap a chord and Yele plays it back, string by string, so your ear learns the shape before your fingers do.
            </p>
          </div>

          {/* Right — chord chips */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {Object.keys(CHORD_FREQS).map(name => (
              <button
                key={name}
                onClick={() => { setActive(name); strum(name) }}
                className={`chord-chip${active === name ? " chord-chip--active" : ""}`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Big STRUM word */}
        <div ref={bigRef} className="strum-word">STRUM</div>
      </div>
    </section>
  )
}

// ─── Camera stage ─────────────────────────────────────────────────────────────
function CameraStage({ activePlaylist }: { activePlaylist: string | null }) {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [denied, setDenied] = useState(false)

  const startCamera = useCallback(async () => {
    if (streamRef.current) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
      setIsLive(true)
    } catch { setDenied(true) }
  }, [])

  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()) }, [])
  useEffect(() => { if (activePlaylist && !isLive) startCamera() }, [activePlaylist, isLive, startCamera])

  return (
    <div style={{ position: "sticky", top: 88, border: `1.5px solid ${C.ink}`, borderRadius: 20, overflow: "hidden", background: "#161310", aspectRatio: "4/3" }}>

      {/* Demo video — idle background */}
      <video
        src="/demo.mp4"
        autoPlay muted loop playsInline
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: isLive ? 0 : 1, transition: "opacity .5s ease" }}
      />

      {/* Live camera */}
      <video
        ref={videoRef} playsInline muted autoPlay
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", opacity: isLive ? 1 : 0, transition: "opacity .5s ease" }}
      />

      {/* Idle overlay — gradient + CTA over demo video */}
      {!isLive && !denied && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: "0 38px 32px", background: "linear-gradient(to top, rgba(22,19,16,.88) 38%, transparent)", color: C.cream, gap: 12 }}>
          <button
            onClick={startCamera}
            style={{ display: "inline-flex", alignItems: "center", gap: 9, background: C.lime, color: C.ink, border: `1.5px solid ${C.ink}`, borderRadius: 999, padding: "12px 22px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
          >
            Let's Start
          </button>
          <p style={{ fontSize: 13, lineHeight: 1.4, color: "rgba(244,235,216,.7)", textAlign: "center", maxWidth: 280 }}>
            Pick a playlist and your camera turns on — watch your hands as you play along.
          </p>
        </div>
      )}

      {/* Guide frame when live */}
      {isLive && (
        <div style={{ position: "absolute", inset: "13% 11%", border: `1.5px dashed rgba(244,235,216,.38)`, borderRadius: 14, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 12, pointerEvents: "none" }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(244,235,216,.8)", background: "rgba(0,0,0,.34)", padding: "4px 11px", borderRadius: 999 }}>Frame your uke here</span>
        </div>
      )}

      {/* HUD when live */}
      {isLive && (
        <div style={{ position: "absolute", left: 14, right: 14, top: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-start", pointerEvents: "none" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(0,0,0,.45)", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", padding: "6px 11px", borderRadius: 999 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff4b3e", animation: "blink 1.2s infinite" }} />
            Live
          </span>
          {activePlaylist && (
            <span style={{ background: "rgba(0,0,0,.45)", color: C.cream, fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 999 }}>{activePlaylist}</span>
          )}
        </div>
      )}

      {/* Chord badge when live */}
      {isLive && activePlaylist && (
        <div style={{ position: "absolute", left: 14, bottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-recolta), serif", fontSize: 34, lineHeight: 1, width: 60, height: 60, borderRadius: 14, background: C.lime, color: C.ink, display: "grid", placeItems: "center", border: `1.5px solid ${C.ink}` }}>
            {activePlaylist[0]}
          </span>
          <span style={{ color: C.cream, fontSize: 12, fontWeight: 600, background: "rgba(0,0,0,.45)", padding: "7px 13px", borderRadius: 999 }}>{activePlaylist}</span>
        </div>
      )}

      {/* Denied */}
      {denied && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center", padding: 38, background: "#161310", color: C.cream }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#7c715f" }}>Camera blocked</span>
          <p style={{ maxWidth: 300, fontSize: 15, lineHeight: 1.5, color: "#b3a892" }}>Allow camera access to use Yele as your practice mirror — you can still browse chords either way.</p>
        </div>
      )}
    </div>
  )
}

// ─── Playlist data ─────────────────────────────────────────────────────────────
const PLAYLISTS = [
  { letter: "0", name: "For Beginners",  chords: ["C","Am","F","G"], count: 8,  bg: "#e7456a", fg: "#fff" },
  { letter: "1", name: "Campfire Classics",  chords: ["G","D","Em","C"], count: 6,  bg: "#2f7d5b", fg: "#fff" },
  { letter: "2", name: "Rainy Day Songs",    chords: ["Am","F","C","G"], count: 7,  bg: "#ea6a2e", fg: "#fff" },
]

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [activePlaylist, setActivePlaylist] = useState<string | null>(null)

  useEffect(() => {
    const els = document.querySelectorAll(".reveal")
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target) } })
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div style={{ background: C.cream, color: C.ink, minHeight: "100vh", overflowX: "hidden" }}>

      <Ticker />

      {/* Nav */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(244,235,216,.88)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
          <Link href="/"><Logo size={30} /></Link>
          <nav style={{ display: "flex", alignItems: "center", gap: 30, fontSize: 14, fontWeight: 500 }}>
            <Link href="/chords/practice" style={{ color: C.ink, textDecoration: "none" }}>Learn chords</Link>
            <Link href="/songs" style={{ color: C.ink, textDecoration: "none" }}>Songs</Link>
            <Link href="#how" style={{ color: C.ink, textDecoration: "none" }}>How it works</Link>
            <Link href="/songs"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.blue, color: "#fff", border: `1.5px solid ${C.blue}`, borderRadius: 999, padding: "9px 18px", fontWeight: 600, fontSize: 14, textDecoration: "none", transition: "transform .18s, box-shadow .18s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 0 -1px ${C.ink}` }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "" }}
            >
              Start playing →
            </Link>
          </nav>
        </div>
      </header>

      <main>

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section style={{ padding: "64px 0 30px" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.35fr .9fr", gap: 48, alignItems: "end" }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: C.mut, display: "block", marginBottom: 18 }}>
                  A friendly start on four strings
                </span>
                <h1 style={{ fontFamily: "var(--font-recolta), serif", fontWeight: 400, lineHeight: 0.92, letterSpacing: "-.01em", fontSize: "clamp(58px, 8.6vw, 128px)", margin: 0 }}>
                  Learn the<br />
                  <span style={{ color: C.orange, fontStyle: "italic" }}>ukulele</span> by<br />
                  <span style={{ color: C.blue }}>sundown.</span>
                </h1>
                <p style={{ maxWidth: 430, fontSize: 18, lineHeight: 1.5, color: "#3b342c", marginTop: 26 }}>
                  Whether it's your very first chord or your fiftieth singalong — Yele makes the start feel like summer.
                </p>
                <div style={{ display: "flex", gap: 14, marginTop: 30, flexWrap: "wrap" }}>
                  <Link href="/chords/practice"
                    style={{ display: "inline-flex", alignItems: "center", gap: 9, background: C.blue, color: "#fff", border: `1.5px solid ${C.blue}`, borderRadius: 999, padding: "12px 22px", fontWeight: 600, fontSize: 15, textDecoration: "none", transition: "transform .18s, box-shadow .18s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 0 -1px ${C.ink}` }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "" }}
                  >
                    Learn chords →
                  </Link>
                  <Link href="/songs"
                    style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "transparent", color: C.ink, border: `1.5px solid ${C.ink}`, borderRadius: 999, padding: "12px 22px", fontWeight: 600, fontSize: 15, textDecoration: "none", transition: "transform .18s, background .18s, color .18s" }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = C.ink; el.style.color = C.cream; el.style.transform = "translateY(-2px)" }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = ""; el.style.color = C.ink; el.style.transform = "" }}
                  >
                    Play a song
                  </Link>
                </div>
              </div>

              <aside style={{ paddingBottom: 8 }}>
                <nav style={{ borderTop: `1px solid ${C.ink}` }}>
                  {[
                    { label: "Chords", mark: "A", href: "/chords/practice" },
                    { label: "Songs",  mark: "B", href: "/songs" },
                    { label: "Rhythm", mark: "C", href: "#how" },
                  ].map(({ label, mark, href }) => (
                    <Link key={label} href={href}
                      style={{ display: "flex", alignItems: "baseline", gap: 14, padding: "15px 2px", borderBottom: `1px solid ${C.line}`, textDecoration: "none", color: C.ink, transition: "padding .2s, color .2s" }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.paddingLeft = "14px"; el.style.color = C.blue }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.paddingLeft = "2px"; el.style.color = C.ink }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: C.orange, width: 18 }}>{mark}</span>
                      <span style={{ fontFamily: "var(--font-recolta), serif", fontSize: 27, lineHeight: 1, flex: 1 }}>{label}</span>
                      <span style={{ fontSize: 15, opacity: 0.45 }}>→</span>
                    </Link>
                  ))}
                </nav>
              </aside>
            </div>
          </div>
        </section>

        {/* ── The Personal Setlist ───────────────────────────────── */}
        <section id="songs" style={{ padding: "92px 0 96px" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>

            <div className="reveal" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: C.mut, display: "block", marginBottom: 14 }}>
                Part I — The starter songbook
              </span>
              <h2 style={{ fontFamily: "var(--font-recolta), serif", fontWeight: 400, fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 0.96, margin: 0 }}>
                The Personal Setlist
              </h2>
              <p style={{ maxWidth: 520, margin: "18px 0 0", color: "#3b342c", fontSize: 16.5, lineHeight: 1.5 }}>
                Pick a playlist, turn on your camera, and play along. It's your practice mirror.
              </p>
            </div>

            <div className="reveal" style={{ display: "grid", gridTemplateColumns: "0.92fr 1.08fr", gap: 44, marginTop: 46, alignItems: "start" }}>

              {/* Left — playlist cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {PLAYLISTS.map((pl) => (
                  <div
                    key={pl.name}
                    style={{
                      display: "flex", alignItems: "stretch",
                      border: `1.5px solid ${C.ink}`,
                      borderRadius: 16, overflow: "hidden",
                      background: pl.bg, color: pl.fg,
                    }}
                  >
                    <div style={{ width: 72, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRight: `1.5px solid rgba(0,0,0,.15)`, background: "rgba(0,0,0,.08)" }}>
                      <span style={{ fontFamily: "var(--font-recolta), serif", fontSize: 42, lineHeight: 1, opacity: 0.9 }}>{pl.letter}</span>
                    </div>
                    <div style={{ flex: 1, padding: "18px 20px" }}>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontFamily: "var(--font-recolta), serif", fontSize: 22, lineHeight: 1 }}>{pl.name}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.65, marginLeft: 12, flexShrink: 0 }}>{pl.count} songs</span>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {pl.chords.map(c => (
                          <span key={c} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", border: `1px solid rgba(0,0,0,.2)`, borderRadius: 999, padding: "4px 10px", background: "rgba(255,255,255,.18)" }}>{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* 4th card — Start Playing CTA */}
                <Link
                  href="/songs"
                  style={{
                    display: "flex", alignItems: "stretch",
                    border: `1.5px solid ${C.ink}`,
                    borderRadius: 16, overflow: "hidden",
                    background: C.lime, color: C.ink,
                    textDecoration: "none",
                    transition: "box-shadow .18s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `-6px 6px 0 -1px ${C.ink}` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "" }}
                >
                  <div style={{ flex: 1, padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 5 }}>
                    <span style={{ fontFamily: "var(--font-recolta), serif", fontSize: 22, lineHeight: 1 }}>Start Playing</span>
                    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.6 }}>Browse all songs</span>
                  </div>
                  <div style={{ width: 72, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderLeft: `1.5px solid rgba(0,0,0,.15)`, background: "rgba(0,0,0,.08)" }}>
                    <span style={{ fontFamily: "var(--font-recolta), serif", fontSize: 42, lineHeight: 1, opacity: 0.9 }}>→</span>
                  </div>
                </Link>
              </div>

              {/* Right — camera / demo stage */}
              <CameraStage activePlaylist={activePlaylist} />
            </div>
          </div>
        </section>

        {/* ── Strum poster ──────────────────────────────────────── */}
        <StrumPoster />

        {/* ── How it works ──────────────────────────────────────── */}
        <section id="how" style={{ padding: "96px 0" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
            <div className="reveal" style={{ marginBottom: 48 }}>
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: C.mut, display: "block", marginBottom: 14 }}>
                How it works
              </span>
              <h2 style={{ fontFamily: "var(--font-recolta), serif", fontWeight: 400, fontSize: "clamp(38px, 5.4vw, 64px)", lineHeight: 0.96, margin: 0 }}>
                3 easy steps,<br />and you're playing.
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 26 }}>
              {[
                { mk: "A", title: "Prop up your uke",  body: "Turn on your camera and Yele frames you and your instrument, so you can check your hands while you learn", tags: ["Camera guide", "Posture"] },
                { mk: "B", title: "Shape a chord",     body: "Clear diagrams show exactly where each finger goes. Hear the chord, match the shape, and strum until you get it right",              tags: ["Diagrams", "Audio"] },
                { mk: "C", title: "Play a real song",  body: "When learning a new song, chords light up in time. Follow the progression, find your rhythm, and before you know it, you can play!",    tags: ["Progression", "Tempo"] },
              ].map(({ mk, title, body, tags }) => (
                <article
                  key={mk}
                  className="reveal"
                  style={{ border: `1.5px solid ${C.ink}`, borderRadius: 18, padding: "28px 26px 30px", background: C.cream2, transition: "transform .22s, box-shadow .22s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-5px)"; el.style.boxShadow = `0 12px 0 -2px ${C.ink}` }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = "" }}
                >
                  <div style={{ fontFamily: "var(--font-recolta), serif", fontSize: 54, lineHeight: 1, color: C.blue }}>{mk}</div>
                  <h3 style={{ fontFamily: "var(--font-recolta), serif", fontWeight: 400, fontSize: 30, margin: "8px 0 10px" }}>{title}</h3>
                  <p style={{ fontSize: 15.5, lineHeight: 1.55, color: "#3b342c" }}>{body}</p>
                  <div style={{ marginTop: 18, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {tags.map(t => (
                      <span key={t} style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", border: `1px solid ${C.line}`, borderRadius: 999, padding: "5px 11px", color: C.mut }}>{t}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Closing CTA ───────────────────────────────────────── */}
        <section style={{ padding: "30px 0 110px", textAlign: "center" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
            <p className="reveal" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.mut, marginBottom: 18 }}>
              Ready when you are
            </p>
            <h2 className="reveal" style={{ fontFamily: "var(--font-recolta), serif", fontWeight: 400, fontSize: "clamp(46px, 8vw, 118px)", lineHeight: 0.92, margin: "0 0 34px" }}>
              Go on,<br />pick it <em style={{ color: C.orange }}>up.</em>
            </h2>
            <div className="reveal" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/chords/practice"
                style={{ display: "inline-flex", alignItems: "center", gap: 9, background: C.blue, color: "#fff", border: `1.5px solid ${C.blue}`, borderRadius: 999, padding: "14px 28px", fontWeight: 600, fontSize: 16, textDecoration: "none", transition: "transform .18s, box-shadow .18s" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = `0 8px 0 -1px ${C.ink}` }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = "" }}
              >
                Learn chords →
              </Link>
              <Link href="/songs"
                style={{ display: "inline-flex", alignItems: "center", gap: 9, background: C.lime, color: C.ink, border: `1.5px solid ${C.ink}`, borderRadius: 999, padding: "14px 28px", fontWeight: 600, fontSize: 16, textDecoration: "none", transition: "transform .18s, box-shadow .18s" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = `0 8px 0 -1px ${C.ink}` }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = "" }}
              >
                Play a song
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer style={{ background: C.ink, color: C.cream, padding: "54px 0 40px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 30, flexWrap: "wrap", borderBottom: "1px solid #443c33", paddingBottom: 30 }}>
            <Logo size={60} color={C.cream} />
            <div style={{ display: "flex", gap: 56, flexWrap: "wrap" }}>
              {[
                { heading: "Learn",       links: [{ label: "Chords", href: "/chords/practice" }, { label: "Songs", href: "/songs" }, { label: "Rhythm & strumming", href: "#how" }] },
                { heading: "Instruments", links: [{ label: "Ukulele", href: "#" }, { label: "Guitar — soon", href: "#" }, { label: "Mandolin — soon", href: "#" }] },
              ].map(col => (
                <div key={col.heading}>
                  <h4 style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9a8e7c", marginBottom: 12 }}>{col.heading}</h4>
                  {col.links.map(l => (
                    <Link key={l.label} href={l.href}
                      style={{ display: "block", fontSize: 14.5, padding: "5px 0", color: C.cream, opacity: 0.85, textDecoration: "none", transition: "opacity .15s, padding .15s, color .15s" }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.opacity = "1"; el.style.paddingLeft = "6px"; el.style.color = C.lime }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.opacity = "0.85"; el.style.paddingLeft = "0"; el.style.color = C.cream }}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 26, fontSize: 12.5, color: "#9a8e7c", flexWrap: "wrap", gap: 10 }}>
            <span>© 2026 Yele — made for happy beginners.</span>
            <a href="https://x.com/precioussjohn" target="_blank" rel="noopener noreferrer" style={{ color: "#9a8e7c", textDecoration: "underline" }}>By Precious Inyang</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
