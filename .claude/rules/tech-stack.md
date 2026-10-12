# Tech Stack & Architecture

## Frontend
- **Framework:** Next.js 14+ (App Router) with static export (`output: 'export'`)
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Icons:** Lucide React

## Data
- **No database server.** The site is fully static. Game data lives in the repo as typed JSON/TS files under `data/`, validated with Zod at build time.
- **Source:** The official wiki (fieldsofmistria.wiki.gg, CC BY-SA). Every record keeps a `source` URL, and the site credits the wiki.
- **Data access:** Pages read data through helper functions in `lib/data/`, never by importing JSON directly in components, so the storage format can change later.
- **Pages:** Every detail page is pre-rendered with `generateStaticParams`.

## Client Features
- **Search & filters:** Client-side, over the static data.
- **PDF export:** Generated entirely in the browser (jsPDF + jspdf-autotable, lazy-loaded). Nothing is uploaded anywhere.
- **State:** Zustand (for client-side UI state like filters and the PDF selection list)

## Deployment
- **Hosting:** GitHub Pages, built and deployed by a GitHub Actions workflow on push to `main`.
- **Base path:** The site is served from `/<repo-name>/`, so `basePath` is set in `next.config` and all internal links/assets must respect it.
- **Images:** `next/image` with `unoptimized: true` (no image server on Pages).
