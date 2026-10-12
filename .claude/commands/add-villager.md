# Command: Add New Villager Profile

## Task
I need to add a new villager to the database.

## Instructions
1. Ask me for the villager's name, birthday, and basic lore/description.
2. Prompt me for their gift preferences (Loved, Liked, Disliked, Hated). If I provide a category (e.g., "Loves all fruits"), translate that into the database logic.
3. Generate the database seed file for the villager.
4. Create the Villager Profile Page (`app/villagers/[name]/page.tsx`).
5. The profile page MUST include:
   - A gift guide table (categorized by Loved/Liked/Neutral/Disliked/Hated).
   - A schedule/location tracker (if applicable).
   - A list of quests associated with this villager.