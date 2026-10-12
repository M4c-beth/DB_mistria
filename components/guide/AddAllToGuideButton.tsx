'use client';

import { ListPlus } from 'lucide-react';
import type { GuideEntry } from '@/lib/store/guideStore';
import { useGuideStore } from '@/lib/store/guideStore';

export function AddAllToGuideButton({ entries, label }: { entries: GuideEntry[]; label: string }): React.JSX.Element {
  const addMany = useGuideStore((s) => s.addMany);
  return (
    <button type="button" onClick={() => addMany(entries)} className="btn-secondary">
      <ListPlus aria-hidden className="size-4" />
      {label}
    </button>
  );
}
