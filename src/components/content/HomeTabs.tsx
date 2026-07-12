"use client"

import { useState } from "react"

export function HomeTabs({
  activity,
  articles,
  notes,
}: {
  activity: React.ReactNode
  articles: React.ReactNode
  notes: React.ReactNode
}) {
  const [tab, setTab] = useState<"activity" | "articles" | "notes">("activity")
  const tabs = [
    { key: "activity", label: "Activity" },
    { key: "articles", label: "Articles" },
    { key: "notes", label: "Notes" },
  ] as const

  return (
    <div>
      <div className="mb-6 flex gap-1 border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-accent text-ink"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className={tab === "activity" ? "block" : "hidden"}>{activity}</div>
      <div className={tab === "articles" ? "block" : "hidden"}>
        <div className="space-y-4">{articles}</div>
      </div>
      <div className={tab === "notes" ? "block" : "hidden"}>
        <div className="space-y-4">{notes}</div>
      </div>
    </div>
  )
}
