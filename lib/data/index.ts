import 'server-only';
import { z } from 'zod';
import villagersJson from '@/data/villagers.json';
import fishJson from '@/data/fish.json';
import bugsJson from '@/data/bugs.json';
import cropsJson from '@/data/crops.json';
import forageJson from '@/data/forage.json';
import recipesJson from '@/data/recipes.json';
import schedulesJson from '@/data/schedules.json';
import questsJson from '@/data/quests.json';
import metaJson from '@/data/meta.json';
import {
  GIFT_TIERS,
  BugSchema,
  CropSchema,
  FishSchema,
  ForageSchema,
  MetaSchema,
  QuestsSchema,
  ScheduleSchema,
  RecipeSchema,
  VillagerSchema,
  type Bug,
  type Crop,
  type DataMeta,
  type Fish,
  type Forage,
  type GiftTier,
  type Quests,
  type Schedule,
  type Recipe,
  type Season,
  type Villager,
} from './schemas';

// Parsed once at build time; a malformed record fails the build instead of shipping.
const villagers: Villager[] = z.array(VillagerSchema).parse(villagersJson);
const fish: Fish[] = z.array(FishSchema).parse(fishJson);
const bugs: Bug[] = z.array(BugSchema).parse(bugsJson);
const crops: Crop[] = z.array(CropSchema).parse(cropsJson);
const forage: Forage[] = z.array(ForageSchema).parse(forageJson);
const recipes: Recipe[] = z.array(RecipeSchema).parse(recipesJson);
const schedules: Record<string, Schedule> = z.record(z.string(), ScheduleSchema).parse(schedulesJson);
const quests: Record<string, Quests> = z.record(z.string(), QuestsSchema).parse(questsJson);
const meta: DataMeta = MetaSchema.parse(metaJson);

export const getVillagers = (): Villager[] => villagers;
export const getVillager = (slug: string): Villager | undefined => villagers.find((v) => v.slug === slug);
export const getFish = (): Fish[] => fish;
export const getBugs = (): Bug[] => bugs;
export const getCrops = (): Crop[] => crops;
export const getForage = (): Forage[] => forage;
export const getRecipes = (): Recipe[] => recipes;
export const getFishBySlug = (slug: string): Fish | undefined => fish.find((f) => f.slug === slug);
export const getBug = (slug: string): Bug | undefined => bugs.find((b) => b.slug === slug);
export const getCrop = (slug: string): Crop | undefined => crops.find((c) => c.slug === slug);
export const getForageable = (slug: string): Forage | undefined => forage.find((f) => f.slug === slug);
export const getRecipe = (slug: string): Recipe | undefined => recipes.find((r) => r.slug === slug);
export const getSchedule = (villagerSlug: string): Schedule | undefined => schedules[villagerSlug];
export const getQuests = (villagerSlug: string): Quests | undefined => quests[villagerSlug];
export const getAllSchedules = (): Record<string, Schedule> => schedules;
export const getAllQuests = (): Record<string, Quests> => quests;
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

/** Recipes that take the given item as an ingredient. */
export function getRecipesUsing(itemName: string): Recipe[] {
  return recipes.filter((r) => r.ingredients.some((i) => i.name === itemName));
}

export interface IngredientNode {
  name: string;
  amount: number;
  href: string | undefined;
  /** Set when this ingredient is itself crafted: what one craft of it takes, as the wiki lists it. */
  craft?: { type: Recipe['type']; ingredients: IngredientNode[] };
}

/**
 * Recipe tree: ingredients, expanded where an ingredient has its own recipe (e.g. Flour from Milling).
 * Amounts are per craft as listed on the wiki. We don't multiply them out because the wiki data
 * doesn't say how many items a craft produces.
 */
export function getIngredientTree(recipe: Recipe): IngredientNode[] {
  const byName = new Map(recipes.map((r) => [r.name, r]));
  const build = (r: Recipe, path: Set<string>): IngredientNode[] =>
    r.ingredients.map((ing): IngredientNode => {
      const sub = byName.get(ing.name);
      const node: IngredientNode = { name: ing.name, amount: ing.amount, href: itemHrefs.get(ing.name) };
      if (sub && !path.has(sub.name) && path.size < 6) {
        node.craft = { type: sub.type, ingredients: build(sub, new Set(path).add(sub.name)) };
      }
      return node;
    });
  return build(recipe, new Set([recipe.name]));
}

// Item name -> page on this site. Earlier entries win when a name appears twice
// (e.g. Basil is both a crop and a forageable).
const itemHrefs = new Map<string, string>();
for (const [list, base] of [
  [crops, 'crops'],
  [fish, 'fish'],
  [bugs, 'bugs'],
  [forage, 'forage'],
  [recipes, 'recipes'],
] as const) {
  for (const item of list) if (!itemHrefs.has(item.name)) itemHrefs.set(item.name, `/${base}/${item.slug}/`);
}

/** Link to an item's page on this site, if we have one. */
export const getItemHref = (name: string): string | undefined => itemHrefs.get(name);

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
  kind: 'Villager' | 'Fish' | 'Bug' | 'Crop' | 'Forage' | 'Recipe';
  href: string;
}

export function getSearchIndex(): SearchEntry[] {
  return [
    ...villagers.map((v): SearchEntry => ({ name: v.name, kind: 'Villager', href: `/villagers/${v.slug}/` })),
    ...fish.map((f): SearchEntry => ({ name: f.name, kind: 'Fish', href: `/fish/${f.slug}/` })),
    ...bugs.map((b): SearchEntry => ({ name: b.name, kind: 'Bug', href: `/bugs/${b.slug}/` })),
    ...crops.map((c): SearchEntry => ({ name: c.name, kind: 'Crop', href: `/crops/${c.slug}/` })),
    ...forage.map((f): SearchEntry => ({ name: f.name, kind: 'Forage', href: `/forage/${f.slug}/` })),
    ...recipes.map((r): SearchEntry => ({ name: r.name, kind: 'Recipe', href: `/recipes/${r.slug}/` })),
  ];
}
