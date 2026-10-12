import Image from 'next/image';
import Link from 'next/link';
import { getItemHref, getItemIcon } from '@/lib/data';
import type { MuseumWing } from '@/lib/data/schemas';
import { assetPath } from '@/lib/utils';
import { AddToGuideButton } from '@/components/guide/AddToGuideButton';
import { SpoilerBlur } from '@/components/spoiler/SpoilerBlur';
import { SpoilerText } from '@/components/spoiler/SpoilerText';

type MuseumSetData = MuseumWing['sets'][number];

export function MuseumSetCard({ set }: { set: MuseumSetData }): React.JSX.Element {
  return (
    <section className="card flex flex-col" aria-labelledby={`set-${set.slug}`}>
      <div className="flex items-center justify-between gap-2 border-b-2 border-wood-brown bg-stone-100 px-3 py-2">
        <h3 id={`set-${set.slug}`} className="text-base">
          {set.name}
        </h3>
        <AddToGuideButton kind="museum" slug={set.slug} name={set.name} compact />
      </div>
      <ul className="divide-y divide-stone-200">
        {set.items.map((item) => {
          const icon = getItemIcon(item.name);
          const href = getItemHref(item.name);
          return (
            <li key={item.name} className="px-3 py-2 text-sm">
              <SpoilerBlur spoiler={item.spoiler} className="flex items-start gap-3">
                <span className="sprite-bg flex size-8 shrink-0 items-center justify-center rounded-md">
                  {icon && <Image src={assetPath(icon)} alt="" width={24} height={24} className="pixelated size-6 object-contain" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    {href ? (
                      <Link href={href} className="font-semibold text-stone-800 hover:text-mistria-blue-ink hover:underline">
                        {item.name}
                      </Link>
                    ) : (
                      <span className="font-semibold">{item.name}</span>
                    )}
                    {item.rarity && <span className="text-xs text-stone-600">{item.rarity}</span>}
                  </span>
                  {item.location && (
                    <span className="block text-xs text-stone-600">
                      <SpoilerText text={item.location.split('\n').join(' · ')} />
                    </span>
                  )}
                </span>
              </SpoilerBlur>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
