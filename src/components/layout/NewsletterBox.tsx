import { getProfile } from "@/lib/profile"

export function NewsletterBox() {
  const nl = getProfile().newsletter
  if (!nl.enabled) return null
  const action = nl.form_id
    ? `https://app.kit.com/forms/${nl.form_id}/subscriptions`
    : "#"

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <h3 className="text-sm font-semibold text-ink">{nl.heading || "Newsletter"}</h3>
      {nl.description && (
        <p className="mt-1 text-sm text-ink-soft">{nl.description}</p>
      )}
      <form action={action} method="post" className="mt-3 flex flex-col gap-2" target="_blank">
        <input
          type="email"
          name="email_address"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {nl.cta || "Subscribe"}
        </button>
      </form>
      {nl.note && <p className="mt-2 text-xs text-ink-mute">{nl.note}</p>}
      {!nl.form_id && (
        <p className="mt-2 text-xs text-ink-mute">Set newsletter.form_id in profile.mdx.</p>
      )}
    </div>
  )
}
