import Link from "next/link"
import { getProfile } from "@/lib/profile"
import { getFolders } from "@/lib/folders"
import { getViews } from "@/lib/views"
import { getAllTags } from "@/lib/content"
import { ActiveLink } from "@/components/ui/ActiveLink"
import { Icon } from "@/components/ui/Icon"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-2 pt-5 text-xs font-semibold uppercase tracking-wider text-ink-mute">
      {children}
    </p>
  )
}

function NavRow({
  href,
  icon,
  label,
  badge,
  exact,
}: {
  href: string
  icon: string
  label: string
  badge?: number
  exact?: boolean
}) {
  return (
    <ActiveLink
      href={href}
      exact={exact}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
    >
      <Icon name={icon} size={18} className="shrink-0 text-ink-soft" />
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="rounded-full bg-hover px-2 py-0.5 text-xs text-ink-soft">{badge}</span>
      )}
    </ActiveLink>
  )
}

export async function SidebarLeft() {
  const profile = getProfile()
  const [folders, views, tags] = await Promise.all([getFolders(), getViews(), getAllTags()])

  const initial = profile.author_display_name.trim().charAt(0).toUpperCase() || "?"

  return (
    <nav className="flex h-full flex-col gap-1 px-2 py-5">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 pb-4">
        {profile.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar}
            alt={profile.author_name}
            className="h-12 w-12 rounded-full border border-line object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-hover text-lg font-semibold text-ink-soft">
            {initial}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{profile.author_display_name}</p>
          <Link href="/" className="truncate text-xs text-ink-mute hover:text-ink">
            {profile.blog_name}
          </Link>
        </div>
      </div>

      <NavRow href="/" icon="home" label="Home" exact />

      {views.length > 0 && (
        <>
          <SectionLabel>Views</SectionLabel>
          {views.map((v) => (
            <NavRow key={v.slug} href={`/view/${v.slug}`} icon={v.icon || "book"} label={v.name} badge={v.count} />
          ))}
        </>
      )}

      <SectionLabel>Folders</SectionLabel>
      {folders.map((f) => (
        <NavRow key={f.slug} href={`/folder/${f.slug}`} icon="folder" label={f.name} badge={f.count} />
      ))}

      {profile.sidebar_work.length > 0 && (
        <>
          <SectionLabel>Work</SectionLabel>
          {profile.sidebar_work.map((w) => (
            <NavRow key={w.label} href={w.href} icon={w.icon} label={w.label} />
          ))}
        </>
      )}

      {tags.length > 0 && (
        <>
          <SectionLabel>Tags</SectionLabel>
          <div className="flex flex-wrap gap-2 px-3 pb-3">
            {tags.map((t) => (
              <Link
                key={t}
                href={`/tag/${encodeURIComponent(t)}`}
                className="rounded-full border border-line px-2.5 py-1 text-xs text-ink-soft transition-colors hover:border-accent hover:text-accent"
              >
                #{t}
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="mt-auto flex items-center justify-between px-3 pt-5">
        <span className="text-xs text-ink-mute">© {new Date().getFullYear()}</span>
        <ThemeToggle />
      </div>
    </nav>
  )
}
