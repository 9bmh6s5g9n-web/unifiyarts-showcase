'use client'

import { useLibrary } from '@/components/library-provider'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

const SECTIONS = [
  { id: 'showcase', label: 'Showcase' },
  { id: 'upload', label: 'Upload' },
  { id: 'analytics', label: 'Analytics' },
]

export function SiteHeader() {
  const { world, setWorld } = useLibrary()

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex items-baseline gap-1.5">
          <span className="font-serif text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            UnifyArts
          </span>
          <span className="text-xs font-medium tracking-widest text-primary">
            .ACADEMY
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div
          role="tablist"
          aria-label="Choose world"
          className="flex items-center gap-1 rounded-full border border-border bg-secondary/60 p-1"
        >
          <WorldButton
            active={world === 'fiction'}
            onClick={() => setWorld('fiction')}
            icon={<Sun className="size-4" />}
            label="Fiction"
          />
          <WorldButton
            active={world === 'nonfiction'}
            onClick={() => setWorld('nonfiction')}
            icon={<Moon className="size-4" />}
            label="Non-fiction"
          />
        </div>
      </div>
    </header>
  )
}

function WorldButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'flex min-h-9 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
