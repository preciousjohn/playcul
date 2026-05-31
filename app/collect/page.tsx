"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Link from "next/link"

// ─── Training classes ─────────────────────────────────────────────────────────
// "no_ukulele" is the new negative class — bare hands, no instrument
const CLASSES = [
  { key: "C_major",      label: "C",          color: "#e7456a" },
  { key: "Am_minor",     label: "Am",         color: "#2f7d5b" },
  { key: "F_major",      label: "F",          color: "#ea6a2e" },
  { key: "G_major",      label: "G",          color: "#d4a62a" },
  { key: "D_major",      label: "D",          color: "#4a90c4" },
  { key: "Dm_minor",     label: "Dm",         color: "#7b5ea7" },
  { key: "A_major",      label: "A",          color: "#c0534a" },
  { key: "Csharp_major", label: "C#",         color: "#3d7a6b" },
  { key: "no_ukulele",   label: "No Ukulele", color: "#6f6451" },
] as const

type ClassKey = typeof CLASSES[number]["key"]

type Sample = { label: ClassKey; features: number[] }

// ─── Hand skeleton ────────────────────────────────────────────────────────────
const CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
]

export default function CollectPage() {
  const videoRef       = useRef<HTMLVideoElement>(null)
  const canvasRef      = useRef<HTMLCanvasElement>(null)
  const landmarkerRef  = useRef<any>(null)
  const animRef        = useRef<number | null>(null)
  const activeRef      = useRef(false)
  const landmarksRef   = useRef<{ x: number; y: number; z: number }[] | null>(null)
  const holdTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null)

  const [status,      setStatus]      = useState<"idle" | "loading" | "running" | "error">("idle")
  const [errorMsg,    setErrorMsg]    = useState("")
  const [samples,     setSamples]     = useState<Sample[]>([])
  const [counts,      setCounts]      = useState<Partial<Record<ClassKey, number>>>({})
  const [activeKey,   setActiveKey]   = useState<ClassKey | null>(null)
  const [handVisible, setHandVisible] = useState(false)

  // ─── Inference loop ─────────────────────────────────────────────────────────
  const runLoop = useCallback(() => {
    if (!activeRef.current) return
    const video    = videoRef.current
    const canvas   = canvasRef.current
    const detector = landmarkerRef.current

    if (!video || !canvas || !detector || video.readyState < 2) {
      animRef.current = requestAnimationFrame(runLoop)
      return
    }

    // Sync canvas size to its container
    const box = canvas.parentElement?.getBoundingClientRect()
    if (box) {
      const rw = Math.round(box.width), rh = Math.round(box.height)
      if (canvas.width !== rw || canvas.height !== rh) { canvas.width = rw; canvas.height = rh }
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) { animRef.current = requestAnimationFrame(runLoop); return }
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const result = detector.detectForVideo(video, performance.now())
    const lms    = result.landmarks?.[0]

    if (lms && lms.length === 21) {
      landmarksRef.current = lms
      setHandVisible(true)

      // Draw skeleton
      ctx.lineWidth   = 2
      ctx.strokeStyle = "#ea6a2e"
      ctx.lineJoin    = "round"
      for (const [a, b] of CONNECTIONS) {
        ctx.beginPath()
        ctx.moveTo(lms[a].x * canvas.width, lms[a].y * canvas.height)
        ctx.lineTo(lms[b].x * canvas.width, lms[b].y * canvas.height)
        ctx.stroke()
      }
      for (let i = 0; i < lms.length; i++) {
        ctx.beginPath()
        ctx.arc(lms[i].x * canvas.width, lms[i].y * canvas.height, i === 0 ? 7 : 4, 0, Math.PI * 2)
        ctx.fillStyle = i === 0 ? "#1c3a8c" : "#fff"
        ctx.fill()
        ctx.strokeStyle = "#ea6a2e"
        ctx.lineWidth   = 1.5
        ctx.stroke()
      }
    } else {
      landmarksRef.current = null
      setHandVisible(false)
    }

    animRef.current = requestAnimationFrame(runLoop)
  }, [])

  // ─── Startup ─────────────────────────────────────────────────────────────────
  const start = useCallback(async () => {
    setStatus("loading")
    activeRef.current = true
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
      const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision")
      const vision = await FilesetResolver.forVisionTasks("/mediapipe/wasm")
      landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: "/mediapipe/hand_landmarker.task", delegate: "GPU" },
        runningMode: "VIDEO", numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })
      const video = videoRef.current!
      video.srcObject = stream
      await video.play()
      setStatus("running")
      animRef.current = requestAnimationFrame(runLoop)
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Failed to start camera")
      setStatus("error")
    }
  }, [runLoop])

  useEffect(() => {
    start()
    return () => {
      activeRef.current = false
      if (animRef.current) cancelAnimationFrame(animRef.current)
      if (holdTimerRef.current) clearInterval(holdTimerRef.current)
      const v = videoRef.current
      if (v?.srcObject) (v.srcObject as MediaStream).getTracks().forEach(t => t.stop())
    }
  }, [start])

  // ─── Recording ───────────────────────────────────────────────────────────────
  const recordOne = useCallback((key: ClassKey) => {
    const lms = landmarksRef.current
    if (!lms) return
    const features: number[] = []
    for (const lm of lms) features.push(lm.x, lm.y, lm.z ?? 0)
    const sample: Sample = { label: key, features }
    setSamples(prev => [...prev, sample])
    setCounts(prev => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }))
  }, [])

  const startHold = useCallback((key: ClassKey) => {
    setActiveKey(key)
    recordOne(key)
    holdTimerRef.current = setInterval(() => recordOne(key), 80) // ~12 samples/sec
  }, [recordOne])

  const stopHold = useCallback(() => {
    setActiveKey(null)
    if (holdTimerRef.current) { clearInterval(holdTimerRef.current); holdTimerRef.current = null }
  }, [])

  // ─── Export ───────────────────────────────────────────────────────────────────
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(samples, null, 2)], { type: "application/json" })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement("a"), { href: url, download: `yele_training_${Date.now()}.json` })
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─── Derived ─────────────────────────────────────────────────────────────────
  const total = samples.length
  const minCount = Math.min(...CLASSES.map(c => counts[c.key] ?? 0))
  const balanced = CLASSES.every(c => (counts[c.key] ?? 0) >= 200)

  return (
    <div style={{ background: "#1a1714", minHeight: "100vh", color: "#f4ebd8", padding: "28px 32px", fontFamily: "var(--font-instrument), sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, fontFamily: "var(--font-recolta), serif" }}>Training Data Collector</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6f6451" }}>
            Hold each button while holding the correct chord shape. Aim for 200+ samples each.
          </p>
        </div>
        <Link href="/" style={{ color: "#6f6451", fontSize: 13, textDecoration: "none", border: "1.5px solid #3a342f", padding: "7px 14px", borderRadius: 999 }}>
          ← Back
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

        {/* Camera */}
        <div>
          <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", background: "#0d0b0a", aspectRatio: "4/3" }}>
            <video
              ref={videoRef} autoPlay playsInline muted
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
            />
            <canvas
              ref={canvasRef}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: "scaleX(-1)" }}
            />

            {/* Status badge */}
            {status === "loading" && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.75)" }}>
                <p style={{ color: "#f4ebd8", fontSize: 14 }}>Starting camera…</p>
              </div>
            )}
            {status === "error" && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.85)", padding: 32, textAlign: "center" }}>
                <p style={{ color: "#ff6b6b", fontSize: 14 }}>{errorMsg}</p>
              </div>
            )}

            {/* Hand / recording indicator */}
            {status === "running" && (
              <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 8 }}>
                <span style={{
                  background: handVisible ? "rgba(46,125,91,.85)" : "rgba(0,0,0,.55)",
                  color: handVisible ? "#c8e85a" : "rgba(255,255,255,.4)",
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
                  padding: "5px 11px", borderRadius: 999,
                }}>
                  {handVisible ? "✓ Hand" : "No hand"}
                </span>
                {activeKey && (
                  <span style={{ background: "rgba(234,106,46,.9)", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", padding: "5px 11px", borderRadius: 999 }}>
                    ● Recording {activeKey}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Tip bar */}
          <div style={{ marginTop: 14, background: "rgba(255,255,255,.04)", borderRadius: 12, padding: "12px 16px" }}>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.7, color: "#6f6451" }}>
              <strong style={{ color: "#d9cbac" }}>Tips for good data:</strong> Hold the chord shape clearly against your ukulele neck.
              Vary your hand angle slightly (tilt up/down/left/right) while holding.
              For <strong style={{ color: "#d9cbac" }}>No Ukulele</strong> — record various open hand poses, fists, pointing, and relaxed hands with <em>no instrument</em>.
              Each recording session at 12 fps adds ~144 samples per 10 seconds of holding.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Class buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {CLASSES.map(({ key, label, color }) => {
              const count   = counts[key] ?? 0
              const isRec   = activeKey === key
              const enough  = count >= 200
              return (
                <button
                  key={key}
                  onMouseDown={() => startHold(key)}
                  onMouseUp={stopHold}
                  onMouseLeave={stopHold}
                  onTouchStart={e => { e.preventDefault(); startHold(key) }}
                  onTouchEnd={stopHold}
                  style={{
                    background: isRec ? color : enough ? `${color}22` : "rgba(255,255,255,.05)",
                    border: `1.5px solid ${isRec || enough ? color : "rgba(255,255,255,.1)"}`,
                    borderRadius: 12,
                    padding: "14px 8px",
                    color: isRec ? "#fff" : enough ? color : "rgba(255,255,255,.7)",
                    cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                    transition: "background .1s, border .1s",
                    userSelect: "none",
                  }}
                >
                  <span style={{ fontSize: key === "no_ukulele" ? 11 : 20, fontWeight: 700, lineHeight: 1, fontFamily: "var(--font-recolta), serif" }}>
                    {label}
                  </span>
                  <span style={{ fontSize: 10, color: isRec ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.35)" }}>
                    {count} {enough ? "✓" : "/ 200"}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Progress summary */}
          <div style={{ background: "rgba(255,255,255,.05)", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6f6451" }}>Balance</span>
              <span style={{ fontSize: 12, color: "#d9cbac" }}>{total} total</span>
            </div>
            {CLASSES.map(({ key, label, color }) => {
              const count = counts[key] ?? 0
              const pct   = Math.min((count / 200) * 100, 100)
              return (
                <div key={key} style={{ marginBottom: 7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 11, color: "#d9cbac" }}>{label}</span>
                    <span style={{ fontSize: 11, color: "#6f6451" }}>{count}</span>
                  </div>
                  <div style={{ height: 3, background: "rgba(255,255,255,.08)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width .2s" }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Status message */}
          {!balanced && total > 0 && (
            <p style={{ margin: 0, fontSize: 12, color: "#6f6451", textAlign: "center" }}>
              Lowest class: <strong style={{ color: "#d9cbac" }}>{minCount}</strong> samples.
              {minCount < 50 ? " Keep going — more is better." : " Looking good, keep balancing."}
            </p>
          )}
          {balanced && (
            <p style={{ margin: 0, fontSize: 12, color: "#c8e85a", textAlign: "center", fontWeight: 600 }}>
              ✓ All classes have 200+ samples — ready to export!
            </p>
          )}

          {/* Export */}
          <button
            onClick={exportJSON}
            disabled={total === 0}
            style={{
              padding: "13px 0", borderRadius: 12, fontWeight: 700, fontSize: 14,
              background: total > 0 ? "#c8e85a" : "rgba(255,255,255,.08)",
              color: total > 0 ? "#241f1b" : "rgba(255,255,255,.25)",
              border: "none", cursor: total > 0 ? "pointer" : "not-allowed",
              transition: "background .15s",
            }}
          >
            Export {total} samples as JSON →
          </button>

          {/* Next step hint */}
          <p style={{ margin: 0, fontSize: 11, color: "#4a413a", lineHeight: 1.6, textAlign: "center" }}>
            After exporting, place the JSON next to <code style={{ color: "#6f6451" }}>train/retrain.py</code> and run it to retrain.
          </p>
        </div>
      </div>
    </div>
  )
}
