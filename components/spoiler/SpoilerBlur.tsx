'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useHideSpoilers } from '@/lib/store/settingsStore';

interface Props {
  spoiler: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Blurs a whole spoiler entry (icon, name and details together) until clicked, so revealing
 * it never leaves part of it hidden. Renders children as-is when they aren't a spoiler.
 */
export function SpoilerBlur({ spoiler, children, className }: Props): React.JSX.Element {
  const hide = useHideSpoilers();
  const [revealed, setRevealed] = useState(false);
  if (!spoiler || !hide || revealed) return <span className={className}>{children}</span>;
  return (
    <span className="relative block">
      {/* Inert so links inside can't be focused or clicked while hidden. */}
      <span aria-hidden inert className={cn('pointer-events-none select-none blur-[5px]', className)}>
        {children}
      </span>
      <button
        type="button"
        onClick={() => setRevealed(true)}
        aria-label="Spoiler hidden. Activate to reveal."
        title="Spoiler: click to reveal"
        className="absolute inset-0 rounded-md hover:bg-stone-200/40"
      />
    </span>
  );
}
