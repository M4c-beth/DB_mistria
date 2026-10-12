'use client';

import { Info } from 'lucide-react';
import type { Bug, Crop, Fish, Forage } from '@/lib/data/schemas';
import { formatGold } from '@/lib/utils';
import { SeasonTags } from '@/components/ui/SeasonTag';
import { Tooltip } from '@/components/ui/Tooltip';
import { SpoilerText } from '@/components/spoiler/SpoilerText';

export interface Column<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  /** Hidden on small screens to avoid pinch-zooming; still on the wiki page. */
  secondary?: boolean;
  numeric?: boolean;
}

const lines = (items: string[]): React.ReactNode =>
  items.length ? (
    <span className="flex flex-col">
      {items.map((i) => (
        <span key={i}>
          <SpoilerText text={i} />
        </span>
      ))}
    </span>
  ) : (
    <span className="text-stone-400">—</span>
  );

const text = (v: string | null): React.ReactNode =>
  v === null ? <span className="text-stone-400">—</span> : <SpoilerText text={v} />;

export const FISH_COLUMNS: Column<Fish>[] = [
  { header: 'Seasons', cell: (r) => <SeasonTags seasons={r.seasons} /> },
  { header: 'Location', cell: (r) => lines(r.locations) },
  { header: 'Weather', cell: (r) => lines(r.weather), secondary: true },
  { header: 'Rarity', cell: (r) => text(r.rarity), secondary: true },
  { header: 'Size', cell: (r) => text(r.size), secondary: true },
  {
    header: 'Method',
    cell: (r) => [r.method.rod && 'Rod', r.method.diving && 'Diving'].filter(Boolean).join(', ') || 'Other',
    secondary: true,
  },
  { header: 'Sell', cell: (r) => formatGold(r.sellValue), numeric: true },
];

export const BUG_COLUMNS: Column<Bug>[] = [
  { header: 'Seasons', cell: (r) => <SeasonTags seasons={r.seasons} /> },
  { header: 'Location', cell: (r) => lines(r.locations) },
  { header: 'Time', cell: (r) => text(r.time), secondary: true },
  { header: 'Weather', cell: (r) => lines(r.weather), secondary: true },
  { header: 'Rarity', cell: (r) => text(r.rarity), secondary: true },
  { header: 'Needs', cell: (r) => text(r.spawnCondition), secondary: true },
  { header: 'Sell', cell: (r) => formatGold(r.sellValue), numeric: true },
];

export const CROP_COLUMNS: Column<Crop>[] = [
  { header: 'Seasons', cell: (r) => <SeasonTags seasons={r.seasons} /> },
  { header: 'Seed', cell: (r) => text(r.seed), secondary: true },
  {
    header: 'Grows',
    numeric: true,
    cell: (r) =>
      r.growthDays === null ? (
        '—'
      ) : r.regrowDays ? (
        <Tooltip content={`Regrows every ${r.regrowDays} days after the first harvest.`}>
          <button type="button" className="inline-flex items-center gap-1 rounded underline decoration-dotted underline-offset-2">
            {r.growthDays} days
            <Info aria-hidden className="size-3.5 text-mistria-blue-ink" />
          </button>
        </Tooltip>
      ) : (
        `${r.growthDays} days`
      ),
  },
  { header: 'Regrows', cell: (r) => (r.regrowDays ? `${r.regrowDays} days` : 'No'), numeric: true, secondary: true },
  { header: 'Sell', cell: (r) => formatGold(r.sellValue), numeric: true },
];

export const FORAGE_COLUMNS: Column<Forage>[] = [
  { header: 'Seasons', cell: (r) => <SeasonTags seasons={r.seasons} /> },
  { header: 'Location', cell: (r) => lines(r.locations) },
  { header: 'How to get', cell: (r) => lines(r.sources), secondary: true },
  { header: 'Sell', cell: (r) => formatGold(r.sellValue), numeric: true },
];
