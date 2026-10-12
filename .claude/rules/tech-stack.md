# Tech Stack & Architecture

## Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Icons:** Lucide React

## Backend & Database
- **ORM:** Prisma
- **Database:** PostgreSQL (via Supabase or Neon)
- **Data Fetching:** React Server Components (RSC) for data fetching. Use `fetch` with caching for external API/wiki data if applicable.

## State & Forms
- **State:** Zustand (for client-side UI state like filters)
- **Forms:** React Hook Form + Zod (for any admin/data-entry forms)

## Deployment
- **Hosting:** Vercel