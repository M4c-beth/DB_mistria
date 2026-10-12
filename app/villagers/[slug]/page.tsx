import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Cake, ExternalLink, Heart, Sparkles, Users } from 'lucide-react';
import { getVillager, getVillagers } from '@/lib/data';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { AddToGuideButton } from '@/components/guide/AddToGuideButton';
import { GiftSection } from '@/components/villagers/GiftSection';
import { Sprite } from '@/components/ui/Sprite';
import { EmptyState } from '@/components/ui/EmptyState';

interface Params {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getVillagers().map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const v = getVillager((await params).slug);
  if (!v) return {};
  const loves = v.gifts.love.slice(0, 5).join(', ');
  return {
    title: `${v.name} — Gifts & Birthday`,
    description: `${v.name}${v.birthday ? ` (birthday ${v.birthday})` : ''}${loves ? ` loves ${loves}` : ''}. Full gift guide for Fields of Mistria.`,
  };
}

export default async function VillagerPage({ params }: Params): Promise<React.JSX.Element> {
  const v = getVillager((await params).slug);
  if (!v) notFound();
  const { gifts } = v;
  const hasGifts = gifts.love.length + gifts.like.length + gifts.neutral.length + gifts.dislike.length + gifts.hate.length > 0;

  const stats: { label: string; value: string | null; icon: React.ReactNode }[] = [
    { label: 'Birthday', value: v.birthday, icon: <Cake aria-hidden className="size-4" /> },
    { label: 'Species', value: v.species, icon: <Sparkles aria-hidden className="size-4" /> },
    { label: 'Affiliation', value: v.affiliation, icon: <Users aria-hidden className="size-4" /> },
    { label: 'Romance', value: v.romanceable ? 'Romanceable' : 'Not romanceable', icon: <Heart aria-hidden className="size-4" /> },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: 'Villagers', href: '/villagers/' }, { label: v.name }]} />

      <section className="card mb-8 flex flex-col gap-6 bg-amber-50/70 p-6 sm:flex-row sm:items-center">
        <Sprite src={v.portrait} alt={`${v.name} portrait`} size={160} className="self-center rounded-xl" />
        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-4xl">{v.name}</h1>
            {v.occupation && <p className="text-lg text-stone-600">{v.occupation}</p>}
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="flex items-center gap-1 text-stone-600">
                  {s.icon}
                  {s.label}
                </dt>
                <dd className="font-semibold">{s.value ?? '—'}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap gap-2 pt-1">
            <AddToGuideButton kind="villager" slug={v.slug} name={v.name} />
            <a href={v.source} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              <ExternalLink aria-hidden className="size-4" /> View on wiki
            </a>
          </div>
        </div>
      </section>

      <h2 className="mb-4 text-2xl">Gift guide</h2>
      {hasGifts ? (
        <div className="space-y-4">
          <GiftSection tier="love" items={gifts.love} />
          <GiftSection tier="like" items={gifts.like} />
          <GiftSection tier="hate" items={gifts.hate} />
          {gifts.neutral.length > 0 && <GiftSection tier="neutral" items={gifts.neutral} collapsible />}
          <GiftSection tier="dislike" items={gifts.dislike} collapsible />
          {gifts.banned.length > 0 && (
            <p className="text-sm text-stone-600">
              <span className="font-semibold">Can&apos;t be gifted to {v.name}:</span> {gifts.banned.join(', ')}.
            </p>
          )}
        </div>
      ) : (
        <EmptyState title={`No gift data for ${v.name} yet.`}>
          The wiki doesn&apos;t list gift preferences for {v.name}. Check back after the next data update.
        </EmptyState>
      )}
    </>
  );
}
