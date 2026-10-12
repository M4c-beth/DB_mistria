'use client';

import { useHideSpoilers } from '@/lib/store/settingsStore';

/** Leaves out its children while spoilers are hidden and `spoiler` is set. */
export function SpoilerHide({ spoiler, children }: { spoiler: boolean; children: React.ReactNode }): React.JSX.Element | null {
  const hide = useHideSpoilers();
  return spoiler && hide ? null : <>{children}</>;
}

/** "N hidden" note shown next to lists that dropped spoiler entries. */
export function SpoilerHiddenNote({ count, noun }: { count: number; noun: string }): React.JSX.Element | null {
  const hide = useHideSpoilers();
  if (!hide || count === 0) return null;
  return (
    <p className="text-sm text-stone-600">
      {count} {noun} hidden to avoid spoilers. Turn off <span className="font-semibold">Hide spoilers</span> in the menu to
      see them.
    </p>
  );
}
