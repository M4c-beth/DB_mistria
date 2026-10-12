import { Flower2, Leaf, Snowflake, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SEASONS, type Season } from '@/lib/data/schemas';

export const SEASON_ICON: Record<Season, LucideIcon> = { Spring: Flower2, Summer: Sun, Fall: Leaf, Winter: Snowflake };

export const SEASON_STYLE: Record<Season, string> = {
  Spring: 'bg-pink-100 text-pink-900 border-pink-200',
  Summer: 'bg-amber-100 text-amber-900 border-amber-200',
  Fall: 'bg-orange-100 text-orange-900 border-orange-200',
  Winter: 'bg-sky-100 text-sky-900 border-sky-200',
};

export function SeasonTags({ seasons }: { seasons: Season[] }): React.JSX.Element {
  if (seasons.length === 0) return <span className="text-stone-400">—</span>;
  if (seasons.length === SEASONS.length) {
    return <span className="rounded border border-stone-300 bg-stone-100 px-1.5 py-0.5 text-xs font-semibold">All seasons</span>;
  }
  return (
    <span className="flex flex-wrap gap-1">
      {seasons.map((s) => {
        const Icon = SEASON_ICON[s];
        return (
          <span key={s} className={cn('inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-semibold', SEASON_STYLE[s])}>
            <Icon aria-hidden className="size-3" />
            {s}
          </span>
        );
      })}
    </span>
  );
}
