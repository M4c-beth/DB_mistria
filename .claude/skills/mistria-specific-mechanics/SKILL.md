---
name: mistria-specific-mechanics
description: Fields of Mistria game mechanics the site must support — weather, animal husbandry, mining/forage node respawns, cooking/crafting recipe trees — plus key villagers and common user lookups. Use when building features, pages, search, or filters for game content.
---

# Skill: Fields of Mistria Specific Mechanics

When building features for Fields of Mistria, keep these game-specific mechanics in mind:

## Key Villagers
The canonical villager list comes from `data/villagers.json` (pulled from the wiki), e.g. Adeline, Balor, Celine, Eiland, Hayden, Juniper, March, Ryis, Valen. Never hardcode or guess names. (Ensure the UI supports filtering by specific villagers.)

## Unique Mechanics to Support in DB
1. **Weather System:** Mistria has specific weather types (Sunny, Rain, Snow, Storm). Crops and forageables are tied to these.
2. **Animal Husbandry:** Pets and livestock have affection levels and specific feeding requirements.
3. **Mining & Foraging:** Nodes have respawn timers and are location-specific (e.g., specific caves or forest areas).
4. **Cooking/Crafting:** Recipes require specific ingredients and unlock at certain cooking/crafting levels. Include a "Recipe Tree" or "Ingredient Calculator" logic in the UI.

## UI/UX Expectations
- Users will frequently look up: "What does [Villager] love?", "What can I plant in [Season]?", "How do I craft [Item]?".
- Ensure search and filtering are lightning-fast and accessible from the navbar.