'use client'

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { SEED_CONTENT, type ContentItem, type Side } from '@/lib/types'

interface LibraryContextValue {
  items: ContentItem[]
  addItem: (item: ContentItem) => void
  world: Side
  setWorld: (side: Side) => void
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ContentItem[]>(SEED_CONTENT)
  const [world, setWorld] = useState<Side>('fiction')

  const value = useMemo<LibraryContextValue>(
    () => ({
      items,
      addItem: (item) => setItems((prev) => [item, ...prev]),
      world,
      setWorld,
    }),
    [items, world],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider')
  return ctx
}
