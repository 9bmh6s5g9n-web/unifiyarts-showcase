"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"
import { useLibrary } from "@/components/library-provider"
import {
  computeSideStats,
  librarySplit,
  libraryTotals,
  platformBreakdown,
  typeComparison,
  type SideStats,
} from "@/lib/analytics"
import { TYPE_LABEL } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Sparkles, Moon, Eye, Download, FileText, TrendingUp } from "lucide-react"

// Explicit brand colors so the charts stay gold (fiction) + teal (non-fiction)
// regardless of the neutral root theme this section renders in.
const FICTION_COLOR = "oklch(0.78 0.14 84)"
const NONFICTION_COLOR = "oklch(0.72 0.12 205)"

const splitConfig = {
  value: { label: "Works" },
  fiction: { label: "Fiction", color: FICTION_COLOR },
  nonfiction: { label: "Non-fiction", color: NONFICTION_COLOR },
} satisfies ChartConfig

const typeConfig = {
  fiction: { label: "Fiction", color: FICTION_COLOR },
  nonfiction: { label: "Non-fiction", color: NONFICTION_COLOR },
} satisfies ChartConfig

const platformConfig = {
  fiction: { label: "Fiction", color: FICTION_COLOR },
  nonfiction: { label: "Non-fiction", color: NONFICTION_COLOR },
} satisfies ChartConfig

export function AnalyticsDashboard({ isDemo = false }: { isDemo?: boolean }) {
  const { items } = useLibrary()

  const totals = useMemo(() => libraryTotals(items), [items])
  const fiction = useMemo(() => computeSideStats(items, "fiction"), [items])
  const nonfiction = useMemo(() => computeSideStats(items, "nonfiction"), [items])
  const split = useMemo(() => librarySplit(items), [items])
  const comparison = useMemo(() => typeComparison(items), [items])

  // Downloads per platform, split fiction vs non-fiction.
  const platformData = useMemo(() => {
    const map = new Map<string, { platform: string; fiction: number; nonfiction: number }>()
    for (const item of items) {
      for (const p of item.platforms) {
        const row = map.get(p.platform) ?? { platform: p.platform, fiction: 0, nonfiction: 0 }
        if (item.side === "fiction") row.fiction += p.downloads
        else row.nonfiction += p.downloads
        map.set(p.platform, row)
      }
    }
    return [...map.values()].sort((a, b) => b.fiction + b.nonfiction - (a.fiction + a.nonfiction))
  }, [items])

  return (
    <section id="analytics" className="scroll-mt-16 bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="mb-10 text-center">
          <span className="font-serif text-sm uppercase tracking-[0.3em] text-primary">The Reading</span>
          <h2 className="mt-2 font-serif text-4xl font-light tracking-tight text-balance md:text-5xl">
            Analytics
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            The academy reads your whole library — downloads, views, and where they come from — and
            splits it into its two sides, the luminous and the cosmic.
          </p>
          {isDemo && (
            <p className="mx-auto mt-3 inline-block rounded-full bg-secondary px-4 py-1.5 text-xs text-muted-foreground">
              Sample numbers shown. Sign in and open Manage to feed your official data.
            </p>
          )}
        </div>

        {/* Headline totals */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <HeadlineStat
            icon={<Download className="size-5" />}
            value={totals.downloads.toLocaleString()}
            label="Total downloads"
          />
          <HeadlineStat
            icon={<Eye className="size-5" />}
            value={totals.views.toLocaleString()}
            label="Total views"
          />
          <HeadlineStat
            icon={<FileText className="size-5" />}
            value={totals.works.toLocaleString()}
            label="Works in library"
          />
        </div>

        {/* Split + type */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <Card className="border-border/70 lg:col-span-1">
            <CardHeader>
              <CardTitle className="font-serif text-xl font-medium">Library split</CardTitle>
              <CardDescription>Fiction vs non-fiction across everything</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={splitConfig} className="mx-auto aspect-square max-h-56">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
                  <Pie data={split} dataKey="value" nameKey="label" innerRadius={55} strokeWidth={4}>
                    {split.map((entry) => (
                      <Cell
                        key={entry.side}
                        fill={entry.side === "fiction" ? "var(--color-fiction)" : "var(--color-nonfiction)"}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="mt-4 flex justify-center gap-6 text-sm">
                <LegendDot color={FICTION_COLOR} label="Fiction" value={fiction.total} />
                <LegendDot color={NONFICTION_COLOR} label="Non-fiction" value={nonfiction.total} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-serif text-xl font-medium">Works by type</CardTitle>
              <CardDescription>How each content type divides across the two sides</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={typeConfig} className="max-h-64 w-full">
                <BarChart data={comparison} margin={{ left: -12, right: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={28} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="fiction" fill="var(--color-fiction)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="nonfiction" fill="var(--color-nonfiction)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Platform breakdown */}
        <Card className="mb-8 border-border/70">
          <CardHeader>
            <CardTitle className="font-serif text-xl font-medium">Downloads by platform</CardTitle>
            <CardDescription>Where your audience finds your work, split by side</CardDescription>
          </CardHeader>
          <CardContent>
            {platformData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No platform data yet. Add downloads per platform in Manage.
              </p>
            ) : (
              <ChartContainer config={platformConfig} className="max-h-72 w-full">
                <BarChart
                  data={platformData}
                  layout="vertical"
                  margin={{ left: 8, right: 16 }}
                  barSize={18}
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="platform"
                    tickLine={false}
                    axisLine={false}
                    width={96}
                    fontSize={12}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="fiction" stackId="d" fill="var(--color-fiction)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="nonfiction" stackId="d" fill="var(--color-nonfiction)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Two sides */}
        <div className="grid gap-6 md:grid-cols-2">
          <SidePanel
            stats={fiction}
            platforms={platformBreakdown(items, "fiction")}
            worldClass="world-fiction"
            icon={<Sparkles className="size-5" />}
            title="Fiction"
            subtitle="The luminous side"
          />
          <SidePanel
            stats={nonfiction}
            platforms={platformBreakdown(items, "nonfiction")}
            worldClass="world-nonfiction"
            icon={<Moon className="size-5" />}
            title="Non-fiction"
            subtitle="The cosmic side"
          />
        </div>
      </div>
    </section>
  )
}

function HeadlineStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string
  label: string
}) {
  return (
    <Card className="border-border/70">
      <CardContent className="flex items-center gap-4 p-6">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          {icon}
        </span>
        <div>
          <p className="font-serif text-3xl font-semibold tabular-nums leading-none">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function SidePanel({
  stats,
  platforms,
  worldClass,
  icon,
  title,
  subtitle,
}: {
  stats: SideStats
  platforms: { platform: string; downloads: number; views: number }[]
  worldClass: string
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  const maxDownloads = Math.max(1, ...platforms.map((p) => p.downloads))

  return (
    <div className={`${worldClass} rounded-2xl border border-border bg-background p-6 text-foreground`}>
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
          {icon}
        </span>
        <div>
          <h3 className="font-serif text-2xl font-medium leading-none">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat icon={<Download className="size-4" />} value={stats.downloads.toLocaleString()} label="Downloads" />
        <Stat icon={<Eye className="size-4" />} value={stats.views.toLocaleString()} label="Views" />
        <Stat icon={<TrendingUp className="size-4" />} value={stats.avgDownloads.toLocaleString()} label="Avg / work" />
      </div>

      {platforms.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Downloads by platform</p>
          <div className="space-y-3">
            {platforms.map((p) => (
              <div key={p.platform} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-sm text-muted-foreground">{p.platform}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(p.downloads / maxDownloads) * 100}%` }}
                  />
                </div>
                <span className="w-14 shrink-0 text-right text-sm font-medium tabular-nums">
                  {p.downloads.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.topItem && (
        <div className="mt-6 rounded-xl border border-border/70 bg-card/60 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Top performer</p>
          <p className="mt-1 font-serif text-lg font-medium leading-snug text-balance">
            {stats.topItem.title}
          </p>
          <p className="text-sm text-muted-foreground">
            {TYPE_LABEL[stats.topItem.type]} · {stats.topItem.downloads.toLocaleString()} downloads ·{" "}
            {stats.topItem.creator}
          </p>
        </div>
      )}
    </div>
  )
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string | number
  label: string
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/60 p-3 text-center">
      <span className="mx-auto flex justify-center text-primary">{icon}</span>
      <p className="mt-1 font-serif text-xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function LegendDot({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <span className="flex items-center gap-2">
      <span className="size-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-muted-foreground">
        {label} <span className="font-semibold text-foreground">{value}</span>
      </span>
    </span>
  )
}
