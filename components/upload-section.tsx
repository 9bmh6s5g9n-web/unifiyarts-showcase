"use client"

import { useMemo, useState } from "react"
import { useLibrary } from "@/components/library-provider"
import { classifySide, CONTENT_TYPES, type ContentType, type Side } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sparkles, Moon, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

type SideChoice = Side | "auto"

export function UploadSection() {
  const { addItem, setWorld } = useLibrary()

  const [title, setTitle] = useState("")
  const [creator, setCreator] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [type, setType] = useState<ContentType>("book")
  const [sideChoice, setSideChoice] = useState<SideChoice>("auto")
  const [justAdded, setJustAdded] = useState<string | null>(null)

  // Live read of the content to predict which side it belongs to.
  const prediction = useMemo(
    () => classifySide(`${title} ${excerpt}`),
    [title, excerpt],
  )

  const resolvedSide: Side = sideChoice === "auto" ? prediction.side : sideChoice

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    addItem({
      id: crypto.randomUUID(),
      title: title.trim(),
      creator: creator.trim() || "Anonymous",
      type,
      side: resolvedSide,
      excerpt: excerpt.trim() || "No description provided.",
      views: 0,
      words: excerpt.trim().split(/\s+/).filter(Boolean).length,
      createdAt: new Date().toISOString().slice(0, 10),
    })

    setWorld(resolvedSide)
    setJustAdded(title.trim())
    setTitle("")
    setCreator("")
    setExcerpt("")
    setType("book")
    setSideChoice("auto")
  }

  return (
    <section id="upload" className="scroll-mt-16 bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
        <div className="mb-10 text-center">
          <span className="font-serif text-sm uppercase tracking-[0.3em] text-primary">
            Contribute
          </span>
          <h2 className="mt-2 font-serif text-4xl font-light tracking-tight text-balance md:text-5xl">
            Upload a Work
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-pretty leading-relaxed text-muted-foreground">
            Add it to the showcase. As you type, the archive reads your words and predicts which
            side it belongs to — you can always decide for yourself.
          </p>
        </div>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-medium">New submission</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The Citadel of the Double Helix"
                  className="text-base"
                  required
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="creator">Creator</Label>
                  <Input
                    id="creator"
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                    placeholder="Your name"
                    className="text-base"
                  />
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
                <Label htmlFor="excerpt">Description / excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A few sentences about the work. The more you write, the better the archive reads its nature."
                  className="min-h-28 text-base"
                />
              </div>

              <div className="grid gap-2">
                <Label>Side</Label>
                <div className="flex flex-wrap gap-2">
                  <SideOption
                    active={sideChoice === "auto"}
                    onClick={() => setSideChoice("auto")}
                    label="Auto-detect"
                  />
                  <SideOption
                    active={sideChoice === "fiction"}
                    onClick={() => setSideChoice("fiction")}
                    label="Fiction"
                  />
                  <SideOption
                    active={sideChoice === "nonfiction"}
                    onClick={() => setSideChoice("nonfiction")}
                    label="Non-fiction"
                  />
                </div>

                {(title || excerpt) && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-border/70 bg-muted/50 p-3 text-sm">
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
                      {sideChoice === "auto" && (
                        <> · {Math.round(prediction.confidence * 100)}% signal</>
                      )}
                    </span>
                  </div>
                )}
              </div>

              <Button type="submit" size="lg" className="min-h-11 rounded-full">
                Add to Showcase
              </Button>

              {justAdded && (
                <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm">
                  <CheckCircle2 className="size-4 text-primary" />
                  <span>
                    <span className="font-semibold">{justAdded}</span> was added and the analytics
                    updated.
                  </span>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function SideOption({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-9 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  )
}
