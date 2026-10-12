import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getForage, getForageable, getGiftReactions, getRecipesUsing } from '@/lib/data';
import { formatGold } from '@/lib/utils';
import { spoilerPlainText } from '@/lib/spoiler';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { GiftReactions } from '@/components/items/GiftReactions';
import { SpoilerGate } from '@/components/spoiler/SpoilerGate';
import { SpoilerText } from '@/components/spoiler/SpoilerText';
import { ItemHero } from '@/components/items/ItemHero';
import { UsedInRecipes } from '@/components/items/UsedInRecipes';
import { SeasonTags } from '@/components/ui/SeasonTag';

interface Params {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getForage().map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const f = getForageable((await params).slug);
  if (!f) return {};
  return {
    title: `${f.name} (Forageable)`,
    description: `Where to find ${f.name} in Fields of Mistria: ${spoilerPlainText(f.locations.join(', '), '[spoiler]') || 'see sources'}.`,
  };
}

export default async function ForageDetailPage({ params }: Params): Promise<React.JSX.Element> {
  const f = getForageable((await params).slug);
  if (!f) notFound();
  return (
    <>
      <Breadcrumbs items={[{ label: 'Forageables', href: '/forage/' }, { label: f.name }]} />
      <SpoilerGate spoiler={f.spoiler} label="This page">
        <ItemHero
          kind="forage"
          slug={f.slug}
          name={f.name}
          icon={f.icon}
          subtitle="Forageable"
          source={f.source}
          stats={[
            { label: 'Seasons', value: <SeasonTags seasons={f.seasons} /> },
            { label: 'Location', value: f.locations.join(', ') || '—' },
            { label: 'Sell price', value: formatGold(f.sellValue) },
          ]}
        />
        {f.sources.length > 0 && (
          <section aria-labelledby="how-to-get" className="mb-8">
            <h2 id="how-to-get" className="mb-3 text-2xl">
              How to get
            </h2>
            <ul className="card list-inside list-disc space-y-1 p-4 text-sm">
              {f.sources.map((s) => (
                <li key={s}>
                  <SpoilerText text={s} />
                </li>
              ))}
            </ul>
          </section>
        )}
        <UsedInRecipes itemName={f.name} recipes={getRecipesUsing(f.name)} />
        <GiftReactions itemName={f.name} reactions={getGiftReactions(f.name)} />
      </SpoilerGate>
    </>
  );
}
