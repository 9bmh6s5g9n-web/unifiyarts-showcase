export type Side = 'fiction' | 'nonfiction'

export type ContentType =
  | 'book'
  | 'article'
  | 'portfolio'
  | 'video'
  | 'infographic'
  | 'other'

export interface ContentItem {
  id: string
  title: string
  creator: string
  type: ContentType
  side: Side
  excerpt: string
  views: number
  words: number
  createdAt: string // ISO date
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

export const SEED_CONTENT: ContentItem[] = [
  {
    id: 'f1',
    title: 'The Citadel of the Double Helix',
    creator: 'Aurelia Vance',
    type: 'book',
    side: 'fiction',
    excerpt:
      'A tower of woven silver and gold rises from the green mist, cradling an egg in luminous hands as three moons wake.',
    views: 4820,
    words: 92000,
    createdAt: '2026-05-02',
  },
  {
    id: 'f2',
    title: 'Blue Moon, Honey Moon',
    creator: 'Ivo Marsh',
    type: 'article',
    side: 'fiction',
    excerpt:
      'A short fable about the night two moons argued over which light the world should dream by.',
    views: 2110,
    words: 3400,
    createdAt: '2026-05-20',
  },
  {
    id: 'f3',
    title: 'Feminine Hands, Fragile Dawn',
    creator: 'Noor El-Amin',
    type: 'portfolio',
    side: 'fiction',
    excerpt:
      'An illustrated portfolio following the myth of the egg-bearer through nine radiant plates.',
    views: 3675,
    words: 900,
    createdAt: '2026-06-08',
  },
  {
    id: 'f4',
    title: 'The Prophecy Reel',
    creator: 'Sena Okafor',
    type: 'video',
    side: 'fiction',
    excerpt:
      'A cinematic short: light bursts through the sky as the helix citadel awakens for the first time.',
    views: 6890,
    words: 0,
    createdAt: '2026-06-24',
  },
  {
    id: 'f5',
    title: 'Anatomy of a Myth',
    creator: 'Aurelia Vance',
    type: 'infographic',
    side: 'fiction',
    excerpt:
      'A single-page map of the realm — its towers, moons, and the green hue that binds them.',
    views: 1540,
    words: 300,
    createdAt: '2026-07-01',
  },
  {
    id: 'n1',
    title: 'Field Notes from the Nebula Belt',
    creator: 'Dr. Halden Reyes',
    type: 'book',
    side: 'nonfiction',
    excerpt:
      'A working record of orbital surveys, instrument logs, and the quiet routine of deep-space observation.',
    views: 3980,
    words: 78000,
    createdAt: '2026-05-11',
  },
  {
    id: 'n2',
    title: 'Lunar Engineering: A Practical Guide',
    creator: 'Priya Anand',
    type: 'article',
    side: 'nonfiction',
    excerpt:
      'How modular scaffolding, regolith concrete, and low-gravity logistics come together on the surface.',
    views: 5230,
    words: 6100,
    createdAt: '2026-05-29',
  },
  {
    id: 'n3',
    title: 'Structures in Vacuum',
    creator: 'Marco Feld',
    type: 'portfolio',
    side: 'nonfiction',
    excerpt:
      'Technical renders and build documentation for a partially assembled orbital station.',
    views: 2870,
    words: 1200,
    createdAt: '2026-06-14',
  },
  {
    id: 'n4',
    title: 'Assembly Sequence 07',
    creator: 'Priya Anand',
    type: 'video',
    side: 'nonfiction',
    excerpt:
      'A step-by-step documentary walkthrough of a station module reaching structural completion.',
    views: 4410,
    words: 0,
    createdAt: '2026-06-27',
  },
  {
    id: 'n5',
    title: 'The Numbers Behind the Nebula',
    creator: 'Dr. Halden Reyes',
    type: 'infographic',
    side: 'nonfiction',
    excerpt:
      'Distances, densities, and timelines rendered as one clean reference sheet.',
    views: 1990,
    words: 250,
    createdAt: '2026-07-04',
  },
]
