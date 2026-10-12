import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Cake } from 'lucide-react';
import { getBirthdaysInSeason, getBugs, getCrops, getFish, getForage } from '@/lib/data';
import { SEASONS, type Season } from '@/lib/data/schemas';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CollectionTable } from '@/components/collections/CollectionTable';
import { SEASON_ICON, SEASON_STYLE } from '@/components/ui/SeasonTag';
import { Sprite } from '@/components/ui/Sprite';
import { TableSkeleton } from '@/components/ui/TableSkeleton';

interface Params {
  params: Promise<{ season: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { season: string }[] {
  return SEASONS.map((s) => ({ season: s.toLowerCase() }));
}

function toSeason(slug: string): Season | undefined {
  return SEASONS.find((s) => s.toLowerCase() === slug);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const season = toSeason((await params).season);
  return season
    ? { title: `${season} Guide`, description: `Fish, bugs, crops and forageables available in ${season}, plus villager birthdays.` }
    : {};
}

export default async function SeasonPage({ params }: Params): Promise<React.JSX.Element> {
  const season = toSeason((await params).season);
  if (!season) notFound();

  const fish = getFish().filter((f) => f.seasons.includes(season));
  const bugs = getBugs().filter((b) => b.seasons.includes(season));
  const crops = getCrops().filter((c) => c.seasons.includes(season));
  const forage = getForage().filter((f) => f.seasons.includes(season));
  const birthdays = getBirthdaysInSeason(season);
  const Icon = SEASON_ICON[season];

  return (
    <>
      <Breadcrumbs items={[{ label: 'Seasons', href: '/seasons/spring/' }, { label: season }]} />

      <nav aria-label="Seasons" className="mb-6 flex flex-wrap gap-2">
        {SEASONS.map((s) => {
          const SIcon = SEASON_ICON[s];
          const active = s === season;
          return (
            <Link
              key={s}
              href={`/seasons/${s.toLowerCase()}/`}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'pill',
                active ? SEASON_STYLE[s] : 'border-stone-300 bg-white/60 text-stone-600 hover:bg-amber-100',
              )}
            >
              <SIcon aria-hidden className="size-4" />
              {s}
            </Link>
          );
        })}
      </nav>

      <div className="mb-8 flex items-center gap-3">
        <Icon aria-hidden className="size-9 text-harvest-gold-ink" />
        <div>
          <h1 className="text-3xl md:text-4xl">{season}</h1>
          <p className="text-stone-600">
            {fish.length} fish · {bugs.length} bugs · {crops.length} crops · {forage.length} forageables ·{' '}
            {birthdays.length} birthdays
          </p>
        </div>
      </div>

      {birthdays.length > 0 && (
        <section className="mb-10" aria-labelledby="birthdays">
          <h2 id="birthdays" className="mb-3 flex items-center gap-2 text-2xl">
            <Cake aria-hidden className="size-6 text-berry-red-ink" /> Birthdays
          </h2>
          <ul className="flex flex-wrap gap-3">
            {birthdays.map((v) => (
              <li key={v.slug}>
                <Link
                  href={`/villagers/${v.slug}/`}
                  className="card flex items-center gap-3 p-2 pr-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <Sprite src={v.portrait} alt="" size={36} />
                  <span>
                    <span className="block font-semibold">{v.name}</span>
                    <span className="block text-xs tabular-nums text-stone-600">{v.birthday}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <SeasonSection id="fish" title="Fish to catch">
        <CollectionTable kind="fish" rows={fish} season={season} />
      </SeasonSection>
      <SeasonSection id="bugs" title="Bugs to catch">
        <CollectionTable kind="bugs" rows={bugs} season={season} />
      </SeasonSection>
      <SeasonSection id="crops" title="Crops to plant">
        <CollectionTable kind="crops" rows={crops} season={season} />
      </SeasonSection>
      <SeasonSection id="forage" title="Forageables to gather">
        <CollectionTable kind="forage" rows={forage} season={season} />
      </SeasonSection>
    </>
  );
}

function SeasonSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <section className="mb-10" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="mb-3 text-2xl">
        {title}
      </h2>
      <Suspense fallback={<TableSkeleton rows={4} />}>{children}</Suspense>
    </section>
  );
}
