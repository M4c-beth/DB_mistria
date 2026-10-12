# Project Context: Fields of Mistria Database

## Overview
This project is a comprehensive community database and wiki website for the game "Fields of Mistria". It tracks items, crops, villagers, relationships, quests, locations, and game mechanics.

## Core Directives
1. **Data Accuracy is Paramount:** Never hallucinate or invent game data (item stats, villager names, gift preferences). If data is missing, use placeholder values or prompt the user to provide the exact data from the game/wiki.
2. **Early Access State:** The game is in Early Access. Structure the database and UI to easily handle data updates, new seasons, and new villagers without breaking existing schemas.
3. **Performance:** The site will have many pages (one for every item, villager, etc.). Prioritize Static Site Generation (SSG) or Incremental Static Regeneration (ISR) where possible.
4. **Theme:** The UI should feel cozy, rustic, and organized, reflecting the farming/life sim genre, while remaining highly readable and data-dense.