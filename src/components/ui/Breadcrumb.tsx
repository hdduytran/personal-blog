import Link from "next/link"

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink-mute">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {it.href ? (
              <Link href={it.href} className="hover:text-ink">
                {it.label}
              </Link>
            ) : (
              <span className="text-ink-soft">{it.label}</span>
            )}
            {i < items.length - 1 && <span className="text-ink-mute">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
