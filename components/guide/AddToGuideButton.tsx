'use client';

import { Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GuideKind } from '@/lib/data/schemas';
import { useGuideHydrated, useGuideStore } from '@/lib/store/guideStore';

interface Props {
  kind: GuideKind;
  slug: string;
  name: string;
  /** Compact icon-only variant for table rows. */
  compact?: boolean;
}

export function AddToGuideButton({ kind, slug, name, compact = false }: Props): React.JSX.Element {
  const hydrated = useGuideHydrated();
  const added = useGuideStore((s) => s.entries.some((e) => e.kind === kind && e.slug === slug));
  const toggle = useGuideStore((s) => s.toggle);
  const on = hydrated && added;
  const label = on ? `Remove ${name} from your guide` : `Add ${name} to your guide`;

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => toggle({ kind, slug })}
        aria-label={label}
        aria-pressed={on}
        title={label}
        className={cn(
          'inline-flex size-10 items-center justify-center rounded-md border transition-colors',
          on
            ? 'border-mistria-green/40 bg-mistria-green/15 text-mistria-green-ink'
            : 'border-stone-300 bg-white/60 text-stone-600 hover:bg-amber-100',
        )}
      >
        {on ? <Check aria-hidden className="size-4" /> : <Plus aria-hidden className="size-4" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle({ kind, slug })}
      aria-pressed={on}
      className={on ? 'btn-secondary' : 'btn-primary'}
    >
      {on ? <Check aria-hidden className="size-4" /> : <Plus aria-hidden className="size-4" />}
      {on ? 'In your guide' : 'Add to guide'}
    </button>
  );
}
