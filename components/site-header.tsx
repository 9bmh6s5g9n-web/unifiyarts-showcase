"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLibrary } from "@/components/library-provider"
import { authClient } from "@/lib/auth-client"
import { Moon, Sun, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const SECTIONS = [
  { id: "gallery", label: "Gallery" },
  { id: "showcase", label: "Showcase" },
  { id: "analytics", label: "Analytics" },
]

export function SiteHeader({ authed = false }: { authed?: boolean }) {
  const { world, setWorld } = useLibrary()
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut()
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex items-baseline gap-1.5">
          <span className="font-serif text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            UnifyArts
          </span>
          <span className="text-xs font-medium tracking-widest text-primary">.ACADEMY</span>
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
          <Link
            href="/manage"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Manage
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div
            role="tablist"
            aria-label="Choose world"
            className="flex items-center gap-1 rounded-full border border-border bg-secondary/60 p-1"
          >
            <WorldButton
              active={world === "fiction"}
              onClick={() => setWorld("fiction")}
              icon={<Sun className="size-4" />}
              label="Fiction"
            />
            <WorldButton
              active={world === "nonfiction"}
              onClick={() => setWorld("nonfiction")}
              icon={<Moon className="size-4" />}
              label="Non-fiction"
            />
          </div>

          {authed ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          ) : (
            <Link
              href="/sign-in"
              className="hidden min-h-9 items-center rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:flex"
            >
              Sign in
            </Link>
          )}
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
        "flex min-h-9 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
