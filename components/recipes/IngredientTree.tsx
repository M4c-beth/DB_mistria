import Link from 'next/link';
import type { IngredientNode } from '@/lib/data';
import { cn } from '@/lib/utils';
import { markSpoiler } from '@/lib/spoiler';
import { SpoilerText } from '@/components/spoiler/SpoilerText';

/** Nested ingredient list; crafted ingredients show what one craft of them takes. */
export function IngredientTree({ nodes, depth = 0 }: { nodes: IngredientNode[]; depth?: number }): React.JSX.Element {
  return (
    <ul className={cn('space-y-2', depth > 0 && 'mt-2 border-l-2 border-amber-200 pl-4')}>
      {nodes.map((n) => (
        <li key={n.name}>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-sm font-semibold tabular-nums text-wood-brown-ink">×{n.amount}</span>
            {n.href ? (
              <Link href={n.href} className="font-semibold text-mistria-blue-ink hover:underline">
                <SpoilerText text={markSpoiler(n.name, n.spoiler)} />
              </Link>
            ) : (
              <span className="font-semibold">
                <SpoilerText text={markSpoiler(n.name, n.spoiler)} />
              </span>
            )}
            {n.craft && <span className="text-xs text-stone-600">({n.craft.type.toLowerCase()} — one craft takes:)</span>}
          </div>
          {n.craft && <IngredientTree nodes={n.craft.ingredients} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  );
}
