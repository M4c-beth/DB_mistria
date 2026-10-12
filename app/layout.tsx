import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter, Nunito } from 'next/font/google';
import { getDataMeta, getSearchIndex } from '@/lib/data';
import { GlobalSearch } from '@/components/layout/GlobalSearch';
import { MobileNav } from '@/components/layout/MobileNav';
import { Sidebar } from '@/components/layout/Sidebar';
import './globals.css';

const heading = Nunito({ subsets: ['latin'], variable: '--font-heading', weight: ['700', '800'] });
const body = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: { default: 'Mistria Almanac — Fields of Mistria Database', template: '%s · Mistria Almanac' },
  description:
    'Villager gift preferences, fish, bugs and crops by season for Fields of Mistria — and build your own printable PDF guide.',
};

// GitHub Pages can't send HTTP headers, so the policy ships as a meta tag.
// Next's static export inlines its bootstrap scripts, hence 'unsafe-inline'.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  const meta = getDataMeta();
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <head>
        {process.env.NODE_ENV === 'production' && <meta httpEquiv="Content-Security-Policy" content={CSP} />}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body className="flex min-h-screen">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-amber-50 focus:px-3 focus:py-2">
          Skip to content
        </a>
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-amber-200 bg-stone-50/90 px-4 backdrop-blur md:px-8">
            <Link href="/" className="rounded-md text-2xl md:hidden" aria-label="Mistria Almanac home">
              <span aria-hidden>🌾</span>
            </Link>
            <GlobalSearch index={getSearchIndex()} />
          </header>
          <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-12">
            {children}
          </main>
          <footer className="border-t border-amber-200 px-4 pb-20 pt-6 text-xs text-stone-600 md:px-8 md:pb-6">
            <p>
              Game data from the{' '}
              <a href={meta.source} target="_blank" rel="noopener noreferrer" className="font-semibold text-mistria-blue-ink underline">
                Fields of Mistria Wiki
              </a>{' '}
              ({meta.license}), last updated {meta.fetchedAt}. Fields of Mistria is © NPC Studio. This is an unofficial fan
              project.
            </p>
          </footer>
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
