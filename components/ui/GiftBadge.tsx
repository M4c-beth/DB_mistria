import { Ban, Heart, Leaf, Minus, ThumbsDown, ThumbsUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GiftTier } from '@/lib/data/schemas';

export const TIER_LABEL: Record<GiftTier, string> = {
  love: 'Loved',
  like: 'Liked',
  neutral: 'Neutral',
  dislike: 'Disliked',
  hate: 'Hated',
};

export const TIER_STYLE: Record<GiftTier, string> = {
  love: 'bg-mistria-green/10 text-mistria-green-ink border-mistria-green/30',
  like: 'bg-harvest-gold/10 text-harvest-gold-ink border-harvest-gold/30',
  neutral: 'bg-mistria-blue/10 text-mistria-blue-ink border-mistria-blue/30',
  dislike: 'bg-wood-brown/10 text-wood-brown-ink border-wood-brown/30',
  hate: 'bg-berry-red/10 text-berry-red-ink border-berry-red/30',
};

export const TIER_ICON: Record<GiftTier, LucideIcon> = {
  love: Heart,
  like: ThumbsUp,
  neutral: Minus,
  dislike: ThumbsDown,
  hate: Ban,
};

export function GiftBadge({ tier, children }: { tier: GiftTier; children: React.ReactNode }): React.JSX.Element {
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm font-medium', TIER_STYLE[tier])}
    >
      {tier === 'love' && <Leaf aria-hidden className="size-3.5" />}
      {children}
    </span>
  );
}
