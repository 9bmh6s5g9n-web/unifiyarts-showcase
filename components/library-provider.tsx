"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import type { ContentItem, Side } from "@/lib/types"

interface LibraryContextValue {
  items: ContentItem[]
  world: Side
  setWorld: (side: Side) => void
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

export function LibraryProvider({
  children,
  initialItems,
}: {
  children: ReactNode
  initialItems: ContentItem[]
}) {
  const [world, setWorld] = useState<Side>("fiction")

  const value = useMemo<LibraryContextValue>(
    () => ({ items: initialItems, world, setWorld }),
    [initialItems, world],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider")
  return ctx
}
