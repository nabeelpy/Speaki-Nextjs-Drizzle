# Migration Task: MySQL to PostgreSQL with Drizzle ORM

## Overview
We have migrated our database to PostgreSQL and are now using Drizzle ORM.

## Requirements
1. Remove all MySQL / Prisma / mysql2 usage.
2. Replace all database access with Drizzle ORM using the existing `src/db/index.ts` connection.
3. Use tables defined in `src/db/schema.ts`.
4. Convert raw SQL queries into Drizzle query builder syntax.
5. Preserve existing API routes, validation, and response structure.
6. Ensure all DB usage runs only on the server (no client components).
7. Do not change business logic — only replace the database layer.
8. Use async/await and proper typing.
9. Do not introduce migrations or schema changes.

## Key Files
- `src/db/index.ts` — Drizzle connection
- `src/db/schema.ts` — Database tables