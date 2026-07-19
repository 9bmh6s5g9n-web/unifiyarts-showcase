import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getWorks, getArtPieces, getAuthorLinks } from "@/lib/queries"
import { LibraryProvider } from "@/components/library-provider"
import { SiteHeader } from "@/components/site-header"
import { WorldSection } from "@/components/world-section"
import { FeaturedArt } from "@/components/featured-art"
import { ShowcaseGallery } from "@/components/showcase-gallery"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { SiteFooter } from "@/components/site-footer"

export default async function HomePage() {
  const [dbItems, artPieces, links, session] = await Promise.all([
    getWorks().catch(() => []),
    getArtPieces().catch(() => []),
    getAuthorLinks().catch(() => []),
    auth.api.getSession({ headers: await headers() }).catch(() => null),
  ])

  // Only ever show real works that the owner has added. No sample data.
  const items = dbItems
  const isEmpty = items.length === 0
  const authed = !!session?.user

  return (
    <LibraryProvider initialItems={items}>
      <div id="top" className="min-h-dvh bg-background">
        <SiteHeader authed={authed} />
        <main>
          <WorldSection variant="fiction" />
          <WorldSection variant="nonfiction" />
          <FeaturedArt pieces={artPieces} authed={authed} />
          <ShowcaseGallery authed={authed} isEmpty={isEmpty} />
          <AnalyticsDashboard isEmpty={isEmpty} />
        </main>
        <SiteFooter links={links} />
      </div>
    </LibraryProvider>
  )
}
