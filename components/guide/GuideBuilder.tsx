'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Download, Loader2, Trash2, X } from 'lucide-react';
import {
  GIFT_TIERS,
  type Bug,
  type Crop,
  type DataMeta,
  type Fish,
  type Forage,
  type GuideKind,
  type MuseumSet,
  type Quests,
  type Recipe,
  type Schedule,
  type Villager,
} from '@/lib/data/schemas';
import { useGuideHydrated, useGuideStore } from '@/lib/store/guideStore';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { Sprite } from '@/components/ui/Sprite';
import { TIER_LABEL, TIER_STYLE } from '@/components/ui/GiftBadge';
import { markSpoiler } from '@/lib/spoiler';
import { useHideSpoilers } from '@/lib/store/settingsStore';
import { SpoilerText } from '@/components/spoiler/SpoilerText';

interface Props {
  villagers: Villager[];
  fish: Fish[];
  bugs: Bug[];
  crops: Crop[];
  forage: Forage[];
  recipes: Recipe[];
  schedules: Record<string, Schedule>;
  quests: Record<string, Quests>;
  museumSets: MuseumSet[];
  /** Item name -> icon path for gift and museum items. */
  itemIcons: Record<string, string | null>;
  spoilerNames: string[];
  meta: DataMeta;
}

interface Listed {
  kind: GuideKind;
  slug: string;
  name: string;
  icon: string | null;
  spoiler: boolean;
}

const GROUPS: { kind: GuideKind; label: string; browse: string }[] = [
  { kind: 'villager', label: 'Villagers', browse: '/villagers/' },
  { kind: 'fish', label: 'Fish', browse: '/fish/' },
  { kind: 'bugs', label: 'Bugs', browse: '/bugs/' },
  { kind: 'crops', label: 'Crops', browse: '/crops/' },
  { kind: 'forage', label: 'Forageables', browse: '/forage/' },
  { kind: 'recipes', label: 'Recipes', browse: '/recipes/' },
  { kind: 'museum', label: 'Museum sets', browse: '/museum/' },
];

export function GuideBuilder({
  villagers,
  fish,
  bugs,
  crops,
  forage,
  recipes,
  schedules,
  quests,
  museumSets,
  itemIcons,
  spoilerNames,
  meta,
}: Props): React.JSX.Element {
  const hydrated = useGuideHydrated();
  const entries = useGuideStore((s) => s.entries);
  const options = useGuideStore((s) => s.options);
  const setOptions = useGuideStore((s) => s.setOptions);
  const remove = useGuideStore((s) => s.remove);
  const clear = useGuideStore((s) => s.clear);
  const addMany = useGuideStore((s) => s.addMany);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hideSpoilers = useHideSpoilers();

  // Resolve stored slugs against current data; entries for removed items are dropped silently.
  const selected = useMemo(() => {
    const pick = <T extends { slug: string }>(kind: GuideKind, all: T[]): T[] => {
      const wanted = new Set(entries.filter((e) => e.kind === kind).map((e) => e.slug));
      return all.filter((x) => wanted.has(x.slug));
    };
    return {
      villager: pick('villager', villagers),
      fish: pick('fish', fish),
      bugs: pick('bugs', bugs),
      crops: pick('crops', crops),
      forage: pick('forage', forage),
      recipes: pick('recipes', recipes),
      museum: pick('museum', museumSets),
    };
  }, [entries, villagers, fish, bugs, crops, forage, recipes, museumSets]);

  const listed: Record<GuideKind, Listed[]> = {
    villager: selected.villager.map((v) => ({ kind: 'villager', slug: v.slug, name: v.name, icon: v.portrait, spoiler: v.spoiler })),
    fish: selected.fish.map((f) => ({ kind: 'fish', slug: f.slug, name: f.name, icon: f.icon, spoiler: f.spoiler })),
    bugs: selected.bugs.map((b) => ({ kind: 'bugs', slug: b.slug, name: b.name, icon: b.icon, spoiler: b.spoiler })),
    crops: selected.crops.map((c) => ({ kind: 'crops', slug: c.slug, name: c.name, icon: c.icon, spoiler: c.spoiler })),
    forage: selected.forage.map((f) => ({ kind: 'forage', slug: f.slug, name: f.name, icon: f.icon, spoiler: f.spoiler })),
    recipes: selected.recipes.map((r) => ({ kind: 'recipes', slug: r.slug, name: r.name, icon: r.icon, spoiler: r.spoiler })),
    museum: selected.museum.map((s) => ({
      kind: 'museum',
      slug: s.slug,
      name: `${s.name} (${s.wing})`,
      icon: itemIcons[s.items[0]?.name ?? ''] ?? null,
      spoiler: false,
    })),
  };
  const total = Object.values(listed).reduce((n, l) => n + l.length, 0);
  const all = Object.values(listed).flat();
  const leftOut = hideSpoilers ? all.filter((i) => i.spoiler).length : 0;

  const download = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      const [{ generateGuidePdf }, { loadImages }] = await Promise.all([
        import('@/lib/pdf/generateGuidePdf'),
        import('@/lib/pdf/loadImages'),
      ]);
      const tiers = GIFT_TIERS.filter((t) => options.giftTiers.includes(t));
      const images = await loadImages([
        ...selected.villager.flatMap((v) => [v.portrait, ...tiers.flatMap((t) => v.gifts[t].map((g) => itemIcons[g]))]),
        ...[selected.fish, selected.bugs, selected.crops, selected.forage, selected.recipes].flat().map((i) => i.icon),
        ...selected.museum.flatMap((s) => s.items.map((i) => itemIcons[i.name])),
      ]);
      generateGuidePdf({
        title: options.title.trim() || 'My Mistria Guide',
        giftTiers: tiers,
        groupBySeason: options.groupBySeason,
        schedules: options.includeSchedules ? schedules : {},
        quests: options.includeQuests ? quests : {},
        hideSpoilers,
        spoilerNames,
        villagers: selected.villager,
        fish: selected.fish,
        bugs: selected.bugs,
        crops: selected.crops,
        forage: selected.forage,
        recipes: selected.recipes,
        museumSets: selected.museum,
        itemIcons,
        images,
        meta,
      });
    } catch {
      setError('Something went wrong while making your PDF. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]" aria-hidden>
        <div className="h-64 animate-pulse rounded-lg bg-stone-200" />
        <div className="h-64 animate-pulse rounded-lg bg-stone-200" />
      </div>
    );
  }

  if (total === 0) {
    return (
      <EmptyState title="Your guide basket is empty.">
        <p>
          Press <span className="font-semibold">Add to guide</span> on any{' '}
          <Link href="/villagers/" className="font-semibold text-mistria-blue-ink underline">villager</Link>,{' '}
          <Link href="/fish/" className="font-semibold text-mistria-blue-ink underline">fish</Link>,{' '}
          <Link href="/bugs/" className="font-semibold text-mistria-blue-ink underline">bug</Link> or{' '}
          <Link href="/crops/" className="font-semibold text-mistria-blue-ink underline">crop</Link>, or start with:
        </p>
        <button
          type="button"
          className="btn-primary mt-4"
          onClick={() => addMany(villagers.map((v) => ({ kind: 'villager', slug: v.slug })))}
        >
          Add every villager&apos;s gifts
        </button>
      </EmptyState>
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-6">
        {GROUPS.map(({ kind, label, browse }) => {
          const items = listed[kind];
          return (
            <section key={kind} className="card p-4" aria-labelledby={`guide-${kind}`}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 id={`guide-${kind}`} className="text-lg">
                  {label} <span className="text-sm font-normal tabular-nums text-stone-600">({items.length})</span>
                </h2>
                <Link href={browse} className="text-sm font-semibold text-mistria-blue-ink hover:underline">
                  Add more
                </Link>
              </div>
              {items.length === 0 ? (
                <p className="text-sm text-stone-600">Nothing added yet.</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {items.map((i) => (
                    <li key={i.slug} className="flex items-center gap-2 rounded-md border border-stone-300 bg-white/70 py-1 pl-1 pr-1 text-sm">
                      <Sprite src={i.icon} alt="" size={20} />
                      <span className="font-medium">
                        <SpoilerText text={markSpoiler(i.name, i.spoiler)} />
                      </span>
                      <button
                        type="button"
                        onClick={() => remove({ kind: i.kind, slug: i.slug })}
                        aria-label={`Remove ${i.name} from guide`}
                        className="inline-flex size-8 items-center justify-center rounded text-stone-600 hover:bg-berry-red/10 hover:text-berry-red-ink"
                      >
                        <X aria-hidden className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <aside className="card space-y-5 bg-amber-50/70 p-5 lg:sticky lg:top-20" aria-label="PDF options">
        <div>
          <label htmlFor="guide-title" className="mb-1 block text-sm font-semibold">
            PDF title
          </label>
          <input
            id="guide-title"
            value={options.title}
            maxLength={80}
            onChange={(e) => setOptions({ title: e.target.value })}
            className="h-10 w-full rounded-md border border-stone-300 bg-white/80 px-3 text-sm"
          />
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Villager gifts to include</legend>
          <div className="flex flex-wrap gap-2">
            {GIFT_TIERS.map((t) => {
              const on = options.giftTiers.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setOptions({ giftTiers: on ? options.giftTiers.filter((x) => x !== t) : [...options.giftTiers, t] })
                  }
                  className={cn('pill', on ? TIER_STYLE[t] : 'border-stone-300 bg-white/60 text-stone-600')}
                >
                  {TIER_LABEL[t]}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-stone-600">Disliked lists are long; leave them off for a shorter PDF.</p>
        </fieldset>

        <label className="flex min-h-10 cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={options.groupBySeason}
            onChange={(e) => setOptions({ groupBySeason: e.target.checked })}
            className="size-5 accent-[#3F6630]"
          />
          <span>
            <span className="font-semibold">Group seasonal items by season</span>
            <span className="block text-xs text-stone-600">Year-round items appear under every season.</span>
          </span>
        </label>

        <label className="flex min-h-10 cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={options.includeSchedules}
            onChange={(e) => setOptions({ includeSchedules: e.target.checked })}
            className="size-5 accent-[#3F6630]"
          />
          <span>
            <span className="font-semibold">Include villager schedules</span>
            <span className="block text-xs text-stone-600">Only some villagers have schedules on the wiki so far.</span>
          </span>
        </label>

        <label
          className={cn('flex min-h-10 items-center gap-3 text-sm', hideSpoilers ? 'cursor-not-allowed opacity-60' : 'cursor-pointer')}
        >
          <input
            type="checkbox"
            checked={options.includeQuests && !hideSpoilers}
            disabled={hideSpoilers}
            onChange={(e) => setOptions({ includeQuests: e.target.checked })}
            className="size-5 accent-[#3F6630]"
          />
          <span>
            <span className="font-semibold">Include villager quests</span>
            {hideSpoilers && (
              <span className="block text-xs text-stone-600">The wiki marks quests as spoilers. Turn off Hide spoilers to include them.</span>
            )}
          </span>
        </label>

        {leftOut > 0 && (
          <p className="rounded-md border border-wood-brown/30 bg-wood-brown/5 p-3 text-xs text-stone-600">
            {leftOut} spoiler {leftOut === 1 ? 'entry' : 'entries'} in your guide will be left out of the PDF while{' '}
            <span className="font-semibold">Hide spoilers</span> is on.
          </p>
        )}

        <button type="button" onClick={download} disabled={busy} className="btn-primary w-full">
          {busy ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Download aria-hidden className="size-4" />}
          {busy ? 'Making your PDF…' : `Download PDF (${total - leftOut} items)`}
        </button>
        {error && (
          <p role="alert" className="text-sm text-berry-red-ink">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            if (window.confirm('Remove everything from your guide?')) clear();
          }}
          className="btn-danger w-full"
        >
          <Trash2 aria-hidden className="size-4" /> Clear guide
        </button>
      </aside>
    </div>
  );
}
