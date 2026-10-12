import 'server-only';
import { z } from 'zod';
import villagersJson from '@/data/villagers.json';
import fishJson from '@/data/fish.json';
import bugsJson from '@/data/bugs.json';
import cropsJson from '@/data/crops.json';
import metaJson from '@/data/meta.json';
import {
  GIFT_TIERS,
  type GiftTier,
  BugSchema,
  CropSchema,
  FishSchema,
  MetaSchema,
  VillagerSchema,
  type Bug,
  type Crop,
  type DataMeta,
  type Fish,
  type Season,
  type Villager,
} from './schemas';

// Parsed once at build time; a malformed record fails the build instead of shipping.
const villagers: Villager[] = z.array(VillagerSchema).parse(villagersJson);
const fish: Fish[] = z.array(FishSchema).parse(fishJson);
const bugs: Bug[] = z.array(BugSchema).parse(bugsJson);
const crops: Crop[] = z.array(CropSchema).parse(cropsJson);
const meta: DataMeta = MetaSchema.parse(metaJson);

export const getVillagers = (): Villager[] => villagers;
export const getVillager = (slug: string): Villager | undefined => villagers.find((v) => v.slug === slug);
export const getFish = (): Fish[] => fish;
export const getBugs = (): Bug[] => bugs;
export const getCrops = (): Crop[] => crops;
export const getFishBySlug = (slug: string): Fish | undefined => fish.find((f) => f.slug === slug);
export const getBug = (slug: string): Bug | undefined => bugs.find((b) => b.slug === slug);
export const getCrop = (slug: string): Crop | undefined => crops.find((c) => c.slug === slug);
export const getDataMeta = (): DataMeta => meta;

export type GiftReactions = Record<GiftTier, Villager[]>;

/** Which villagers love / like / … a given item (reverse of each villager's gift lists). */
export function getGiftReactions(itemName: string): GiftReactions {
  const out: GiftReactions = { love: [], like: [], neutral: [], dislike: [], hate: [] };
  for (const v of villagers) {
    for (const tier of GIFT_TIERS) {
      if (v.gifts[tier].includes(itemName)) out[tier].push(v);
    }
  }
  return out;
}

export function getBirthdaysInSeason(season: Season): Villager[] {
  return villagers
    .filter((v) => v.birthday?.startsWith(season))
    .sort((a, b) => birthdayDay(a) - birthdayDay(b));
}

function birthdayDay(v: Villager): number {
  return Number.parseInt(v.birthday?.split(' ')[1] ?? '', 10) || 0;
}

export interface SearchEntry {
  name: string;
  kind: 'Villager' | 'Fish' | 'Bug' | 'Crop';
  href: string;
}

export function getSearchIndex(): SearchEntry[] {
  return [
    ...villagers.map((v): SearchEntry => ({ name: v.name, kind: 'Villager', href: `/villagers/${v.slug}/` })),
    ...fish.map((f): SearchEntry => ({ name: f.name, kind: 'Fish', href: `/fish/${f.slug}/` })),
    ...bugs.map((b): SearchEntry => ({ name: b.name, kind: 'Bug', href: `/bugs/${b.slug}/` })),
    ...crops.map((c): SearchEntry => ({ name: c.name, kind: 'Crop', href: `/crops/${c.slug}/` })),
  ];
}
