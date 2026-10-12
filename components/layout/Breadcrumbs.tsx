import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }): React.JSX.Element {
  const all: Crumb[] = [{ label: 'Home', href: '/' }, ...items];
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-stone-600">
      <ol className="flex flex-wrap items-center gap-1">
        {all.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-1">
            {i > 0 && <ChevronRight aria-hidden className="size-3.5 text-stone-400" />}
            {c.href && i < all.length - 1 ? (
              <Link href={c.href} className="rounded hover:text-mistria-blue-ink hover:underline">
                {c.label}
              </Link>
            ) : (
              <span aria-current={i === all.length - 1 ? 'page' : undefined} className="font-semibold text-stone-800">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
