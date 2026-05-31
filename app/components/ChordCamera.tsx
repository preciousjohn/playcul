"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { C } from "@/app/lib/theme"

// TF.js and MediaPipe are loaded dynamically inside start() to avoid
// server-side import issues during Next.js / Vercel builds.

const HAND_CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
]

// Map model label → chord ID used in the app.
// "no_ukulele" maps to the sentinel __no_uke__ so we can show a specific message.
const LABEL_MAP: Record<string, string> = {
  A_major:      "A",
  Am_minor:     "Am",
  C_major:      "C",
  Csharp_major: "C#",
  D_major:      "D",
  Dm_minor:     "Dm",
  F_major:      "F",
  G_major:      "G",
  no_ukulele:   "__no_uke__",
}

const NO_UKE = "__no_uke__"

const LOCK_NEEDED          = 22    // consecutive matching frames required
const CONFIDENCE_THRESHOLD = 0.93  // top class must be ≥ 93% confident
const MIN_CONF_GAP         = 0.40  // top class must lead second place by ≥ 40%

// [MCP landmark index, TIP landmark index] for each finger
const FINGER_PAIRS = [[5, 8], [9, 12], [13, 16], [17, 20]] as const

// Must match the normalise() function in train/retrain.py:
// 1. Subtract wrist so hand position in frame doesn't matter
// 2. Divide by wrist→middle-MCP distance so hand size doesn't matter
function normaliseFeatures(raw: Float32Array): Float32Array {
  const out = new Float32Array(63)
  const wx = raw[0], wy = raw[1], wz = raw[2]
  for (let i = 0; i < 21; i++) {
    out[i * 3]     = raw[i * 3]     - wx
    out[i * 3 + 1] = raw[i * 3 + 1] - wy
    out[i * 3 + 2] = raw[i * 3 + 2] - wz
  }
  // wrist→middle-MCP (landmark 9) distance as scale
  const sx = out[27], sy = out[28], sz = out[29]
  const scale = Math.sqrt(sx * sx + sy * sy + sz * sz) || 1e-6
  for (let i = 0; i < 63; i++) out[i] /= scale
  return out
}

interface Props {
  expectedChordId: string
  onMatchChange?: (isMatch: boolean) => void
}

type Status = "idle" | "loading" | "running" | "error"

export default function ChordCamera({ expectedChordId, onMatchChange }: Props) {
  const videoRef      = useRef<HTMLVideoElement>(null)
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const modelRef      = useRef<any>(null)
  const labelsRef     = useRef<string[]>([])
  const landmarkerRef = useRef<any>(null)
  const tfRef         = useRef<any>(null)
  const animFrameRef  = useRef<number | null>(null)
  const activeRef     = useRef(false)
  const lockCountRef  = useRef(0)
  const prevLockedRef = useRef(false)

  const onMatchChangeRef   = useRef(onMatchChange)
  onMatchChangeRef.current = onMatchChange
  const expectedChordRef   = useRef(expectedChordId)
  expectedChordRef.current = expectedChordId

  const [status,        setStatus]        = useState<Status>("idle")
  const [errorMsg,      setErrorMsg]      = useState<string | null>(null)
  const [detectedChord, setDetectedChord] = useState<string | null>(null)
  const [noUkulele,     setNoUkulele]     = useState(false)
  const [locked,        setLocked]        = useState(false)
  const [handDetected,  setHandDetected]  = useState(false)
  const [lockProgress,  setLockProgress]  = useState(0)

  // Reset when target chord changes
  useEffect(() => {
    lockCountRef.current  = 0
    prevLockedRef.current = false
    setLocked(false)
    setLockProgress(0)
    setDetectedChord(null)
    setNoUkulele(false)
    onMatchChangeRef.current?.(false)
  }, [expectedChordId])

  const drawSkeleton = useCallback((
    ctx: CanvasRenderingContext2D,
    lms: { x: number; y: number }[],
    w: number, h: number,
    isLocked: boolean,
  ) => {
    const color = isLocked ? "#34d399" : "#E9A825"
    ctx.strokeStyle = color
    ctx.lineWidth   = 2.5
    ctx.lineJoin    = "round"

    for (const [a, b] of HAND_CONNECTIONS) {
      ctx.beginPath()
      ctx.moveTo(lms[a].x * w, lms[a].y * h)
      ctx.lineTo(lms[b].x * w, lms[b].y * h)
      ctx.stroke()
    }

    for (let i = 0; i < lms.length; i++) {
      const cx = lms[i].x * w
      const cy = lms[i].y * h
      ctx.beginPath()
      ctx.arc(cx, cy, i === 0 ? 8 : 5, 0, Math.PI * 2)
      ctx.fillStyle = i === 0 ? "#1E50CB" : "#FFFFFF"
      ctx.fill()
      if (i !== 0) {
        ctx.strokeStyle = color
        ctx.lineWidth   = 1.5
        ctx.stroke()
      }
    }
  }, [])

  const runLoop = useCallback(() => {
    if (!activeRef.current) return

    const video     = videoRef.current
    const canvas    = canvasRef.current
    const landmarker = landmarkerRef.current
    const model     = modelRef.current

    if (!video || !canvas || !landmarker || !model || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(runLoop)
      return
    }

    // Resize canvas to container
    const container = canvas.parentElement
    if (container) {
      const { width, height } = container.getBoundingClientRect()
      const rw = Math.round(width), rh = Math.round(height)
      if (canvas.width !== rw || canvas.height !== rh) {
        canvas.width = rw; canvas.height = rh
      }
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) { animFrameRef.current = requestAnimationFrame(runLoop); return }
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const result = landmarker.detectForVideo(video, performance.now())
    const lms    = result.landmarks?.[0]

    if (lms && lms.length === 21) {
      setHandDetected(true)

      // Build 63-feature input then normalise (must match train/retrain.py)
      const raw = new Float32Array(63)
      for (let i = 0; i < 21; i++) {
        raw[i * 3]     = lms[i].x
        raw[i * 3 + 1] = lms[i].y
        raw[i * 3 + 2] = lms[i].z ?? 0
      }
      const input = normaliseFeatures(raw)

      // Run inference
      const tfLib   = tfRef.current
      if (!tfLib) { animFrameRef.current = requestAnimationFrame(runLoop); return }
      const tensor  = tfLib.tensor2d([Array.from(input)], [1, 63])
      const pred    = model.predict(tensor)
      const probs   = Array.from(pred.dataSync() as Float32Array)
      tensor.dispose()
      pred.dispose()

      const maxIdx   = probs.reduce((best, v, i) => (v > probs[best] ? i : best), 0)
      const sorted   = [...probs].sort((a, b) => b - a)
      const conf     = sorted[0]
      const confGap  = sorted[0] - sorted[1]   // margin over second-best class
      const rawLabel = labelsRef.current[maxIdx] ?? null
      const chordId  = rawLabel ? (LABEL_MAP[rawLabel] ?? null) : null

      // Finger-curl check — an open flat palm cannot be a chord.
      // When the hand points up (middle MCP above wrist in image), a curled/pressed
      // fingertip drops BELOW its MCP (higher y value). Require ≥ 1 curled finger.
      const handUp = lms[9].y < lms[0].y  // middle-finger MCP above wrist
      let curledCount = 0
      for (const [mcp, tip] of FINGER_PAIRS) {
        if (handUp ? lms[tip].y > lms[mcp].y : lms[tip].y < lms[mcp].y) curledCount++
      }
      const hasChordGrip = curledCount >= 1

      // Only surface a detection when the model is clearly decisive
      const isDecisive = conf >= CONFIDENCE_THRESHOLD && confGap >= MIN_CONF_GAP
      // no_ukulele is valid regardless of grip (bare hand IS the signal)
      const isNoUkeNow = isDecisive && chordId === NO_UKE
      // chord detections additionally require a physical grip shape
      const isChordDetection = isDecisive && !isNoUkeNow && hasChordGrip
      const visibleChord = isChordDetection ? chordId : null

      setDetectedChord(visibleChord)
      setNoUkulele(isNoUkeNow)

      // Lock logic — no_ukulele / open-palm detections decay the counter but never advance it
      const isMatch = isChordDetection && chordId === expectedChordRef.current
      lockCountRef.current = isMatch
        ? Math.min(lockCountRef.current + 1, LOCK_NEEDED)
        : Math.max(lockCountRef.current - 1, 0)

      const newLocked = lockCountRef.current >= LOCK_NEEDED
      setLockProgress(lockCountRef.current)
      setLocked(newLocked)

      if (newLocked !== prevLockedRef.current) {
        prevLockedRef.current = newLocked
        onMatchChangeRef.current?.(newLocked)
      }

      drawSkeleton(ctx, lms, canvas.width, canvas.height, newLocked)
    } else {
      setHandDetected(false)
      setNoUkulele(false)
      lockCountRef.current = Math.max(lockCountRef.current - 1, 0)
      setLockProgress(lockCountRef.current)
      if (prevLockedRef.current) {
        prevLockedRef.current = false
        setLocked(false)
        onMatchChangeRef.current?.(false)
      }
    }

    animFrameRef.current = requestAnimationFrame(runLoop)
  }, [drawSkeleton])

  const stop = useCallback(() => {
    activeRef.current = false
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    animFrameRef.current = null
    const video = videoRef.current
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach(t => t.stop())
      video.srcObject = null
    }
    setStatus("idle")
    setHandDetected(false)
    setLocked(false)
    setDetectedChord(null)
    setNoUkulele(false)
    setLockProgress(0)
  }, [])

  const start = useCallback(async () => {
    setStatus("loading")
    setErrorMsg(null)
    activeRef.current = true

    // Step 1 — camera permission (separate so error message is specific)
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
      })
    } catch {
      if (activeRef.current) {
        setErrorMsg("Camera access denied. Allow camera access in your browser settings, then try again.")
        setStatus("error")
      }
      return
    }

    if (!activeRef.current) { stream.getTracks().forEach(t => t.stop()); return }

    // Step 2a — TF.js chord-recognition model (all files served locally)
    try {
      if (!modelRef.current) {
        // dynamic import may return { default: tf } (CJS wrap) or the namespace directly
        const tfModule = await import("@tensorflow/tfjs")
        const tf = (tfModule as any).default ?? tfModule
        tfRef.current = tf

        const [m, labelsRes] = await Promise.all([
          tf.loadLayersModel("/web_model/model.json"),
          fetch("/labels.json"),
        ])
        labelsRef.current = await labelsRes.json()
        modelRef.current  = m
        // warm-up pass
        const dummy = tf.zeros([1, 63])
        ;(m.predict(dummy) as any).dispose()
        dummy.dispose()
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err)
      console.error("TF.js model load error:", err)
      stream.getTracks().forEach(t => t.stop())
      if (activeRef.current) {
        setErrorMsg(`Chord model failed to load: ${detail}`)
        setStatus("error")
      }
      return
    }

    if (!activeRef.current) { stream.getTracks().forEach(t => t.stop()); return }

    // Step 2b — MediaPipe hand landmarker (WASM + task file served locally)
    try {
      if (!landmarkerRef.current) {
        const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision")
        const vision = await FilesetResolver.forVisionTasks("/mediapipe/wasm")
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/mediapipe/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence:  0.5,
          minTrackingConfidence:      0.5,
        })
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err)
      console.error("MediaPipe load error:", err)
      stream.getTracks().forEach(t => t.stop())
      if (activeRef.current) {
        setErrorMsg(`Hand-detection failed to load: ${detail}`)
        setStatus("error")
      }
      return
    }

    if (!activeRef.current) { stream.getTracks().forEach(t => t.stop()); return }

    // Step 3 — wire up video and start inference loop
    try {
      const video = videoRef.current!
      video.srcObject = stream
      await video.play()
      if (activeRef.current) {
        setStatus("running")
        animFrameRef.current = requestAnimationFrame(runLoop)
      }
    } catch (err) {
      console.error(err)
      stream.getTracks().forEach(t => t.stop())
      if (activeRef.current) {
        setErrorMsg("Video playback failed. Please try again.")
        setStatus("error")
      }
    }
  }, [runLoop])

  // Auto-start on mount
  useEffect(() => {
    start()
    return () => stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Stop when tab inactive, restart when visible
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) stop()
      else start()
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [start, stop])

  const lockPct      = Math.round((lockProgress / LOCK_NEEDED) * 100)
  const showProgress = !locked && lockProgress > 0
  const uiMsg        = locked
    ? `${detectedChord} ✓ — tap "Got it ✓"`
    : noUkulele
    ? "No ukulele in frame — pick it up!"
    : handDetected
    ? detectedChord
      ? `Looks like ${detectedChord} — hold still…`
      : "Hand detected — make sure your uke is in frame"
    : "Hold your ukulele up so we can see your fretting hand"

  return (
    <div style={{ background: C.ink, borderRadius: 24, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20, height: "100%" }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <p style={{ fontFamily: "var(--font-recolta), serif", color: "#fff", fontWeight: 600, fontSize: 22, margin: 0 }}>Practice your chords</p>

        {status === "running" && (
          <span className={`flex items-center gap-2 font-sans text-lg font-semibold px-4 py-2 rounded-full transition-colors duration-300 ${
            locked
              ? "bg-emerald-500/25 text-emerald-300"
              : noUkulele
              ? "bg-orange-500/20 text-orange-300"
              : handDetected
              ? "bg-white/10 text-white/60"
              : "bg-white/5 text-white/40"
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
              locked        ? "bg-emerald-400 animate-pulse"
              : noUkulele   ? "bg-orange-400 animate-pulse"
              : handDetected ? "bg-amber-400 animate-pulse"
              : "bg-white/20"
            }`} />
            {locked ? `${detectedChord} ✓` : noUkulele ? "No uke in frame" : handDetected ? "Detecting…" : "No hand in frame"}
          </span>
        )}
      </div>

      {/* Camera feed */}
      <div className="relative overflow-hidden flex-1" style={{ minHeight: 400, borderRadius: 20, background: C.dark }}>
        <video
          ref={videoRef} autoPlay playsInline muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ transform: "scaleX(-1)" }}
        />

        {/* Locked banner */}
        {status === "running" && locked && (
          <div className="absolute top-4 inset-x-4 flex justify-center pointer-events-none">
            <div className="flex items-center gap-2 bg-emerald-500/30 backdrop-blur-sm border border-emerald-500/40 text-emerald-300 font-sans font-bold text-base px-5 py-2.5 rounded-full animate-pulse">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#4ade80" strokeWidth="1.5"/>
                <path d="M5 8l2 2 4-4" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {detectedChord} ✓ — tap &ldquo;Got it ✓&rdquo;
            </div>
          </div>
        )}

        {/* Almost there banner */}
        {status === "running" && !locked && lockProgress >= LOCK_NEEDED / 2 && (
          <div className="absolute top-4 inset-x-4 flex justify-center pointer-events-none">
            <div className="flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 text-amber-300 font-sans font-semibold text-sm px-4 py-2 rounded-full">
              Almost there — hold still…
            </div>
          </div>
        )}

        {/* Idle / loading / error overlay */}
        {status !== "running" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black/75 text-center px-8">
            {status === "idle" && (
              <>
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-5xl">📷</div>
                <p className="font-sans text-white/60 text-base">Starting camera…</p>
              </>
            )}
            {status === "loading" && (
              <>
                <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: C.orange, borderTopColor: "transparent" }} />
                <p className="font-sans text-white/60 text-lg">Loading model…</p>
              </>
            )}
            {status === "error" && (
              <>
                <span className="text-4xl">⚠️</span>
                <p className="font-sans text-red-400 text-base text-center max-w-xs leading-relaxed whitespace-pre-line">{errorMsg}</p>
                <button
                  onClick={start}
                  style={{ fontFamily: "var(--font-instrument), sans-serif", fontSize: 15, fontWeight: 700, padding: "12px 28px", borderRadius: 999, background: C.lime, color: C.ink, border: `1.5px solid ${C.ink}`, cursor: "pointer" }}
                >
                  Try again
                </button>
              </>
            )}
          </div>
        )}

        {/* Bottom-right: detected chord label */}
        {status === "running" && detectedChord && (
          <div className="absolute bottom-3 right-3">
            <span className={`font-serif font-bold text-lg px-3 py-1 rounded-xl backdrop-blur-sm transition-colors duration-200 ${
              locked ? "bg-emerald-500/40 text-emerald-200" : "bg-black/50 text-white/80"
            }`}>
              {detectedChord}{locked ? " ✓" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Live feedback bar */}
      {status === "running" && (
        <div className={`rounded-2xl px-5 py-4 flex flex-col gap-3 transition-colors duration-300 ${
          locked
            ? "bg-emerald-500/20 border border-emerald-500/30"
            : noUkulele
            ? "bg-orange-500/15 border border-orange-500/25"
            : handDetected && detectedChord
            ? "bg-amber-500/10 border border-amber-500/20"
            : "bg-white/5 border border-white/10"
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-xl shrink-0">
              {locked ? "✅" : noUkulele ? "🎸" : handDetected ? "👁️" : "👋"}
            </span>
            <p className={`font-sans text-base leading-snug ${
              locked ? "text-emerald-300"
              : noUkulele ? "text-orange-300"
              : handDetected ? "text-amber-200"
              : "text-white/60"
            }`}>
              {uiMsg}
            </p>
          </div>

          {showProgress && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{ background: C.orange, width: `${lockPct}%` }}
                />
              </div>
              <span className="font-sans text-xs text-white/40 tabular-nums shrink-0">{lockPct}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
