"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  createWork,
  deleteWork,
  importWorks,
  createResearchEntry,
  deleteResearchEntry,
  createArtPiece,
  deleteArtPiece,
  createAuthorLink,
  deleteAuthorLink,
  type PlatformInput,
} from "@/app/actions/works"
import { authClient } from "@/lib/auth-client"
import {
  classifySide,
  CONTENT_TYPES,
  TYPE_LABEL,
  type ArtPiece,
  type AuthorLink,
  type ContentItem,
  type ContentType,
  type ResearchEntry,
  type Side,
} from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Download,
  Eye,
  LogOut,
  Plus,
  Sparkles,
  Moon,
  Trash2,
  Upload,
  CheckCircle2,
  FlaskConical,
  Palette,
  LinkIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

type SideChoice = Side | "auto"

const CSV_TEMPLATE =
  "title,type,side,creator,platform,downloads,views,excerpt\n" +
  "The Citadel,book,fiction,Your Name,Amazon,1200,3400,A luminous tale\n" +
  "The Citadel,book,fiction,Your Name,Website,540,1900,A luminous tale\n" +
  "Lunar Engineering,article,nonfiction,Your Name,Website,880,2600,A practical guide"

/** Minimal CSV parser: handles quoted fields and commas inside quotes. */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let field = ""
  let row: string[] = []
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else inQuotes = false
      } else field += c
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ",") {
      row.push(field)
      field = ""
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++
      row.push(field)
      field = ""
      if (row.some((f) => f.trim() !== "")) rows.push(row)
      row = []
    } else field += c
  }
  if (field !== "" || row.length) {
    row.push(field)
    if (row.some((f) => f.trim() !== "")) rows.push(row)
  }
  if (rows.length < 2) return []
  const headers = rows[0].map((h) => h.trim().toLowerCase())
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => (obj[h] = (r[i] ?? "").trim()))
    return obj
  })
}

export function ManageDashboard({
  items,
  research,
  art,
  links,
  userName,
}: {
  items: ContentItem[]
  research: ResearchEntry[]
  art: ArtPiece[]
  links: AuthorLink[]
  userName: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-xl font-semibold tracking-tight">UnifyArts</span>
            <span className="text-xs font-medium tracking-widest text-primary">.ACADEMY</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/coherence"
              className="flex min-h-9 items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Sparkles className="size-4" />
              <span className="hidden sm:inline">Coherence Engine</span>
              <span className="sm:hidden">Coherence</span>
            </Link>
            <Link
              href="/"
              className="flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">View site</span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-light tracking-tight md:text-4xl">
            Welcome back, {userName}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Add your works and feed in official download and view numbers. Everything you save here
            updates the public showcase and analytics.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <ManualForm isPending={isPending} startTransition={startTransition} />
          <CsvImport isPending={isPending} startTransition={startTransition} />
        </div>

        <WorksList items={items} isPending={isPending} startTransition={startTransition} />

        <div className="mt-12">
          <div className="mb-6 flex items-center gap-2">
            <Palette className="size-5 text-primary" />
            <h2 className="font-serif text-2xl font-light tracking-tight">Art gallery</h2>
          </div>
          <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
            Add your art pieces and book covers. Paste an image link for each one and write your own
            title and description. These appear on the home page and the public Gallery.
          </p>
          <div className="grid gap-8 lg:grid-cols-2">
            <ArtForm isPending={isPending} startTransition={startTransition} />
            <ArtList pieces={art} isPending={isPending} startTransition={startTransition} />
          </div>
        </div>

        <div className="mt-12">
          <div className="mb-6 flex items-center gap-2">
            <LinkIcon className="size-5 text-primary" />
            <h2 className="font-serif text-2xl font-light tracking-tight">Author &amp; publication links</h2>
          </div>
          <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
            Add links to your author profile, publications, and socials. These are shown in the site
            footer.
          </p>
          <div className="grid gap-8 lg:grid-cols-2">
            <LinksForm isPending={isPending} startTransition={startTransition} />
            <LinksList links={links} isPending={isPending} startTransition={startTransition} />
          </div>
        </div>

        <div className="mt-12">
          <div className="mb-6 flex items-center gap-2">
            <FlaskConical className="size-5 text-primary" />
            <h2 className="font-serif text-2xl font-light tracking-tight">Research library</h2>
          </div>
          <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
            Add your research notes, experiment write-ups, and findings here. The{" "}
            <span className="font-medium text-foreground">Coherence Engine</span> reads across
            everything you store to find the connections and through-lines between your ideas.
            Nothing here is shown publicly.
          </p>
          <div className="grid gap-8 lg:grid-cols-2">
            <ResearchForm isPending={isPending} startTransition={startTransition} />
            <ResearchList entries={research} isPending={isPending} startTransition={startTransition} />
          </div>
        </div>
      </main>
    </div>
  )
}

function ManualForm({
  isPending,
  startTransition,
}: {
  isPending: boolean
  startTransition: (cb: () => void) => void
}) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [creator, setCreator] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [type, setType] = useState<ContentType>("book")
  const [sideChoice, setSideChoice] = useState<SideChoice>("auto")
  const [platforms, setPlatforms] = useState<PlatformInput[]>([
    { platform: "Website", downloads: 0, views: 0 },
  ])
  const [saved, setSaved] = useState<string | null>(null)

  const prediction = useMemo(() => classifySide(`${title} ${excerpt}`), [title, excerpt])
  const resolvedSide: Side = sideChoice === "auto" ? prediction.side : sideChoice

  function updatePlatform(index: number, field: keyof PlatformInput, value: string) {
    setPlatforms((prev) =>
      prev.map((p, i) =>
        i === index
          ? { ...p, [field]: field === "platform" ? value : Number.parseInt(value || "0", 10) || 0 }
          : p,
      ),
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const words = excerpt.trim().split(/\s+/).filter(Boolean).length
    startTransition(async () => {
      await createWork({
        title,
        creator,
        type,
        side: resolvedSide,
        excerpt,
        coverUrl: "",
        link: "",
        words,
        platforms,
      })
      setSaved(title.trim())
      setTitle("")
      setCreator("")
      setExcerpt("")
      setType("book")
      setSideChoice("auto")
      setPlatforms([{ platform: "Website", downloads: 0, views: 0 }])
      router.refresh()
    })
  }

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-xl font-medium">
          <Plus className="size-5 text-primary" /> Add a work
        </CardTitle>
        <CardDescription>Enter one work and its numbers by hand.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="text-base" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="creator">Creator</Label>
              <Input id="creator" value={creator} onChange={(e) => setCreator(e.target.value)} placeholder="Your name" className="text-base" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as ContentType)}>
                <SelectTrigger id="type" className="text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="excerpt">Description</Label>
            <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="min-h-20 text-base" />
          </div>

          <div className="grid gap-2">
            <Label>Side</Label>
            <div className="flex flex-wrap gap-2">
              {(["auto", "fiction", "nonfiction"] as SideChoice[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSideChoice(s)}
                  className={cn(
                    "min-h-9 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    sideChoice === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s === "auto" ? "Auto-detect" : s === "fiction" ? "Fiction" : "Non-fiction"}
                </button>
              ))}
            </div>
            {(title || excerpt) && (
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-border/70 bg-muted/50 p-2.5 text-sm">
                {resolvedSide === "fiction" ? (
                  <Sparkles className="size-4 shrink-0 text-primary" />
                ) : (
                  <Moon className="size-4 shrink-0 text-primary" />
                )}
                <span className="text-muted-foreground">
                  Reads as{" "}
                  <span className="font-semibold text-foreground">
                    {resolvedSide === "fiction" ? "Fiction" : "Non-fiction"}
                  </span>
                </span>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Downloads &amp; views per platform</Label>
            <div className="space-y-2">
              {platforms.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    aria-label="Platform"
                    value={p.platform}
                    onChange={(e) => updatePlatform(i, "platform", e.target.value)}
                    placeholder="Platform"
                    className="flex-1 text-base"
                  />
                  <Input
                    aria-label="Downloads"
                    type="number"
                    min={0}
                    value={p.downloads || ""}
                    onChange={(e) => updatePlatform(i, "downloads", e.target.value)}
                    placeholder="Downloads"
                    className="w-28 text-base"
                  />
                  <Input
                    aria-label="Views"
                    type="number"
                    min={0}
                    value={p.views || ""}
                    onChange={(e) => updatePlatform(i, "views", e.target.value)}
                    placeholder="Views"
                    className="w-24 text-base"
                  />
                  {platforms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setPlatforms((prev) => prev.filter((_, idx) => idx !== i))}
                      className="shrink-0 rounded-md p-2 text-muted-foreground hover:text-destructive"
                      aria-label="Remove platform"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPlatforms((prev) => [...prev, { platform: "", downloads: 0, views: 0 }])}
              className="mt-1 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <Plus className="size-4" /> Add another platform
            </button>
          </div>

          <Button type="submit" size="lg" disabled={isPending} className="min-h-11 rounded-full">
            {isPending ? "Saving..." : "Save work"}
          </Button>

          {saved && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm">
              <CheckCircle2 className="size-4 text-primary" />
              <span>
                <span className="font-semibold">{saved}</span> saved.
              </span>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

function CsvImport({
  isPending,
  startTransition,
}: {
  isPending: boolean
  startTransition: (cb: () => void) => void
}) {
  const router = useRouter()
  const [text, setText] = useState("")
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleImport() {
    setError(null)
    setResult(null)
    const rows = parseCsv(text)
    if (rows.length === 0) {
      setError("Couldn't find any rows. Make sure the first line is the header.")
      return
    }
    startTransition(async () => {
      try {
        const count = await importWorks(rows as { title: string }[])
        setResult(`Imported ${count} work${count === 1 ? "" : "s"}.`)
        setText("")
        router.refresh()
      } catch {
        setError("Something went wrong during import. Check your columns and try again.")
      }
    })
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setText(String(reader.result ?? ""))
    reader.readAsText(file)
  }

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-xl font-medium">
          <Upload className="size-5 text-primary" /> Import a spreadsheet (CSV)
        </CardTitle>
        <CardDescription>
          Paste rows or upload a .csv file. Columns: title, type, side, creator, platform,
          downloads, views, excerpt. Repeat a title to add more platforms to it.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <Upload className="size-4" />
            Choose file
            <input type="file" accept=".csv,text/csv" onChange={handleFile} className="sr-only" />
          </label>
          <button
            type="button"
            onClick={() => setText(CSV_TEMPLATE)}
            className="text-sm font-medium text-primary hover:underline"
          >
            Use example template
          </button>
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={CSV_TEMPLATE}
          className="min-h-40 font-mono text-sm"
        />

        <Button onClick={handleImport} disabled={isPending || !text.trim()} className="rounded-full">
          {isPending ? "Importing..." : "Import rows"}
        </Button>

        {result && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm">
            <CheckCircle2 className="size-4 text-primary" />
            {result}
          </div>
        )}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function ArtForm({
  isPending,
  startTransition,
}: {
  isPending: boolean
  startTransition: (cb: () => void) => void
}) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [side, setSide] = useState<Side>("fiction")
  const [isBookCover, setIsBookCover] = useState(false)
  const [featured, setFeatured] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !imageUrl.trim()) return
    startTransition(async () => {
      await createArtPiece({ title, description, imageUrl, side, isBookCover, featured })
      setSaved(title.trim())
      setTitle("")
      setDescription("")
      setImageUrl("")
      setIsBookCover(false)
      setFeatured(false)
      router.refresh()
    })
  }

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-xl font-medium">
          <Plus className="size-5 text-primary" /> Add art / book cover
        </CardTitle>
        <CardDescription>Paste an image link and describe the piece.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="a-title">Title</Label>
            <Input id="a-title" value={title} onChange={(e) => setTitle(e.target.value)} required className="text-base" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="a-image">Image link (URL)</Label>
            <Input
              id="a-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              required
              className="text-base"
            />
            {imageUrl.trim() && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl || "/placeholder.svg"}
                alt="Preview"
                className="mt-1 max-h-40 w-full rounded-lg border border-border object-cover"
              />
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="a-desc">Description</Label>
            <Textarea
              id="a-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Your own words about this piece."
              className="min-h-24 text-base"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="a-side">World</Label>
            <Select value={side} onValueChange={(v) => setSide(v as Side)}>
              <SelectTrigger id="a-side">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fiction">Fiction (luminous)</SelectItem>
                <SelectItem value="nonfiction">Non-fiction (cosmic)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isBookCover}
                onChange={(e) => setIsBookCover(e.target.checked)}
                className="size-4 accent-primary"
              />
              This is a book cover
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="size-4 accent-primary"
              />
              Feature on home page
            </label>
          </div>
          <Button type="submit" size="lg" disabled={isPending} className="min-h-11 rounded-full">
            {isPending ? "Saving..." : "Add to gallery"}
          </Button>
          {saved && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm">
              <CheckCircle2 className="size-4 text-primary" />
              <span>
                <span className="font-semibold">{saved}</span> added to your gallery.
              </span>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

function ArtList({
  pieces,
  isPending,
  startTransition,
}: {
  pieces: ArtPiece[]
  isPending: boolean
  startTransition: (cb: () => void) => void
}) {
  const router = useRouter()

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="font-serif text-xl font-medium">Your gallery ({pieces.length})</CardTitle>
        <CardDescription>Shown on the home page and public Gallery.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {pieces.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No art yet. Add your first piece to fill the gallery.
          </p>
        )}
        {pieces.map((piece) => (
          <div
            key={piece.id}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 p-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={piece.imageUrl || "/placeholder.svg"}
              alt={piece.title}
              className="size-14 shrink-0 rounded-lg border border-border object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{piece.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {piece.isBookCover ? "Book cover" : "Art piece"}
                {piece.featured ? " · Featured" : ""}
              </p>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await deleteArtPiece(Number(piece.id))
                  router.refresh()
                })
              }
              className="shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
              aria-label={`Delete ${piece.title}`}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function LinksForm({
  isPending,
  startTransition,
}: {
  isPending: boolean
  startTransition: (cb: () => void) => void
}) {
  const router = useRouter()
  const [label, setLabel] = useState("")
  const [url, setUrl] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim() || !url.trim()) return
    startTransition(async () => {
      await createAuthorLink(label, url)
      setLabel("")
      setUrl("")
      router.refresh()
    })
  }

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-xl font-medium">
          <Plus className="size-5 text-primary" /> Add a link
        </CardTitle>
        <CardDescription>Author profile, publication, or social.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="l-label">Label</Label>
            <Input
              id="l-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Amazon Author Page"
              required
              className="text-base"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="l-url">URL</Label>
            <Input
              id="l-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              required
              className="text-base"
            />
          </div>
          <Button type="submit" size="lg" disabled={isPending} className="min-h-11 rounded-full">
            {isPending ? "Saving..." : "Add link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function LinksList({
  links,
  isPending,
  startTransition,
}: {
  links: AuthorLink[]
  isPending: boolean
  startTransition: (cb: () => void) => void
}) {
  const router = useRouter()

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="font-serif text-xl font-medium">Your links ({links.length})</CardTitle>
        <CardDescription>Shown in the site footer.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {links.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No links yet. Add your author or publication link.
          </p>
        )}
        {links.map((link) => (
          <div
            key={link.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/50 p-3"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{link.label}</p>
              <p className="truncate text-xs text-muted-foreground">{link.url}</p>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await deleteAuthorLink(Number(link.id))
                  router.refresh()
                })
              }
              className="shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
              aria-label={`Delete ${link.label}`}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function ResearchForm({
  isPending,
  startTransition,
}: {
  isPending: boolean
  startTransition: (cb: () => void) => void
}) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [doi, setDoi] = useState("")
  const [tags, setTags] = useState("")
  const [saved, setSaved] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    startTransition(async () => {
      await createResearchEntry({ title, content, doi, tags })
      setSaved(title.trim())
      setTitle("")
      setContent("")
      setDoi("")
      setTags("")
      router.refresh()
    })
  }

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-xl font-medium">
          <Plus className="size-5 text-primary" /> Add a research entry
        </CardTitle>
        <CardDescription>Notes, experiments, findings — in your own words.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="r-title">Title</Label>
            <Input id="r-title" value={title} onChange={(e) => setTitle(e.target.value)} required className="text-base" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="r-content">Notes / content</Label>
            <Textarea
              id="r-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste or type your research here. The more you add, the more connections the Coherence Engine can find."
              className="min-h-40 text-base"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="r-doi">DOI (optional)</Label>
              <Input id="r-doi" value={doi} onChange={(e) => setDoi(e.target.value)} placeholder="10.xxxx/xxxxx" className="text-base" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="r-tags">Tags (optional)</Label>
              <Input id="r-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="water, coherence, physics" className="text-base" />
            </div>
          </div>
          <Button type="submit" size="lg" disabled={isPending} className="min-h-11 rounded-full">
            {isPending ? "Saving..." : "Save entry"}
          </Button>
          {saved && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm">
              <CheckCircle2 className="size-4 text-primary" />
              <span>
                <span className="font-semibold">{saved}</span> saved to your research library.
              </span>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

function ResearchList({
  entries,
  isPending,
  startTransition,
}: {
  entries: ResearchEntry[]
  isPending: boolean
  startTransition: (cb: () => void) => void
}) {
  const router = useRouter()

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="font-serif text-xl font-medium">
          Your research ({entries.length})
        </CardTitle>
        <CardDescription>Everything the Coherence Engine can read.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {entries.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No research entries yet. Add your first one to feed the Coherence Engine.
          </p>
        )}
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-card/50 p-3"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{entry.title}</p>
              {entry.content && (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{entry.content}</p>
              )}
              {(entry.doi || entry.tags) && (
                <p className="mt-1 truncate text-[11px] text-muted-foreground">
                  {entry.doi && <span>DOI: {entry.doi}</span>}
                  {entry.doi && entry.tags && <span> · </span>}
                  {entry.tags && <span>{entry.tags}</span>}
                </p>
              )}
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await deleteResearchEntry(Number(entry.id))
                  router.refresh()
                })
              }
              className="shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
              aria-label={`Delete ${entry.title}`}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function WorksList({
  items,
  isPending,
  startTransition,
}: {
  items: ContentItem[]
  isPending: boolean
  startTransition: (cb: () => void) => void
}) {
  const router = useRouter()

  if (items.length === 0) return null

  return (
    <Card className="mt-8 border-border/70">
      <CardHeader>
        <CardTitle className="font-serif text-xl font-medium">Your works ({items.length})</CardTitle>
        <CardDescription>Everything currently in your library.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/50 p-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {item.side === "fiction" ? (
                  <Sparkles className="size-3.5 shrink-0 text-primary" />
                ) : (
                  <Moon className="size-3.5 shrink-0 text-primary" />
                )}
                <p className="truncate font-medium">{item.title}</p>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {TYPE_LABEL[item.type]} · {item.creator}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Download className="size-3.5" />
                {item.downloads.toLocaleString()}
              </span>
              <span className="hidden items-center gap-1 text-sm text-muted-foreground sm:flex">
                <Eye className="size-3.5" />
                {item.views.toLocaleString()}
              </span>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteWork(Number(item.id))
                    router.refresh()
                  })
                }
                className="rounded-md p-2 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                aria-label={`Delete ${item.title}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
