import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Prefixes a /public path with the GitHub Pages base path (next/image doesn't for string srcs). */
export function assetPath(p: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${p}`;
}

export function formatGold(n: number | null): string {
  return n === null ? '—' : `${n.toLocaleString('en-US')}g`;
}
