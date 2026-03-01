'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface WebGLSceneProps {
  variant?: 'particles' | 'sphere' | 'grid'
  className?: string
}

export default function WebGLScene({ variant = 'particles', className = '' }: WebGLSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5

    const mouse = { x: 0, y: 0 }
    const targetMouse = { x: 0, y: 0 }

    let mainMesh: THREE.Mesh | THREE.Points

    if (variant === 'particles') {
      // Particle field — lusion.co style
      const count = 2000
      const positions = new Float32Array(count * 3)
      const colors = new Float32Array(count * 3)
      const sizes = new Float32Array(count)

      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10

        // Brand colors: indigo/cyan mix
        const t = Math.random()
        colors[i * 3] = t < 0.5 ? 0.39 : 0.13       // R
        colors[i * 3 + 1] = t < 0.5 ? 0.40 : 0.83   // G
        colors[i * 3 + 2] = t < 0.5 ? 0.95 : 0.93   // B

        sizes[i] = Math.random() * 2.5 + 0.5
      }

      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

      const mat = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
      })

      mainMesh = new THREE.Points(geo, mat)
      scene.add(mainMesh)

    } else if (variant === 'sphere') {
      // Morphing icosahedron — signature 3D shape
      const geo = new THREE.IcosahedronGeometry(2, 8)
      const mat = new THREE.MeshPhongMaterial({
        color: 0x6366f1,
        wireframe: true,
        transparent: true,
        opacity: 0.15,
        emissive: 0x6366f1,
        emissiveIntensity: 0.3,
      })
      mainMesh = new THREE.Mesh(geo, mat)
      scene.add(mainMesh)

      // Inner solid sphere
      const innerGeo = new THREE.IcosahedronGeometry(1.6, 4)
      const innerMat = new THREE.MeshPhongMaterial({
        color: 0x22d3ee,
        wireframe: true,
        transparent: true,
        opacity: 0.08,
      })
      const inner = new THREE.Mesh(innerGeo, innerMat)
      scene.add(inner)

      // Lights
      const ambient = new THREE.AmbientLight(0xffffff, 0.3)
      scene.add(ambient)
      const point1 = new THREE.PointLight(0x6366f1, 2, 20)
      point1.position.set(5, 5, 5)
      scene.add(point1)
      const point2 = new THREE.PointLight(0x22d3ee, 2, 20)
      point2.position.set(-5, -5, 5)
      scene.add(point2)

    } else if (variant === 'grid') {
      // Perspective grid plane — like Matrix/dogstudio aesthetic
      const geo = new THREE.PlaneGeometry(30, 30, 30, 30)
      const mat = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      })
      mainMesh = new THREE.Mesh(geo, mat)
      mainMesh.rotation.x = -Math.PI / 2.8
      mainMesh.position.y = -3
      scene.add(mainMesh)
    }

    // Torus ring accent for all variants
    const torusGeo = new THREE.TorusGeometry(3.5, 0.008, 3, 200)
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.18,
    })
    const torus = new THREE.Mesh(torusGeo, torusMat)
    torus.rotation.x = Math.PI / 4
    scene.add(torus)

    const torus2 = new THREE.Mesh(
      new THREE.TorusGeometry(4.5, 0.005, 3, 200),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.1 })
    )
    torus2.rotation.x = -Math.PI / 3
    torus2.rotation.y = Math.PI / 6
    scene.add(torus2)

    // Mouse tracking
    const onMouseMove = (e: MouseEvent) => {
      targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      targetMouse.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    // Resize handler
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    // Animation loop
    let t = 0
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      t += 0.005

      // Smooth mouse follow
      mouse.x += (targetMouse.x - mouse.x) * 0.04
      mouse.y += (targetMouse.y - mouse.y) * 0.04

      if (mainMesh) {
        mainMesh.rotation.y = t * 0.2 + mouse.x * 0.3
        mainMesh.rotation.x = t * 0.1 + mouse.y * 0.2

        if (variant === 'sphere') {
          // Breathing scale effect
          const scale = 1 + Math.sin(t * 1.5) * 0.03
          mainMesh.scale.setScalar(scale)
        }
      }

      torus.rotation.y = t * 0.15 + mouse.x * 0.1
      torus.rotation.z = t * 0.08
      torus2.rotation.x = -Math.PI / 3 + mouse.y * 0.1
      torus2.rotation.y = t * 0.12

      // Gentle camera drift
      camera.position.x = Math.sin(t * 0.3) * 0.3 + mouse.x * 0.5
      camera.position.y = Math.cos(t * 0.2) * 0.2 + mouse.y * 0.5
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
    }
  }, [variant])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  )
}
