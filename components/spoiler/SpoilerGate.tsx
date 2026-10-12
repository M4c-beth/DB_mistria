'use client';

import { useState } from 'react';
import { EyeOff } from 'lucide-react';
import { useHideSpoilers } from '@/lib/store/settingsStore';

interface Props {
  spoiler: boolean;
  /** What is being hidden, e.g. "This page" or "Quests". */
  label: string;
  children: React.ReactNode;
}

/** Covers spoiler-flagged content with a notice until the reader chooses to see it. */
export function SpoilerGate({ spoiler, label, children }: Props): React.JSX.Element {
  const hide = useHideSpoilers();
  const [revealed, setRevealed] = useState(false);
  if (!spoiler || !hide || revealed) return <>{children}</>;
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-wood-brown/40 bg-amber-50/70 px-6 py-10 text-center">
      <EyeOff aria-hidden className="size-10 text-wood-brown-ink" strokeWidth={1.5} />
      <p className="font-heading text-lg font-bold">{label} may contain story spoilers.</p>
      <p className="max-w-sm text-sm text-stone-600">
        The wiki marks this as a spoiler. You can peek just this once, or turn off{' '}
        <span className="font-semibold">Hide spoilers</span> in the menu.
      </p>
      <button type="button" onClick={() => setRevealed(true)} className="btn-secondary">
        Show anyway
      </button>
    </div>
  );
}
