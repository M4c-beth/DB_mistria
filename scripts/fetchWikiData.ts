/**
 * Pulls game data from the official Fields of Mistria wiki (fieldsofmistria.wiki.gg)
 * via its Cargo API and writes cleaned JSON to data/ and icons to public/icons/.
 *
 * Run: npm run fetch-data
 * Wiki content is CC BY-SA 4.0; every record keeps its source page URL.
 */
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';

const API = 'https://fieldsofmistria.wiki.gg/api.php';
const WIKI = 'https://fieldsofmistria.wiki.gg/wiki/';
const USER_AGENT = 'MistriaDB/0.1 (community fan database; https://github.com/M4c-beth/DB_mistria)';
const ROOT = path.resolve(import.meta.dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const ICON_DIR = path.join(ROOT, 'public', 'icons');

const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'] as const;
type Season = (typeof SEASONS)[number];
type Row = Record<string, string>;

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

async function api(params: Record<string, string>): Promise<unknown> {
  const url = `${API}?${new URLSearchParams({ format: 'json', ...params })}`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

/** Runs a Cargo query, paging through all results. */
async function cargo(params: Record<string, string>): Promise<Row[]> {
  const rows: Row[] = [];
  const limit = 500;
  for (let offset = 0; ; offset += limit) {
    const json = (await api({
      action: 'cargoquery',
      limit: String(limit),
      offset: String(offset),
      ...params,
    })) as { cargoquery?: { title: Row }[]; error?: { info: string } };
    if (json.error) throw new Error(`Cargo error: ${json.error.info}`);
    const page = (json.cargoquery ?? []).map((r) => r.title);
    rows.push(...page);
    if (page.length < limit) return rows;
    await sleep(300);
  }
}

/** Strips wiki markup down to plain text. */
function clean(raw: string | undefined): string {
  if (!raw) return '';
  return raw
    .replace(/<span style="display:\s*none">[^<]*<\/span>/gi, '') // hidden sort keys
    .replace(/\[\[File:[^\]]*\]\]/gi, '')
    .replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1')
    .replace(/\[\[([^\]]*)\]\]/g, '$1')
    .replace(/'''?/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+/g, ' ')
    .replace(/\( /g, '(')
    .replace(/ \)/g, ')')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .join('\n');
}

/** Splits a cleaned multi-value field (newline/comma separated), de-duplicated. */
function list(raw: string | undefined): string[] {
  const parts = clean(raw).split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  // A line like "(floors 61-79)" qualifies the entry before it.
  const merged: string[] = [];
  for (const p of parts) {
    if (p.startsWith('(') && merged.length) merged[merged.length - 1] += ` ${p}`;
    else merged.push(p);
  }
  return [...new Set(merged)];
}

function seasons(raw: string | undefined): Season[] {
  const text = clean(raw).toLowerCase();
  if (!text) return [];
  if (/\ball\b|any|year/.test(text)) return [...SEASONS];
  return SEASONS.filter((s) => text.includes(s.toLowerCase()) || (s === 'Fall' && text.includes('autumn')));
}

function num(raw: string | undefined): number | null {
  const n = Number.parseInt(clean(raw), 10);
  return Number.isFinite(n) ? n : null;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const sourceUrl = (page: string): string => WIKI + encodeURIComponent(page.replace(/ /g, '_'));

function iconFile(raw: string | undefined): string | null {
  const m = raw?.match(/\[\[File:([^\]|]+)/i);
  return m ? m[1].trim() : null;
}

const fileExists = (p: string): Promise<boolean> =>
  access(p).then(
    () => true,
    () => false,
  );

/** Downloads a wiki file to public/icons/<slug>.png; returns its public path or null. */
async function downloadIcon(file: string | null, slug: string): Promise<string | null> {
  if (!file) return null;
  const ext = path.extname(file).toLowerCase() || '.png';
  if (!['.png', '.gif', '.webp', '.jpg', '.jpeg'].includes(ext)) return null;
  const name = `${slug}${ext}`;
  const dest = path.join(ICON_DIR, name);
  if (await fileExists(dest)) return `/icons/${name}`;
  const info = (await api({ action: 'query', titles: `File:${file}`, prop: 'imageinfo', iiprop: 'url' })) as {
    query?: { pages?: Record<string, { imageinfo?: { url: string }[] }> };
  };
  const url = Object.values(info.query?.pages ?? {})[0]?.imageinfo?.[0]?.url;
  if (!url) {
    console.warn(`  ! icon not on wiki: ${file}`);
    return null;
  }
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (res.ok && (res.headers.get('content-type') ?? '').startsWith('image/')) {
      await writeFile(dest, Buffer.from(await res.arrayBuffer()));
      await sleep(200);
      return `/icons/${name}`;
    }
    await sleep(2000 * (attempt + 1));
  }
  console.warn(`  ! icon download failed: ${file}`);
  return null;
}

async function fetchVillagers(): Promise<unknown[]> {
  console.log('Villagers…');
  const chars = (
    await cargo({
      tables: 'Characters',
      fields: 'charName,occupation,affiliation,relationship,romanceable,birth,species,_pageName=page',
      where: '_pageNamespace=0',
    })
  ).filter((c) => !c.page.includes('/') && c.page !== 'The Player');

  const prefs = await cargo({ tables: 'GiftPrefs', fields: 'charName,itemName,interest' });

  const out = [];
  for (const c of chars) {
    const name = clean(c.charName) || c.page;
    const slug = slugify(name);
    const gifts: Record<string, string[]> = { love: [], like: [], neutral: [], dislike: [], hate: [], banned: [] };
    for (const p of prefs) {
      if (clean(p.charName) !== name) continue;
      const bucket = gifts[p.interest?.toLowerCase()];
      if (bucket) bucket.push(clean(p.itemName));
    }
    for (const k of Object.keys(gifts)) gifts[k] = [...new Set(gifts[k])].sort();
    out.push({
      slug,
      name,
      occupation: clean(c.occupation) || null,
      affiliation: clean(c.affiliation) || null,
      relationship: clean(c.relationship) || null,
      romanceable: c.romanceable === '1',
      birthday: clean(c.birth) || null,
      species: clean(c.species) || null,
      portrait: await downloadIcon(`${c.page} Portrait.png`, `villager-${slug}`),
      gifts,
      source: sourceUrl(c.page),
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchFish(): Promise<unknown[]> {
  console.log('Fish…');
  const rows = await cargo({
    tables: 'Fish,Items',
    join_on: 'Fish.fishName=Items.itemName',
    fields:
      'Fish.fishName=name,Fish.rarity=rarity,Fish.size=size,Fish.weather__full=weather,Fish.fishing=fishing,Fish.diving=diving,' +
      'Items.season=season,Items.location__full=location,Items.sellValue=sellValue,Items.icon=icon,Items._pageName=page',
  });
  const out = [];
  for (const r of rows) {
    const name = clean(r.name);
    const slug = slugify(name);
    out.push({
      slug,
      name,
      rarity: clean(r.rarity) || null,
      size: clean(r.size) || null,
      seasons: seasons(r.season),
      locations: list(r.location),
      weather: list(r.weather),
      method: { rod: r.fishing === '1', diving: r.diving === '1' },
      sellValue: num(r.sellValue),
      icon: await downloadIcon(iconFile(r.icon), `fish-${slug}`),
      source: sourceUrl(r.page || name),
    });
  }
  return dedupe(out);
}

async function fetchBugs(): Promise<unknown[]> {
  console.log('Bugs…');
  const rows = await cargo({
    tables: 'Bugs,Items',
    join_on: 'Bugs.name=Items.itemName',
    fields:
      'Bugs.name=name,Bugs.rarity=rarity,Bugs.weather__full=weather,Bugs.season__full=season,Bugs.time=time,Bugs.spawnCondition=spawnCondition,' +
      'Items.location__full=location,Items.sellValue=sellValue,Items.icon=icon,Items._pageName=page',
  });
  const out = [];
  for (const r of rows) {
    const name = clean(r.name);
    // The wiki Bugs table also holds honey, pheromones and bait; keep only catchable bugs.
    if (/honey|pheromones|fish bait/i.test(name)) continue;
    const slug = slugify(name);
    out.push({
      slug,
      name,
      rarity: clean(r.rarity) || null,
      seasons: seasons(r.season),
      locations: list(r.location),
      weather: list(r.weather),
      time: clean(r.time) || null,
      spawnCondition: clean(r.spawnCondition) || null,
      sellValue: num(r.sellValue),
      icon: await downloadIcon(iconFile(r.icon), `bug-${slug}`),
      source: sourceUrl(r.page || name),
    });
  }
  return dedupe(out);
}

async function fetchCrops(): Promise<unknown[]> {
  console.log('Crops…');
  const rows = await cargo({
    tables: 'Crops,Items',
    join_on: 'Crops.name=Items.itemName',
    fields:
      'Crops.name=name,Crops.seed=seed,Crops.growthTime=growthTime,Crops.regrowTime=regrowTime,' +
      'Items.season=season,Items.sellValue=sellValue,Items.icon=icon,Items._pageName=page',
  });
  const out = [];
  for (const r of rows) {
    const name = clean(r.name);
    const slug = slugify(name);
    out.push({
      slug,
      name,
      seed: clean(r.seed) || null,
      seasons: seasons(r.season),
      growthDays: num(r.growthTime),
      regrowDays: num(r.regrowTime),
      sellValue: num(r.sellValue),
      icon: await downloadIcon(iconFile(r.icon), `crop-${slug}`),
      source: sourceUrl(r.page || name),
    });
  }
  return dedupe(out);
}

async function fetchForage(): Promise<unknown[]> {
  console.log('Forageables…');
  const rows = await cargo({
    tables: 'Items',
    fields:
      'itemName=name,season,location__full=location,sources__full=sources,sellValue,icon,tags__full=tags,_pageName=page',
    where: 'tags HOLDS "Forageable"',
  });
  const out = [];
  for (const r of rows) {
    const name = clean(r.name);
    const slug = slugify(name);
    out.push({
      slug,
      name,
      seasons: seasons(r.season),
      locations: list(r.location),
      sources: list(r.sources),
      tags: list(r.tags).filter((t) => t !== 'Forageable'),
      sellValue: num(r.sellValue),
      icon: await downloadIcon(iconFile(r.icon), `forage-${slug}`),
      source: sourceUrl(r.page || name),
    });
  }
  return dedupe(out);
}

const CRAFT_TYPES: Record<string, string> = {
  Food: 'Cooking',
  Blacksmith: 'Blacksmithing',
  Milling: 'Milling',
  Refinery: 'Refinery',
};

async function fetchRecipes(): Promise<unknown[]> {
  console.log('Recipes…');
  const rows = await cargo({
    tables: 'Recipes,Items',
    join_on: 'Recipes.itemName=Items.itemName',
    fields:
      'Recipes.itemName=name,Recipes.time=time,Recipes.craftType=craftType,Recipes.skillLevel=skillLevel,Recipes.stars=stars,' +
      'Recipes.workbenchLevel=workbenchLevel,Recipes.recipeSource__full=recipeSource,' +
      'Items.sellValue=sellValue,Items.health=health,Items.stamina=stamina,Items.mana=mana,Items.icon=icon,Recipes._pageName=page',
  });
  const ingredientRows = await cargo({ tables: 'Ingredients', fields: 'resultItem,ingredient,amount' });
  const ingredients = new Map<string, { name: string; amount: number }[]>();
  for (const i of ingredientRows) {
    const key = clean(i.resultItem);
    const name = clean(i.ingredient);
    if (!key || !name) continue;
    const listFor = ingredients.get(key) ?? [];
    if (!listFor.some((x) => x.name === name)) listFor.push({ name, amount: num(i.amount) ?? 1 });
    ingredients.set(key, listFor);
  }

  const out = [];
  for (const r of rows) {
    const name = clean(r.name);
    const type = CRAFT_TYPES[clean(r.craftType)];
    if (!name || !type) continue;
    const slug = slugify(name);
    out.push({
      slug,
      name,
      type,
      ingredients: ingredients.get(name) ?? [],
      timeMinutes: num(r.time),
      skillLevel: num(r.skillLevel),
      stars: num(r.stars),
      stationLevel: num(r.workbenchLevel),
      howToGet: list(r.recipeSource),
      sellValue: num(r.sellValue),
      health: num(r.health),
      stamina: num(r.stamina),
      mana: num(r.mana),
      icon: await downloadIcon(iconFile(r.icon), `recipe-${slug}`),
      source: sourceUrl(r.page || name),
    });
  }
  return dedupe(out);
}

function dedupe<T extends { slug: string; name: string }>(items: T[]): T[] {
  const seen = new Map<string, T>();
  for (const i of items) if (i.slug && !seen.has(i.slug)) seen.set(i.slug, i);
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}

async function main(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(ICON_DIR, { recursive: true });
  const datasets = {
    villagers: await fetchVillagers(),
    fish: await fetchFish(),
    bugs: await fetchBugs(),
    crops: await fetchCrops(),
    forage: await fetchForage(),
    recipes: await fetchRecipes(),
  };
  for (const [name, data] of Object.entries(datasets)) {
    await writeFile(path.join(DATA_DIR, `${name}.json`), JSON.stringify(data, null, 2) + '\n');
    console.log(`  ${name}: ${data.length}`);
  }
  await writeFile(
    path.join(DATA_DIR, 'meta.json'),
    JSON.stringify(
      {
        source: 'https://fieldsofmistria.wiki.gg',
        license: 'CC BY-SA 4.0',
        fetchedAt: new Date().toISOString().slice(0, 10),
      },
      null,
      2,
    ) + '\n',
  );
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
