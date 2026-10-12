'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeStorage } from './safeStorage';

interface SettingsState {
  /** Hide content the wiki marks as a spoiler. On by default. */
  hideSpoilers: boolean;
  setHideSpoilers: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      hideSpoilers: true,
      setHideSpoilers: (hideSpoilers) => set({ hideSpoilers }),
    }),
    {
      name: 'mistria-settings',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<SettingsState>;
        return { ...current, hideSpoilers: typeof p.hideSpoilers === 'boolean' ? p.hideSpoilers : current.hideSpoilers };
      },
    },
  ),
);

/**
 * Whether spoilers should be hidden right now. Static HTML is always rendered with spoilers
 * hidden, so this stays true until the saved preference has loaded.
 */
export function useHideSpoilers(): boolean {
  const [hydrated, setHydrated] = useState(false);
  const hide = useSettingsStore((s) => s.hideSpoilers);
  useEffect(() => {
    setHydrated(useSettingsStore.persist.hasHydrated());
    return useSettingsStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);
  return hydrated ? hide : true;
}
