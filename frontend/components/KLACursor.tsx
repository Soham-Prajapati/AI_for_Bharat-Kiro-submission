'use client'

import { useEffect, useRef } from 'react'

/**
 * KLACursor — dual-ring magnetic cursor.
 *
 * WHY A NEW FILE:
 * The old CustomCursor used `mix-blend-mode: difference` which silently
 * breaks on any element that has a CSS `backdrop-filter` property (all
 * glassmorphism panels). This made the cursor completely invisible over
 * most of the landing page.
 *
 * This implementation:
 * - Uses explicit, always-visible colors (no blend modes)
 * - Inner dot: snaps instantly to mouse
 * - Outer ring: follows with lerp lag for a premium feel
 * - Expands + changes color on hover over interactive elements
 * - Uses requestAnimationFrame for jank-free tracking
 * - z-index: 999999 — nothing will ever cover it
 */
export default function KLACursor({ accentColor = '#818CF8' }: { accentColor?: string }) {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const accentRef = useRef(accentColor)
  const isDarkRef = useRef(true)

  // Keep accent ref in sync so RAF loop sees updates without remounting
  useEffect(() => { accentRef.current = accentColor }, [accentColor])

  // Track dark/light mode changes
  useEffect(() => {
    const check = () => {
      isDarkRef.current = document.documentElement.classList.contains('dark')
    }
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    // Hide on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      dot.style.display = 'none'
      ring.style.display = 'none'
      return
    }

    // Hide native cursor safely via class (not body cursor:none which breaks everywhere)
    document.documentElement.classList.add('kla-cursor-active')

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let ringX = mouseX
    let ringY = mouseY
    let isHovering = false
    let isClicking = false
    let rafId: number

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const onMouseEnterInteractive = () => { isHovering = true }
    const onMouseLeaveInteractive = () => { isHovering = false }
    const onMouseDown = () => { isClicking = true }
    const onMouseUp = () => { isClicking = false }

    const bindInteractive = () => {
      document.querySelectorAll('a, button, [role="button"], input, textarea, select, [data-cursor-hover]').forEach(el => {
        el.addEventListener('mouseenter', onMouseEnterInteractive)
        el.addEventListener('mouseleave', onMouseLeaveInteractive)
      })
    }

    bindInteractive()

    // MutationObserver to bind newly added elements
    const observer = new MutationObserver(bindInteractive)
    observer.observe(document.body, { childList: true, subtree: true })

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    // RAF loop — smooth lerp for ring, instant for dot
    const animate = () => {
      rafId = requestAnimationFrame(animate)

      // Dot: snap to cursor
      dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`

      // Ring: lerp follow
      const lerp = 0.12
      ringX += (mouseX - ringX) * lerp
      ringY += (mouseY - ringY) * lerp
      ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`

      // State-based styling
      if (isClicking) {
        dot.style.transform = `translate(${mouseX - 2}px, ${mouseY - 2}px) scale(0.5)`
        ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px) scale(1.4)`
      }

      if (isHovering) {
        ring.style.width = '44px'
        ring.style.height = '44px'
        ring.style.transform = `translate(${ringX - 22}px, ${ringY - 22}px)`
        ring.style.borderColor = accentRef.current + 'dd'
        ring.style.background = accentRef.current + '14'
        dot.style.background = accentRef.current
      } else {
        const dark = isDarkRef.current
        ring.style.width = '40px'
        ring.style.height = '40px'
        ring.style.borderColor = dark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.25)'
        ring.style.background = 'transparent'
        dot.style.background = dark ? '#ffffff' : '#1f2937'
      }
    }

    animate()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      observer.disconnect()
      document.documentElement.classList.remove('kla-cursor-active')
    }
  }, [])

  return (
    <>
      {/* Outer ring — lags behind */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '1.5px solid rgba(0,0,0,0.25)',
          pointerEvents: 'none',
          zIndex: 999999,
          transition: 'width 0.2s ease, height 0.2s ease, border-color 0.2s ease, background 0.2s ease',
          willChange: 'transform',
        }}
      />
      {/* Inner dot — instant */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#1f2937',
          pointerEvents: 'none',
          zIndex: 999999,
          willChange: 'transform',
          transition: 'background 0.15s ease, transform 0.1s ease',
        }}
      />
    </>
  )
}
