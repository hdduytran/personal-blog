"use client"

import { useEffect, useRef } from "react"

const MIN = 200
const MAX = 420
const STORAGE_KEY = "sidebar-width"

export function SidebarResizer() {
  const dragging = useRef(false)
  const asideLeft = useRef(0)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const w = parseInt(stored, 10)
      if (!isNaN(w) && w >= MIN && w <= MAX) {
        document.documentElement.style.setProperty("--sidebar-w", `${w}px`)
      }
    }
  }, [])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      const w = Math.min(MAX, Math.max(MIN, e.clientX - asideLeft.current))
      document.documentElement.style.setProperty("--sidebar-w", `${w}px`)
    }
    const onUp = () => {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      const w =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sidebar-w")) || MIN
      localStorage.setItem(STORAGE_KEY, String(Math.round(w)))
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
  }, [])

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      className="absolute right-0 top-0 z-10 h-full w-1 cursor-col-resize bg-transparent transition-colors hover:bg-accent/40"
      onPointerDown={(e) => {
        const aside = e.currentTarget.parentElement
        if (!aside) return
        dragging.current = true
        asideLeft.current = aside.getBoundingClientRect().left
        e.preventDefault()
        document.body.style.cursor = "col-resize"
        document.body.style.userSelect = "none"
      }}
    />
  )
}
