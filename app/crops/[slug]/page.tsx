import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCrop, getCrops, getGiftReactions, getRecipesUsing } from '@/lib/data';
import { formatGold } from '@/lib/utils';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { GiftReactions } from '@/components/items/GiftReactions';
import { ItemHero } from '@/components/items/ItemHero';
import { UsedInRecipes } from '@/components/items/UsedInRecipes';
import { SeasonTags } from '@/components/ui/SeasonTag';

interface Params {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getCrops().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = getCrop((await params).slug);
  if (!c) return {};
  return {
    title: `${c.name} (Crop)`,
    description: `${c.name} in Fields of Mistria: grows in ${c.seasons.join(', ') || 'unknown season'}${c.growthDays ? `, ready in ${c.growthDays} days` : ''}.`,
  };
}

export default async function CropDetailPage({ params }: Params): Promise<React.JSX.Element> {
  const c = getCrop((await params).slug);
  if (!c) notFound();
  return (
    <>
      <Breadcrumbs items={[{ label: 'Crops', href: '/crops/' }, { label: c.name }]} />
      <ItemHero
        kind="crops"
        slug={c.slug}
        name={c.name}
        icon={c.icon}
        subtitle="Crop"
        source={c.source}
        stats={[
          { label: 'Seasons', value: <SeasonTags seasons={c.seasons} /> },
          { label: 'Seed', value: c.seed ?? '—' },
          { label: 'Grows in', value: c.growthDays === null ? '—' : `${c.growthDays} days` },
          { label: 'Regrows', value: c.regrowDays ? `Every ${c.regrowDays} days` : 'No' },
          { label: 'Sell price', value: formatGold(c.sellValue) },
        ]}
      />
      <UsedInRecipes itemName={c.name} recipes={getRecipesUsing(c.name)} />
      <GiftReactions itemName={c.name} reactions={getGiftReactions(c.name)} />
    </>
  );
}
