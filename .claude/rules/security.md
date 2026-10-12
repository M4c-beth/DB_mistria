# Security Guidelines & Best Practices

> **Current deployment:** The site is a static export on GitHub Pages, with no server, database, auth or API routes. Sections 2, 3 and 5 (rate limiting, CORS, CSRF) apply only if a backend is added later. What applies now:
> - Validate all bundled game data with Zod at build time.
> - Treat search input and URL params as untrusted; never render them as HTML.
> - GitHub Pages cannot set HTTP headers, so the CSP and referrer policy go in a `<meta http-equiv>` tag in the root layout. Clickjacking protection (`X-Frame-Options`, CSP `frame-ancestors`) only works as a real header, so it is unavailable on Pages; this is acceptable because the site has no logged-in actions.
> - Keep dependencies minimal and audited (`npm audit` in CI).

## Core Philosophy
Security is non-negotiable. Assume all user input is malicious, all network requests can be intercepted, and all client-side code can be tampered with. The AI must write defensively, prioritizing data integrity, secure authentication, and protection against common web vulnerabilities (XSS, SQLi, CSRF).

---

## 1. Input Validation & Sanitization (The First Line of Defense)
**Never trust client input.** All data entering the server must be strictly validated.

- **Use Zod:** Every API route, Server Action, and form submission must validate its payload using `zod`.
- **Strict Typing:** Use `.strict()` or `.strip()` in Zod schemas to prevent unexpected fields from reaching the database.
- **Sanitization:** If accepting rich text (e.g., community descriptions), sanitize it using a library like `DOMPurify` before saving or rendering. For standard database fields, rely on strict Zod string/number validation.
- **File Uploads:** If allowing image uploads (e.g., custom villager portraits), validate file types (MIME types), restrict file sizes, and rename files to prevent path traversal attacks. Store them in an isolated bucket (e.g., Supabase Storage or AWS S3), never in the public `/public` directory.

---

## 2. Database & ORM Security (Prisma/PostgreSQL)
- **Prevent SQL Injection:** Prisma handles this automatically for standard queries. If you *must* use `prisma.$queryRaw`, **always** use tagged template literals (`Prisma.sql`) to parameterize inputs. Never concatenate strings into raw queries.
- **Prevent Mass Assignment:** Never pass raw request bodies directly into `prisma.model.create()` or `.update()`. Always explicitly pick the allowed fields using Zod's `.pick()` or object destructuring.
- **Data Exposure:** Never return sensitive database fields (like internal IDs, hashed passwords, or admin flags) to the client. Use a "Data Transfer Object" (DTO) pattern or Zod's `.omit()` to strip sensitive data before sending the response.
- **Row-Level Security (RLS):** If using Supabase, enable RLS on all tables. Even if the app logic checks permissions, the database must enforce it as a fallback.

---

## 3. Authentication & Authorization
*Assumption: The site has public read access, but restricted write/admin access.*

- **Use Established Providers:** Use NextAuth (Auth.js), Clerk, or Supabase Auth. **Never** write custom authentication or password hashing logic.
- **Middleware is Mandatory:** Protect all `/admin`, `/dashboard`, or `/api/internal` routes using Next.js Middleware (`middleware.ts`). Check for valid session tokens *before* the route loads.
- **Server-Side Enforcement:** Hiding a "Delete" button on the UI is **not** security. Every Server Action and API route must independently verify the user's session and role (e.g., `isAdmin`) before executing.
- **Secure Cookies:** Session cookies must be configured with:
  - `httpOnly: true` (prevents XSS theft)
  - `secure: true` (HTTPS only)
  - `sameSite: 'strict'` or `'lax'` (prevents CSRF)

---

## 4. Frontend Security (React / Next.js)
- **XSS Prevention:** React escapes curly braces `{}` by default. **Never** use `dangerouslySetInnerHTML` unless the content has been strictly sanitized and is from a trusted source.
- **Environment Variables:** 
  - Never expose secret keys to the client. Only prefix variables with `NEXT_PUBLIC_` if they are strictly meant for the browser (e.g., public analytics IDs).
  - Never log environment variables or sensitive payloads to the console in production.
- **Dependency Security:** Regularly audit dependencies. Do not install obscure or unmaintained npm packages for critical functionality.

---

## 5. API & Network Security
- **Rate Limiting:** Implement rate limiting on public API routes and Server Actions (e.g., using `upstash/ratelimit` or Vercel's built-in tools) to prevent abuse, scraping, and brute-force attacks.
- **CORS Configuration:** If exposing API routes, restrict `Access-Control-Allow-Origin` to your specific domain. Never use `*` in production.
- **CSRF Protection:** For any state-changing requests (POST, PUT, DELETE) that rely on cookies, ensure CSRF tokens are validated, or rely on the `SameSite` cookie attribute.
- **Security Headers:** Configure Next.js headers in `next.config.js` to include:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` (prevents clickjacking)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - A strict `Content-Security-Policy` (CSP).

---

## 6. AI Code Generation Rules
When generating code, the AI must adhere to these strict checks:
1. **No `any` types:** Weak typing leads to security holes. Use strict TypeScript.
2. **No hardcoded secrets:** If a code snippet requires an API key, use `process.env.MY_SECRET` and add a comment reminding the user to add it to `.env.local`.
3. **Error Handling:** Never expose stack traces or internal database errors to the client. Catch errors and return generic, safe error messages (e.g., "An internal error occurred" instead of "Postgres connection failed at line 42").