# Coding Standards

## TypeScript
- Use explicit return types for all functions and components.
- Avoid `any`. Use `unknown` and type guards if the type is truly uncertain.
- Prefer interfaces for object shapes, types for unions/primitives.

## React / Next.js
- Default to Server Components. Only use `'use client'` when interactivity (hooks, event listeners, browser APIs) is strictly required.
- Keep components small and composable. Extract UI logic into separate files.
- Use `next/image` for all images to ensure optimization.

## Database / Prisma
- Always use migrations (`npx prisma migrate dev`). Never use `prisma db push` in production.
- Keep business logic out of the database layer; use service functions or server actions.

## File Naming
- Components: `PascalCase.tsx` (e.g., `VillagerCard.tsx`)
- Utilities/Helpers: `camelCase.ts` (e.g., `formatSeason.ts`)
- Pages/Routes: `page.tsx`, `layout.tsx`, `route.ts`