import { LibraryProvider } from "@/components/library-provider"
import { SiteHeader } from "@/components/site-header"
import { WorldSection } from "@/components/world-section"
import { ShowcaseGallery } from "@/components/showcase-gallery"
import { UploadSection } from "@/components/upload-section"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { SiteFooter } from "@/components/site-footer"

export default function HomePage() {
  return (
    <LibraryProvider>
      <div id="top" className="min-h-dvh bg-background">
        <SiteHeader />
        <main>
          <WorldSection variant="fiction" />
          <WorldSection variant="nonfiction" />
          <ShowcaseGallery />
          <UploadSection />
          <AnalyticsDashboard />
        </main>
        <SiteFooter />
      </div>
    </LibraryProvider>
  )
}
