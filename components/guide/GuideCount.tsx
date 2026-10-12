'use client';

import { useGuideHydrated, useGuideStore } from '@/lib/store/guideStore';

export function GuideCount(): React.JSX.Element | null {
  const hydrated = useGuideHydrated();
  const count = useGuideStore((s) => s.entries.length);
  if (!hydrated || count === 0) return null;
  return (
    <span className="rounded-full bg-mistria-green-ink px-1.5 py-0.5 text-[10px] font-bold leading-none text-amber-50 tabular-nums">
      {count}
      <span className="sr-only"> items in your guide</span>
    </span>
  );
}
