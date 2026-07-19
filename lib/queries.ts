import "server-only"
import { db } from "@/lib/db"
import { works, workStats, artPieces, authorLinks } from "@/lib/db/schema"
import { asc, desc } from "drizzle-orm"
import type { ArtPiece, AuthorLink, ContentItem, ContentType, PlatformStat, Side } from "@/lib/types"

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
      coverUrl: w.coverUrl,
      link: w.link,
      words: w.words,
      createdAt:
        w.createdAt instanceof Date ? w.createdAt.toISOString() : String(w.createdAt),
      views,
      downloads,
      platforms,
    }
  })
}

/** Public read: all art pieces, ordered by the owner's manual sort then newest. */
export async function getArtPieces(): Promise<ArtPiece[]> {
  const rows = await db
    .select()
    .from(artPieces)
    .orderBy(asc(artPieces.sort), desc(artPieces.createdAt))

  return rows.map((a) => ({
    id: String(a.id),
    title: a.title,
    description: a.description,
    imageUrl: a.imageUrl,
    side: a.side as Side,
    isBookCover: a.isBookCover,
    featured: a.featured,
    sort: a.sort,
    createdAt:
      a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
  }))
}

/** Public read: author / publication links. */
export async function getAuthorLinks(): Promise<AuthorLink[]> {
  const rows = await db
    .select()
    .from(authorLinks)
    .orderBy(asc(authorLinks.sort), asc(authorLinks.id))

  return rows.map((l) => ({
    id: String(l.id),
    label: l.label,
    url: l.url,
    sort: l.sort,
  }))
}
