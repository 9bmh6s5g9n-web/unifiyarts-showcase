# UnifyArts.academy

A dual-world creative showcase and analytics platform. Upload books, articles,
portfolios, videos, and infographics; the site reads each submission and sorts
your library into two sides:

- **Fiction** — a luminous world (silver & gold double-helix citadel, the egg, the three moons).
- **Non-fiction** — a deep cosmic world (nebula and lunar engineering).

It then builds side-by-side **fiction vs non-fiction analytics** from everything in the library.

## Features

- Two fully themed worlds with a header toggle
- Filterable showcase gallery (books, articles, portfolios, videos, infographics)
- Upload form that auto-detects fiction vs non-fiction from the title + description (with manual override)
- Analytics dashboard: library-split donut, per-type comparison chart, and per-side breakdowns

## Tech stack

- Next.js (App Router) + React, exported as a fully static site
- Tailwind CSS v4 + shadcn/ui
- Recharts for the analytics charts

## Local development

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Build (static export)

```bash
pnpm build
```

This produces a static site in the **`out/`** folder. There is no server —
everything runs in the browser, which is what makes it a clean fit for
Cloudflare Pages.

## Deploy to Cloudflare Pages (domain: unifiyarts.academy)

1. Push this repository to GitHub.
2. In the Cloudflare dashboard go to **Workers & Pages → Create → Pages → Connect to Git** and select this repo.
3. Set the build settings:
   - **Framework preset:** `Next.js (Static HTML Export)`
   - **Build command:** `pnpm build` (or `npm run build`)
   - **Build output directory:** `out`
4. Deploy. Cloudflare will build and publish the `out/` folder.
5. Under **Custom domains**, add `unifiyarts.academy` (and `www` if you want). Because your
   domain is already on Cloudflare, DNS records are created automatically.

> Note: This is a static build, so uploads live in the browser session only.
> When you're ready for persistent uploads and real cross-visit analytics,
> add a database + file storage and swap the in-memory library for it.
