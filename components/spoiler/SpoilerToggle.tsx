'use client';

import { useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHideSpoilers, useSettingsStore } from '@/lib/store/settingsStore';

/** Site-wide "Hide spoilers" switch. `compact` drops the label for the collapsed sidebar. */
export function SpoilerToggle({ compact = false }: { compact?: boolean }): React.JSX.Element {
  const id = useId();
  const hide = useHideSpoilers();
  const setHide = useSettingsStore((s) => s.setHideSpoilers);
  const Icon = hide ? EyeOff : Eye;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={hide}
      aria-labelledby={compact ? undefined : id}
      aria-label={compact ? 'Hide spoilers' : undefined}
      title={compact ? (hide ? 'Spoilers hidden' : 'Spoilers shown') : undefined}
      onClick={() => setHide(!hide)}
      className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-stone-600 hover:bg-amber-100"
    >
      <Icon aria-hidden className="size-5 shrink-0" />
      {!compact && (
        <>
          <span id={id} className="flex-1 text-left font-semibold">
            Hide spoilers
          </span>
          <span
            aria-hidden
            className={cn(
              'relative h-5 w-9 shrink-0 rounded-full transition-colors',
              hide ? 'bg-mistria-green-ink' : 'bg-stone-300',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 size-4 rounded-full bg-amber-50 shadow transition-transform',
                hide ? 'translate-x-[18px]' : 'translate-x-0.5',
              )}
            />
          </span>
        </>
      )}
    </button>
  );
}
