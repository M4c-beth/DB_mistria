import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotFound(): React.JSX.Element {
  return (
    <div className="py-12">
      <EmptyState title="This page wandered off into the Deep Woods.">
        <Link href="/" className="font-semibold text-mistria-blue-ink underline">
          Head back to town
        </Link>
      </EmptyState>
    </div>
  );
}
