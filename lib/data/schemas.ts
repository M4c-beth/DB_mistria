import { z } from 'zod';

export const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'] as const;
export const SeasonSchema = z.enum(SEASONS);
export type Season = z.infer<typeof SeasonSchema>;

export const GIFT_TIERS = ['love', 'like', 'neutral', 'dislike', 'hate'] as const;
export type GiftTier = (typeof GIFT_TIERS)[number];

const slug = z.string().regex(/^[a-z0-9-]+$/);
const sourceUrl = z.url().startsWith('https://fieldsofmistria.wiki.gg/');
const iconPath = z.string().regex(/^\/icons\/[a-z0-9-]+\.(png|gif|webp|jpe?g)$/).nullable();

export const VillagerSchema = z
  .object({
    slug,
    name: z.string().min(1),
    occupation: z.string().nullable(),
    affiliation: z.string().nullable(),
    relationship: z.string().nullable(),
    romanceable: z.boolean(),
    birthday: z.string().nullable(),
    species: z.string().nullable(),
    portrait: iconPath,
    gifts: z
      .object({
        love: z.array(z.string()),
        like: z.array(z.string()),
        neutral: z.array(z.string()),
        dislike: z.array(z.string()),
        hate: z.array(z.string()),
        banned: z.array(z.string()),
      })
      .strict(),
    source: sourceUrl,
  })
  .strict();

export const FishSchema = z
  .object({
    slug,
    name: z.string().min(1),
    rarity: z.string().nullable(),
    size: z.string().nullable(),
    seasons: z.array(SeasonSchema),
    locations: z.array(z.string()),
    weather: z.array(z.string()),
    method: z.object({ rod: z.boolean(), diving: z.boolean() }).strict(),
    sellValue: z.number().int().nullable(),
    icon: iconPath,
    source: sourceUrl,
  })
  .strict();

export const BugSchema = z
  .object({
    slug,
    name: z.string().min(1),
    rarity: z.string().nullable(),
    seasons: z.array(SeasonSchema),
    locations: z.array(z.string()),
    weather: z.array(z.string()),
    time: z.string().nullable(),
    spawnCondition: z.string().nullable(),
    sellValue: z.number().int().nullable(),
    icon: iconPath,
    source: sourceUrl,
  })
  .strict();

export const CropSchema = z
  .object({
    slug,
    name: z.string().min(1),
    seed: z.string().nullable(),
    seasons: z.array(SeasonSchema),
    growthDays: z.number().int().nullable(),
    regrowDays: z.number().int().nullable(),
    sellValue: z.number().int().nullable(),
    icon: iconPath,
    source: sourceUrl,
  })
  .strict();

export const MetaSchema = z
  .object({
    source: z.url(),
    license: z.string(),
    fetchedAt: z.iso.date(),
  })
  .strict();

export type Villager = z.infer<typeof VillagerSchema>;
export type Fish = z.infer<typeof FishSchema>;
export type Bug = z.infer<typeof BugSchema>;
export type Crop = z.infer<typeof CropSchema>;
export type DataMeta = z.infer<typeof MetaSchema>;

export type CollectionKind = 'fish' | 'bugs' | 'crops';
export type GuideKind = 'villager' | CollectionKind;
