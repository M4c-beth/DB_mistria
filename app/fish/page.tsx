import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getFish } from '@/lib/data';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { CollectionTable } from '@/components/collections/CollectionTable';
import { TableSkeleton } from '@/components/ui/TableSkeleton';

export const metadata: Metadata = { title: 'Fish', description: 'Every fish in Fields of Mistria by season, location and weather.' };

export default function FishPage(): React.JSX.Element {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Fish' }]} />
      <PageHeader title="Fish">Where and when to catch every fish. Filter by season or location, then add them to your guide.</PageHeader>
      <Suspense fallback={<TableSkeleton />}>
        <CollectionTable kind="fish" rows={getFish()} />
      </Suspense>
    </>
  );
}
