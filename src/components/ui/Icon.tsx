import {
  Home,
  Heart,
  Globe,
  Server,
  Tag,
  Rss,
  Sun,
  Moon,
  Menu,
  ArrowUp,
  Copy,
  Check,
  Share2,
  Mail,
  Folder,
  FileText,
  Clock,
  ChevronRight,
  Quote,
  BookOpen,
  type LucideIcon,
} from "lucide-react"
import { GithubIcon, LinkedinIcon, XIcon } from "./brand-icons"

const MAP: Record<string, LucideIcon> = {
  home: Home,
  heart: Heart,
  globe: Globe,
  server: Server,
  tag: Tag,
  rss: Rss,
  sun: Sun,
  moon: Moon,
  menu: Menu,
  x: XIcon as unknown as LucideIcon,
  arrowup: ArrowUp,
  copy: Copy,
  check: Check,
  share: Share2,
  github: GithubIcon as unknown as LucideIcon,
  linkedin: LinkedinIcon as unknown as LucideIcon,
  twitter: XIcon as unknown as LucideIcon,
  x_twitter: XIcon as unknown as LucideIcon,
  mail: Mail,
  folder: Folder,
  file: FileText,
  clock: Clock,
  chevron: ChevronRight,
  quote: Quote,
  book: BookOpen,
}

export function Icon({
  name,
  className,
  size = 18,
}: {
  name?: string | null
  className?: string
  size?: number
}) {
  const key = (name || "").toLowerCase()
  const Cmp = MAP[key] || FileText
  return <Cmp className={className} size={size} aria-hidden />
}
