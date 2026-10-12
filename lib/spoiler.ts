// Inline spoilers from the wiki are stored inside text as {{spoiler}}…{{/spoiler}}.
export const SPOILER_OPEN = '{{spoiler}}';
export const SPOILER_CLOSE = '{{/spoiler}}';

export interface TextSegment {
  text: string;
  spoiler: boolean;
}

export function hasSpoiler(text: string): boolean {
  return text.includes(SPOILER_OPEN);
}

/** Splits text into plain and spoiler segments. An unclosed marker runs to the end of the text. */
export function splitSpoilers(text: string): TextSegment[] {
  const out: TextSegment[] = [];
  let rest = text;
  while (rest) {
    const open = rest.indexOf(SPOILER_OPEN);
    if (open === -1) {
      out.push({ text: rest, spoiler: false });
      break;
    }
    if (open > 0) out.push({ text: rest.slice(0, open), spoiler: false });
    rest = rest.slice(open + SPOILER_OPEN.length);
    const close = rest.indexOf(SPOILER_CLOSE);
    out.push({ text: close === -1 ? rest : rest.slice(0, close), spoiler: true });
    rest = close === -1 ? '' : rest.slice(close + SPOILER_CLOSE.length);
  }
  return out.map((s) => ({ ...s, text: s.text.replaceAll(SPOILER_CLOSE, '') })).filter((s) => s.text);
}

/** Plain text with markers removed (spoilers shown), or with spoiler parts replaced. */
export function spoilerPlainText(text: string, replacement?: string): string {
  return splitSpoilers(text)
    .map((s) => (s.spoiler && replacement !== undefined ? replacement : s.text))
    .join('');
}

/** Wraps a whole value as a spoiler when `isSpoiler` is set. */
export function markSpoiler(text: string, isSpoiler: boolean): string {
  return isSpoiler ? `${SPOILER_OPEN}${text}${SPOILER_CLOSE}` : text;
}
