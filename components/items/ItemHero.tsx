import { ExternalLink } from 'lucide-react';
import type { GuideKind } from '@/lib/data/schemas';
import { AddToGuideButton } from '@/components/guide/AddToGuideButton';
import { Sprite } from '@/components/ui/Sprite';

export interface ItemStat {
  label: string;
  value: React.ReactNode;
}

interface Props {
  kind: GuideKind;
  slug: string;
  name: string;
  icon: string | null;
  subtitle: string;
  stats: ItemStat[];
  source: string;
}

export function ItemHero({ kind, slug, name, icon, subtitle, stats, source }: Props): React.JSX.Element {
  return (
    <section className="card mb-8 flex flex-col gap-6 bg-amber-50/70 p-6 sm:flex-row sm:items-start">
      <Sprite src={icon} alt={name} size={96} className="self-center rounded-xl sm:self-start" />
      <div className="flex-1 space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-harvest-gold-ink">{subtitle}</p>
          <h1 className="text-4xl">{name}</h1>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="text-stone-600">{s.label}</dt>
              <dd className="font-semibold tabular-nums">{s.value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap gap-2">
          <AddToGuideButton kind={kind} slug={slug} name={name} />
          <a href={source} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            <ExternalLink aria-hidden className="size-4" /> View on wiki
          </a>
        </div>
      </div>
    </section>
  );
}
