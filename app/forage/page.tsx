import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getForage } from '@/lib/data';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { CollectionTable } from '@/components/collections/CollectionTable';
import { TableSkeleton } from '@/components/ui/TableSkeleton';

export const metadata: Metadata = {
  title: 'Forageables',
  description: 'Every forageable in Fields of Mistria by season and location.',
};

export default function ForagePage(): React.JSX.Element {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Forageables' }]} />
      <PageHeader title="Forageables">Wild goods you can gather around Mistria and in the mines, by season and location.</PageHeader>
      <Suspense fallback={<TableSkeleton />}>
        <CollectionTable kind="forage" rows={getForage()} />
      </Suspense>
    </>
  );
}
