'use client';

import { useState } from 'react';
import { splitSpoilers } from '@/lib/spoiler';
import { useHideSpoilers } from '@/lib/store/settingsStore';

/** Renders text, blurring {{spoiler}} parts behind a click-to-reveal button while spoilers are hidden. */
export function SpoilerText({ text }: { text: string }): React.JSX.Element {
  const hide = useHideSpoilers();
  const segments = splitSpoilers(text);
  return (
    <>
      {segments.map((s, i) => (s.spoiler && hide ? <HiddenSpoiler key={i} text={s.text} /> : <span key={i}>{s.text}</span>))}
    </>
  );
}

function HiddenSpoiler({ text }: { text: string }): React.JSX.Element {
  const [shown, setShown] = useState(false);
  if (shown) return <span>{text}</span>;
  return (
    <button
      type="button"
      onClick={(e) => {
        // Spoilers can sit inside links; reveal without navigating.
        e.preventDefault();
        e.stopPropagation();
        setShown(true);
      }}
      className="inline rounded bg-stone-300 px-1 text-stone-300 transition-colors hover:bg-stone-400 hover:text-stone-400"
    >
      <span aria-hidden className="select-none blur-[3px]">
        {text}
      </span>
      <span className="sr-only">Spoiler hidden. Activate to reveal.</span>
    </button>
  );
}
