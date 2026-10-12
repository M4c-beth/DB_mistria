'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { GIFT_TIERS, GUIDE_KINDS, type GiftTier, type GuideKind } from '@/lib/data/schemas';
import { safeStorage } from './safeStorage';

export interface GuideEntry {
  kind: GuideKind;
  slug: string;
}

export interface GuideOptions {
  title: string;
  giftTiers: GiftTier[];
  groupBySeason: boolean;
  includeSchedules: boolean;
  includeQuests: boolean;
}

interface GuideState {
  entries: GuideEntry[];
  options: GuideOptions;
  toggle: (entry: GuideEntry) => void;
  addMany: (entries: GuideEntry[]) => void;
  remove: (entry: GuideEntry) => void;
  clear: () => void;
  setOptions: (patch: Partial<GuideOptions>) => void;
}

const same = (a: GuideEntry, b: GuideEntry): boolean => a.kind === b.kind && a.slug === b.slug;

const KINDS = GUIDE_KINDS;

function isGuideEntry(x: unknown): x is GuideEntry {
  if (typeof x !== 'object' || x === null) return false;
  const e = x as Record<string, unknown>;
  return KINDS.includes(e.kind as GuideKind) && typeof e.slug === 'string' && /^[a-z0-9-]+$/.test(e.slug);
}

export const useGuideStore = create<GuideState>()(
  persist(
    (set) => ({
      entries: [],
      options: {
        title: 'My Mistria Guide',
        giftTiers: ['love', 'like', 'hate'],
        groupBySeason: false,
        includeSchedules: false,
        includeQuests: false,
      },
      toggle: (entry) =>
        set((s) => ({
          entries: s.entries.some((e) => same(e, entry))
            ? s.entries.filter((e) => !same(e, entry))
            : [...s.entries, entry],
        })),
      addMany: (entries) =>
        set((s) => ({ entries: [...s.entries, ...entries.filter((n) => !s.entries.some((e) => same(e, n)))] })),
      remove: (entry) => set((s) => ({ entries: s.entries.filter((e) => !same(e, entry)) })),
      clear: () => set({ entries: [] }),
      setOptions: (patch) => set((s) => ({ options: { ...s.options, ...patch } })),
    }),
    {
      name: 'mistria-guide',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      // Stored data is user-editable; keep only well-formed values.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GuideState>;
        const entries = Array.isArray(p.entries) ? p.entries.filter(isGuideEntry) : current.entries;
        const o = p.options;
        const options: GuideOptions = {
          title:
            typeof o?.title === 'string' ? o.title.slice(0, 80) : current.options.title,
          giftTiers: Array.isArray(o?.giftTiers)
            ? o.giftTiers.filter((t): t is GiftTier => GIFT_TIERS.includes(t))
            : current.options.giftTiers,
          groupBySeason: typeof o?.groupBySeason === 'boolean' ? o.groupBySeason : current.options.groupBySeason,
          includeSchedules: o?.includeSchedules === true,
          includeQuests: o?.includeQuests === true,
        };
        return { ...current, entries, options };
      },
    },
  ),
);

/** True once persisted state has loaded; avoids hydration mismatches on static HTML. */
export function useGuideHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(useGuideStore.persist.hasHydrated());
    return useGuideStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);
  return hydrated;
}
