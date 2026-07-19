"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { works, workStats, artPieces, authorLinks, researchEntries } from "@/lib/db/schema"
import type { Side } from "@/lib/types"
import { and, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export interface PlatformInput {
  platform: string
  downloads: number
  views: number
}

export interface WorkInput {
  title: string
  creator: string
  type: string
  side: Side
  excerpt: string
  coverUrl: string
  link: string
  words: number
  platforms: PlatformInput[]
}

/** Create a single work with its per-platform stats. */
export async function createWork(input: WorkInput) {
  const userId = await getUserId()
  const title = input.title.trim()
  if (!title) throw new Error("Title is required")

  const [row] = await db
    .insert(works)
    .values({
      userId,
      title,
      creator: input.creator.trim() || "Anonymous",
      type: input.type || "other",
      side: input.side,
      excerpt: input.excerpt.trim(),
      coverUrl: input.coverUrl?.trim() || "",
      link: input.link?.trim() || "",
      words: Number.isFinite(input.words) ? input.words : 0,
    })
    .returning({ id: works.id })

  const platforms = input.platforms.filter(
    (p) => p.platform.trim() && (p.downloads > 0 || p.views > 0),
  )
  if (platforms.length > 0) {
    await db.insert(workStats).values(
      platforms.map((p) => ({
        userId,
        workId: row.id,
        platform: p.platform.trim(),
        downloads: Math.max(0, Math.round(p.downloads)),
        views: Math.max(0, Math.round(p.views)),
      })),
    )
  }

  revalidatePath("/")
  revalidatePath("/manage")
}

/** Delete a work (and its stats) owned by the current user. */
export async function deleteWork(id: number) {
  const userId = await getUserId()
  await db.delete(workStats).where(and(eq(workStats.workId, id), eq(workStats.userId, userId)))
  await db.delete(works).where(and(eq(works.id, id), eq(works.userId, userId)))
  revalidatePath("/")
  revalidatePath("/manage")
}

interface CsvRow {
  title: string
  type?: string
  side?: string
  creator?: string
  platform?: string
  downloads?: string
  views?: string
  excerpt?: string
  words?: string
}

/**
 * Import works from parsed CSV rows. Rows sharing the same title + side are
 * grouped into one work with multiple platform stat rows.
 */
export async function importWorks(rows: CsvRow[]) {
  const userId = await getUserId()
  const groups = new Map<string, { meta: CsvRow; platforms: PlatformInput[] }>()

  for (const r of rows) {
    const title = (r.title ?? "").trim()
    if (!title) continue
    const side: Side = (r.side ?? "").toLowerCase().startsWith("non") ? "nonfiction" : "fiction"
    const key = `${title.toLowerCase()}__${side}`
    const group = groups.get(key) ?? { meta: { ...r, side }, platforms: [] }
    const downloads = Number.parseInt((r.downloads ?? "0").replace(/[^0-9-]/g, ""), 10) || 0
    const views = Number.parseInt((r.views ?? "0").replace(/[^0-9-]/g, ""), 10) || 0
    if (r.platform?.trim() || downloads || views) {
      group.platforms.push({
        platform: r.platform?.trim() || "Website",
        downloads,
        views,
      })
    }
    groups.set(key, group)
  }

  let imported = 0
  for (const { meta, platforms } of groups.values()) {
    const side: Side = meta.side === "nonfiction" ? "nonfiction" : "fiction"
    const [row] = await db
      .insert(works)
      .values({
        userId,
        title: (meta.title ?? "").trim(),
        creator: (meta.creator ?? "").trim() || "Anonymous",
        type: (meta.type ?? "other").trim().toLowerCase() || "other",
        side,
        excerpt: (meta.excerpt ?? "").trim(),
        words: Number.parseInt((meta.words ?? "0").replace(/[^0-9]/g, ""), 10) || 0,
      })
      .returning({ id: works.id })

    if (platforms.length > 0) {
      await db.insert(workStats).values(
        platforms.map((p) => ({
          userId,
          workId: row.id,
          platform: p.platform,
          downloads: Math.max(0, p.downloads),
          views: Math.max(0, p.views),
        })),
      )
    }
    imported++
  }

  revalidatePath("/")
  revalidatePath("/manage")
  return imported
}

// --- Art pieces ------------------------------------------------------------

export interface ArtInput {
  title: string
  description: string
  imageUrl: string
  side: Side
  isBookCover: boolean
  featured: boolean
}

export async function createArtPiece(input: ArtInput) {
  const userId = await getUserId()
  const title = input.title.trim()
  if (!title) throw new Error("Title is required")
  if (!input.imageUrl.trim()) throw new Error("An image is required")

  await db.insert(artPieces).values({
    userId,
    title,
    description: input.description.trim(),
    imageUrl: input.imageUrl.trim(),
    side: input.side,
    isBookCover: input.isBookCover,
    featured: input.featured,
  })

  revalidatePath("/")
  revalidatePath("/gallery")
  revalidatePath("/manage")
}

export async function updateArtPiece(id: number, input: Partial<ArtInput>) {
  const userId = await getUserId()
  const patch: Record<string, unknown> = {}
  if (input.title !== undefined) patch.title = input.title.trim()
  if (input.description !== undefined) patch.description = input.description.trim()
  if (input.imageUrl !== undefined) patch.imageUrl = input.imageUrl.trim()
  if (input.side !== undefined) patch.side = input.side
  if (input.isBookCover !== undefined) patch.isBookCover = input.isBookCover
  if (input.featured !== undefined) patch.featured = input.featured
  if (Object.keys(patch).length === 0) return

  await db
    .update(artPieces)
    .set(patch)
    .where(and(eq(artPieces.id, id), eq(artPieces.userId, userId)))

  revalidatePath("/")
  revalidatePath("/gallery")
  revalidatePath("/manage")
}

export async function deleteArtPiece(id: number) {
  const userId = await getUserId()
  await db.delete(artPieces).where(and(eq(artPieces.id, id), eq(artPieces.userId, userId)))
  revalidatePath("/")
  revalidatePath("/gallery")
  revalidatePath("/manage")
}

// --- Author links ----------------------------------------------------------

export async function createAuthorLink(label: string, url: string) {
  const userId = await getUserId()
  const l = label.trim()
  const u = url.trim()
  if (!l || !u) throw new Error("Label and URL are required")
  await db.insert(authorLinks).values({ userId, label: l, url: u })
  revalidatePath("/")
  revalidatePath("/manage")
}

export async function deleteAuthorLink(id: number) {
  const userId = await getUserId()
  await db.delete(authorLinks).where(and(eq(authorLinks.id, id), eq(authorLinks.userId, userId)))
  revalidatePath("/")
  revalidatePath("/manage")
}

// --- Research entries (for the Coherence assistant) ------------------------

export interface ResearchInput {
  title: string
  content: string
  doi: string
  tags: string
}

export async function createResearchEntry(input: ResearchInput) {
  const userId = await getUserId()
  const title = input.title.trim()
  if (!title) throw new Error("Title is required")
  await db.insert(researchEntries).values({
    userId,
    title,
    content: input.content.trim(),
    doi: input.doi.trim(),
    tags: input.tags.trim(),
  })
  revalidatePath("/manage")
  revalidatePath("/coherence")
}

export async function deleteResearchEntry(id: number) {
  const userId = await getUserId()
  await db.delete(researchEntries).where(and(eq(researchEntries.id, id), eq(researchEntries.userId, userId)))
  revalidatePath("/manage")
  revalidatePath("/coherence")
}


