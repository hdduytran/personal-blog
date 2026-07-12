import type { Metadata } from "next"
import "./globals.css"
import { inter, robotoMono } from "./fonts"
import { getProfile } from "@/lib/profile"
import { SidebarLeft } from "@/components/layout/SidebarLeft"
import { AppFrame } from "@/components/layout/AppFrame"

export function generateMetadata(): Metadata {
  const profile = getProfile()
  return {
    title: {
      default: profile.seo.title || profile.blog_name,
      template: `%s · ${profile.blog_name}`,
    },
    description: profile.seo.description,
    openGraph: {
      title: profile.seo.title || profile.blog_name,
      description: profile.seo.description,
      type: "website",
      images: profile.seo.og_image ? [profile.seo.og_image] : undefined,
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = getProfile()
  return (
    <html lang="vi" data-theme="light" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className="min-h-screen antialiased">
        <AppFrame sidebarLeft={<SidebarLeft />} mobileTitle={profile.blog_name}>
          {children}
        </AppFrame>
      </body>
    </html>
  )
}
