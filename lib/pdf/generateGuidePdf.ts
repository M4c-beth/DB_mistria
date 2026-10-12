import { jsPDF } from 'jspdf';
import { autoTable, type CellHookData, type CellInput, type RowInput } from 'jspdf-autotable';
import { spoilerPlainText } from '@/lib/spoiler';
import {
  SEASONS,
  type Bug,
  type Crop,
  type Fish,
  type Forage,
  type GiftTier,
  type MuseumSet,
  type Quests,
  type Recipe,
  type Schedule,
  type Season,
  type Villager,
} from '@/lib/data/schemas';

export interface GuidePdfInput {
  title: string;
  giftTiers: GiftTier[];
  groupBySeason: boolean;
  /** Keyed by villager slug; empty when the option is off. */
  schedules: Record<string, Schedule>;
  quests: Record<string, Quests>;
  villagers: Villager[];
  fish: Fish[];
  bugs: Bug[];
  crops: Crop[];
  forage: Forage[];
  recipes: Recipe[];
  museumSets: MuseumSet[];
  /** Item name -> icon path, for gift and museum items. */
  itemIcons: Record<string, string | null>;
  /** Icon path -> PNG data URL. Icons missing here are simply not drawn. */
  images: Record<string, string>;
  /** Leave out spoiler-flagged entries and blank out inline spoilers. */
  hideSpoilers: boolean;
  /** Names of items/characters whose wiki pages are marked as spoilers. */
  spoilerNames: string[];
  meta: { source: string; license: string; fetchedAt: string };
}

type RGB = [number, number, number];
type ColumnStyles = Record<number, { cellWidth?: number | 'auto'; halign?: 'right' | 'center' }>;

// Print-friendly versions of the site palette (the `ink` shades).
const COLOR = {
  text: [41, 37, 36] as RGB,
  muted: [87, 83, 78] as RGB,
  wood: [107, 78, 61] as RGB,
  parchment: [255, 251, 235] as RGB,
  stripe: [250, 250, 249] as RGB,
  border: [214, 211, 209] as RGB,
};

const TIER: Record<GiftTier, { label: string; color: RGB; tint: RGB }> = {
  love: { label: 'Loved', color: [63, 102, 48], tint: [239, 243, 236] },
  like: { label: 'Liked', color: [122, 85, 16], tint: [250, 245, 235] },
  neutral: { label: 'Neutral', color: [54, 96, 111], tint: [239, 244, 245] },
  dislike: { label: 'Disliked', color: [90, 64, 51], tint: [240, 237, 236] },
  hate: { label: 'Hated', color: [143, 52, 52], tint: [246, 236, 236] },
};

const MARGIN = 40;
const TABLE_ICON = 14;
const CHIP_ICON = 11;

/** The built-in PDF fonts only cover Latin-1; map common typography and drop anything else. */
function pdfSafe(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/×/g, 'x')
    .replace(/[ -​ ]/g, ' ')
    .replace(/[^\u0000-ÿ]/g, '');
}

function finalY(doc: jsPDF): number {
  const last = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable;
  return last?.finalY ?? MARGIN;
}

function seasonsText(seasons: Season[]): string {
  return seasons.length === SEASONS.length ? 'All' : seasons.join(', ');
}

function gold(n: number | null): string {
  return n === null ? '-' : `${n}g`;
}

interface TableOptions {
  columnStyles?: ColumnStyles;
  /** Image path per body row, drawn at the left of `iconColumn`. */
  icons?: (string | null | undefined)[];
  iconColumn?: number;
  /** Draws an empty tick box in this column (museum checklist). */
  checkboxColumn?: number;
}

/** Builds the guide PDF document (no I/O, so it can be tested outside the browser). */
export function buildGuidePdf(input: GuidePdfInput): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottom = pageHeight - MARGIN - 20;
  let y = MARGIN;

  const hide = input.hideSpoilers;
  const spoilerSet = new Set(input.spoilerNames);
  const keep = <T extends { spoiler: boolean }>(items: T[]): T[] => (hide ? items.filter((i) => !i.spoiler) : items);
  /** Strips spoiler markers, replacing spoiler text when hiding. */
  const txt = (text: string): string => spoilerPlainText(text, hide ? '[spoiler]' : undefined);
  const itemName = (name: string): string => (hide && spoilerSet.has(name) ? '[spoiler]' : name);
  const cell = (c: CellInput): CellInput =>
    typeof c === 'string'
      ? txt(c)
      : c && typeof c === 'object' && 'content' in c && typeof c.content === 'string'
        ? { ...c, content: txt(c.content) }
        : c;

  /** Draws an icon scaled to fit a size x size box, keeping its aspect ratio. */
  const sizes = new Map<string, { w: number; h: number }>();
  const drawIcon = (path: string | null | undefined, x: number, top: number, size: number): boolean => {
    const data = path ? input.images[path] : undefined;
    if (!path || !data) return false;
    let dims = sizes.get(path);
    if (!dims) {
      const p = doc.getImageProperties(data);
      dims = { w: p.width, h: p.height };
      sizes.set(path, dims);
    }
    const scale = size / Math.max(dims.w, dims.h);
    const w = dims.w * scale;
    const h = dims.h * scale;
    // The alias makes jsPDF embed each icon once however often it is drawn.
    doc.addImage(data, 'PNG', x + (size - w) / 2, top + (size - h) / 2, w, h, path, 'FAST');
    return true;
  };

  const ensureSpace = (needed: number): void => {
    if (y + needed > bottom) {
      doc.addPage();
      y = MARGIN;
    }
  };

  /** `tableRows` keeps the heading on the same page as the first rows of the table under it. */
  const heading = (text: string, size: number, gap = 8, icon?: string | null, tableRows = 0): void => {
    ensureSpace(size + 40 + Math.min(tableRows, 3) * 26);
    const iconSize = size * 2;
    const hasIcon = drawIcon(icon, MARGIN, y - 2, iconSize);
    doc.setFont('helvetica', 'bold').setFontSize(size).setTextColor(...COLOR.wood);
    doc.text(pdfSafe(txt(text)), MARGIN + (hasIcon ? iconSize + 6 : 0), y + size);
    y += size + gap;
  };

  const table = (head: string[], body: RowInput[], opts: TableOptions = {}): void => {
    const { icons, iconColumn = 0, checkboxColumn } = opts;
    const pad = 4;
    const columnStyles: Record<number, object> = { ...opts.columnStyles };
    if (icons) {
      columnStyles[iconColumn] = {
        ...columnStyles[iconColumn],
        cellPadding: { top: pad, right: pad, bottom: pad, left: pad + TABLE_ICON + 4 },
      };
    }
    autoTable(doc, {
      startY: y,
      head: [head],
      body: body.map((row) => (Array.isArray(row) ? row.map(cell) : row)),
      margin: { left: MARGIN, right: MARGIN, bottom: MARGIN + 20 },
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 9, textColor: COLOR.text, lineColor: COLOR.border, lineWidth: 0.5, cellPadding: pad },
      bodyStyles: icons ? { minCellHeight: TABLE_ICON + pad * 2 } : {},
      headStyles: { fillColor: COLOR.wood, textColor: COLOR.parchment, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: COLOR.stripe },
      columnStyles,
      didParseCell: (data) => {
        data.cell.text = data.cell.text.map(pdfSafe);
      },
      didDrawCell: (data: CellHookData) => {
        if (data.section !== 'body') return;
        if (icons && data.column.index === iconColumn) {
          drawIcon(icons[data.row.index], data.cell.x + pad, data.cell.y + pad, TABLE_ICON);
        }
        if (data.column.index === checkboxColumn) {
          const box = 9;
          doc.setDrawColor(...COLOR.wood).setLineWidth(0.8);
          doc.rect(data.cell.x + (data.cell.width - box) / 2, data.cell.y + (data.cell.height - box) / 2, box, box);
        }
      },
    });
    y = finalY(doc) + 18;
  };

  /** One gift reaction as a label followed by wrapping icon + name chips. */
  const giftChips = (tier: GiftTier, names: string[]): void => {
    const { label, color, tint } = TIER[tier];
    const chipH = 16;
    const padX = 4;
    ensureSpace(chipH * 2 + 16);
    doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(...color);
    doc.text(label, MARGIN, y + 9);
    y += 14;
    let x = MARGIN;
    doc.setFont('helvetica', 'normal').setFontSize(8.5);
    for (const name of names) {
      const icon = input.itemIcons[name];
      const showIcon = Boolean(icon && input.images[icon]);
      const text = pdfSafe(name);
      const width = padX * 2 + doc.getTextWidth(text) + (showIcon ? CHIP_ICON + 3 : 0);
      if (x + width > pageWidth - MARGIN) {
        x = MARGIN;
        y += chipH + 3;
      }
      if (y + chipH > bottom) {
        doc.addPage();
        y = MARGIN;
        x = MARGIN;
        doc.setFont('helvetica', 'normal').setFontSize(8.5);
      }
      doc.setFillColor(...tint).setDrawColor(...COLOR.border).setLineWidth(0.5);
      doc.roundedRect(x, y, width, chipH, 3, 3, 'FD');
      if (showIcon) drawIcon(icon, x + padX, y + (chipH - CHIP_ICON) / 2, CHIP_ICON);
      doc.setTextColor(...COLOR.text);
      doc.text(text, x + padX + (showIcon ? CHIP_ICON + 3 : 0), y + 11);
      x += width + 4;
    }
    y += chipH + 10;
  };

  // Title block
  doc.setFillColor(...COLOR.parchment).rect(0, 0, pageWidth, 90, 'F');
  doc.setFont('helvetica', 'bold').setFontSize(24).setTextColor(...COLOR.wood);
  doc.text(pdfSafe(input.title) || 'My Mistria Guide', MARGIN, 50);
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(...COLOR.muted);
  doc.text(`Fields of Mistria  -  made ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}`, MARGIN, 70);
  y = 120;

  const villagers = keep(input.villagers);
  if (villagers.length) {
    heading('Villagers', 18, 12);
    for (const v of villagers) {
      ensureSpace(80);
      heading(v.name, 13, 4, v.portrait);
      const details = [v.birthday && `Birthday: ${v.birthday}`, v.occupation].filter(Boolean).join('   |   ');
      if (details) {
        doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...COLOR.muted);
        doc.text(pdfSafe(txt(details)), MARGIN + (v.portrait && input.images[v.portrait] ? 32 : 0), y + 6);
        y += 14;
      }
      y += 8;
      const gifts = (t: GiftTier): string[] => (hide ? v.gifts[t].filter((g) => !spoilerSet.has(g)) : v.gifts[t]);
      const tiers = input.giftTiers.filter((t) => gifts(t).length > 0);
      if (tiers.length) {
        for (const t of tiers) giftChips(t, gifts(t));
        y += 6;
      } else {
        doc.setFont('helvetica', 'italic').setFontSize(9).setTextColor(...COLOR.muted);
        doc.text('No gift data listed for the selected reactions.', MARGIN, y + 6);
        y += 22;
      }

      const schedule = input.schedules[v.slug];
      if (schedule && !(hide && schedule.spoiler)) {
        for (const s of schedule.sections) {
          heading(`${v.name}'s schedule: ${s.title}`, 11, 4, null, s.days.length);
          table(
            ['Day', 'Leaves at', 'Goes to'],
            s.days.flatMap((d) =>
              d.stops.map((stop, i) => [i === 0 ? (d.condition ? `${d.day}\n${d.condition}` : d.day) : '', stop.time, stop.place]),
            ),
            { columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 90 } } },
          );
        }
      }

      const quests = input.quests[v.slug];
      if (quests && !(hide && quests.spoiler)) {
        for (const t of quests.tables) {
          heading(`${v.name}: ${t.title}`, 11, 4, null, t.rows.length);
          table(t.headers, t.rows, { columnStyles: { 0: { cellWidth: 90 } } });
        }
      }
    }
  }

  const section = <T extends { seasons: Season[]; spoiler: boolean; icon: string | null }>(
    title: string,
    items: T[],
    head: string[],
    toRow: (item: T) => RowInput,
    columnStyles?: ColumnStyles,
  ): void => {
    items = keep(items);
    if (!items.length) return;
    heading(title, 18, 12, null, input.groupBySeason ? 0 : items.length);
    const draw = (list: T[]): void =>
      table(head, list.map(toRow), { columnStyles, icons: list.map((i) => i.icon) });
    if (!input.groupBySeason) {
      draw(items);
      return;
    }
    for (const s of SEASONS) {
      const inSeason = items.filter((i) => i.seasons.includes(s));
      if (!inSeason.length) continue;
      heading(s, 12, 4, null, inSeason.length);
      draw(inSeason);
    }
  };

  section(
    'Fish',
    input.fish,
    ['Name', 'Seasons', 'Location', 'Weather', 'Sell'],
    (f) => [f.name, seasonsText(f.seasons), f.locations.join(', '), f.weather.join(', '), gold(f.sellValue)],
    { 4: { halign: 'right' } },
  );
  section(
    'Bugs',
    input.bugs,
    ['Name', 'Seasons', 'Location', 'Time', 'Sell'],
    (b) => [b.name, seasonsText(b.seasons), b.locations.join(', '), b.time ?? '-', gold(b.sellValue)],
    { 4: { halign: 'right' } },
  );
  section(
    'Crops',
    input.crops,
    ['Name', 'Seasons', 'Grows (days)', 'Regrows (days)', 'Sell'],
    (c) => [c.name, seasonsText(c.seasons), c.growthDays?.toString() ?? '-', c.regrowDays?.toString() ?? 'No', gold(c.sellValue)],
    { 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
  );
  section(
    'Forageables',
    input.forage,
    ['Name', 'Seasons', 'Location', 'Sell'],
    (f) => [f.name, seasonsText(f.seasons), f.locations.join(', ') || f.sources.join(', '), gold(f.sellValue)],
    { 3: { halign: 'right' } },
  );

  // Recipes aren't seasonal, so they're one table regardless of grouping.
  const recipes = keep(input.recipes);
  if (recipes.length) {
    heading('Recipes', 18, 12, null, recipes.length);
    table(
      ['Name', 'Type', 'Ingredients', 'Sell'],
      recipes.map((r) => [
        r.name,
        r.type,
        r.ingredients.map((i) => `${itemName(i.name)} x${i.amount}`).join(', '),
        gold(r.sellValue),
      ]),
      { columnStyles: { 0: { cellWidth: 130 }, 1: { cellWidth: 70 }, 3: { halign: 'right' } }, icons: recipes.map((r) => r.icon) },
    );
  }

  // Museum: one checklist per donation set.
  if (input.museumSets.length) {
    heading('Museum checklist', 18, 12);
    for (const set of input.museumSets) {
      heading(`${set.wing}: ${set.name}`, 11, 4, null, set.items.length);
      table(
        ['', 'Item', 'Where to find', 'Rarity'],
        set.items.map((i) => [
          '',
          hide && i.spoiler ? '[spoiler]' : i.name,
          i.location?.split('\n').join(', ') ?? '-',
          i.rarity ?? '-',
        ]),
        {
          columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 150 }, 3: { cellWidth: 70 } },
          checkboxColumn: 0,
          iconColumn: 1,
          icons: set.items.map((i) => (hide && i.spoiler ? null : input.itemIcons[i.name])),
        },
      );
    }
  }

  // Footer with attribution (CC BY-SA) and page numbers on every page.
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...COLOR.muted);
    doc.text(
      `Data: Fields of Mistria Wiki (${input.meta.license}), ${input.meta.source}, updated ${input.meta.fetchedAt}. Unofficial fan guide.`,
      MARGIN,
      pageHeight - 20,
    );
    doc.text(`${p} / ${pages}`, pageWidth - MARGIN, pageHeight - 20, { align: 'right' });
  }

  return doc;
}

/** Builds the guide PDF entirely client-side and triggers a download. */
export function generateGuidePdf(input: GuidePdfInput): void {
  buildGuidePdf(input).save(`${safeFileName(input.title)}.pdf`);
}

function safeFileName(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  return base || 'mistria-guide';
}
