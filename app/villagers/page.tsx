import type { Metadata } from 'next';
import { getVillagers } from '@/lib/data';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { VillagerCard } from '@/components/villagers/VillagerCard';

export const metadata: Metadata = {
  title: 'Villagers',
  description: 'Every Fields of Mistria villager with birthdays and loved, liked and hated gifts.',
};

export default function VillagersPage(): React.JSX.Element {
  const villagers = getVillagers();
  return (
    <>
      <Breadcrumbs items={[{ label: 'Villagers' }]} />
      <PageHeader title="Villagers">
        Birthdays and gift preferences for all {villagers.length} residents of Mistria. Pick someone to see their full gift guide.
      </PageHeader>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {villagers.map((v) => (
          <li key={v.slug}>
            <VillagerCard villager={v} />
          </li>
        ))}
      </ul>
    </>
  );
}
