'use client'

import { useEffect, useRef, useState } from 'react'
import { Application } from '@splinetool/runtime'

export default function SplineHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const app = new Application(canvas)
    app
      .load('https://prod.spline.design/pBrJCgVmrYlXdQGy/scene.splinecode')
      .then(() => setReady(true))
      .catch(() => {})

    return () => {
      try { app.dispose() } catch { /* ignore */ }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        opacity: ready ? 1 : 0,
        transition: 'opacity 1.4s ease',
        display: 'block',
      }}
    />
  )
}
