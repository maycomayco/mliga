# CLAUDE.md

@AGENTS.md

## Commands

Always use `pnpm`, never `yarn` or `npm`.

```bash
docker compose up -d        # start PostgreSQL (required before dev)
pnpm prisma migrate dev     # apply migrations + seed
pnpm prisma migrate reset   # reset DB + seed
pnpm prisma studio          # DB browser
pnpm prisma db seed         # seed only
```

## Architecture

**Next.js App Router** — `app/(dashboard)/` wraps all pages in a top-nav layout. DB access is server-side (Server Components + Server Actions). Auth routes at `app/api/auth/[...all]/`.

- `app/(dashboard)/matches/actions.ts` — match mutations (`createMatch`, `updateMatch`, `deleteMatch`) as Server Actions; all require `ADMIN` role
- `lib/prisma.ts` — singleton `PrismaClient` via `@prisma/adapter-pg`; client generated to `prisma/generated/`
- `lib/queries/` — all DB reads (`getMatches`, `getMatch`, `getPlayers`, `getStandings`, `getAttendance`, `getUsers`); pages never call `prisma` directly
- `lib/schemas/match.ts` — Zod schemas for match forms; exports `calculateWinnerTeam`
- `lib/auth.ts` — Better Auth config (email+password, username plugin, rate limiting, session hooks)
- `lib/auth-client.ts` — Better Auth browser client
- `lib/security/audit.ts` — `logSecurityEvent()` used in actions and auth hooks
- `components/Sidebar.tsx` — despite the name, this is the top nav (`TopNav`)
- `prisma/schema.prisma` — models: `User`, `Match`, `Session`, `Account`, `AuditLog`, `Verification`, `RateLimit`

**Auth:** Better Auth with `username` plugin. Sign-up is disabled (`disableSignUp: true`). Only `ADMIN` users can mutate matches. Rate limited to 3 login attempts per 5 min.

## Design System

Tailwind v4 (CSS-first, no `tailwind.config.ts`). Tokens in `app/globals.css` under `@theme inline` using raw `oklch()` — **never use `var()` inside `@theme`**.

| Token | Purpose |
|---|---|
| `pitch` | Page background |
| `surface` / `surface-raised` / `surface-hover` | Card backgrounds |
| `line` / `line-soft` | Borders |
| `chalk` / `chalk-secondary` / `chalk-muted` | Text hierarchy |
| `mint` / `mint-dimmed` | Primary accent |
| `rose` / `rose-dimmed` | Destructive / loss |
| `amber` | Warning |

## Git

Never run `git commit` or `git push` unless explicitly requested.

## Key Conventions

- **Reads** → `lib/queries/` (reusable across pages, no `prisma` calls in page components)
- **Writes** → `app/(dashboard)/<feature>/actions.ts` (Server Actions colocated with the feature that owns the form)
- Set 3 is only persisted when sets are 1-1 (`set3Needed()` in actions.ts); form always shows set 3 inputs
- `winnerTeam` (1, 2, or 0) is computed on save, not stored as a player ID — **0 means draw** (partido concluido sin 3er set, cada pareja ganó un set)
- Standings computed at query time from raw scores — no denormalized table
- UI text is in Spanish (es-AR)
