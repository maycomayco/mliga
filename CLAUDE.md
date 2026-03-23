# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
# Database
pnpm prisma migrate dev    # Apply migrations + run seed
pnpm prisma migrate reset  # Reset DB + seed
pnpm prisma studio         # Open DB browser
pnpm prisma db seed        # Run seed directly
```

## Architecture

**Next.js 16 App Router** with a single route group `app/(dashboard)/` that wraps all pages in a top-nav layout. All DB access is server-side (Server Components + Server Actions — no API routes).

- `app/(dashboard)/matches/actions.ts` — all match mutations (`createMatch`, `updateMatch`, `deleteMatch`) as Server Actions using `useActionState`
- `lib/prisma.ts` — singleton `PrismaClient` using `@prisma/adapter-pg` (the pg driver adapter, not the default query engine)
- `lib/schemas/match.ts` — Zod schemas for match form validation; also exports `calculateWinnerTeam`
- `components/Sidebar.tsx` — despite the filename, this is the top navigation bar (`TopNav`)
- `prisma/schema.prisma` — two models: `User` and `Match`. A match has 4 player relations (team1player1..team2player2), scores per set (set3 is nullable — only saved when sets are 1-1)

## Design System

Tailwind v4 (CSS-first, no `tailwind.config.ts`). All custom tokens are in `app/globals.css` under `@theme inline` using raw `oklch()` values — **do not use `var()` inside `@theme`**, Tailwind v4 cannot resolve them there.

Custom colors available as Tailwind utilities:
| Token | Purpose |
|---|---|
| `pitch` | Page background |
| `surface` / `surface-raised` / `surface-hover` | Card/panel backgrounds |
| `line` / `line-soft` | Borders |
| `chalk` / `chalk-secondary` / `chalk-muted` | Text hierarchy |
| `mint` / `mint-dimmed` | Primary accent (pastel green) |
| `rose` / `rose-dimmed` | Destructive / loss |
| `amber` | Warning |

## Git

Always ask for explicit permission before running `git commit` or `git push`.

## Key Conventions

- Match set 3 is only persisted when sets are tied 1-1 (`set3Needed()` in actions.ts); the form always shows set 3 inputs
- `winnerTeam` (1 or 2) is computed on save, not stored as a player ID
- Standings are computed at query time from raw set scores — no denormalized ranking table
- UI text is in Spanish (es-AR locale)
