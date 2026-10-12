import Link from 'next/link';
import type { GiftReactions as Reactions } from '@/lib/data';
import type { GiftTier } from '@/lib/data/schemas';
import { cn } from '@/lib/utils';
import { TIER_ICON, TIER_LABEL, TIER_STYLE } from '@/components/ui/GiftBadge';
import { Sprite } from '@/components/ui/Sprite';
import { SpoilerHide } from '@/components/spoiler/SpoilerHide';

// Dislikes are mostly villagers' default reaction, so they're summarised last and collapsed.
const SHOWN: GiftTier[] = ['love', 'like', 'neutral', 'hate'];

export function GiftReactions({ itemName, reactions }: { itemName: string; reactions: Reactions }): React.JSX.Element {
  const any = SHOWN.some((t) => reactions[t].length > 0) || reactions.dislike.length > 0;
  return (
    <section aria-labelledby="gift-reactions" className="space-y-4">
      <h2 id="gift-reactions" className="text-2xl">
        As a gift
      </h2>
      {!any && <p className="text-stone-600">The wiki doesn&apos;t list any villager reactions to {itemName}.</p>}
      {SHOWN.filter((t) => reactions[t].length > 0).map((tier) => {
        const Icon = TIER_ICON[tier];
        return (
          <div key={tier} className="card p-4">
            <h3 className="mb-3 flex items-center gap-2 text-lg">
              <Icon aria-hidden className="size-5" />
              {TIER_LABEL[tier]} by
              <span className="text-sm font-normal tabular-nums text-stone-600">({reactions[tier].length})</span>
            </h3>
            <VillagerChips tier={tier} villagers={reactions[tier]} />
          </div>
        );
      })}
      {reactions.dislike.length > 0 && (
        <details className="card group p-4">
          <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between rounded-md">
            <span className="font-heading text-lg font-bold">
              {TIER_LABEL.dislike} by{' '}
              <span className="text-sm font-normal tabular-nums text-stone-600">({reactions.dislike.length})</span>
            </span>
            <span className="text-sm text-mistria-blue-ink group-open:hidden">Show</span>
            <span className="hidden text-sm text-mistria-blue-ink group-open:inline">Hide</span>
          </summary>
          <div className="mt-3">
            <VillagerChips tier="dislike" villagers={reactions.dislike} />
          </div>
        </details>
      )}
    </section>
  );
}

function VillagerChips({ tier, villagers }: { tier: GiftTier; villagers: Reactions[GiftTier] }): React.JSX.Element {
  return (
    <ul className="flex flex-wrap gap-2">
      {villagers.map((v) => (
        <SpoilerHide key={v.slug} spoiler={v.spoiler}>
          <li>
            <Link
              href={`/villagers/${v.slug}/`}
              className={cn('flex items-center gap-2 rounded-md border py-1 pl-1 pr-3 text-sm font-medium hover:underline', TIER_STYLE[tier])}
            >
              <Sprite src={v.portrait} alt="" size={20} />
              {v.name}
            </Link>
          </li>
        </SpoilerHide>
      ))}
    </ul>
  );
}
