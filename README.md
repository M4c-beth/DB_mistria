# Mistria Almanac 🌾

An unofficial fan database for **[Fields of Mistria](https://store.steampowered.com/app/2142790/Fields_of_Mistria/)**. Look up what every villager loves, what you can catch or grow each season, and build your own printable PDF guide.

**👉 Use the site: [m4c-beth.github.io/DB_mistria](https://m4c-beth.github.io/DB_mistria/)**

## What's inside

- **Villagers:** birthdays, full gift guides (loved, liked, neutral, disliked, hated) with item icons, schedules and quests.
- **Fish, bugs, crops and forageables:** seasons, locations, weather, growth times and sell prices, with search and filters.
- **Season pages:** everything you can catch, plant or gather in a season, plus that season's birthdays.
- **Recipes:** cooking, milling, refinery and blacksmithing, with ingredient trees and "used in" links.
- **Museum:** all four wings and every donation set, with where to find each item.
- **My Guide (PDF):** add anything to your guide, give it a title, and download a PDF with pictures. Museum sets print as tick-box checklists. The PDF is made in your browser and nothing is uploaded.
- **Spoiler filter:** content the wiki marks as a spoiler is hidden by default. Turn it off with the **Hide spoilers** switch in the menu.

Your guide and settings are saved only in your own browser.

## Where the data comes from

All game data comes from the community-run **[Fields of Mistria Wiki](https://fieldsofmistria.wiki.gg)**, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Every entry links back to its wiki page.

Spotted something wrong or out of date? The wiki is the source of truth, so please fix it there. The site picks up the change on its next data refresh.

## Running it locally

You'll need **Node.js 24** or newer.

```bash
npm install
npm run dev          # http://localhost:3000
```

Other commands:

| Command | What it does |
| --- | --- |
| `npm run build` | Builds the static site into `out/` |
| `npm run typecheck` | Checks types |
| `npm run fetch-data` | Pulls fresh data and icons from the wiki into `data/` and `public/icons/` |

To refresh the data after a game update, run `npm run fetch-data`, check the changes in `data/`, and commit them.

## How it's built

- **[Next.js](https://nextjs.org/)** (App Router) exported as a fully static site, with **TypeScript**, **Tailwind CSS** and **Zustand**.
- There's no server or database. Game data lives as JSON in `data/` and is checked with **Zod** at build time, so bad data fails the build instead of reaching the site.
- PDFs are generated in the browser with **jsPDF**.
- Every push to `main` builds and deploys to **GitHub Pages** through GitHub Actions (`.github/workflows/deploy.yml`).

```
app/          pages (one folder per section)
components/   UI components
lib/data/     data loading and Zod schemas
lib/pdf/      PDF guide generation
scripts/      wiki data fetcher
data/         game data (generated, don't hand-edit)
public/icons/ item and villager icons (generated)
```

## Contributing

Issues and pull requests are welcome. For wrong game data, please fix it on the [wiki](https://fieldsofmistria.wiki.gg) rather than editing `data/` by hand, because the next fetch overwrites it.

## Disclaimer

This is an unofficial fan project and isn't affiliated with or endorsed by NPC Studio. *Fields of Mistria* and its characters, artwork and icons are © NPC Studio. Game text and data are from the Fields of Mistria Wiki (CC BY-SA 4.0).
