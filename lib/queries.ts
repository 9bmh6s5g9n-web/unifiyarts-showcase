import "server-only"
import { db } from "@/lib/db"
import { works, workStats } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import type { ContentItem, ContentType, PlatformStat, Side } from "@/lib/types"

/**
 * Public read: returns every work in the library with its per-platform stats
 * aggregated. This powers the showcase and analytics for all visitors.
 * (This is a single-owner personal showcase, so reads are not user-scoped —
 * writes in app/actions/works.ts are scoped to the signed-in owner.)
 */
export async function getWorks(): Promise<ContentItem[]> {
  const [workRows, statRows] = await Promise.all([
    db.select().from(works).orderBy(desc(works.createdAt)),
    db.select().from(workStats),
  ])

  const statsByWork = new Map<number, PlatformStat[]>()
  for (const s of statRows) {
    const list = statsByWork.get(s.workId) ?? []
    list.push({ platform: s.platform, downloads: s.downloads, views: s.views })
    statsByWork.set(s.workId, list)
  }

  return workRows.map((w) => {
    const platforms = statsByWork.get(w.id) ?? []
    const views = platforms.reduce((sum, p) => sum + p.views, 0)
    const downloads = platforms.reduce((sum, p) => sum + p.downloads, 0)
    return {
      id: String(w.id),
      title: w.title,
      creator: w.creator,
      type: w.type as ContentType,
      side: w.side as Side,
      excerpt: w.excerpt,
      words: w.words,
      createdAt:
        w.createdAt instanceof Date ? w.createdAt.toISOString() : String(w.createdAt),
      views,
      downloads,
      platforms,
    }
  })
}
