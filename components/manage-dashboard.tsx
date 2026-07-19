"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createWork, deleteWork, importWorks, seedDemoData, type PlatformInput } from "@/app/actions/works"
import { authClient } from "@/lib/auth-client"
import { classifySide, CONTENT_TYPES, TYPE_LABEL, type ContentItem, type ContentType, type Side } from "@/lib/types"
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

export function ManageDashboard({ items, userName }: { items: ContentItem[]; userName: string }) {
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

        {items.length === 0 && (
          <Card className="mb-8 border-dashed border-primary/40 bg-primary/5">
            <CardContent className="flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">Your library is empty</p>
                <p className="text-sm text-muted-foreground">
                  Load a set of sample works to see how everything looks, then replace it with your
                  own data.
                </p>
              </div>
              <Button
                onClick={() => startTransition(async () => { await seedDemoData(); router.refresh() })}
                disabled={isPending}
                className="rounded-full"
              >
                Load sample data
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          <ManualForm isPending={isPending} startTransition={startTransition} />
          <CsvImport isPending={isPending} startTransition={startTransition} />
        </div>

        <WorksList items={items} isPending={isPending} startTransition={startTransition} />
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
        const count = await importWorks(rows)
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
