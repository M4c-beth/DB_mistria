import Link from 'next/link';
import { Cake, Heart } from 'lucide-react';
import type { Villager } from '@/lib/data/schemas';
import { Sprite } from '@/components/ui/Sprite';

export function VillagerCard({ villager }: { villager: Villager }): React.JSX.Element {
  const loves = villager.gifts.love.slice(0, 3);
  return (
    <Link
      href={`/villagers/${villager.slug}/`}
      className="card group flex gap-4 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <Sprite src={villager.portrait} alt="" size={72} className="rounded-lg" />
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-lg group-hover:text-mistria-green-ink">{villager.name}</h2>
        {villager.occupation && <p className="truncate text-sm text-stone-600">{villager.occupation}</p>}
        {villager.birthday && (
          <p className="mt-1 flex items-center gap-1 text-xs text-stone-600">
            <Cake aria-hidden className="size-3.5" /> {villager.birthday}
          </p>
        )}
        {loves.length > 0 && (
          <p className="mt-2 flex items-start gap-1 text-xs text-mistria-green-ink">
            <Heart aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            <span className="line-clamp-2">
              <span className="sr-only">Loves: </span>
              {loves.join(', ')}
              {villager.gifts.love.length > 3 && ` +${villager.gifts.love.length - 3} more`}
            </span>
          </p>
        )}
      </div>
    </Link>
  );
}
