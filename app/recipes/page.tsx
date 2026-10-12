import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getRecipes } from '@/lib/data';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { RecipeTable } from '@/components/recipes/RecipeTable';
import { TableSkeleton } from '@/components/ui/TableSkeleton';

export const metadata: Metadata = {
  title: 'Recipes',
  description: 'Every cooking, milling, refinery and blacksmithing recipe in Fields of Mistria with ingredients.',
};

export default function RecipesPage(): React.JSX.Element {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Recipes' }]} />
      <PageHeader title="Recipes">
        Cooking, milling, refinery and blacksmithing recipes. Search by an ingredient to see what you can make with it.
      </PageHeader>
      <Suspense fallback={<TableSkeleton />}>
        <RecipeTable recipes={getRecipes()} />
      </Suspense>
    </>
  );
}
