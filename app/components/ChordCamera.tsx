"use client"

import { useState, useEffect, useRef, useCallback } from "react"

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const HAND_CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
]

const SERVER_URL       = "http://localhost:8765"
const SEND_INTERVAL_MS = 150

interface Lm { x: number; y: number; z: number }

// ─────────────────────────────────────────────
// Server response type
// ─────────────────────────────────────────────

interface ServerResult {
  state: "IDLE" | "PLAYING" | "LOCKED"
  hand_detected: boolean
  active_fingers: number
  chord_match: string | null
  score: number
  is_match: boolean
  ui_message: string
  lock_progress: number
  lock_needed: number
  landmarks: [number, number, number][] | null
}

// ─────────────────────────────────────────────
// Skeleton drawing
// ─────────────────────────────────────────────

function coverTransform(cW: number, cH: number, vW: number, vH: number) {
  const scale = Math.max(cW / vW, cH / vH)
  const dW = vW * scale, dH = vH * scale
  return {
    toX: (nx: number) => nx * dW + (cW - dW) / 2,
    toY: (ny: number) => ny * dH + (cH - dH) / 2,
  }
}

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  lm: Lm[],
  toX: (n: number) => number,
  toY: (n: number) => number,
  locked: boolean,
) {
  const lineColor = locked ? "#34d399" : "#E9A825"
  ctx.strokeStyle = lineColor
  ctx.lineWidth   = 2.5
  ctx.lineJoin    = "round"

  for (const [a, b] of HAND_CONNECTIONS) {
    ctx.beginPath()
    ctx.moveTo(toX(lm[a].x), toY(lm[a].y))
    ctx.lineTo(toX(lm[b].x), toY(lm[b].y))
    ctx.stroke()
  }

  for (let i = 0; i < lm.length; i++) {
    const cx = toX(lm[i].x)
    const cy = toY(lm[i].y)
    const r  = i === 0 ? 8 : 5
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fillStyle = i === 0 ? "#1E50CB" : "#FFFFFF"
    ctx.fill()
    if (i !== 0) {
      ctx.strokeStyle = lineColor
      ctx.lineWidth   = 1.5
      ctx.stroke()
    }
  }
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

type Status = "idle" | "loading" | "running" | "error"

interface Props {
  expectedChordId: string
  onMatchChange?: (isMatch: boolean) => void
}

export default function ChordCamera({ expectedChordId, onMatchChange }: Props) {
  const videoRef     = useRef<HTMLVideoElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number | null>(null)
  const sendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const activeRef    = useRef(false)
  const onMatchChangeRef = useRef(onMatchChange)
  onMatchChangeRef.current = onMatchChange

  const serverResultRef    = useRef<ServerResult | null>(null)
  const prevLockedRef      = useRef(false)
  const sendingRef         = useRef(false)        // prevents concurrent requests
  const expectedChordRef   = useRef(expectedChordId)
  expectedChordRef.current = expectedChordId      // always current, readable by the interval

  const [status,       setStatus]       = useState<Status>("idle")
  const [serverResult, setServerResult] = useState<ServerResult | null>(null)
  const [errorMsg,     setErrorMsg]     = useState<string | null>(null)
  const [serverOnline, setServerOnline] = useState(false)

  // Reset server state + local state when target chord changes
  useEffect(() => {
    setServerResult(null)
    serverResultRef.current = null
    prevLockedRef.current   = false
    onMatchChangeRef.current?.(false)
    fetch(`${SERVER_URL}/reset`, { method: "POST" }).catch(() => {})
  }, [expectedChordId])

  // ── Capture a JPEG frame as base64 ──────────────────────────────────────
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current
    if (!video || video.readyState < 2) return null
    const tmp   = document.createElement("canvas")
    tmp.width   = 320
    tmp.height  = 240
    const ctx   = tmp.getContext("2d")!
    ctx.drawImage(video, 0, 0, 320, 240)
    const dataUrl = tmp.toDataURL("image/jpeg", 0.75)
    return dataUrl.split(",")[1]
  }, [])

  // ── Send frame to Python server ──────────────────────────────────────────
  const sendFrame = useCallback(async () => {
    if (!activeRef.current || sendingRef.current) return
    const b64 = captureFrame()
    if (!b64) return

    sendingRef.current = true
    try {
      const res = await fetch(`${SERVER_URL}/detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame_b64: b64, expected_chord: expectedChordRef.current }),
        signal: AbortSignal.timeout(3000),
      })
      if (!res.ok) return
      const data: ServerResult = await res.json()
      if (!activeRef.current) return

      serverResultRef.current = data
      setServerResult(data)
      setServerOnline(true)

      const isLocked = data.state === "LOCKED"
      if (isLocked !== prevLockedRef.current) {
        prevLockedRef.current = isLocked
        onMatchChangeRef.current?.(isLocked)
      }
    } catch {
      setServerOnline(false)
    } finally {
      sendingRef.current = false
    }
  }, [captureFrame])

  // ── Skeleton overlay using server landmarks only ─────────────────────────
  const drawLoop = useCallback(() => {
    if (!activeRef.current) return
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) { animFrameRef.current = requestAnimationFrame(drawLoop); return }

    const container = canvas.parentElement
    if (container) {
      const { width, height } = container.getBoundingClientRect()
      const rw = Math.round(width), rh = Math.round(height)
      if (canvas.width !== rw || canvas.height !== rh) {
        canvas.width = rw; canvas.height = rh
      }
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) { animFrameRef.current = requestAnimationFrame(drawLoop); return }
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const sr     = serverResultRef.current
    const locked = sr?.state === "LOCKED"
    const vW = video.videoWidth  || 1280
    const vH = video.videoHeight || 720
    const { toX, toY } = coverTransform(canvas.width, canvas.height, vW, vH)

    if (sr?.landmarks && sr.landmarks.length === 21) {
      const lmObjs: Lm[] = sr.landmarks.map(([x, y, z]) => ({ x, y, z }))
      drawSkeleton(ctx, lmObjs, toX, toY, locked)
    }

    animFrameRef.current = requestAnimationFrame(drawLoop)
  }, [])

  // ── Start camera + MediaPipe + server polling ────────────────────────────
  const start = useCallback(async () => {
    setStatus("loading")
    setErrorMsg(null)
    activeRef.current = true

    try {
      // Health check and camera stream in parallel
      const [health, stream] = await Promise.all([
        fetch(`${SERVER_URL}/health`, { signal: AbortSignal.timeout(3000) }).catch(() => null),
        navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 },
                   frameRate: { ideal: 30, max: 30 }, facingMode: "user" },
        }),
      ])

      if (!activeRef.current) { stream.getTracks().forEach(t => t.stop()); return }

      if (!health?.ok) {
        stream.getTracks().forEach(t => t.stop())
        setErrorMsg("Python server not running. Start it with:\npython3 chord_server.py")
        setStatus("error")
        activeRef.current = false
        return
      }

      setServerOnline(true)
      fetch(`${SERVER_URL}/reset`, { method: "POST" }).catch(() => {})

      const video = videoRef.current!
      video.srcObject = stream
      await video.play()

      if (activeRef.current) {
        setStatus("running")
        animFrameRef.current = requestAnimationFrame(drawLoop)
        sendTimerRef.current = setInterval(sendFrame, SEND_INTERVAL_MS)
      }
    } catch (err) {
      console.error(err)
      if (activeRef.current) {
        setErrorMsg("Could not start camera. Please allow camera access.")
        setStatus("error")
      }
    }
  }, [drawLoop, sendFrame])

  // Stop camera and all loops
  const stop = useCallback(() => {
    activeRef.current = false
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (sendTimerRef.current)  clearInterval(sendTimerRef.current)
    animFrameRef.current = null
    sendTimerRef.current = null
    const video = videoRef.current
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach(t => t.stop())
      video.srcObject = null
    }
    setStatus("idle")
  }, [])

  // Auto-start on mount
  useEffect(() => {
    start()
    return () => { stop() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Stop camera when tab is inactive, restart when active
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        stop()
      } else {
        start()
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [start, stop])

  const sr          = serverResult
  const locked      = sr?.state === "LOCKED"
  const playing     = sr?.state === "PLAYING"
  const uiMsg       = sr?.ui_message ?? "Hold your ukulele up so we can see your fretting hand"
  const lockPct     = sr ? Math.round((sr.lock_progress / sr.lock_needed) * 100) : 0
  const showProgress = playing && (sr?.lock_progress ?? 0) > 0 && !locked

  return (
    <div className="bg-[#1A1A2E] rounded-3xl p-6 md:p-8 flex flex-col gap-5 h-full">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-serif text-white font-semibold text-2xl">
          Practice your chords
        </p>

        {status === "running" && (
          <span className={`flex items-center gap-2 font-sans text-lg font-semibold px-4 py-2 rounded-full transition-colors duration-300 ${
            locked
              ? "bg-emerald-500/25 text-emerald-300"
              : playing && sr?.hand_detected
              ? "bg-white/10 text-white/60"
              : "bg-white/5 text-white/40"
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
              locked  ? "bg-emerald-400 animate-pulse"
              : playing && sr?.hand_detected ? "bg-amber-400 animate-pulse"
              : "bg-white/20"
            }`} />
            {locked
              ? `${sr?.chord_match ?? expectedChordId} ✓`
              : sr?.hand_detected
              ? "Detecting…"
              : "No hand in frame"}
          </span>
        )}
      </div>

      {/* Camera feed */}
      <div className="relative rounded-2xl overflow-hidden bg-black/50 flex-1" style={{ minHeight: 400 }}>
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

        {/* LOCKED banner */}
        {status === "running" && locked && (
          <div className="absolute top-4 inset-x-4 flex justify-center pointer-events-none">
            <div className="flex items-center gap-2 bg-emerald-500/30 backdrop-blur-sm border border-emerald-500/40 text-emerald-300 font-sans font-bold text-base px-5 py-2.5 rounded-full animate-pulse">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#4ade80" strokeWidth="1.5"/>
                <path d="M5 8l2 2 4-4" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {sr?.chord_match ?? expectedChordId} ✓ — tap &ldquo;Got it ✓&rdquo;
            </div>
          </div>
        )}

        {/* Almost there banner */}
        {status === "running" && !locked && playing && (sr?.score ?? 0) > 0.35 && (
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
                <div className="w-10 h-10 border-2 border-[#E9A825] border-t-transparent rounded-full animate-spin" />
                <p className="font-sans text-white/60 text-lg">Loading…</p>
              </>
            )}
            {status === "error" && (
              <>
                <span className="text-4xl">⚠️</span>
                <p className="font-sans text-red-400 text-base text-center max-w-xs leading-relaxed whitespace-pre-line">{errorMsg}</p>
                <button
                  onClick={start}
                  className="font-sans text-base font-semibold px-8 py-3.5 bg-[#E9A825] text-[#1A1A2E] rounded-full hover:bg-[#d99b20] transition-colors"
                >
                  Try again
                </button>
              </>
            )}
          </div>
        )}

        {/* Bottom-right: detected chord label + server dot */}
        {status === "running" && (
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {/* Live detected chord */}
            {sr?.chord_match && (
              <span className={`font-serif font-bold text-lg px-3 py-1 rounded-xl backdrop-blur-sm transition-colors duration-200 ${
                locked
                  ? "bg-emerald-500/40 text-emerald-200"
                  : "bg-black/50 text-white/80"
              }`}>
                {sr.chord_match}{locked ? " ✓" : ""}
              </span>
            )}
            <span className={`w-2 h-2 rounded-full ${serverOnline ? "bg-emerald-400" : "bg-red-400"}`} />
          </div>
        )}
      </div>

      {/* Live feedback bar */}
      {status === "running" && (
        <div className={`rounded-2xl px-5 py-4 flex flex-col gap-3 transition-colors duration-300 ${
          locked
            ? "bg-emerald-500/20 border border-emerald-500/30"
            : sr?.hand_detected && (sr?.active_fingers ?? 0) > 0
            ? "bg-amber-500/10 border border-amber-500/20"
            : "bg-white/5 border border-white/10"
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-xl shrink-0">
              {locked ? "✅" : sr?.hand_detected ? "🎸" : "👋"}
            </span>
            <p className={`font-sans text-base leading-snug ${
              locked ? "text-emerald-300"
              : sr?.hand_detected ? "text-amber-200"
              : "text-white/60"
            }`}>
              {uiMsg}
            </p>
          </div>

          {/* Lock progress bar — shows while building toward a lock */}
          {showProgress && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E9A825] rounded-full transition-all duration-200"
                  style={{ width: `${lockPct}%` }}
                />
              </div>
              <span className="font-sans text-xs text-white/40 tabular-nums shrink-0">
                {lockPct}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
