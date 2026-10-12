import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Star } from 'lucide-react';
import { getGiftReactions, getIngredientTree, getRecipe, getRecipes, getRecipesUsing } from '@/lib/data';
import { formatGold } from '@/lib/utils';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { GiftReactions } from '@/components/items/GiftReactions';
import { SpoilerGate } from '@/components/spoiler/SpoilerGate';
import { SpoilerText } from '@/components/spoiler/SpoilerText';
import { ItemHero, type ItemStat } from '@/components/items/ItemHero';
import { UsedInRecipes } from '@/components/items/UsedInRecipes';
import { IngredientTree } from '@/components/recipes/IngredientTree';

interface Params {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getRecipes().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const r = getRecipe((await params).slug);
  if (!r) return {};
  return {
    title: `${r.name} (Recipe)`,
    description: `How to make ${r.name} in Fields of Mistria: ${r.ingredients.map((i) => `${i.name} ×${i.amount}`).join(', ')}.`,
  };
}

const STATION: Record<string, string> = { Cooking: 'Kitchen level', Blacksmithing: 'Workbench level' };

export default async function RecipeDetailPage({ params }: Params): Promise<React.JSX.Element> {
  const r = getRecipe((await params).slug);
  if (!r) notFound();

  const stats: ItemStat[] = [
    { label: 'Crafting time', value: r.timeMinutes === null ? '—' : `${r.timeMinutes}m` },
    { label: 'Skill level', value: r.skillLevel ?? '—' },
    { label: 'Sell price', value: formatGold(r.sellValue) },
  ];
  if (r.stars !== null) {
    stats.push({
      label: 'Stars',
      value: (
        <span className="inline-flex items-center gap-0.5" aria-label={`${r.stars} stars`}>
          {Array.from({ length: r.stars }, (_, i) => (
            <Star key={i} aria-hidden className="size-4 fill-harvest-gold text-harvest-gold-ink" />
          ))}
        </span>
      ),
    });
  }
  if (r.stationLevel !== null) stats.push({ label: STATION[r.type] ?? 'Station level', value: r.stationLevel });
  if (r.health !== null) stats.push({ label: 'Health', value: `+${r.health}` });
  if (r.stamina !== null) stats.push({ label: 'Stamina', value: `+${r.stamina}` });
  if (r.mana !== null) stats.push({ label: 'Mana', value: `+${r.mana}` });

  return (
    <>
      <Breadcrumbs items={[{ label: 'Recipes', href: '/recipes/' }, { label: r.name }]} />
      <SpoilerGate spoiler={r.spoiler} label="This page">
        <ItemHero kind="recipes" slug={r.slug} name={r.name} icon={r.icon} subtitle={`${r.type} recipe`} source={r.source} stats={stats} />

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="ingredients" className="card p-5">
            <h2 id="ingredients" className="mb-4 text-2xl">
              Ingredients
            </h2>
            <IngredientTree nodes={getIngredientTree(r)} />
          </section>
          {r.howToGet.length > 0 && (
            <section aria-labelledby="unlock" className="card p-5">
              <h2 id="unlock" className="mb-4 text-2xl">
                How to get the recipe
              </h2>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {r.howToGet.map((s) => (
                  <li key={s}>
                    <SpoilerText text={s} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <UsedInRecipes itemName={r.name} recipes={getRecipesUsing(r.name)} />
        <GiftReactions itemName={r.name} reactions={getGiftReactions(r.name)} />
      </SpoilerGate>
    </>
  );
}
