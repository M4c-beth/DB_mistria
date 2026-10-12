# Command: Generate / Update Database Schema

## Task
We are adding a new game mechanic or expanding an existing one.

## Instructions
1. Ask me what new mechanic we are adding (e.g., "Fishing mini-game", "Crop crossbreeding", "New cave levels").
2. Design the Prisma schema (`schema.prisma`) to support this. 
3. Ensure proper relations (e.g., Many-to-Many for Villagers and Gifts, One-to-Many for Crops and Seasons).
4. Generate the TypeScript types based on the Prisma schema.
5. Write a brief explanation of the schema design and any potential performance considerations (like indexing).