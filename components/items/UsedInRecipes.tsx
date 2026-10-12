import Link from 'next/link';
import type { Recipe } from '@/lib/data/schemas';
import { Sprite } from '@/components/ui/Sprite';
import { SpoilerHide } from '@/components/spoiler/SpoilerHide';

export function UsedInRecipes({ itemName, recipes }: { itemName: string; recipes: Recipe[] }): React.JSX.Element | null {
  if (recipes.length === 0) return null;
  return (
    <section aria-labelledby="used-in" className="mb-8">
      <h2 id="used-in" className="mb-3 text-2xl">
        Used in <span className="text-base font-normal tabular-nums text-stone-600">({recipes.length})</span>
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((r) => {
          const amount = r.ingredients.find((i) => i.name === itemName)?.amount ?? 1;
          return (
            <SpoilerHide key={r.slug} spoiler={r.spoiler}>
              <li>
                <Link
                  href={`/recipes/${r.slug}/`}
                  className="card flex items-center gap-3 p-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <Sprite src={r.icon} alt="" size={28} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{r.name}</span>
                    <span className="block text-xs text-stone-600">
                      {r.type} · needs <span className="tabular-nums">{amount}</span>
                    </span>
                  </span>
                </Link>
              </li>
            </SpoilerHide>
          );
        })}
      </ul>
    </section>
  );
}
