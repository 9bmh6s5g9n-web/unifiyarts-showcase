export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-center sm:flex-row sm:text-left">
        <div>
          <p className="font-serif text-lg font-semibold">
            UnifyArts<span className="text-primary">.academy</span>
          </p>
          <p className="text-sm text-muted-foreground">Where fiction meets fact.</p>
        </div>
        <p className="text-xs text-muted-foreground">
          {"\u00A9"} {new Date().getFullYear()} UnifyArts Academy. All works belong to their creators.
        </p>
      </div>
    </footer>
  )
}
