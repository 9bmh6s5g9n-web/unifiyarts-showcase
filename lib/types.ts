export type Side = 'fiction' | 'nonfiction'

export type ContentType =
  | 'book'
  | 'article'
  | 'portfolio'
  | 'video'
  | 'infographic'
  | 'other'

export interface PlatformStat {
  platform: string
  downloads: number
  views: number
}

export interface ContentItem {
  id: string
  title: string
  creator: string
  type: ContentType
  side: Side
  excerpt: string
  coverUrl: string
  link: string
  views: number // aggregated across all platforms
  downloads: number // aggregated across all platforms
  words: number
  createdAt: string // ISO date
  platforms: PlatformStat[]
}

export interface ArtPiece {
  id: string
  title: string
  description: string
  imageUrl: string
  side: Side
  isBookCover: boolean
  featured: boolean
  sort: number
  createdAt: string
}

export interface AuthorLink {
  id: string
  label: string
  url: string
  sort: number
}

export const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'book', label: 'Book' },
  { value: 'article', label: 'Article' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'video', label: 'Video' },
  { value: 'infographic', label: 'Infographic' },
  { value: 'other', label: 'Other' },
]

export const TYPE_LABEL: Record<ContentType, string> = {
  book: 'Book',
  article: 'Article',
  portfolio: 'Portfolio',
  video: 'Video',
  infographic: 'Infographic',
  other: 'Other',
}

/**
 * Naive fiction / non-fiction classifier used when the uploader does not
 * pick a side explicitly. It "reads" the title + excerpt for signal words.
 */
const FICTION_SIGNALS = [
  'novel',
  'myth',
  'legend',
  'saga',
  'dream',
  'fantasy',
  'tale',
  'poem',
  'verse',
  'story',
  'fable',
  'moon',
  'citadel',
  'egg',
  'helix',
  'goddess',
  'prophecy',
  'realm',
  'epic',
]

const NONFICTION_SIGNALS = [
  'guide',
  'report',
  'study',
  'analysis',
  'history',
  'manual',
  'essay',
  'research',
  'data',
  'engineering',
  'nebula',
  'orbital',
  'lunar',
  'field notes',
  'documentary',
  'how to',
  'reference',
  'record',
  'journal',
]

export function classifySide(text: string): { side: Side; confidence: number } {
  const t = text.toLowerCase()
  let fiction = 0
  let nonfiction = 0
  for (const w of FICTION_SIGNALS) if (t.includes(w)) fiction++
  for (const w of NONFICTION_SIGNALS) if (t.includes(w)) nonfiction++
  const total = fiction + nonfiction
  if (total === 0) return { side: 'fiction', confidence: 0.5 }
  const side: Side = fiction >= nonfiction ? 'fiction' : 'nonfiction'
  const confidence = Math.max(fiction, nonfiction) / total
  return { side, confidence }
}


