import { assetPath } from '@/lib/utils';

/** Pixel art is upscaled to at least this many pixels per side so PDF viewers don't blur it. */
const MIN_SIDE = 64;

/**
 * Redraws an icon on a canvas and returns it as an RGBA PNG data URL. Some wiki icons use
 * colour-key transparency, which jsPDF renders as a black box; a canvas re-encode fixes that.
 */
async function toPdfPng(blob: Blob): Promise<string> {
  const bitmap = await createImageBitmap(blob);
  const scale = Math.max(1, Math.ceil(MIN_SIDE / Math.max(bitmap.width, bitmap.height)));
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width * scale;
  canvas.height = bitmap.height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no 2d context');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/png');
}

/** Fetches the site's own icon files as PDF-ready data URLs. Icons that fail are skipped. */
export async function loadImages(paths: (string | null | undefined)[]): Promise<Record<string, string>> {
  const unique = [...new Set(paths.filter((p): p is string => Boolean(p)))];
  const out: Record<string, string> = {};
  await Promise.all(
    unique.map(async (p) => {
      try {
        const res = await fetch(assetPath(p));
        if (!res.ok) return;
        out[p] = await toPdfPng(await res.blob());
      } catch {
        /* skip this icon */
      }
    }),
  );
  return out;
}
