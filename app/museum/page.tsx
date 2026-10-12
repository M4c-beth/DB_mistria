import type { Metadata } from 'next';
import { ExternalLink } from 'lucide-react';
import { getMuseum } from '@/lib/data';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { AddAllToGuideButton } from '@/components/guide/AddAllToGuideButton';
import { MuseumSetCard } from '@/components/museum/MuseumSetCard';

export const metadata: Metadata = {
  title: 'Museum',
  description: 'Every museum donation set in Fields of Mistria, wing by wing, with where to find each item.',
};

export default function MuseumPage(): React.JSX.Element {
  const wings = getMuseum();
  const totalItems = wings.reduce((n, w) => n + w.sets.reduce((m, s) => m + s.items.length, 0), 0);
  return (
    <>
      <Breadcrumbs items={[{ label: 'Museum' }]} />
      <PageHeader title="Museum">
        All {totalItems} items the museum wants, grouped into donation sets. Add sets to your guide to print a checklist.
      </PageHeader>

      <nav aria-label="Museum wings" className="mb-8 flex flex-wrap gap-2">
        {wings.map((w) => (
          <a key={w.slug} href={`#${w.slug}`} className="pill border-stone-300 bg-white/60 text-stone-600 hover:bg-amber-100">
            {w.name}
          </a>
        ))}
      </nav>

      <div className="space-y-12">
        {wings.map((w) => (
          <section key={w.slug} aria-labelledby={w.slug}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 id={w.slug} className="scroll-mt-20 text-2xl">
                {w.name} <span className="text-base font-normal tabular-nums text-stone-600">({w.sets.length} sets)</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                <AddAllToGuideButton
                  entries={w.sets.map((s) => ({ kind: 'museum', slug: s.slug }))}
                  label={`Add all ${w.sets.length} sets to guide`}
                />
                <a href={w.source} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  <ExternalLink aria-hidden className="size-4" /> Wiki
                </a>
              </div>
            </div>
            <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
              {w.sets.map((s) => (
                <MuseumSetCard key={s.slug} set={s} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
