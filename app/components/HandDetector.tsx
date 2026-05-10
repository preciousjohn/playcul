"use client"

import { useState, useEffect, useRef, useCallback } from "react"

// Hand skeleton connections (pairs of landmark indices)
const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],         // thumb
  [0, 5], [5, 6], [6, 7], [7, 8],          // index
  [0, 9], [9, 10], [10, 11], [11, 12],     // middle
  [0, 13], [13, 14], [14, 15], [15, 16],   // ring
  [0, 17], [17, 18], [18, 19], [19, 20],   // pinky
  [5, 9], [9, 13], [13, 17],               // palm cross
]

const VELOCITY_THRESHOLD = 0.018 // normalized coord change per frame
const DEBOUNCE_MS = 350           // min ms between detected strokes

type StrokeDir = "D" | "U" | null
type Status = "idle" | "loading" | "running" | "error"

interface HandDetectorProps {
  onStrum?: () => void
  className?: string
}

interface Landmark { x: number; y: number; z: number }
interface MPResults { multiHandLandmarks?: Landmark[][] }

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement("script")
    s.src = src
    s.crossOrigin = "anonymous"
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })
}

export default function HandDetector({ onStrum, className }: HandDetectorProps = {}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const handsRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const prevYRef = useRef<number | null>(null)
  const lastStrumRef = useRef<number>(0)
  const activeRef = useRef(false) // guards against post-cleanup WASM calls

  const [status, setStatus] = useState<Status>("idle")
  const [handDetected, setHandDetected] = useState(false)
  const [strokeDir, setStrokeDir] = useState<StrokeDir>(null)
  const [strokeCount, setStrokeCount] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Map normalised [0,1] landmark coords through object-cover transform
  const coverTransform = useCallback((cW: number, cH: number, vW: number, vH: number) => {
    const scale = Math.max(cW / vW, cH / vH)
    const dW = vW * scale, dH = vH * scale
    return {
      toX: (nx: number) => nx * dW + (cW - dW) / 2,
      toY: (ny: number) => ny * dH + (cH - dH) / 2,
    }
  }, [])

  // Draw hand skeleton + dots on canvas
  const drawHand = useCallback((
    ctx: CanvasRenderingContext2D,
    landmarks: Landmark[],
    toX: (n: number) => number,
    toY: (n: number) => number,
  ) => {
    ctx.strokeStyle = "#E9A825"
    ctx.lineWidth = 2.5
    ctx.lineJoin = "round"
    for (const [a, b] of HAND_CONNECTIONS) {
      ctx.beginPath()
      ctx.moveTo(toX(landmarks[a].x), toY(landmarks[a].y))
      ctx.lineTo(toX(landmarks[b].x), toY(landmarks[b].y))
      ctx.stroke()
    }

    for (let i = 0; i < landmarks.length; i++) {
      const cx = toX(landmarks[i].x)
      const cy = toY(landmarks[i].y)
      const r = i === 0 ? 8 : 5

      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = i === 0 ? "#1E50CB" : "#FFFFFF"
      ctx.fill()

      if (i !== 0) {
        ctx.strokeStyle = "#E9A825"
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    }
  }, [])

  // Called every frame by MediaPipe
  const onStrumRef = useRef(onStrum)
  onStrumRef.current = onStrum

  const onResults = useCallback((results: MPResults) => {
    if (!activeRef.current) return  // component unmounted or stopped
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Sync canvas to container size (fixes object-cover misalignment)
    const video = videoRef.current
    const container = canvas.parentElement
    if (container) {
      const { width, height } = container.getBoundingClientRect()
      const rw = Math.round(width), rh = Math.round(height)
      if (canvas.width !== rw || canvas.height !== rh) {
        canvas.width = rw; canvas.height = rh
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const hasHand = !!(results.multiHandLandmarks?.length)
    setHandDetected(hasHand)

    if (!hasHand || !results.multiHandLandmarks) {
      prevYRef.current = null
      return
    }

    const landmarks = results.multiHandLandmarks[0]
    const vW = video?.videoWidth || 640
    const vH = video?.videoHeight || 480
    const { toX, toY } = coverTransform(canvas.width, canvas.height, vW, vH)
    drawHand(ctx, landmarks, toX, toY)

    // Strum detection: track wrist (landmark 0) vertical velocity
    const wristY = landmarks[0].y  // 0=top, 1=bottom in normalized coords
    const now = Date.now()

    if (prevYRef.current !== null) {
      const velocity = wristY - prevYRef.current // positive = moving down

      if (
        Math.abs(velocity) > VELOCITY_THRESHOLD &&
        now - lastStrumRef.current > DEBOUNCE_MS
      ) {
        lastStrumRef.current = now
        prevYRef.current = null // reset buffer after strum
        const dir: StrokeDir = velocity > 0 ? "D" : "U"

        setStrokeDir(dir)
        setStrokeCount((c) => c + 1)
        onStrumRef.current?.()
        setTimeout(() => setStrokeDir(null), 700)
        return
      }
    }

    prevYRef.current = wristY
  }, [drawHand, coverTransform])

  const start = useCallback(async () => {
    setStatus("loading")
    setErrorMsg(null)
    activeRef.current = true
    try {
      // Load MediaPipe scripts from CDN
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js")
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js")

      const video = videoRef.current
      if (!video || !activeRef.current) return

      // Initialise MediaPipe Hands
      const hands = new (window as any).Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      })
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.5,
      })
      hands.onResults(onResults)
      handsRef.current = hands

      // Initialise Camera utility (handles getUserMedia + frame loop)
      const camera = new (window as any).Camera(video, {
        onFrame: async () => {
          // Guard: do not send if WASM object has been closed
          if (!activeRef.current) return
          try {
            await hands.send({ image: video })
          } catch (_) {
            // WASM object may have been deleted mid-flight — ignore
          }
        },
        width: 640,
        height: 480,
      })
      cameraRef.current = camera
      camera.start()

      if (activeRef.current) setStatus("running")
    } catch (err) {
      console.error("HandDetector error:", err)
      if (activeRef.current) {
        setErrorMsg("Could not start camera. Please allow camera access and try again.")
        setStatus("error")
      }
    }
  }, [onResults])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Set flag first so any in-flight onFrame/onResults bails out immediately
      activeRef.current = false
      try { cameraRef.current?.stop() } catch (_) {}
      // Delay close slightly to let any in-flight hands.send() resolve before WASM teardown
      const h = handsRef.current
      if (h) setTimeout(() => { try { h.close() } catch (_) {} }, 200)
    }
  }, [])

  return (
    <div className={`bg-[#1A1A2E] rounded-3xl p-6 md:p-8 ${className ?? ""}`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <p className="font-sans text-white/40 text-xs uppercase tracking-widest">
          Camera · Hand Detection
        </p>
        {status === "running" && (
          <span
            className={`flex items-center gap-1.5 font-sans text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
              handDetected
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                handDetected ? "bg-emerald-400 animate-pulse" : "bg-red-400"
              }`}
            />
            {handDetected ? "Hand detected" : "No hand"}
          </span>
        )}
      </div>

      {/* Video + Canvas */}
      <div className="relative rounded-2xl overflow-hidden bg-black/50 mb-5" style={{ aspectRatio: "4/3" }}>
        {/* Mirror both video and canvas so it feels like looking in a mirror */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ transform: "scaleX(-1)" }}
        />

        {/* Overlay for non-running states */}
        {status !== "running" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 text-center px-6">
            {status === "idle" && (
              <>
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-3xl">
                  📷
                </div>
                <div>
                  <p className="font-sans text-white font-semibold mb-1">Enable camera</p>
                  <p className="font-sans text-white/40 text-xs max-w-xs">
                    Detects your strumming hand in real time.
                    All processing is local — nothing leaves your device.
                  </p>
                </div>
                <button
                  onClick={start}
                  className="font-sans text-sm font-semibold px-7 py-2.5 bg-[#E9A825] text-[#1A1A2E] rounded-full hover:bg-[#d99b20] transition-colors"
                >
                  Start camera
                </button>
              </>
            )}

            {status === "loading" && (
              <>
                <div className="w-8 h-8 border-2 border-[#E9A825] border-t-transparent rounded-full animate-spin" />
                <p className="font-sans text-white/60 text-sm">Loading hand model…</p>
              </>
            )}

            {status === "error" && (
              <>
                <span className="text-3xl">⚠️</span>
                <p className="font-sans text-red-400 text-sm">{errorMsg}</p>
                <button
                  onClick={start}
                  className="font-sans text-xs text-white/50 underline hover:text-white/80 transition-colors"
                >
                  Try again
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Detection output — only shown when running */}
      {status === "running" && (
        <div className="grid grid-cols-2 gap-3">
          {/* Last strum direction */}
          <div className="bg-white/5 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[110px] gap-1">
            <p className="font-sans text-white/30 text-[10px] uppercase tracking-widest">
              Last strum
            </p>
            {strokeDir ? (
              <>
                <span
                  className={`text-[56px] font-bold leading-none transition-all duration-100 ${
                    strokeDir === "D" ? "text-[#E9A825]" : "text-white"
                  }`}
                  style={{ animation: "pop 0.15s ease-out" }}
                >
                  {strokeDir === "D" ? "↓" : "↑"}
                </span>
                <span
                  className={`font-sans text-xs font-semibold ${
                    strokeDir === "D" ? "text-[#E9A825]" : "text-white/70"
                  }`}
                >
                  {strokeDir === "D" ? "Down" : "Up"}
                </span>
              </>
            ) : (
              <span className="text-4xl text-white/10 select-none">—</span>
            )}
          </div>

          {/* Stroke counter */}
          <div className="bg-white/5 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[110px] gap-1">
            <p className="font-sans text-white/30 text-[10px] uppercase tracking-widest">
              Strokes
            </p>
            <span className="font-serif text-[56px] text-white leading-none">
              {strokeCount}
            </span>
            {strokeCount > 0 && (
              <button
                onClick={() => setStrokeCount(0)}
                className="font-sans text-[10px] text-white/25 hover:text-white/50 transition-colors"
              >
                reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* CSS keyframe for pop animation */}
      <style>{`
        @keyframes pop {
          0% { transform: scale(0.7); opacity: 0.5; }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
