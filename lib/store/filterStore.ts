'use client';

import { create } from 'zustand';
import type { CollectionKind, Season } from '@/lib/data/schemas';

export interface CollectionFilters {
  query: string;
  season: Season | null;
  location: string | null;
}

interface FilterState {
  filters: Record<CollectionKind, CollectionFilters>;
  setFilter: (kind: CollectionKind, patch: Partial<CollectionFilters>) => void;
  reset: (kind: CollectionKind) => void;
}

const empty = (): CollectionFilters => ({ query: '', season: null, location: null });

export const useFilterStore = create<FilterState>()((set) => ({
  filters: { fish: empty(), bugs: empty(), crops: empty(), forage: empty() },
  setFilter: (kind, patch) =>
    set((s) => ({ filters: { ...s.filters, [kind]: { ...s.filters[kind], ...patch } } })),
  reset: (kind) => set((s) => ({ filters: { ...s.filters, [kind]: empty() } })),
}));
