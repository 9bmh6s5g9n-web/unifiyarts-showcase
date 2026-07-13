import Image from "next/image"
import { buttonVariants } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface WorldSectionProps {
  variant: "fiction" | "nonfiction"
}

const CONTENT = {
  fiction: {
    kicker: "The Luminous Side",
    title: "Fiction",
    blurb:
      "Where silver and gold entwine and light bursts through the sky. A citadel of story, myth, and imagination.",
    image: "/fiction-hero.png",
    imageAlt:
      "A luminous citadel formed from an intertwined silver and gold double helix, feminine hands cradling a glowing egg at its peak beneath three moons",
    href: "#showcase",
    cta: "Enter the Citadel",
  },
  nonfiction: {
    kicker: "The Cosmic Side",
    title: "Non-Fiction",
    blurb:
      "Where nebulae drift and precise minds engineer the real. Truth, craft, and the architecture of what is.",
    image: "/nonfiction-hero.png",
    imageAlt:
      "A deep cosmic scene with a colorful nebula and precise futuristic lunar engineering structures near a large moon",
    href: "#showcase",
    cta: "Enter the Cosmos",
  },
} as const

export function WorldSection({ variant }: WorldSectionProps) {
  const c = CONTENT[variant]
  const worldClass = variant === "fiction" ? "world-fiction" : "world-nonfiction"

  return (
    <section className={`${worldClass} relative isolate overflow-hidden bg-background text-foreground`}>
      <div className="absolute inset-0 -z-10">
        <Image
          src={c.image || "/placeholder.svg"}
          alt={c.imageAlt}
          fill
          priority={variant === "fiction"}
          className="object-cover object-center opacity-40"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
      </div>

      <div className="mx-auto flex min-h-[85vh] max-w-6xl flex-col items-center justify-end gap-6 px-6 py-16 text-center md:min-h-[90vh] md:justify-center">
        <span className="font-serif text-sm uppercase tracking-[0.35em] text-primary md:text-base">{c.kicker}</span>
        <h2 className="font-serif text-6xl font-light leading-none tracking-tight text-balance md:text-8xl">
          {c.title}
        </h2>
        <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">{c.blurb}</p>
        <a
          href={c.href}
          className={cn(buttonVariants({ size: "lg" }), "mt-2 h-11 gap-2 rounded-full px-8 text-base")}
        >
          {c.cta}
          <ArrowRight className="size-4" />
        </a>
      </div>
    </section>
  )
}
