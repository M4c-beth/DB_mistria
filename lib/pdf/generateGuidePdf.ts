import { jsPDF } from 'jspdf';
import { autoTable, type RowInput } from 'jspdf-autotable';
import {
  SEASONS,
  type Bug,
  type Crop,
  type Fish,
  type Forage,
  type Quests,
  type Schedule,
  type GiftTier,
  type Recipe,
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
  meta: { source: string; license: string; fetchedAt: string };
}

type RGB = [number, number, number];

// Print-friendly versions of the site palette (the `ink` shades).
const COLOR = {
  text: [41, 37, 36] as RGB,
  muted: [87, 83, 78] as RGB,
  wood: [107, 78, 61] as RGB,
  parchment: [255, 251, 235] as RGB,
  stripe: [250, 250, 249] as RGB,
  border: [214, 211, 209] as RGB,
};

const TIER: Record<GiftTier, { label: string; color: RGB }> = {
  love: { label: 'Loved', color: [63, 102, 48] },
  like: { label: 'Liked', color: [122, 85, 16] },
  neutral: { label: 'Neutral', color: [54, 96, 111] },
  dislike: { label: 'Disliked', color: [90, 64, 51] },
  hate: { label: 'Hated', color: [143, 52, 52] },
};

const MARGIN = 40;

/** The built-in PDF fonts only cover Latin-1; map common typography and drop anything else. */
function pdfSafe(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00d7/g, 'x')
    .replace(/[\u2000-\u200b\u202f]/g, ' ')
    .replace(/[^\u0000-\u00ff]/g, '');
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

/** Builds the guide PDF document (no I/O, so it can be tested outside the browser). */
export function buildGuidePdf(input: GuidePdfInput): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = MARGIN;

  const ensureSpace = (needed: number): void => {
    if (y + needed > pageHeight - MARGIN - 20) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const heading = (text: string, size: number, gap = 8): void => {
    ensureSpace(size + 40);
    doc.setFont('helvetica', 'bold').setFontSize(size).setTextColor(...COLOR.wood);
    doc.text(pdfSafe(text), MARGIN, y + size);
    y += size + gap;
  };

  const table = (head: string[], body: RowInput[], columnStyles: Record<number, { cellWidth?: number | 'auto'; halign?: 'right' }> = {}): void => {
    autoTable(doc, {
      startY: y,
      head: [head],
      body,
      margin: { left: MARGIN, right: MARGIN, bottom: MARGIN + 20 },
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 9, textColor: COLOR.text, lineColor: COLOR.border, lineWidth: 0.5, cellPadding: 4 },
      headStyles: { fillColor: COLOR.wood, textColor: COLOR.parchment, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: COLOR.stripe },
      columnStyles,
      didParseCell: (data) => {
        data.cell.text = data.cell.text.map(pdfSafe);
      },
    });
    y = finalY(doc) + 18;
  };

  // Title block
  doc.setFillColor(...COLOR.parchment).rect(0, 0, pageWidth, 90, 'F');
  doc.setFont('helvetica', 'bold').setFontSize(24).setTextColor(...COLOR.wood);
  doc.text(pdfSafe(input.title) || 'My Mistria Guide', MARGIN, 50);
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(...COLOR.muted);
  doc.text(`Fields of Mistria  -  made ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}`, MARGIN, 70);
  y = 120;

  if (input.villagers.length) {
    heading('Villagers', 18, 12);
    for (const v of input.villagers) {
      heading(v.name, 13, 4);
      const details = [v.birthday && `Birthday: ${v.birthday}`, v.occupation].filter(Boolean).join('   |   ');
      if (details) {
        doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...COLOR.muted);
        doc.text(details, MARGIN, y + 6);
        y += 14;
      }
      const rows: RowInput[] = input.giftTiers
        .filter((t) => v.gifts[t].length > 0)
        .map((t) => [
          { content: TIER[t].label, styles: { textColor: TIER[t].color, fontStyle: 'bold' } },
          v.gifts[t].join(', '),
        ]);
      if (rows.length) {
        table(['Reaction', 'Gifts'], rows, { 0: { cellWidth: 70 } });
      } else {
        doc.setFont('helvetica', 'italic').setFontSize(9).setTextColor(...COLOR.muted);
        doc.text('No gift data listed for the selected reactions.', MARGIN, y + 6);
        y += 22;
      }

      const schedule = input.schedules[v.slug];
      if (schedule) {
        for (const s of schedule.sections) {
          heading(`${v.name}'s schedule: ${s.title}`, 11, 4);
          table(
            ['Day', 'Leaves at', 'Goes to'],
            s.days.flatMap((d) =>
              d.stops.map((stop, i) => [i === 0 ? (d.condition ? `${d.day}
${d.condition}` : d.day) : '', stop.time, stop.place]),
            ),
            { 0: { cellWidth: 120 }, 1: { cellWidth: 90 } },
          );
        }
      }

      const quests = input.quests[v.slug];
      if (quests) {
        for (const t of quests.tables) {
          heading(`${v.name}: ${t.title}`, 11, 4);
          table(t.headers, t.rows, { 0: { cellWidth: 90 } });
        }
      }
    }
  }

  const section = <T extends { seasons: Season[] }>(
    title: string,
    items: T[],
    head: string[],
    toRow: (item: T) => RowInput,
    columnStyles?: Record<number, { cellWidth?: number | 'auto'; halign?: 'right' }>,
  ): void => {
    if (!items.length) return;
    heading(title, 18, 12);
    if (!input.groupBySeason) {
      table(head, items.map(toRow), columnStyles);
      return;
    }
    for (const s of SEASONS) {
      const inSeason = items.filter((i) => i.seasons.includes(s));
      if (!inSeason.length) continue;
      heading(s, 12, 4);
      table(head, inSeason.map(toRow), columnStyles);
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
  if (input.recipes.length) {
    heading('Recipes', 18, 12);
    table(
      ['Name', 'Type', 'Ingredients', 'Sell'],
      input.recipes.map((r) => [
        r.name,
        r.type,
        r.ingredients.map((i) => `${i.name} x${i.amount}`).join(', '),
        gold(r.sellValue),
      ]),
      { 0: { cellWidth: 110 }, 1: { cellWidth: 70 }, 3: { halign: 'right' } },
    );
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
