'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    // Check if touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouchDevice) return

    const move = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`
      cursor.style.top = `${e.clientY}px`
    }

    const addHover = () => cursor.classList.add('hover')
    const removeHover = () => cursor.classList.remove('hover')
    const addClick = () => cursor.classList.add('click')
    const removeClick = () => cursor.classList.remove('click')

    window.addEventListener('mousemove', move)
    window.addEventListener('mousedown', addClick)
    window.addEventListener('mouseup', removeClick)

    // Observe hover targets
    const observer = new MutationObserver(() => {
      document.querySelectorAll('a, button, [role="button"], input, textarea, select').forEach(el => {
        el.addEventListener('mouseenter', addHover)
        el.addEventListener('mouseleave', removeHover)
      })
    })
    observer.observe(document.body, { childList: true, subtree: true })

    // Initial binding
    document.querySelectorAll('a, button, [role="button"], input, textarea, select').forEach(el => {
      el.addEventListener('mouseenter', addHover)
      el.addEventListener('mouseleave', removeHover)
    })

    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mousedown', addClick)
      window.removeEventListener('mouseup', removeClick)
      observer.disconnect()
    }
  }, [])

  return <div ref={cursorRef} className="custom-cursor" />
}
