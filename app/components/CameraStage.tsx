"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { C } from "@/app/lib/theme"

export default function CameraStage({ songTitle }: { songTitle: string }) {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isLive,   setIsLive]   = useState(false)
  const [denied,   setDenied]   = useState(false)
  const [starting, setStarting] = useState(false)

  const startCamera = useCallback(async () => {
    if (streamRef.current || starting) return
    setStarting(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
      setIsLive(true)
      setDenied(false)
    } catch {
      setDenied(true)
    } finally {
      setStarting(false)
    }
  }, [starting])

  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()) }, [])

  return (
    <div style={{ borderRadius: 24, overflow: "hidden", background: C.dark, aspectRatio: "4/3", position: "relative" }}>

      {/* Live feed */}
      <video
        ref={videoRef} playsInline muted autoPlay
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", opacity: isLive ? 1 : 0, transition: "opacity .5s ease" }}
      />

      {/* Idle state — waiting for user to tap Let's Start */}
      {!isLive && !denied && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "0 40px" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", border: "1.5px solid rgba(244,235,216,.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
              <rect x="1" y="5" width="26" height="16" rx="3" stroke="rgba(244,235,216,.55)" strokeWidth="1.5" />
              <circle cx="14" cy="13" r="4.5" stroke="rgba(244,235,216,.55)" strokeWidth="1.5" />
              <path d="M9 5V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1" stroke="rgba(244,235,216,.55)" strokeWidth="1.5" />
            </svg>
          </div>
          <p style={{ color: "rgba(244,235,216,.55)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, margin: 0 }}>
            Your Practice Mirror
          </p>
          <p style={{ color: "rgba(244,235,216,.4)", fontSize: 13, lineHeight: 1.65, textAlign: "center", maxWidth: 280, margin: 0 }}>
            Turn on your camera to watch your hands as you play along.
          </p>
          <button
            onClick={startCamera}
            disabled={starting}
            style={{ marginTop: 4, padding: "10px 22px", borderRadius: 999, background: C.lime, color: C.ink, fontWeight: 700, fontSize: 14, border: `1.5px solid ${C.ink}`, cursor: starting ? "wait" : "pointer", opacity: starting ? 0.7 : 1 }}
          >
            {starting ? "Starting…" : "Let's Start"}
          </button>
        </div>
      )}

      {/* Live HUD */}
      {isLive && (
        <>
          <div style={{ position: "absolute", inset: "13% 11%", border: "1.5px dashed rgba(244,235,216,.3)", borderRadius: 14, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 10, pointerEvents: "none" }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(244,235,216,.75)", background: "rgba(0,0,0,.35)", padding: "3px 10px", borderRadius: 999 }}>Frame your uke here</span>
          </div>
          <div style={{ position: "absolute", left: 12, top: 12, display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,.45)", padding: "5px 11px", borderRadius: 999, pointerEvents: "none" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff4b3e", animation: "blink 1.2s infinite", display: "block" }} />
            <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>Live</span>
          </div>
          {songTitle && (
            <div style={{ position: "absolute", right: 12, top: 12, background: "rgba(0,0,0,.45)", color: C.cream, fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: 999, pointerEvents: "none" }}>
              {songTitle}
            </div>
          )}
        </>
      )}

      {/* Denied state */}
      {denied && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 32, textAlign: "center", background: C.dark }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#7c715f" }}>Camera blocked</span>
          <p style={{ fontSize: 14, lineHeight: 1.5, color: "#b3a892", maxWidth: 260, margin: 0 }}>
            Allow camera access in your browser settings, then tap below.
          </p>
          <button
            onClick={() => { setDenied(false); startCamera() }}
            style={{ marginTop: 4, padding: "10px 22px", borderRadius: 999, background: C.lime, color: C.ink, fontWeight: 700, fontSize: 14, border: `1.5px solid ${C.ink}`, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
