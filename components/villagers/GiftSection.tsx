import type { GiftTier } from '@/lib/data/schemas';
import { GiftBadge, TIER_ICON, TIER_LABEL } from '@/components/ui/GiftBadge';
import { cn } from '@/lib/utils';

interface Props {
  tier: GiftTier;
  items: string[];
  /** Long lists (e.g. dislikes) start collapsed. */
  collapsible?: boolean;
}

export function GiftSection({ tier, items, collapsible = false }: Props): React.JSX.Element {
  const Icon = TIER_ICON[tier];
  const heading = (
    <span className="flex items-center gap-2">
      <Icon aria-hidden className={cn('size-5', TIER_TEXT[tier])} />
      <span className="font-heading text-lg font-bold">{TIER_LABEL[tier]}</span>
      <span className="text-sm font-normal tabular-nums text-stone-600">({items.length})</span>
    </span>
  );
  const body =
    items.length === 0 ? (
      <p className="text-sm text-stone-600">None listed on the wiki.</p>
    ) : (
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item}>
            <GiftBadge tier={tier}>{item}</GiftBadge>
          </li>
        ))}
      </ul>
    );

  if (collapsible && items.length > 0) {
    return (
      <details className="card group p-4">
        <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between rounded-md">
          {heading}
          <span className="text-sm text-mistria-blue-ink group-open:hidden">Show all</span>
          <span className="hidden text-sm text-mistria-blue-ink group-open:inline">Hide</span>
        </summary>
        <div className="mt-3">{body}</div>
      </details>
    );
  }
  return (
    <section className="card p-4" aria-label={`${TIER_LABEL[tier]} gifts`}>
      <h3 className="mb-3">{heading}</h3>
      {body}
    </section>
  );
}

const TIER_TEXT: Record<GiftTier, string> = {
  love: 'text-mistria-green-ink',
  like: 'text-harvest-gold-ink',
  neutral: 'text-mistria-blue-ink',
  dislike: 'text-wood-brown-ink',
  hate: 'text-berry-red-ink',
};
