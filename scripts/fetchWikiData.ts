/**
 * Pulls game data from the official Fields of Mistria wiki (fieldsofmistria.wiki.gg)
 * via its Cargo API and writes cleaned JSON to data/ and icons to public/icons/.
 *
 * Run: npm run fetch-data
 * Wiki content is CC BY-SA 4.0; every record keeps its source page URL.
 */
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { parse as parseHtml, type HTMLElement } from 'node-html-parser';

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

// Inline spoilers are kept but wrapped in these markers so the site can blur them.
const SPOILER_OPEN = '{{spoiler}}';
const SPOILER_CLOSE = '{{/spoiler}}';

/** Wiki pages that carry a "Spoiler warning" banner or SpoilerTag; filled before anything else is fetched. */
const spoilerPages = new Set<string>();
const isSpoilerPage = (page: string): boolean => spoilerPages.has(page);

async function fetchSpoilerPages(): Promise<void> {
  console.log('Spoiler-flagged pages…');
  for (const template of ['Template:Spoiler warning', 'Template:SpoilerTag']) {
    let cont: string | undefined;
    do {
      const json = (await api({
        action: 'query',
        list: 'embeddedin',
        eititle: template,
        einamespace: '0',
        eilimit: '500',
        ...(cont ? { eicontinue: cont } : {}),
      })) as { query?: { embeddedin?: { title: string }[] }; continue?: { eicontinue?: string } };
      for (const p of json.query?.embeddedin ?? []) spoilerPages.add(p.title);
      cont = json.continue?.eicontinue;
    } while (cont);
  }
}

/** Strips wiki markup down to plain text. */
function clean(raw: string | undefined): string {
  if (!raw) return '';
  return raw
    .replace(/\[\[Category:[^\]]*\]\]/gi, '')
    .replace(/<span class="spoiler-content[^"]*"[^>]*><span>([\s\S]*?)<\/span><\/span>/gi, SPOILER_OPEN + '$1' + SPOILER_CLOSE)
    .replace(/<span style="display:\s*none">[^<]*<\/span>/gi, '') // hidden sort keys
    .replace(/\[\[File:[^\]]*\]\]/gi, '')
    .replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1')
    .replace(/\[\[([^\]]*)\]\]/g, '$1')
    .replace(/'''?/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/<\/?[a-z]*$/i, '') // tag cut off where the wiki truncated a long field
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
      spoiler: isSpoilerPage(c.page),
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
      spoiler: isSpoilerPage(r.page || name),
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
      spoiler: isSpoilerPage(r.page || name),
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
      spoiler: isSpoilerPage(r.page || name),
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
      spoiler: isSpoilerPage(r.page || name),
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
      spoiler: isSpoilerPage(r.page || name),
      source: sourceUrl(r.page || name),
    });
  }
  return dedupe(out);
}

// ---------- Villager schedules & quests (rendered HTML; the wiki has no Cargo tables for these) ----------

/** Rendered HTML of a page, or null if it doesn't exist. */
async function pageHtml(page: string): Promise<HTMLElement | null> {
  const json = (await api({ action: 'parse', page, prop: 'text', formatversion: '2', redirects: '1' })) as {
    parse?: { text: string };
  };
  await sleep(300);
  return json.parse ? parseHtml(json.parse.text) : null;
}

/** Visible text of an element: hidden sort keys and footnotes removed, line breaks kept. */
function visibleText(el: HTMLElement): string {
  const copy = parseHtml(el.outerHTML);
  for (const hidden of copy.querySelectorAll('[style*="display:none"], [style*="display: none"], sup.reference, .mw-editsection')) {
    hidden.remove();
  }
  for (const spoiler of copy.querySelectorAll('.spoiler-content')) {
    spoiler.set_content(SPOILER_OPEN + spoiler.innerHTML + SPOILER_CLOSE);
  }
  const html = copy.innerHTML.replace(/<br\s*\/?>|<\/(li|p|div|dd|dt)>/gi, '\n');
  return parseHtml(html)
    .text.replace(/[\u00a0\u2000-\u200b\u202f\u205f]/g, ' ')
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

/** Table -> header + body grid, expanding rowspan/colspan so columns stay aligned. */
function tableGrid(table: HTMLElement): { headers: string[]; rows: string[][] } {
  const grid: string[][] = [];
  const carry: { text: string; left: number }[] = [];
  table.querySelectorAll('tr').forEach((tr, r) => {
    const row: string[] = [];
    let col = 0;
    const cells = tr.querySelectorAll('th, td').filter((c) => c.closest('tr') === tr);
    const fillCarry = (): void => {
      while (carry[col]?.left) {
        row[col] = carry[col]!.text;
        carry[col]!.left--;
        col++;
      }
    };
    for (const cell of cells) {
      fillCarry();
      const text = visibleText(cell);
      const span = Number(cell.getAttribute('colspan') ?? 1) || 1;
      const rowspan = Number(cell.getAttribute('rowspan') ?? 1) || 1;
      for (let i = 0; i < span; i++) {
        row[col] = text;
        if (rowspan > 1) carry[col] = { text, left: rowspan - 1 };
        col++;
      }
    }
    fillCarry();
    grid[r] = row.map((c) => c ?? '');
  });
  const [head = [], ...rows] = grid;
  return { headers: head, rows: rows.filter((r) => r.some(Boolean)) };
}

const headingText = (h: HTMLElement): string => visibleText(h).replace(/\s*Schedules?$/i, '').trim();

/** Content tables in document order with the h2/h3/h4 headings above them. Skips navboxes. */
function tablesWithHeadings(root: HTMLElement): { h2: string; h3: string | null; h4: string | null; table: HTMLElement }[] {
  const out: { h2: string; h3: string | null; h4: string | null; table: HTMLElement }[] = [];
  let h2 = '';
  let h3: string | null = null;
  let h4: string | null = null;
  for (const el of root.querySelectorAll('h2, h3, h4, table')) {
    if (el.tagName === 'H2') [h2, h3, h4] = [headingText(el), null, null];
    else if (el.tagName === 'H3') [h3, h4] = [headingText(el), null];
    else if (el.tagName === 'H4') h4 = headingText(el);
    else if (el.classList.contains('wikitable') && !el.classList.contains('navbox') && !el.closest('.navbox')) {
      out.push({ h2, h3, h4, table: el });
    }
  }
  return out;
}

async function fetchVillagerSchedule(page: string): Promise<unknown | null> {
  const root = await pageHtml(`${page}/Schedule`);
  if (!root) return null;
  const sections: { title: string; days: { day: string; condition: string | null; stops: { time: string; place: string }[] }[] }[] = [];
  for (const { h2, h3, h4, table } of tablesWithHeadings(root)) {
    const { rows } = tableGrid(table);
    const stops = rows
      .filter((r) => r[0] && r[1])
      .map((r) => ({ time: r[0]!, place: r[1]! }));
    if (!stops.length || !h2) continue;
    let section = sections.find((s) => s.title === h2);
    if (!section) sections.push((section = { title: h2, days: [] }));
    section.days.push({ day: h3 ?? h2, condition: h4, stops });
  }
  return sections.length
    ? { sections, spoiler: isSpoilerPage(`${page}/Schedule`), source: sourceUrl(`${page}/Schedule`) }
    : null;
}

async function fetchVillagerQuests(page: string): Promise<unknown | null> {
  const root = await pageHtml(`${page}/Quests`);
  if (!root) return null;
  const tables = tablesWithHeadings(root)
    .map(({ h2, table }) => {
      const { headers, rows } = tableGrid(table);
      return { title: h2, headers: headers.map((h, i) => h || (i === 0 ? 'Name' : '')), rows };
    })
    .filter((t) => t.title && t.rows.length);
  return tables.length ? { tables, spoiler: isSpoilerPage(`${page}/Quests`), source: sourceUrl(`${page}/Quests`) } : null;
}

async function fetchVillagerDetails(villagers: { slug: string; source: string }[]): Promise<{
  schedules: Record<string, unknown>;
  quests: Record<string, unknown>;
}> {
  console.log('Schedules & quests…');
  const schedules: Record<string, unknown> = {};
  const quests: Record<string, unknown> = {};
  for (const v of villagers) {
    const page = decodeURIComponent(v.source.slice(WIKI.length)).replace(/_/g, ' ');
    const s = await fetchVillagerSchedule(page);
    const q = await fetchVillagerQuests(page);
    if (s) schedules[v.slug] = s;
    if (q) quests[v.slug] = q;
  }
  return { schedules, quests };
}

/**
 * Icon for every item named in a villager's gift lists. Reuses icons already downloaded for
 * fish/bugs/crops/forage/recipes and fetches the rest (gems, drinks, animal treats…) from Items.
 */
async function fetchGiftItemIcons(
  villagers: { gifts: Record<string, string[]> }[],
  datasets: { name: string; icon: string | null }[][],
): Promise<Record<string, string | null>> {
  console.log('Gift item icons…');
  const known = new Map<string, string>();
  for (const list of datasets) for (const item of list) if (item.icon && !known.has(item.name)) known.set(item.name, item.icon);

  const names = [...new Set(villagers.flatMap((v) => Object.values(v.gifts).flat()))].sort();
  const missing = names.filter((n) => !known.has(n));
  const itemIcons = new Map<string, string | null>();
  for (const r of await cargo({ tables: 'Items', fields: 'itemName=name,icon' })) {
    const name = clean(r.name);
    if (missing.includes(name) && !itemIcons.has(name)) itemIcons.set(name, iconFile(r.icon));
  }

  const out: Record<string, string | null> = {};
  for (const name of names) {
    out[name] = known.get(name) ?? (await downloadIcon(itemIcons.get(name) ?? null, `item-${slugify(name)}`));
  }
  return out;
}

function dedupe<T extends { slug: string; name: string }>(items: T[]): T[] {
  const seen = new Map<string, T>();
  for (const i of items) if (i.slug && !seen.has(i.slug)) seen.set(i.slug, i);
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}

async function main(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(ICON_DIR, { recursive: true });
  await fetchSpoilerPages();
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
  const { villagers, ...items } = datasets as unknown as {
    villagers: { gifts: Record<string, string[]> }[];
  } & Record<string, { name: string; icon: string | null }[]>;
  const giftIcons = await fetchGiftItemIcons(villagers, Object.values(items));
  await writeFile(path.join(DATA_DIR, 'itemIcons.json'), JSON.stringify(giftIcons, null, 2) + '\n');
  console.log(`  gift item icons: ${Object.values(giftIcons).filter(Boolean).length}/${Object.keys(giftIcons).length}`);

  const spoilerNames = [...spoilerPages].filter((t) => !t.includes('/')).sort();
  await writeFile(path.join(DATA_DIR, 'spoilers.json'), JSON.stringify(spoilerNames, null, 2) + '\n');
  console.log(`  spoiler pages: ${spoilerNames.length}`);
  const details = await fetchVillagerDetails(datasets.villagers as { slug: string; source: string }[]);
  for (const [name, data] of Object.entries(details)) {
    await writeFile(path.join(DATA_DIR, `${name}.json`), JSON.stringify(data, null, 2) + '\n');
    console.log(`  ${name}: ${Object.keys(data).length} villagers`);
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
