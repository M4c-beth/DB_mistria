'use client';

import * as RadixTooltip from '@radix-ui/react-tooltip';

/** Parchment-styled tooltip for hidden stats. The trigger must be focusable. */
export function Tooltip({ content, children }: { content: React.ReactNode; children: React.ReactNode }): React.JSX.Element {
  return (
    <RadixTooltip.Provider delayDuration={150}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            sideOffset={6}
            className="z-50 max-w-xs rounded-md border border-wood-brown/40 bg-amber-50 px-3 py-2 text-xs text-stone-800 shadow-md shadow-stone-300/60"
          >
            {content}
            <RadixTooltip.Arrow className="fill-amber-50" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
