import Image from 'next/image';
import { Ban, Heart, Minus, ThumbsDown, ThumbsUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { assetPath, cn } from '@/lib/utils';
import { SpoilerBlur } from '@/components/spoiler/SpoilerBlur';
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

interface GiftBadgeProps {
  tier: GiftTier;
  /** Item sprite; blurred together with the name when the item is a spoiler. */
  icon?: string | null;
  spoiler?: boolean;
  children: React.ReactNode;
}

export function GiftBadge({ tier, icon = null, spoiler = false, children }: GiftBadgeProps): React.JSX.Element {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-md border py-1 pl-1.5 pr-2 text-sm font-medium', TIER_STYLE[tier])}
    >
      <SpoilerBlur spoiler={spoiler} className="inline-flex items-center gap-1.5">
        {icon && <Image src={assetPath(icon)} alt="" width={20} height={20} className="pixelated size-5 object-contain" />}
        {children}
      </SpoilerBlur>
    </span>
  );
}
