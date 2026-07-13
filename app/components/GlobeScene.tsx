'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

function fibonacciSphere(n: number): number[] {
  const positions: number[] = []
  const phi = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = phi * i
    positions.push(r * Math.cos(theta), y, r * Math.sin(theta))
  }
  return positions
}

function createArc(
  start: THREE.Vector3,
  end: THREE.Vector3,
  lift = 0.28
): THREE.BufferGeometry {
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
  mid.normalize().multiplyScalar(1 + lift)
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
  return new THREE.BufferGeometry().setFromPoints(curve.getPoints(24))
}

export default function GlobeScene() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    let W = container.clientWidth
    let H = container.clientHeight

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    /* ── Scene / Camera ── */
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100)
    camera.position.set(0, 0.15, 3.8)

    /* ── Group (everything rotates together) ── */
    const group = new THREE.Group()
    group.rotation.x = 0.18
    scene.add(group)

    /* ── Wireframe sphere ── */
    const sphereGeo = new THREE.SphereGeometry(1, 36, 36)
    group.add(new THREE.Mesh(
      sphereGeo,
      new THREE.MeshBasicMaterial({ color: 0xe03030, wireframe: true, transparent: true, opacity: 0.07 })
    ))

    /* ── Surface dots (Fibonacci distribution) ── */
    const DOT_COUNT = 500
    const rawPos = fibonacciSphere(DOT_COUNT)
    const dotGeo = new THREE.BufferGeometry()
    dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(rawPos, 3))
    group.add(new THREE.Points(
      dotGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.016, transparent: true, opacity: 0.65, sizeAttenuation: true })
    ))

    /* ── Connection arcs ── */
    const pts3d: THREE.Vector3[] = []
    for (let i = 0; i < DOT_COUNT; i++) {
      pts3d.push(new THREE.Vector3(rawPos[i * 3], rawPos[i * 3 + 1], rawPos[i * 3 + 2]))
    }
    const arcMat = new THREE.LineBasicMaterial({ color: 0xe03030, transparent: true, opacity: 0.28 })
    // Pick ~60 random arcs between points within distance threshold
    let arcsAdded = 0
    for (let i = 0; i < pts3d.length && arcsAdded < 60; i += 2) {
      for (let j = i + 3; j < pts3d.length && arcsAdded < 60; j += 3) {
        const dist = pts3d[i].distanceTo(pts3d[j])
        if (dist > 0.55 && dist < 1.1) {
          group.add(new THREE.Line(createArc(pts3d[i], pts3d[j]), arcMat))
          arcsAdded++
        }
      }
    }

    /* ── Saturn rings ── */
    const RING_TILT = Math.PI / 2.6

    const makeRing = (inner: number, outer: number, color: number, opacity: number) => {
      const geo = new THREE.RingGeometry(inner, outer, 96)
      const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.rotation.x = RING_TILT
      group.add(mesh)
    }

    makeRing(1.42, 1.72, 0xe03030, 0.13)   // main red ring
    makeRing(1.80, 1.90, 0xff6060, 0.07)   // mid thin ring
    makeRing(1.98, 2.18, 0xffffff, 0.04)   // outer white ring

    // Ring particle band
    const ringParticleGeo = new THREE.BufferGeometry()
    const rPos: number[] = []
    for (let i = 0; i < 1800; i++) {
      const r = 1.42 + Math.random() * 0.76
      const angle = Math.random() * Math.PI * 2
      rPos.push(r * Math.cos(angle), 0, r * Math.sin(angle))
    }
    ringParticleGeo.setAttribute('position', new THREE.Float32BufferAttribute(rPos, 3))
    const ringParticleMesh = new THREE.Points(
      ringParticleGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.008, transparent: true, opacity: 0.3 })
    )
    ringParticleMesh.rotation.x = RING_TILT
    group.add(ringParticleMesh)

    /* ── Ambient glow (additive sprite) ── */
    const glowCanvas = document.createElement('canvas')
    glowCanvas.width = 256; glowCanvas.height = 256
    const gCtx = glowCanvas.getContext('2d')!
    const grad = gCtx.createRadialGradient(128, 128, 0, 128, 128, 128)
    grad.addColorStop(0, 'rgba(224,48,48,0.18)')
    grad.addColorStop(1, 'rgba(224,48,48,0)')
    gCtx.fillStyle = grad
    gCtx.fillRect(0, 0, 256, 256)
    const glowTex = new THREE.CanvasTexture(glowCanvas)
    const glowSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
    )
    glowSprite.scale.set(5, 5, 1)
    scene.add(glowSprite)

    /* ── Resize handler ── */
    const onResize = () => {
      W = container.clientWidth
      H = container.clientHeight
      camera.aspect = W / H
      camera.updateProjectionMatrix()
      renderer.setSize(W, H)
    }
    window.addEventListener('resize', onResize)

    /* ── Mouse parallax ── */
    const mouse = { x: 0, y: 0 }
    const onMouse = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouse)

    /* ── Animate ── */
    let raf: number
    const clock = new THREE.Clock()
    const animate = () => {
      raf = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      group.rotation.y = t * 0.12 + mouse.x * 0.15
      group.rotation.x = 0.18 + mouse.y * -0.08
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouse)
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
}
