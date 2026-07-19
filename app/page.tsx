import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getWorks } from "@/lib/queries"
import { SEED_CONTENT } from "@/lib/types"
import { LibraryProvider } from "@/components/library-provider"
import { SiteHeader } from "@/components/site-header"
import { WorldSection } from "@/components/world-section"
import { ShowcaseGallery } from "@/components/showcase-gallery"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { SiteFooter } from "@/components/site-footer"

export default async function HomePage() {
  const [dbItems, session] = await Promise.all([
    getWorks().catch(() => []),
    auth.api.getSession({ headers: await headers() }).catch(() => null),
  ])

  // Until real works are added, show the demo library so the site looks alive.
  const items = dbItems.length > 0 ? dbItems : SEED_CONTENT
  const isDemo = dbItems.length === 0

  return (
    <LibraryProvider initialItems={items}>
      <div id="top" className="min-h-dvh bg-background">
        <SiteHeader authed={!!session?.user} />
        <main>
          <WorldSection variant="fiction" />
          <WorldSection variant="nonfiction" />
          <ShowcaseGallery isDemo={isDemo} />
          <AnalyticsDashboard isDemo={isDemo} />
        </main>
        <SiteFooter />
      </div>
    </LibraryProvider>
  )
}
