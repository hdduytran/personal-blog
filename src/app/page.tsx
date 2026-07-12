import { getProfile } from "@/lib/profile"
import { getAllPosts, getAllNotes } from "@/lib/content"
import { ArticleCard } from "@/components/content/ArticleCard"
import { NoteCard } from "@/components/content/NoteCard"
import { ActivityFeed } from "@/components/content/ActivityFeed"
import { HomeTabs } from "@/components/content/HomeTabs"
import { MainLayout } from "@/components/layout/MainLayout"
import { NewsletterBox } from "@/components/layout/NewsletterBox"
import { Icon } from "@/components/ui/Icon"

export default async function HomePage() {
  const profile = getProfile()
  const [posts, notes] = await Promise.all([getAllPosts(), getAllNotes()])

  const initial = profile.author_display_name.trim().charAt(0).toUpperCase() || "?"

  return (
    <MainLayout right={<NewsletterBox />}>
      <section className="mb-8 border-b border-line pb-8">
        <div className="flex items-center gap-4">
          {profile.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar}
              alt={profile.author_name}
              className="h-16 w-16 rounded-full border border-line object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-hover text-2xl font-semibold text-ink-soft">
              {initial}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-ink">{profile.author_display_name}</h1>
            <p className="text-sm text-ink-soft">{profile.blog_tagline}</p>
          </div>
        </div>
        {profile.social.length > 0 && (
          <div className="mt-4 flex gap-2">
            {profile.social.map((s) => (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.platform}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:bg-hover hover:text-ink"
              >
                <Icon name={s.platform} size={16} />
              </a>
            ))}
          </div>
        )}
      </section>

      <HomeTabs
        activity={<ActivityFeed posts={posts} notes={notes} />}
        articles={
          <>
            {posts.map((p) => (
              <ArticleCard key={p.slug} post={p} />
            ))}
          </>
        }
        notes={
          <>
            {notes.map((n) => (
              <NoteCard key={n.slug} note={n} />
            ))}
          </>
        }
      />
    </MainLayout>
  )
}
