import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getBugs } from '@/lib/data';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { CollectionTable } from '@/components/collections/CollectionTable';
import { TableSkeleton } from '@/components/ui/TableSkeleton';

export const metadata: Metadata = { title: 'Bugs', description: 'Every bug in Fields of Mistria by season, location and time.' };

export default function BugsPage(): React.JSX.Element {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Bugs' }]} />
      <PageHeader title="Bugs">Every critter you can catch, when it appears, and what it needs to spawn.</PageHeader>
      <Suspense fallback={<TableSkeleton />}>
        <CollectionTable kind="bugs" rows={getBugs()} />
      </Suspense>
    </>
  );
}
