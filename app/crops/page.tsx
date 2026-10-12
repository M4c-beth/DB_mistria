import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getCrops } from '@/lib/data';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { CollectionTable } from '@/components/collections/CollectionTable';
import { TableSkeleton } from '@/components/ui/TableSkeleton';

export const metadata: Metadata = { title: 'Crops', description: 'Every crop in Fields of Mistria by season, growth time and sell price.' };

export default function CropsPage(): React.JSX.Element {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Crops' }]} />
      <PageHeader title="Crops">What to plant each season, how long it takes, and what it sells for.</PageHeader>
      <Suspense fallback={<TableSkeleton />}>
        <CollectionTable kind="crops" rows={getCrops()} />
      </Suspense>
    </>
  );
}
