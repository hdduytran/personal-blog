"use client"

import { useEffect, useState } from "react"
import { Link2, Check } from "lucide-react"
import { XIcon, FacebookIcon, LinkedinIcon } from "@/components/ui/brand-icons"

export function SocialShare({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)
  const [url, setUrl] = useState("")

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(window.location.href)
  }, [])

  const encoded = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  function copy() {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const links = [
    { href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`, label: "Share on X", icon: <XIcon size={16} /> },
    { href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`, label: "Share on Facebook", icon: <FacebookIcon size={16} /> },
    { href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`, label: "Share on LinkedIn", icon: <LinkedinIcon size={16} /> },
  ]

  return (
    <div className="flex items-center gap-2">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.label}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:bg-hover hover:text-ink"
        >
          {l.icon}
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        aria-label="Copy link"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:bg-hover hover:text-ink"
      >
        {copied ? <Check size={16} /> : <Link2 size={16} />}
      </button>
    </div>
  )
}
