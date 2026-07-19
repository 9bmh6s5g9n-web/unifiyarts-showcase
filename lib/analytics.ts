import { CONTENT_TYPES, type ContentItem, type Side } from "@/lib/types"

export interface SideStats {
  side: Side
  total: number
  views: number
  downloads: number
  words: number
  avgDownloads: number
  topItem: ContentItem | null
  byType: { type: string; label: string; count: number }[]
}

export function computeSideStats(items: ContentItem[], side: Side): SideStats {
  const scoped = items.filter((i) => i.side === side)
  const views = scoped.reduce((s, i) => s + i.views, 0)
  const downloads = scoped.reduce((s, i) => s + i.downloads, 0)
  const words = scoped.reduce((s, i) => s + i.words, 0)
  const topItem =
    scoped.length > 0
      ? scoped.reduce((top, i) => (i.downloads > top.downloads ? i : top), scoped[0])
      : null

  const byType = CONTENT_TYPES.map((t) => ({
    type: t.value,
    label: t.label,
    count: scoped.filter((i) => i.type === t.value).length,
  }))

  return {
    side,
    total: scoped.length,
    views,
    downloads,
    words,
    avgDownloads: scoped.length ? Math.round(downloads / scoped.length) : 0,
    topItem,
    byType,
  }
}

/** Combined per-type comparison for a grouped bar chart. */
export function typeComparison(items: ContentItem[]) {
  return CONTENT_TYPES.map((t) => ({
    label: t.label,
    fiction: items.filter((i) => i.side === "fiction" && i.type === t.value).length,
    nonfiction: items.filter((i) => i.side === "nonfiction" && i.type === t.value).length,
  }))
}

/** Split totals for a donut/pie of the whole library. */
export function librarySplit(items: ContentItem[]) {
  const fiction = items.filter((i) => i.side === "fiction").length
  const nonfiction = items.filter((i) => i.side === "nonfiction").length
  return [
    { side: "fiction", label: "Fiction", value: fiction },
    { side: "nonfiction", label: "Non-fiction", value: nonfiction },
  ]
}

export interface PlatformRow {
  platform: string
  downloads: number
  views: number
}

/**
 * Aggregate downloads + views per platform across the whole library, or a
 * single side when `side` is provided. Sorted by downloads, highest first.
 */
export function platformBreakdown(items: ContentItem[], side?: Side): PlatformRow[] {
  const map = new Map<string, PlatformRow>()
  for (const item of items) {
    if (side && item.side !== side) continue
    for (const p of item.platforms) {
      const row = map.get(p.platform) ?? { platform: p.platform, downloads: 0, views: 0 }
      row.downloads += p.downloads
      row.views += p.views
      map.set(p.platform, row)
    }
  }
  return [...map.values()].sort((a, b) => b.downloads - a.downloads)
}

/** Grand totals for headline numbers. */
export function libraryTotals(items: ContentItem[]) {
  return {
    works: items.length,
    downloads: items.reduce((s, i) => s + i.downloads, 0),
    views: items.reduce((s, i) => s + i.views, 0),
  }
}
