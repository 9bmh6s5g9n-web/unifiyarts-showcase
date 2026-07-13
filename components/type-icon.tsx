import {
  BookOpen,
  FileText,
  LayoutGrid,
  Video,
  BarChart3,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import type { ContentType } from '@/lib/types'

const MAP: Record<ContentType, LucideIcon> = {
  book: BookOpen,
  article: FileText,
  portfolio: LayoutGrid,
  video: Video,
  infographic: BarChart3,
  other: Sparkles,
}

export function TypeIcon({
  type,
  className,
}: {
  type: ContentType
  className?: string
}) {
  const Icon = MAP[type]
  return <Icon className={className} aria-hidden="true" />
}
