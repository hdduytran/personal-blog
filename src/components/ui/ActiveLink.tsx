"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function ActiveLink({
  href,
  children,
  className = "",
  exact = false,
  style,
}: {
  href: string
  children: React.ReactNode
  className?: string
  exact?: boolean
  style?: React.CSSProperties
}) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/")
  return (
    <Link
      href={href}
      style={style}
      className={`${className} ${isActive ? "bg-hover text-ink font-medium" : "text-ink-soft hover:bg-hover hover:text-ink"}`}
    >
      {children}
    </Link>
  )
}
