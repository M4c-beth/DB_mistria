# Command: Add New Item to Database

## Task
I need to add a new item to the Fields of Mistria database. 

## Instructions
1. Ask me for the item's name, category (Crop, Fish, Forage, Mineral, etc.), and any specific stats (sell price, growth time, location).
2. Generate the Prisma schema update (if a new category/type is needed) OR the TypeScript seed data / JSON entry.
3. Create the Next.js Server Component page for this item (`app/items/[slug]/page.tsx`).
4. Include a "Used In" section on the item page (e.g., "Used in recipes", "Liked by [Villager]", "Found in [Location]").
5. Ensure all images use `next/image` and include fallback placeholders if the official asset isn't available yet.