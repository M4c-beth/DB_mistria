'use client';

import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExternalLink, ListPlus, Search, X } from 'lucide-react';
import { SEASONS, SeasonSchema, type Bug, type CollectionKind, type Crop, type Fish, type Season } from '@/lib/data/schemas';
import { useFilterStore } from '@/lib/store/filterStore';
import { useGuideStore } from '@/lib/store/guideStore';
import { cn } from '@/lib/utils';
import { AddToGuideButton } from '@/components/guide/AddToGuideButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { SEASON_ICON } from '@/components/ui/SeasonTag';
import { Sprite } from '@/components/ui/Sprite';
import { BUG_COLUMNS, CROP_COLUMNS, FISH_COLUMNS, type Column } from './columns';

type Props =
  | { kind: 'fish'; rows: Fish[]; season?: Season }
  | { kind: 'bugs'; rows: Bug[]; season?: Season }
  | { kind: 'crops'; rows: Crop[]; season?: Season };

const NOUN: Record<CollectionKind, string> = { fish: 'fish', bugs: 'bugs', crops: 'crops' };

/**
 * Searchable, filterable table. When `season` is given the season filter is fixed
 * (used on season pages) and URL params are ignored.
 */
export function CollectionTable(props: Props): React.JSX.Element {
  switch (props.kind) {
    case 'fish':
      return <Table kind="fish" rows={props.rows} columns={FISH_COLUMNS} fixedSeason={props.season} />;
    case 'bugs':
      return <Table kind="bugs" rows={props.rows} columns={BUG_COLUMNS} fixedSeason={props.season} />;
    case 'crops':
      return <Table kind="crops" rows={props.rows} columns={CROP_COLUMNS} fixedSeason={props.season} />;
  }
}

interface Row {
  slug: string;
  name: string;
  seasons: Season[];
  icon: string | null;
  source: string;
  locations?: string[];
}

interface TableProps<T extends Row> {
  kind: CollectionKind;
  rows: T[];
  columns: Column<T>[];
  fixedSeason?: Season;
}

function Table<T extends Row>({ kind, rows, columns, fixedSeason }: TableProps<T>): React.JSX.Element {
  const params = useSearchParams();
  const stored = useFilterStore((s) => s.filters[kind]);
  const setFilter = useFilterStore((s) => s.setFilter);
  const reset = useFilterStore((s) => s.reset);
  const addMany = useGuideStore((s) => s.addMany);

  // Seed filters from ?q= / ?season= links (search results, season pages).
  useEffect(() => {
    if (fixedSeason) return;
    const q = params.get('q');
    const season = SeasonSchema.safeParse(params.get('season'));
    if (q !== null || season.success) {
      reset(kind);
      setFilter(kind, { query: (q ?? '').slice(0, 60), season: season.success ? season.data : null });
    }
  }, [params, kind, fixedSeason, reset, setFilter]);

  const season = fixedSeason ?? stored.season;
  const query = fixedSeason ? '' : stored.query;
  const location = fixedSeason ? null : stored.location;

  const locations = useMemo(
    () => [...new Set(rows.flatMap((r) => r.locations ?? []))].sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!q || r.name.toLowerCase().includes(q)) &&
        (!season || r.seasons.includes(season)) &&
        (!location || (r.locations ?? []).includes(location)),
    );
  }, [rows, query, season, location]);

  const hasFilters = !fixedSeason && (query || season || location);

  return (
    <div className="space-y-4">
      {!fixedSeason && (
        <div className="space-y-3">
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={stored.query}
              maxLength={60}
              onChange={(e) => setFilter(kind, { query: e.target.value })}
              placeholder={`Search ${NOUN[kind]}…`}
              aria-label={`Search ${NOUN[kind]}`}
              className="h-12 w-full rounded-lg border border-stone-300 bg-white/70 pl-11 pr-3 text-base shadow-sm placeholder:text-stone-400"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by season">
            <SeasonPill active={season === null} onClick={() => setFilter(kind, { season: null })}>
              All seasons
            </SeasonPill>
            {SEASONS.map((s) => {
              const Icon = SEASON_ICON[s];
              return (
                <SeasonPill key={s} active={season === s} onClick={() => setFilter(kind, { season: season === s ? null : s })}>
                  <Icon aria-hidden className="size-4" />
                  {s}
                </SeasonPill>
              );
            })}
            {locations.length > 1 && (
              <select
                value={location ?? ''}
                onChange={(e) => setFilter(kind, { location: e.target.value || null })}
                aria-label="Filter by location"
                className="h-10 rounded-md border border-stone-300 bg-white/70 px-3 text-sm font-semibold text-stone-800"
              >
                <option value="">All locations</option>
                {locations.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            )}
            {hasFilters && (
              <button type="button" onClick={() => reset(kind)} className="btn h-10 text-stone-600 hover:bg-stone-100">
                <X aria-hidden className="size-4" /> Clear
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-stone-600" aria-live="polite">
          Showing <span className="font-semibold tabular-nums text-stone-800">{filtered.length}</span> of{' '}
          <span className="tabular-nums">{rows.length}</span> {NOUN[kind]}
        </p>
        {filtered.length > 0 && (
          <button
            type="button"
            onClick={() => addMany(filtered.map((r) => ({ kind, slug: r.slug })))}
            className="btn-secondary"
          >
            <ListPlus aria-hidden className="size-4" />
            Add all {filtered.length} to guide
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={`No ${NOUN[kind]} found${season ? ` for ${season}` : ''}.`}>
          Try changing your filters or search.
        </EmptyState>
      ) : (
        <div className="table-scroll max-h-[70vh] overflow-y-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                <Th className="w-12">
                  <span className="sr-only">Guide</span>
                </Th>
                <Th>Name</Th>
                {columns.map((c) => (
                  <Th key={c.header} className={cn(c.secondary && 'hidden lg:table-cell', c.numeric && 'text-right')}>
                    {c.header}
                  </Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.slug} className="border-b border-stone-200 align-top odd:bg-stone-50 even:bg-white/40">
                  <td className="px-2 py-2">
                    <AddToGuideButton kind={kind} slug={r.slug} name={r.name} compact />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Sprite src={r.icon} alt="" size={28} />
                      <a
                        href={r.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1 font-semibold text-stone-800 hover:text-mistria-blue-ink hover:underline"
                      >
                        {r.name}
                        <ExternalLink aria-label="(opens wiki)" className="size-3 text-stone-400 group-hover:text-mistria-blue-ink" />
                      </a>
                    </div>
                  </td>
                  {columns.map((c) => (
                    <td
                      key={c.header}
                      className={cn(
                        'px-3 py-2',
                        c.secondary && 'hidden lg:table-cell',
                        c.numeric && 'text-right font-mono tabular-nums',
                      )}
                    >
                      {c.cell(r)}
                    </td>
                  ))}
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

function SeasonPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'pill',
        active
          ? 'border-mistria-green/40 bg-mistria-green/15 text-mistria-green-ink'
          : 'border-stone-300 bg-white/60 text-stone-600 hover:bg-amber-100',
      )}
    >
      {children}
    </button>
  );
}
