import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFish, getFishBySlug, getGiftReactions, getRecipesUsing } from '@/lib/data';
import { formatGold } from '@/lib/utils';
import { spoilerPlainText } from '@/lib/spoiler';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { GiftReactions } from '@/components/items/GiftReactions';
import { SpoilerGate } from '@/components/spoiler/SpoilerGate';
import { ItemHero } from '@/components/items/ItemHero';
import { UsedInRecipes } from '@/components/items/UsedInRecipes';
import { SeasonTags } from '@/components/ui/SeasonTag';

interface Params {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getFish().map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const f = getFishBySlug((await params).slug);
  if (!f) return {};
  return {
    title: `${f.name} (Fish)`,
    description: `Where and when to catch ${f.name} in Fields of Mistria: ${f.seasons.join(', ') || 'unknown season'}, ${spoilerPlainText(f.locations.join(', '), '[spoiler]') || 'unknown location'}.`,
  };
}

export default async function FishDetailPage({ params }: Params): Promise<React.JSX.Element> {
  const f = getFishBySlug((await params).slug);
  if (!f) notFound();
  const method = [f.method.rod && 'Fishing rod', f.method.diving && 'Diving'].filter(Boolean).join(', ') || 'Other';
  return (
    <>
      <Breadcrumbs items={[{ label: 'Fish', href: '/fish/' }, { label: f.name }]} />
      <SpoilerGate spoiler={f.spoiler} label="This page">
        <ItemHero
          kind="fish"
          slug={f.slug}
          name={f.name}
          icon={f.icon}
          subtitle="Fish"
          source={f.source}
          stats={[
            { label: 'Seasons', value: <SeasonTags seasons={f.seasons} /> },
            { label: 'Location', value: f.locations.join(', ') || '—' },
            { label: 'Weather', value: f.weather.join(', ') || '—' },
            { label: 'Rarity', value: f.rarity ?? '—' },
            { label: 'Size', value: f.size ?? '—' },
            { label: 'Caught by', value: method },
            { label: 'Sell price', value: formatGold(f.sellValue) },
          ]}
        />
        <UsedInRecipes itemName={f.name} recipes={getRecipesUsing(f.name)} />
        <GiftReactions itemName={f.name} reactions={getGiftReactions(f.name)} />
      </SpoilerGate>
    </>
  );
}
