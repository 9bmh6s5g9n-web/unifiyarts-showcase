"use client"

import { useMemo, useState } from "react"
import { useLibrary } from "@/components/library-provider"
import { TypeIcon } from "@/components/type-icon"
import { CONTENT_TYPES, TYPE_LABEL, type ContentType } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Download } from "lucide-react"
import { cn } from "@/lib/utils"

export function ShowcaseGallery({ isDemo = false }: { isDemo?: boolean }) {
  const { items, world } = useLibrary()
  const [type, setType] = useState<ContentType | "all">("all")

  const worldClass = world === "fiction" ? "world-fiction" : "world-nonfiction"

  const filtered = useMemo(() => {
    return items
      .filter((i) => i.side === world)
      .filter((i) => (type === "all" ? true : i.type === type))
  }, [items, world, type])

  return (
    <section
      id="showcase"
      className={cn(worldClass, "scroll-mt-16 bg-background text-foreground transition-colors")}
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="mb-10 flex flex-col gap-3 text-center">
          <span className="font-serif text-sm uppercase tracking-[0.3em] text-primary">
            {world === "fiction" ? "The Luminous Archive" : "The Cosmic Record"}
          </span>
          <h2 className="font-serif text-4xl font-light tracking-tight text-balance md:text-5xl">
            Showcase
          </h2>
          <p className="mx-auto max-w-lg text-pretty leading-relaxed text-muted-foreground">
            Every book, article, portfolio, video, and infographic in the{" "}
            {world === "fiction" ? "fiction" : "non-fiction"} collection.
          </p>
          {isDemo && (
            <p className="mx-auto mt-1 rounded-full bg-secondary px-4 py-1.5 text-xs text-muted-foreground">
              Showing sample data. Sign in and open Manage to add your own works.
            </p>
          )}
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          <FilterChip active={type === "all"} onClick={() => setType("all")} label="All" />
          {CONTENT_TYPES.map((t) => (
            <FilterChip
              key={t.value}
              active={type === t.value}
              onClick={() => setType(t.value)}
              label={t.label}
            />
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            Nothing here yet. Upload something to fill this side.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <Card
                key={item.id}
                className="group flex flex-col overflow-hidden border-border/70 bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
                  <Badge
                    variant="secondary"
                    className="gap-1.5 rounded-full font-medium text-secondary-foreground"
                  >
                    <TypeIcon type={item.type} className="size-3.5" />
                    {TYPE_LABEL[item.type]}
                  </Badge>
                  <span className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Download className="size-3.5" />
                      {item.downloads.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="size-3.5" />
                      {item.views.toLocaleString()}
                    </span>
                  </span>
                </CardHeader>
                <CardContent className="flex-1">
                  <h3 className="font-serif text-xl font-medium leading-snug text-balance">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {item.excerpt}
                  </p>
                </CardContent>
                <CardFooter className="justify-between border-t border-border/60 pt-4">
                  <span className="text-sm text-muted-foreground">{item.creator}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className="min-h-9 rounded-full"
    >
      {label}
    </Button>
  )
}
