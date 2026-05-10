"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Link from "next/link"

// Yele Logo Component
function YeleLogo({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <svg width="91" height="52" viewBox="0 0 91 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.50518 24.7169L5.05111 22.6134C5.56277 22.1906 6.16821 21.8955 6.81722 21.7524L13.4714 20.2859C14.3985 20.0816 15.3678 20.1977 16.2199 20.6153L19.7984 22.3687C21.439 23.1727 22.3652 24.9454 22.0852 26.7455L21.5466 30.2072C21.364 31.3811 21.693 32.5769 22.451 33.4939L24.1471 35.5459C24.916 36.4763 25.243 37.6928 25.0435 38.8815L23.6756 47.0332C23.3611 48.9076 21.8133 50.3324 19.9131 50.4968L9.78582 51.3731C8.22894 51.5078 6.7266 50.7663 5.8908 49.4506L1.14831 41.9854C0.533165 41.0171 0.345492 39.8391 0.629462 38.7286L1.64809 34.745C1.78609 34.2054 1.8141 33.6436 1.73045 33.093L1.03995 28.5474C0.820528 27.1029 1.3765 25.6495 2.50518 24.7169Z" fill="#1E50CB" />
        <path d="M14.9036 31.2609C14.9036 33.5619 15.1222 35.8021 12.8128 35.8021C10.5034 35.8021 7.58591 33.5619 7.58591 31.2609C7.58591 28.9599 10.5034 27.4696 12.8128 27.4696C15.1222 27.4696 14.9036 28.9599 14.9036 31.2609Z" fill="#081B4A" />
        <path d="M14.957 45.3302C17.2098 44.8239 19.4513 44.5434 18.9431 42.2989C18.5416 43.0931 17.2098 43.6261 14.957 44.1324C12.7042 44.6387 12.2692 45.1346 10.785 44.1324C11.2932 46.377 12.7042 45.8365 14.957 45.3302Z" fill="#081B4A" />
        <path d="M11.0993 36.8593L3.71904 1.65186C3.59642 1.06695 4.34333 0.828434 4.94096 0.828434L4.97287 0.828434L6.09109 0.828434C6.4845 0.542651 7.04422 0.322162 7.3491 0.700962C7.42952 0.800872 7.48765 0.920293 7.51521 1.05252L14.8618 36.2899C14.9697 36.8072 14.5733 37.2926 14.043 37.2926H13.8582L6.09109 0.828434L4.97287 0.828434L12.5201 37.2926L12.3742 37.3873C11.8811 37.707 11.2196 37.4331 11.0993 36.8593Z" fill="#D3462A" />
        <path d="M46.0271 40.9849C44.2827 45.5908 40.7066 48.6034 36.52 48.6034C33.9034 48.6034 31.0542 47.4157 30.7634 44.9245C31.5484 43.4182 33.4673 41.5643 35.0954 40.7822C33.7871 40.3766 33.1475 39.3048 33.1475 37.9723C33.1475 36.7847 33.9325 34.9597 34.6884 33.1347C35.4152 31.4257 36.113 29.7166 36.113 28.5579C36.113 28.0654 35.9095 27.9206 35.6187 27.9206C35.2989 27.9206 34.7465 28.0654 34.4558 28.2392L34.3976 28.1813L34.5139 27.573C35.328 27.0805 36.6363 26.5881 37.9155 26.5881C39.7763 26.5881 40.6775 27.573 40.6775 29.2241C40.6775 30.2959 40.067 31.9471 39.4564 33.5693C38.7587 35.3073 38.0609 36.9874 38.0609 37.9723C38.0609 38.6096 38.3807 38.8993 38.8168 38.8993C39.5146 38.8993 40.445 37.9434 41.5498 36.1474C42.7708 34.0907 44.2245 30.9332 45.6491 26.7909C47.0737 27.0805 49.0798 27.8337 49.923 28.9055C49.3996 30.5566 47.2191 37.7985 46.0271 40.9849ZM34.8919 43.2734C34.8919 45.4459 36.2583 47.7054 38.497 47.7054C39.5437 47.7054 40.5031 45.1563 41.4916 42.1436C42.3347 39.3917 43.1779 36.2053 43.9047 34.2065L43.3814 34.2934C42.9744 35.0466 42.5673 35.7708 42.1312 36.466C40.5612 38.9572 38.6133 40.956 36.3165 40.956C36.0839 40.956 35.8804 40.927 35.6769 40.898C35.2117 41.6222 34.8919 42.4623 34.8919 43.2734Z" fill="#1E50CB" />
        <path d="M59.4248 27.4571C57.3897 27.4571 55.5871 31.6284 55.5871 35.8867C55.5871 38.3199 56.6919 39.9711 58.9015 39.9711C61.3728 39.9711 63.9603 38.5806 65.9664 36.3212L66.0827 36.3791V37.1033C63.4661 39.8552 59.5993 41.825 56.1686 41.825C52.5634 41.825 50.6446 39.7973 50.6446 36.4081C50.6446 31.4257 54.5986 26.5881 59.7737 26.5881C62.5066 26.5881 64.1347 27.6309 64.1347 29.6007C64.1347 32.1788 60.6168 34.3514 56.1976 35.1045L56.0232 34.728C58.3491 33.5403 60.3552 31.0201 60.3552 28.7606C60.3552 27.8627 60.0935 27.4571 59.4248 27.4571Z" fill="#1E50CB" />
        <path d="M75.1259 38.233C73.178 40.2608 70.4451 41.825 68.5844 41.825C66.6655 41.825 65.2991 40.5794 65.2991 37.9723C65.2991 30.5566 69.0786 19.6359 76.8994 19.6359C79.08 19.6359 80.5627 20.418 80.5627 21.8953C80.5627 23.6913 78.7892 24.9949 76.7541 26.4722C74.8934 27.8047 72.6256 29.2821 70.9684 31.4257C70.4451 33.9458 69.9799 36.9005 69.9799 39.16C69.9799 39.8842 70.009 40.2897 70.1544 40.7242C71.579 40.2897 73.6432 38.8703 75.0387 37.4509L75.1259 37.5378V38.233ZM75.6493 20.3311C74.2247 20.3311 72.5965 24.2127 71.2591 30.209C72.4221 28.8476 73.6432 27.8916 74.6317 26.8778C75.7365 25.748 76.6668 24.4155 76.6668 22.4457C76.6668 20.9394 76.2598 20.3311 75.6493 20.3311Z" fill="#1E50CB" />
        <path d="M83.8421 27.4571C81.807 27.4571 80.0044 31.6284 80.0044 35.8867C80.0044 38.3199 81.1092 39.9711 83.3188 39.9711C85.7901 39.9711 88.3776 38.5806 90.3837 36.3212L90.5 36.3791V37.1033C87.8834 39.8552 84.0166 41.825 80.5859 41.825C76.9808 41.825 75.0619 39.7973 75.0619 36.4081C75.0619 31.4257 79.0159 26.5881 84.191 26.5881C86.9239 26.5881 88.5521 27.6309 88.5521 29.6007C88.5521 32.1788 85.0342 34.3514 80.615 35.1045L80.4405 34.728C82.7664 33.5403 84.7725 31.0201 84.7725 28.7606C84.7725 27.8627 84.5108 27.4571 83.8421 27.4571Z" fill="#1E50CB" />
      </svg>
    </div>
  )
}

// Live Feedback Icon Component
function LiveFeedbackIcon() {
  return (
    <div className="w-16 h-16 rounded-full border border-[#3B1D0C] flex items-center justify-center">
      <svg width="30" height="30" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.87 15L8 14.5L10 11H13C13.2652 11 13.5196 10.8946 13.7071 10.7071C13.8946 10.5196 14 10.2652 14 10V4C14 3.73478 13.8946 3.48043 13.7071 3.29289C13.5196 3.10536 13.2652 3 13 3H3C2.73478 3 2.48043 3.10536 2.29289 3.29289C2.10536 3.48043 2 3.73478 2 4V10C2 10.2652 2.10536 10.5196 2.29289 10.7071C2.48043 10.8946 2.73478 11 3 11H7.5V12H3C2.46957 12 1.96086 11.7893 1.58579 11.4142C1.21071 11.0391 1 10.5304 1 10V4C1 3.46957 1.21071 2.96086 1.58579 2.58579C1.96086 2.21071 2.46957 2 3 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V10C15 10.5304 14.7893 11.0391 14.4142 11.4142C14.0391 11.7893 13.5304 12 13 12H10.58L8.87 15Z" fill="#3B1D0C" />
        <path d="M4 5H12V6H4V5ZM4 8H9V9H4V8Z" fill="#3B1D0C" />
      </svg>
    </div>
  )
}

// Chord Library Icon Component
function ChordLibraryIcon() {
  return (
    <div className="w-16 h-16 rounded-full border border-[#3B1D0C] flex items-center justify-center">
      <svg width="30" height="30" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.75 11.625V3.75C12.75 3.75 15 4.5 15 6.75M9.75 4.5H3M9.75 7.5H3M6 10.5H3M12.75 12.3C12.75 13.2945 11.7427 14.1 10.5 14.1C9.25725 14.1 8.25 13.2937 8.25 12.3C8.25 11.3062 9.25725 10.5 10.5 10.5C11.7427 10.5 12.75 11.3062 12.75 12.3Z" stroke="#3B1D0C" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// Song Tutorials Icon Component
function SongTutorialsIcon() {
  return (
    <div className="w-16 h-16 rounded-full border border-[#3B1D0C] flex items-center justify-center">
      <svg width="30" height="28" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_128_16)">
          <path d="M5.75994 12.6955V2.77879L10.0799 2.125M15.1199 7.73713V11.2788M15.1199 11.9871C15.1199 12.5507 14.8924 13.0912 14.4873 13.4897C14.0822 13.8882 13.5328 14.1121 12.9599 14.1121C12.3871 14.1121 11.8377 13.8882 11.4326 13.4897C11.0275 13.0912 10.7999 12.5507 10.7999 11.9871C10.7999 11.4235 11.0275 10.883 11.4326 10.4845C11.8377 10.086 12.3871 9.86213 12.9599 9.86213C13.5328 9.86213 14.0822 10.086 14.4873 10.4845C14.8924 10.883 15.1199 11.4235 15.1199 11.9871ZM5.75994 13.4038C5.75994 13.9674 5.53237 14.5079 5.12729 14.9064C4.72221 15.3049 4.17281 15.5288 3.59994 15.5288C3.02707 15.5288 2.47767 15.3049 2.07259 14.9064C1.66751 14.5079 1.43994 13.9674 1.43994 13.4038C1.43994 12.8402 1.66751 12.2997 2.07259 11.9012C2.47767 11.5027 3.02707 11.2788 3.59994 11.2788C4.17281 11.2788 4.72221 11.5027 5.12729 11.9012C5.53237 12.2997 5.75994 12.8402 5.75994 13.4038Z" stroke="#3B1D0C" strokeLinecap="square" />
          <path d="M14.22 2.125L14.5944 2.99625L15.48 3.36458L14.5944 3.73292L14.22 4.60417L13.8456 3.73292L12.96 3.36458L13.8456 2.99625L14.22 2.125Z" stroke="#3B1D0C" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_128_16">
            <rect width="18" height="17" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  )
}

// Guitar SVG Component
function GuitarSVG({ width = 100, height = 190 }: { width?: number; height?: number }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 189 361"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-lg pointer-events-none"
    >
      <path d="M22.8505 176.149L39.5569 160.698C42.9144 157.593 46.9638 155.333 51.3693 154.106L96.5378 141.521C102.831 139.767 109.534 140.208 115.544 142.77L140.782 153.531C152.354 158.465 159.378 170.344 158.126 182.861L155.717 206.931C154.9 215.093 157.607 223.216 163.156 229.257L175.574 242.777C181.204 248.906 183.904 257.173 182.977 265.443L176.62 322.161C175.158 335.202 165.056 345.602 152.062 347.442L82.8127 357.248C72.1668 358.755 61.5688 354.201 55.336 345.44L19.9696 295.726C15.3822 289.278 13.6535 281.225 15.1902 273.462L20.7025 245.616C21.4493 241.843 21.4322 237.959 20.6521 234.193L14.2128 203.107C12.1665 193.228 15.444 182.999 22.8505 176.149Z" fill="#1E50CB" />
      <path d="M110.471 216.665C111.329 232.531 113.667 247.897 97.8009 248.755C81.9348 249.614 61.0553 235.25 60.197 219.384C59.3388 203.518 78.8267 192.158 94.6928 191.299C110.559 190.441 109.613 200.799 110.471 216.665Z" fill="#081B4A" />
      <path d="M116.086 313.658C131.374 309.33 146.669 306.563 142.341 291.275C139.878 296.901 130.928 301.07 115.639 305.399C100.351 309.727 97.5473 313.308 86.9766 306.949C91.3051 322.238 100.798 317.987 116.086 313.658Z" fill="#081B4A" />
      <path d="M27.9974 7.62807L96.3458 259.142L95.3783 259.849C92.1102 262.237 87.4631 260.593 86.4227 256.682L22.5866 16.656C22.0267 14.5509 22.7036 12.3101 24.3353 10.8669L27.9974 7.62807ZM27.9974 7.62807L38.9141 7.03754M38.9141 7.03754L105.539 258.644L106.808 258.576C110.451 258.378 112.994 254.884 112.06 251.357L48.4436 11.1125C47.7456 8.47654 45.2933 6.69247 42.5705 6.83975L38.9141 7.03754Z" stroke="#D3462A" strokeWidth="2.69277" />
    </svg>
  )
}

export default function Home() {
  const [guitarPos, setGuitarPos] = useState({ x: 320, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const blobContainerRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ x: 0, y: 0, guitarX: 0, guitarY: 0 })

  const guitarWidth = 140
  const guitarHeight = 266

  // Handle mouse/touch events for dragging guitar across entire blob section
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      guitarX: guitarPos.x,
      guitarY: guitarPos.y
    }
  }, [guitarPos])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    setIsDragging(true)
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      guitarX: guitarPos.x,
      guitarY: guitarPos.y
    }
  }, [guitarPos])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !blobContainerRef.current) return

      const containerRect = blobContainerRef.current.getBoundingClientRect()
      const deltaX = e.clientX - dragStartRef.current.x
      const deltaY = e.clientY - dragStartRef.current.y

      const newX = dragStartRef.current.guitarX + deltaX
      const newY = dragStartRef.current.guitarY + deltaY

      // Allow movement across entire blob container width
      const maxX = containerRect.width - guitarWidth + 20
      const maxY = containerRect.height - guitarHeight + 40

      const constrainedX = Math.max(-40, Math.min(maxX, newX))
      const constrainedY = Math.max(-50, Math.min(maxY, newY))

      setGuitarPos({ x: constrainedX, y: constrainedY })
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !blobContainerRef.current) return

      const touch = e.touches[0]
      const containerRect = blobContainerRef.current.getBoundingClientRect()
      const deltaX = touch.clientX - dragStartRef.current.x
      const deltaY = touch.clientY - dragStartRef.current.y

      const newX = dragStartRef.current.guitarX + deltaX
      const newY = dragStartRef.current.guitarY + deltaY

      const maxX = containerRect.width - guitarWidth + 20
      const maxY = containerRect.height - guitarHeight + 40

      const constrainedX = Math.max(-40, Math.min(maxX, newX))
      const constrainedY = Math.max(-50, Math.min(maxY, newY))

      setGuitarPos({ x: constrainedX, y: constrainedY })
    }

    const handleEnd = () => setIsDragging(false)

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleEnd)
      window.addEventListener("touchmove", handleTouchMove, { passive: false })
      window.addEventListener("touchend", handleEnd)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleEnd)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleEnd)
    }
  }, [isDragging])

  // Generate blob path with bulge at guitar position
  const getBlobPath = useCallback(() => {
    const w = 1200
    const h = 400

    // Get normalized position of guitar within blob section
    const containerWidth = blobContainerRef.current?.offsetWidth || 1200
    const containerHeight = blobContainerRef.current?.offsetHeight || 400

    // Calculate actual guitar center position relative to blob
    const guitarCenterX = guitarPos.x + guitarWidth / 2
    const guitarCenterY = guitarPos.y + guitarHeight / 2 + 48 // account for padding

    const gx = Math.max(0, Math.min(1, guitarCenterX / containerWidth))
    const gy = Math.max(0, Math.min(1, guitarCenterY / containerHeight))

    // Bulge parameters
    const bulgeSize = 50
    const bulgeInfluence = 0.25

    // Calculate bulge on each edge based on guitar proximity
    const leftBulge = gx < bulgeInfluence ? (1 - gx / bulgeInfluence) * bulgeSize : 0
    const rightBulge = gx > (1 - bulgeInfluence) ? ((gx - (1 - bulgeInfluence)) / bulgeInfluence) * bulgeSize : 0
    const topBulge = gy < bulgeInfluence ? (1 - gy / bulgeInfluence) * bulgeSize : 0
    const bottomBulge = gy > (1 - bulgeInfluence) ? ((gy - (1 - bulgeInfluence)) / bulgeInfluence) * bulgeSize : 0

    // Position along edges where bulge should be
    const leftBulgeY = h * gy
    const rightBulgeY = h * gy
    const topBulgeX = w * gx
    const bottomBulgeX = w * gx

    // Corner radius
    const cr = 50

    // Build path with potential bulges on each edge
    let path = `M ${cr},0 `

    // Top edge with potential bulge
    if (topBulge > 0) {
      const bx = Math.max(cr + 40, Math.min(w - cr - 40, topBulgeX))
      path += `L ${bx - 60},0 `
      path += `C ${bx - 30},0 ${bx - 15},${-topBulge} ${bx},${-topBulge} `
      path += `C ${bx + 15},${-topBulge} ${bx + 30},0 ${bx + 60},0 `
      path += `L ${w - cr},0 `
    } else {
      path += `L ${w - cr},0 `
    }

    // Top-right corner
    path += `Q ${w},0 ${w},${cr} `

    // Right edge with potential bulge
    if (rightBulge > 0) {
      const by = Math.max(cr + 40, Math.min(h - cr - 40, rightBulgeY))
      path += `L ${w},${by - 60} `
      path += `C ${w},${by - 30} ${w + rightBulge},${by - 15} ${w + rightBulge},${by} `
      path += `C ${w + rightBulge},${by + 15} ${w},${by + 30} ${w},${by + 60} `
      path += `L ${w},${h - cr} `
    } else {
      path += `L ${w},${h - cr} `
    }

    // Bottom-right corner
    path += `Q ${w},${h} ${w - cr},${h} `

    // Bottom edge with potential bulge
    if (bottomBulge > 0) {
      const bx = Math.max(cr + 40, Math.min(w - cr - 40, bottomBulgeX))
      path += `L ${bx + 60},${h} `
      path += `C ${bx + 30},${h} ${bx + 15},${h + bottomBulge} ${bx},${h + bottomBulge} `
      path += `C ${bx - 15},${h + bottomBulge} ${bx - 30},${h} ${bx - 60},${h} `
      path += `L ${cr},${h} `
    } else {
      path += `L ${cr},${h} `
    }

    // Bottom-left corner
    path += `Q 0,${h} 0,${h - cr} `

    // Left edge with potential bulge
    if (leftBulge > 0) {
      const by = Math.max(cr + 40, Math.min(h - cr - 40, leftBulgeY))
      path += `L 0,${by + 60} `
      path += `C 0,${by + 30} ${-leftBulge},${by + 15} ${-leftBulge},${by} `
      path += `C ${-leftBulge},${by - 15} 0,${by - 30} 0,${by - 60} `
      path += `L 0,${cr} `
    } else {
      path += `L 0,${cr} `
    }

    // Top-left corner
    path += `Q 0,0 ${cr},0 `

    path += 'Z'

    return path
  }, [guitarPos])

  // Text content split into words for local displacement
  const words = "You pick a song. Any song. Yele figures out the chords, the strumming pattern, and where your fingers go. Your camera watches your hands and guides you in real time.".split(" ")

  // Refs for each word to calculate overlap
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const textAreaRef = useRef<HTMLDivElement>(null)

  // Calculate displacement for a word based on guitar proximity
  const getWordDisplacement = useCallback((wordEl: HTMLSpanElement | null) => {
    if (!wordEl || !textAreaRef.current) return { x: 0, y: 0, opacity: 1 }

    const wordRect = wordEl.getBoundingClientRect()
    const textAreaRect = textAreaRef.current.getBoundingClientRect()

    // Word center relative to text area
    const wordCenterX = wordRect.left - textAreaRect.left + wordRect.width / 2
    const wordCenterY = wordRect.top - textAreaRect.top + wordRect.height / 2

    // Guitar center relative to text area (accounting for layout offset)
    const guitarCenterX = guitarPos.x + guitarWidth / 2
    const guitarCenterY = guitarPos.y + guitarHeight / 2

    // Distance from word to guitar center
    const dx = wordCenterX - guitarCenterX
    const dy = wordCenterY - guitarCenterY
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Influence radius - words within this distance get displaced
    const influenceRadius = 120

    if (distance > influenceRadius || distance === 0) {
      return { x: 0, y: 0, opacity: 1 }
    }

    // Calculate push direction and magnitude
    const pushStrength = (1 - distance / influenceRadius) * 30
    const angle = Math.atan2(dy, dx)

    return {
      x: Math.cos(angle) * pushStrength,
      y: Math.sin(angle) * pushStrength,
      opacity: 0.85 + (distance / influenceRadius) * 0.15
    }
  }, [guitarPos])

  return (
    <div className="h-screen flex flex-col bg-[#EEF2F8] overflow-hidden">
      {/* Header */}
      <header className="pt-8 pb-4 flex justify-center shrink-0">
        <YeleLogo className="scale-[1.4] origin-center" />
      </header>

      {/* Hero + Yellow */}
      <main className="px-6 md:px-12 lg:px-20 flex-1 flex flex-col min-h-0">
        {/* Hero - fills remaining space, content vertically centered */}
        <section className="flex-1 flex flex-col justify-center text-center max-w-3xl mx-auto w-full">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-[#1A1A2E] mb-5 text-balance">
            To the lovers of strings
          </h1>
          <p className="font-sans text-lg md:text-xl leading-relaxed mb-8 text-[#4A4A5A] max-w-xl mx-auto">
            Or those who want to become one, Yele teaches you to learn by doing on any string
            instrument. Just you, your instrument, and music you actually want to make.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Link href="/songs" className="px-10 py-4 text-lg font-medium bg-[#E9A825] text-[#1A1A2E] rounded-full hover:bg-[#d99b20] transition-colors">
              Pick a song
            </Link>
            <Link href="/chords/practice" className="px-10 py-4 text-lg font-medium border-2 border-[#1A1A2E] text-[#1A1A2E] rounded-full hover:bg-[#1A1A2E] hover:text-white transition-colors">
              Learn chords
            </Link>
          </div>
        </section>

        {/* Interactive Yellow Section — fixed viewport-relative height */}
        <section
          ref={blobContainerRef}
          className="relative shrink-0 h-[38vh] min-h-[220px] mx-4 md:mx-8"
        >
          {/* Yellow Blob Background */}
          <svg
            className="absolute inset-0 w-full h-full overflow-visible"
            viewBox="0 0 1200 400"
            preserveAspectRatio="none"
            style={{ overflow: 'visible' }}
          >
            <path
              d={getBlobPath()}
              fill="#E9A825"
              className="transition-all duration-150 ease-out"
            />
          </svg>

          {/* Draggable Guitar - Can move across entire blob */}
          <div
            className="absolute cursor-grab active:cursor-grabbing select-none z-30"
            style={{
              left: guitarPos.x,
              top: guitarPos.y + 48,
              width: guitarWidth,
              height: guitarHeight,
              touchAction: 'none',
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <GuitarSVG width={guitarWidth} height={guitarHeight} />
          </div>

          {/* Content on Yellow Section */}
          <div className="relative z-10 flex flex-col px-6 md:px-8 lg:px-16 pt-12 pb-8">
            {/* Text at top */}
            <div
              ref={textAreaRef}
              className="max-w-2xl"
            >
              <p className="font-sans text-xl md:text-2xl leading-relaxed text-[#3B1D0C]">
                {words.map((word, index) => {
                  const displacement = getWordDisplacement(wordRefs.current[index])
                  return (
                    <span
                      key={index}
                      ref={(el) => { wordRefs.current[index] = el }}
                      className="inline-block transition-transform duration-75 ease-out"
                      style={{
                        transform: `translate(${displacement.x}px, ${displacement.y}px)`,
                        opacity: displacement.opacity,
                      }}
                    >
                      {word}{index < words.length - 1 ? '\u00A0' : ''}
                    </span>
                  )
                })}
              </p>
            </div>

            {/* Feature Cards - below text, positioned toward right */}
            <div className="flex flex-row items-start gap-10 md:gap-14 lg:gap-20 justify-end mt-6 md:mt-8">
              <div className="text-left">
                <div className="mb-3">
                  <LiveFeedbackIcon />
                </div>
                <h3 className="font-serif text-xl md:text-2xl text-[#3B1D0C] mb-1">Live Feedback</h3>
                <p className="font-sans text-[#3B1D0C]/70 text-lg md:text-xl">See your progress instantly</p>
              </div>

              <div className="text-left">
                <div className="mb-3">
                  <ChordLibraryIcon />
                </div>
                <h3 className="font-serif text-xl md:text-2xl text-[#3B1D0C] mb-1">Chord Library</h3>
                <p className="font-sans text-[#3B1D0C]/70 text-lg md:text-xl">All essential chords</p>
              </div>

              <div className="text-left">
                <div className="mb-3">
                  <SongTutorialsIcon />
                </div>
                <h3 className="font-serif text-xl md:text-2xl text-[#3B1D0C] mb-1">Song Tutorials</h3>
                <p className="font-sans text-[#3B1D0C]/70 text-lg md:text-xl">Progressive song tutorials</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-10 md:px-20 lg:px-28 py-6 md:py-8 flex justify-between items-center shrink-0">
        <span className="text-[#1A1A2E]/60 text-md md:text-base lg:text-lg">©2026</span>
        <a
          href="https://x.com/precioussjohn"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1A1A2E] text-md md:text-base lg:text-lg underline hover:no-underline"
        >
          Curated by Precious Inyang
        </a>
      </footer>
    </div>
  )
}
