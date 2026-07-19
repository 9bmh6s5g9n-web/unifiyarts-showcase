"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ImageIcon, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ArtPiece } from "@/lib/types"

type Filter = "all" | "art" | "covers"

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "art", label: "Art pieces" },
  { id: "covers", label: "Book covers" },
]

export function ArtGallery({
  pieces,
  contactEmail,
}: {
  pieces: ArtPiece[]
  contactEmail?: string
}) {
  const [filter, setFilter] = useState<Filter>("all")

  const visible = pieces.filter((p) => {
    if (filter === "covers") return p.isBookCover
    if (filter === "art") return !p.isBookCover
    return true
  })

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-4" />
            Back to site
          </Link>
          <span className="font-serif text-lg font-semibold tracking-tight">The Gallery</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="text-center">
          <h1 className="font-serif text-5xl font-light tracking-tight text-balance sm:text-6xl">
            Art &amp; Book Covers
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            A growing collection of original pieces. Every work here can be adapted into a book
            cover — including custom commissions.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <div role="tablist" aria-label="Filter gallery" className="flex items-center gap-1 rounded-full border border-border bg-secondary/60 p-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "min-h-9 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  filter === f.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {visible.length > 0 ? (
          <div className="mt-12 columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
            {visible.map((piece) => (
              <figure
                key={piece.id}
                className="group relative break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={piece.imageUrl || "/placeholder.svg"}
                  alt={piece.title}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <figcaption className="p-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg font-medium">{piece.title}</h3>
                    {piece.isBookCover && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                        Cover
                      </span>
                    )}
                  </div>
                  {piece.description && (
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {piece.description}
                    </p>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-dashed border-border bg-card/40 px-6 py-20 text-center">
            <ImageIcon className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-4 font-serif text-2xl font-light">Nothing here yet</p>
            <p className="mx-auto mt-2 max-w-md text-pretty leading-relaxed text-muted-foreground">
              {filter === "covers"
                ? "No book covers to show yet."
                : filter === "art"
                  ? "No standalone art pieces to show yet."
                  : "Art and book covers are on their way."}
            </p>
          </div>
        )}

        {/* Cover-design service */}
        <section className="mt-24 overflow-hidden rounded-3xl border border-border bg-card p-8 text-center sm:p-14">
          <span className="font-serif text-sm uppercase tracking-[0.3em] text-primary">
            Commissions
          </span>
          <h2 className="mt-3 font-serif text-3xl font-light tracking-tight text-balance sm:text-4xl">
            Need a cover for your book?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            I design original book covers from scratch — the same craft you see in this gallery,
            shaped around your story. Tell me what you&apos;re writing and let&apos;s make something
            unforgettable.
          </p>
          <a
            href={contactEmail ? `mailto:${contactEmail}?subject=Book cover commission` : "#"}
            className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-8 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Mail className="size-4" />
            Hire me for a cover
          </a>
        </section>
      </main>
    </div>
  )
}
