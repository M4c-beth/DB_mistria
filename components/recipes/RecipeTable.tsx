'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ListPlus, Search } from 'lucide-react';
import { RECIPE_TYPES, type Recipe, type RecipeType } from '@/lib/data/schemas';
import { useGuideStore } from '@/lib/store/guideStore';
import { cn, formatGold } from '@/lib/utils';
import { markSpoiler } from '@/lib/spoiler';
import { useHideSpoilers } from '@/lib/store/settingsStore';
import { SpoilerHiddenNote } from '@/components/spoiler/SpoilerHide';
import { SpoilerText } from '@/components/spoiler/SpoilerText';
import { AddToGuideButton } from '@/components/guide/AddToGuideButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Sprite } from '@/components/ui/Sprite';

export function RecipeTable({ recipes, spoilerNames }: { recipes: Recipe[]; spoilerNames: string[] }): React.JSX.Element {
  const params = useSearchParams();
  const initialType = RECIPE_TYPES.find((t) => t.toLowerCase() === params.get('type'));
  const [query, setQuery] = useState('');
  const [type, setType] = useState<RecipeType | null>(initialType ?? null);
  const addMany = useGuideStore((s) => s.addMany);
  const hideSpoilers = useHideSpoilers();
  const spoilerSet = useMemo(() => new Set(spoilerNames), [spoilerNames]);
  const visible = useMemo(() => (hideSpoilers ? recipes.filter((r) => !r.spoiler) : recipes), [recipes, hideSpoilers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visible.filter(
      (r) =>
        (!type || r.type === type) &&
        (!q || r.name.toLowerCase().includes(q) || r.ingredients.some((i) => i.name.toLowerCase().includes(q))),
    );
  }, [visible, query, type]);

  return (
    <div className="space-y-4">
      <SpoilerHiddenNote count={recipes.length - visible.length} noun="recipes" />
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={query}
          maxLength={60}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search recipes or ingredients…"
          aria-label="Search recipes or ingredients"
          className="h-12 w-full rounded-lg border border-stone-300 bg-white/70 pl-11 pr-3 text-base shadow-sm placeholder:text-stone-400"
        />
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by recipe type">
        {[null, ...RECIPE_TYPES].map((t) => (
          <button
            key={t ?? 'all'}
            type="button"
            aria-pressed={type === t}
            onClick={() => setType(t)}
            className={cn(
              'pill',
              type === t
                ? 'border-mistria-green/40 bg-mistria-green/15 text-mistria-green-ink'
                : 'border-stone-300 bg-white/60 text-stone-600 hover:bg-amber-100',
            )}
          >
            {t ?? 'All types'}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-stone-600" aria-live="polite">
          Showing <span className="font-semibold tabular-nums text-stone-800">{filtered.length}</span> of{' '}
          <span className="tabular-nums">{visible.length}</span> recipes
        </p>
        {filtered.length > 0 && (
          <button
            type="button"
            onClick={() => addMany(filtered.map((r) => ({ kind: 'recipes', slug: r.slug })))}
            className="btn-secondary"
          >
            <ListPlus aria-hidden className="size-4" /> Add all {filtered.length} to guide
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No recipes found.">Try a different ingredient or recipe type.</EmptyState>
      ) : (
        <div className="table-scroll max-h-[70vh] overflow-y-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                <Th className="w-12">
                  <span className="sr-only">Guide</span>
                </Th>
                <Th>Name</Th>
                <Th>Ingredients</Th>
                <Th className="hidden lg:table-cell">Type</Th>
                <Th className="hidden text-right lg:table-cell">Time</Th>
                <Th className="text-right">Sell</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.slug} className="border-b border-stone-200 align-top odd:bg-stone-50 even:bg-white/40">
                  <td className="px-2 py-2">
                    <AddToGuideButton kind="recipes" slug={r.slug} name={r.name} compact />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Sprite src={r.icon} alt="" size={28} />
                      <Link href={`/recipes/${r.slug}/`} className="font-semibold hover:text-mistria-blue-ink hover:underline">
                        {r.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-stone-600">
                    {r.ingredients.map((i, n) => (
                      <span key={i.name}>
                        {n > 0 && ', '}
                        <SpoilerText text={markSpoiler(i.name, spoilerSet.has(i.name))} /> ×{i.amount}
                      </span>
                    ))}
                  </td>
                  <td className="hidden px-3 py-2 lg:table-cell">{r.type}</td>
                  <td className="hidden px-3 py-2 text-right font-mono tabular-nums lg:table-cell">
                    {r.timeMinutes === null ? '—' : `${r.timeMinutes}m`}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{formatGold(r.sellValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }): React.JSX.Element {
  return (
    <th
      scope="col"
      className={cn(
        'sticky top-0 z-10 whitespace-nowrap border-b-2 border-wood-brown bg-stone-100 px-3 py-2 font-heading font-bold text-stone-800',
        className,
      )}
    >
      {children}
    </th>
  );
}
