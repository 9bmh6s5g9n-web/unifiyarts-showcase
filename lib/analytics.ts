import { CONTENT_TYPES, type ContentItem, type Side } from "@/lib/types"

export interface SideStats {
  side: Side
  total: number
  views: number
  words: number
  avgViews: number
  topItem: ContentItem | null
  byType: { type: string; label: string; count: number }[]
}

export function computeSideStats(items: ContentItem[], side: Side): SideStats {
  const scoped = items.filter((i) => i.side === side)
  const views = scoped.reduce((s, i) => s + i.views, 0)
  const words = scoped.reduce((s, i) => s + i.words, 0)
  const topItem =
    scoped.length > 0
      ? scoped.reduce((top, i) => (i.views > top.views ? i : top), scoped[0])
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
    words,
    avgViews: scoped.length ? Math.round(views / scoped.length) : 0,
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
