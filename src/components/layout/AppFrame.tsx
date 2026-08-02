"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { SidebarResizer } from "@/components/layout/SidebarResizer"

const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`

export function AppFrame({
  sidebarLeft,
  mobileTitle,
  children,
}: {
  sidebarLeft: React.ReactNode
  mobileTitle: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft"
        >
          <Menu size={18} />
        </button>
        <span className="text-sm font-semibold text-ink">{mobileTitle}</span>
        <ThemeToggle />
      </header>

      <div className="mx-auto flex w-full max-w-[1480px]">
        <aside className="sidebar-w relative sticky top-0 hidden h-screen shrink-0 overflow-y-auto border-r border-line lg:block">
          {sidebarLeft}
          <SidebarResizer />
        </aside>

        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-[280px] overflow-y-auto border-r border-line bg-canvas">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft"
              >
                <X size={18} />
              </button>
              {sidebarLeft}
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </>
  )
}
