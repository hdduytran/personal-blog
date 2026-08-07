import { Icon } from "@/components/ui/Icon"

function isEmoji(value: string): boolean {
  return /^\p{Extended_Pictographic}/u.test(value)
}

export function PostThumb({
  coverImage,
  icon,
  color,
  folder,
  size = "card",
  cardHref,
}: {
  coverImage?: string
  icon?: string
  color?: string
  folder: string
  size?: "card" | "hero"
  /** Auto-generated card image (e.g. /card/<slug>) used when a post has no real cover. */
  cardHref?: string
}) {
  const folderName = folder.split("/").pop() || folder
  const iconValue = icon?.trim()
  const background = color ? { backgroundColor: color } : undefined
  const isEmojiIcon = Boolean(iconValue && isEmoji(iconValue))

  const src = coverImage || cardHref

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden ${
        size === "card" ? "h-24 w-36 rounded-lg" : "aspect-[16/9] w-full rounded-xl"
      } ${src ? "" : "bg-hover text-2xl font-semibold text-ink-mute"}`}
      style={src ? undefined : background}
      aria-hidden
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : isEmojiIcon ? (
        <span className="text-3xl">{iconValue}</span>
      ) : iconValue ? (
        <Icon name={iconValue} size={size === "card" ? 22 : 28} />
      ) : (
        folderName.charAt(0).toUpperCase()
      )}
    </span>
  )
}