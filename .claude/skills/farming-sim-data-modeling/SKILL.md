---
name: farming-sim-data-modeling
description: Standard patterns for farming-sim database schemas and TypeScript types — polymorphic Items (crop/fish/etc.), villager gift-preference matrix with category overrides, and season/time enums. Use when designing or changing the Prisma schema, seed data, or data interfaces.
---

# Skill: Farming Sim Data Modeling

When designing database schemas or TypeScript interfaces for a farming sim, use the following standardized patterns:

## 1. The "Item" Polymorphism
Items share base traits but have specific traits based on category.
- **Base Item:** `id`, `name`, `description`, `iconUrl`, `sellPrice`, `buyPrice`, `category` (Crop, Forage, Mineral, Fish, Artifact, Gift, Material).
- **Crop Specific:** `seasons` (array), `growthDays`, `regrows` (boolean), `seedId`.
- **Fish Specific:** `location` (river, lake, ocean), `weatherRequirement`, `timeOfDay`.

## 2. The "Villager" Relationship Matrix
Villagers need a robust gift preference system. Do not use simple arrays. Use a relational model or a structured JSON object:
- **Villager:** `id`, `name`, `portraitUrl`, `birthday`, `location`, `schedule`.
- **Gift Preferences:** Map to specific items or categories.
  - `loved` (multiplier)
  - `liked` (multiplier)
  - `neutral` (base)
  - `disliked` (multiplier)
  - `hated` (multiplier)
  - *Note:* Universal gifts (e.g., "Loves all flowers except Poppy") should be handled via category overrides.

## 3. Time and Seasons
- Always track time using a standardized enum: `SPRING`, `SUMMER`, `AUTUMN`, `WINTER`.
- Include a `year` and `day` integer for quest/event tracking.