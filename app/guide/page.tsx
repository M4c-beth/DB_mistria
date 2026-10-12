import type { Metadata } from 'next';
import { getBugs, getCrops, getDataMeta, getFish, getVillagers } from '@/lib/data';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { GuideBuilder } from '@/components/guide/GuideBuilder';

export const metadata: Metadata = {
  title: 'My Guide',
  description: 'Pick the villagers, fish, bugs and crops you care about and download them as a PDF.',
};

export default function GuidePage(): React.JSX.Element {
  return (
    <>
      <Breadcrumbs items={[{ label: 'My Guide' }]} />
      <PageHeader title="My Guide">
        Everything you&apos;ve added is listed here. Choose what to include, then download your PDF. It&apos;s generated in your
        browser and saved only on this device.
      </PageHeader>
      <GuideBuilder villagers={getVillagers()} fish={getFish()} bugs={getBugs()} crops={getCrops()} meta={getDataMeta()} />
    </>
  );
}
