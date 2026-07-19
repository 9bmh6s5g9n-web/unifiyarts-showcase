import Link from "next/link"
import { ArrowRight, ImageIcon, Palette } from "lucide-react"
import type { ArtPiece } from "@/lib/types"

export function FeaturedArt({
  pieces,
  authed = false,
}: {
  pieces: ArtPiece[]
  authed?: boolean
}) {
  const featured = pieces.find((p) => p.featured) ?? pieces[0] ?? null
  const supporting = pieces.filter((p) => p.id !== featured?.id).slice(0, 3)

  return (
    <section id="gallery" className="bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mb-10 text-center">
          <span className="flex items-center justify-center gap-2 font-serif text-sm uppercase tracking-[0.35em] text-primary">
            <Palette className="size-4" />
            The Gallery
          </span>
          <h2 className="mt-3 font-serif text-4xl font-light tracking-tight text-balance sm:text-5xl">
            Art &amp; Book Covers
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Original pieces from the studio — each one a world of its own, and each one ready to
            become a cover.
          </p>
        </div>

        {featured ? (
          <>
            <div className="grid items-stretch gap-6 lg:grid-cols-5">
              <figure className="group relative overflow-hidden rounded-3xl border border-border bg-card lg:col-span-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featured.imageUrl || "/placeholder.svg"}
                  alt={featured.title}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-6">
                  <div className="flex items-center gap-2">
                    {featured.isBookCover && (
                      <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                        Book cover
                      </span>
                    )}
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      Featured
                    </span>
                  </div>
                  <h3 className="mt-2 font-serif text-2xl font-medium">{featured.title}</h3>
                  {featured.description && (
                    <p className="mt-1 line-clamp-2 max-w-lg text-sm text-muted-foreground">
                      {featured.description}
                    </p>
                  )}
                </figcaption>
              </figure>

              <div className="grid gap-6 lg:col-span-2">
                {supporting.length > 0 ? (
                  supporting.map((piece) => (
                    <figure
                      key={piece.id}
                      className="group relative flex-1 overflow-hidden rounded-2xl border border-border bg-card"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={piece.imageUrl || "/placeholder.svg"}
                        alt={piece.title}
                        className="h-full min-h-32 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-4">
                        <h3 className="font-serif text-lg font-medium">{piece.title}</h3>
                      </figcaption>
                    </figure>
                  ))
                ) : (
                  <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
                    More pieces will appear here as you add them.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10 flex justify-center">
              <Link
                href="/gallery"
                className="flex min-h-11 items-center gap-2 rounded-full bg-primary px-8 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Enter the Gallery
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-card/40 px-6 py-20 text-center">
            <ImageIcon className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-4 font-serif text-2xl font-light">The gallery is being hung</p>
            <p className="mx-auto mt-2 max-w-md text-pretty leading-relaxed text-muted-foreground">
              {authed
                ? "Open Manage to add your first art pieces and book covers."
                : "Original art and book covers are coming soon."}
            </p>
            {authed && (
              <Link
                href="/manage"
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Add art in Manage
                <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
