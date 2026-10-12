import Link from 'next/link';
import { ArrowRight, Bug, FileDown, Fish, Sprout, Users } from 'lucide-react';
import { getBugs, getCrops, getFish, getVillagers } from '@/lib/data';
import { SEASONS } from '@/lib/data/schemas';
import { cn } from '@/lib/utils';
import { SEASON_ICON, SEASON_STYLE } from '@/components/ui/SeasonTag';

export default function HomePage(): React.JSX.Element {
  const sections = [
    { href: '/villagers/', label: 'Villagers', count: getVillagers().length, icon: Users, blurb: 'Birthdays and every loved, liked and hated gift.' },
    { href: '/fish/', label: 'Fish', count: getFish().length, icon: Fish, blurb: 'Seasons, locations, weather and sell prices.' },
    { href: '/bugs/', label: 'Bugs', count: getBugs().length, icon: Bug, blurb: 'When and where every critter shows up.' },
    { href: '/crops/', label: 'Crops', count: getCrops().length, icon: Sprout, blurb: 'Growth times, regrowth and profits by season.' },
  ];

  return (
    <div className="space-y-12">
      <section className="card relative overflow-hidden bg-amber-50 px-6 py-10 md:px-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-harvest-gold-ink">Fields of Mistria</p>
        <h1 className="mt-1 text-4xl md:text-5xl">The Mistria Almanac</h1>
        <p className="mt-3 max-w-xl text-lg text-stone-600">
          Look up what every villager loves, what you can catch each season, and build your own printable PDF guide with just the
          things you need.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/villagers/" className="btn-primary">
            Browse villagers <ArrowRight aria-hidden className="size-4" />
          </Link>
          <Link href="/guide/" className="btn-secondary">
            <FileDown aria-hidden className="size-4" /> Build my PDF guide
          </Link>
        </div>
        <span aria-hidden className="pointer-events-none absolute -bottom-6 -right-2 select-none text-[9rem] opacity-15">
          🌾
        </span>
      </section>

      <section aria-labelledby="seasons-heading">
        <h2 id="seasons-heading" className="mb-4 text-2xl">
          What&apos;s in season?
        </h2>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {SEASONS.map((s) => {
            const Icon = SEASON_ICON[s];
            return (
              <li key={s}>
                <Link
                  href={`/seasons/${s.toLowerCase()}/`}
                  className={cn(
                    'flex h-24 flex-col items-center justify-center gap-2 rounded-lg border font-heading text-lg font-bold shadow-md shadow-stone-200/50 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg',
                    SEASON_STYLE[s],
                  )}
                >
                  <Icon aria-hidden className="size-7" />
                  {s}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="browse-heading">
        <h2 id="browse-heading" className="mb-4 text-2xl">
          Browse the almanac
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {sections.map(({ href, label, count, icon: Icon, blurb }) => (
            <li key={href}>
              <Link href={href} className="card group flex items-start gap-4 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <span className="rounded-lg bg-mistria-green/10 p-3 text-mistria-green-ink">
                  <Icon aria-hidden className="size-6" />
                </span>
                <span>
                  <span className="flex items-baseline gap-2">
                    <span className="font-heading text-xl font-bold group-hover:text-mistria-green-ink">{label}</span>
                    <span className="text-sm tabular-nums text-stone-600">{count}</span>
                  </span>
                  <span className="mt-1 block text-sm text-stone-600">{blurb}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="card flex flex-col items-start gap-4 border-mistria-green/30 bg-mistria-green/5 p-6 md:flex-row md:items-center">
        <FileDown aria-hidden className="size-10 shrink-0 text-mistria-green-ink" />
        <div className="flex-1">
          <h2 className="text-xl">Make your own cheat sheet</h2>
          <p className="text-stone-600">
            Tap <span className="font-semibold">Add to guide</span> on any villager, fish, bug or crop. Then download it all as one
            tidy PDF. It&apos;s made right in your browser, nothing is uploaded.
          </p>
        </div>
        <Link href="/guide/" className="btn-primary">
          Open my guide
        </Link>
      </section>
    </div>
  );
}
