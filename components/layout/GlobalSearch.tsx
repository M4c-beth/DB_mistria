'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHideSpoilers } from '@/lib/store/settingsStore';

export interface SearchItem {
  name: string;
  kind: string;
  href: string;
  spoiler: boolean;
}

const MAX_RESULTS = 8;

export function GlobalSearch({ index }: { index: SearchItem[] }): React.JSX.Element {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideSpoilers = useHideSpoilers();

  const results = useMemo((): SearchItem[] => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const pool = hideSpoilers ? index.filter((i) => !i.spoiler) : index;
    const starts = pool.filter((i) => i.name.toLowerCase().startsWith(q));
    const contains = pool.filter((i) => !i.name.toLowerCase().startsWith(q) && i.name.toLowerCase().includes(q));
    return [...starts, ...contains].slice(0, MAX_RESULTS);
  }, [index, query, hideSpoilers]);

  const go = (item: SearchItem): void => {
    setOpen(false);
    setQuery('');
    router.push(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showList = open && query.trim().length > 0;

  return (
    <div className="relative w-full max-w-md">
      <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
      <input
        type="search"
        role="combobox"
        aria-label="Search villagers, fish, bugs and crops"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && results[active] ? `${listId}-${active}` : undefined}
        placeholder="Search villagers, fish, bugs, crops…"
        maxLength={60}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={onKeyDown}
        className="h-10 w-full rounded-md border border-stone-300 bg-white/70 pl-9 pr-3 text-sm placeholder:text-stone-400"
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-40 mt-1 overflow-hidden rounded-lg border border-stone-300 bg-amber-50 shadow-lg shadow-stone-300/50"
        >
          {results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-stone-600">Nothing in the almanac matches “{query}”.</li>
          ) : (
            results.map((r, i) => (
              <li key={`${r.kind}-${r.href}`} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                <Link
                  href={r.href}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setOpen(false);
                    setQuery('');
                  }}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 text-sm',
                    i === active ? 'bg-amber-100' : 'hover:bg-amber-100',
                  )}
                >
                  <span className="font-semibold">{r.name}</span>
                  <span className="text-xs text-stone-600">{r.kind}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
