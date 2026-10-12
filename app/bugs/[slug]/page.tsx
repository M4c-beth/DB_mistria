import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBug, getBugs, getGiftReactions, getRecipesUsing } from '@/lib/data';
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
  return getBugs().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const b = getBug((await params).slug);
  if (!b) return {};
  return {
    title: `${b.name} (Bug)`,
    description: `Where and when to catch ${b.name} in Fields of Mistria: ${b.seasons.join(', ') || 'unknown season'}, ${spoilerPlainText(b.locations.join(', '), '[spoiler]') || 'unknown location'}.`,
  };
}

export default async function BugDetailPage({ params }: Params): Promise<React.JSX.Element> {
  const b = getBug((await params).slug);
  if (!b) notFound();
  return (
    <>
      <Breadcrumbs items={[{ label: 'Bugs', href: '/bugs/' }, { label: b.name }]} />
      <SpoilerGate spoiler={b.spoiler} label="This page">
        <ItemHero
          kind="bugs"
          slug={b.slug}
          name={b.name}
          icon={b.icon}
          subtitle="Bug"
          source={b.source}
          stats={[
            { label: 'Seasons', value: <SeasonTags seasons={b.seasons} /> },
            { label: 'Location', value: b.locations.join(', ') || '—' },
            { label: 'Time', value: b.time ?? '—' },
            { label: 'Weather', value: b.weather.join(', ') || '—' },
            { label: 'Rarity', value: b.rarity ?? '—' },
            { label: 'Needs to spawn', value: b.spawnCondition ?? 'Nothing special' },
            { label: 'Sell price', value: formatGold(b.sellValue) },
          ]}
        />
        <UsedInRecipes itemName={b.name} recipes={getRecipesUsing(b.name)} />
        <GiftReactions itemName={b.name} reactions={getGiftReactions(b.name)} />
      </SpoilerGate>
    </>
  );
}
