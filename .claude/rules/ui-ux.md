# UI/UX Design System & Guidelines

## Core Philosophy
The UI must balance **cozy, rustic charm** (fitting the *Fields of Mistria* farming sim aesthetic) with **high-density data readability** (fitting a wiki/database). It should feel like a modern, polished grimoire or a well-organized farmer's almanac. Avoid harsh, sterile "corporate" web design; lean into warmth, but keep it clean and accessible.

---

## 1. Design Tokens (Tailwind CSS Configuration)

When generating Tailwind classes, prioritize these custom design tokens. Add these to `tailwind.config.ts` if not already present.

### Color Palette
Avoid pure `#000000` black or `#FFFFFF` white. Use off-whites and deep earthy tones.
- **Backgrounds:** `bg-stone-50` (parchment), `bg-amber-50` (warm cream), `bg-stone-100` (cards).
- **Text:** `text-stone-800` (primary), `text-stone-600` (secondary), `text-stone-400` (muted).
- **Accents (Nature-inspired):**
  - `mistria-green` (Sprout/Crop): `#5C8A47` (Use for primary buttons, success states, "Loved" gifts).
  - `harvest-gold` (Sun/Wheat): `#D4A03A` (Use for highlights, "Liked" gifts, warnings).
  - `mistria-blue` (Water/Sky): `#5B8C9E` (Use for links, "Neutral" gifts, info states).
  - `wood-brown` (Earth/Trunk): `#6B4E3D` (Use for borders, dark text, "Disliked" gifts).
  - `berry-red` (Forage/Alerts): `#A84242` (Use for "Hated" gifts, destructive actions).

### Typography
- **Headings:** A clean, slightly rounded sans-serif (e.g., `font-family: 'Nunito', 'Quicksand', or system-ui`) to feel friendly but readable. Use `font-bold` or `font-extrabold`.
- **Body & Data:** A highly legible sans-serif (e.g., `Inter` or `system-ui`). Data tables must use `font-mono` or `tabular-nums` for aligned numbers (prices, days).

### Borders & Shadows
- **Borders:** Use soft, earthy borders. `border-stone-300` or `border-amber-200`. Avoid harsh `border-gray-800`.
- **Shadows:** Soft, diffused shadows to create a "lifted paper" or "wooden block" feel. `shadow-md shadow-stone-200/50`. Avoid sharp, dark drop shadows.
- **Corners:** Slightly rounded. `rounded-md` (4px) for inputs, `rounded-lg` (8px) for cards, `rounded-xl` (12px) for modals. Avoid perfectly sharp (`rounded-none`) or overly bubbly (`rounded-full` unless for avatars) corners.

---

## 2. Component Patterns

### Data Tables (Crucial for Database)
Farming sim databases rely heavily on tables (crop yields, fish locations, gift lists).
- **Styling:** Use subtle zebra striping (`odd:bg-stone-50 even:bg-transparent`).
- **Headers:** Sticky headers (`sticky top-0 bg-stone-100 z-10`) with a bottom border (`border-b-2 border-wood-brown`).
- **Mobile:** Wrap tables in a horizontally scrollable container (`overflow-x-auto`) with a fade-out gradient on the edges to indicate more content. Never stack table rows into cards on mobile unless specifically requested; horizontal scroll is preferred for data integrity.

### Gift Preference Badges
When displaying villager gift preferences, use distinct, color-coded pill badges:
- **Loved:** `bg-mistria-green/10 text-mistria-green border-mistria-green/20` (Add a small heart/leaf icon).
- **Liked:** `bg-harvest-gold/10 text-harvest-gold border-harvest-gold/20`
- **Neutral:** `bg-mistria-blue/10 text-mistria-blue border-mistria-blue/20`
- **Disliked:** `bg-wood-brown/10 text-wood-brown border-wood-brown/20`
- **Hated:** `bg-berry-red/10 text-berry-red border-berry-red/20`

### Item Cards & Grids
- **Image Containers:** Game assets often have transparent backgrounds. Give image containers a subtle checkered pattern or a soft `bg-stone-200` background so transparent PNGs don't look broken.
- **Hover States:** Cards should have a gentle lift on hover: `hover:-translate-y-1 hover:shadow-lg transition-all duration-200`.

---

## 3. Layout & Navigation

### Global Layout
- **Sidebar vs. Topbar:** Use a collapsible left sidebar for main navigation (Dashboard, Items, Villagers, Crops, Fishing, Mining) on desktop. On mobile, collapse this into a bottom navigation bar or a hamburger menu.
- **Breadcrumbs:** Always include breadcrumbs on deep pages (e.g., `Home > Items > Crops > Parsnip`) to help users navigate the database hierarchy.

### Page Structures
- **List/Index Pages (e.g., "All Crops"):** 
  - Top: Large search bar + Filter pills (Season, Price, Growth Time).
  - Middle: Data table or Grid of cards.
  - Bottom: Pagination or "Load More".
- **Detail Pages (e.g., "Parsnip" or "Ariadne"):**
  - Top: Hero section with large image, name, and key stats.
  - Middle: Tabbed interface or distinct sections (e.g., "Overview", "Gift Preferences", "Used In Recipes", "Locations").
  - Sidebar (Desktop): Quick stats, related links, or a mini-map.

---

## 4. UX Principles for Databases

### Search & Filtering
- **Instant Feedback:** Search should filter instantly (client-side) or with minimal debounce (server-side). 
- **Empty States:** Never show a blank screen. If a search yields no results, show a cozy illustration (e.g., a sleeping pet or an empty basket) with helpful text: *"No crops found for Winter. Try changing your filters!"*

### Loading States
- Use Skeleton loaders (`animate-pulse bg-stone-200 rounded`) that match the exact layout of the incoming data. Do not use spinning loaders for page content.

### Tooltips & Hover Info
- Farming sims have a lot of hidden stats. Use tooltips for complex mechanics.
- Example: Hovering over a "Growth Time: 4 days" should show a tooltip: *"Regrows every 2 days after initial harvest."*
- Use a library like `@radix-ui/react-tooltip` styled with the wood-brown/parchment theme.

### Mobile Responsiveness
- **Touch Targets:** Ensure all buttons and filter pills are at least `h-10` (40px) tall for easy tapping.
- **Data Density:** On mobile, hide secondary table columns behind an "expand" chevron or move them to the detail page. Do not force the user to pinch-and-zoom to read a table.

---

## 5. Accessibility (a11y)
- **Contrast:** Ensure all text meets WCAG AA standards. The earthy tones must be dark enough against the parchment backgrounds.
- **Focus States:** Custom focus rings for keyboard navigation. Use `focus-visible:ring-2 focus-visible:ring-mistria-blue focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50`.
- **Icons:** Always pair icons with text labels or `aria-label` attributes. Never use an icon alone without context (e.g., a "trash" icon needs `aria-label="Delete item"`).