# Attendance Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `/attendance` page with a table showing each player's historical match count, a proportional progress bar, and the date of their last match — sorted ascending so the least-active player appears first.

**Architecture:** Single Server Component that queries matches and users concurrently via `Promise.all`, computes attendance in memory, and renders a table following the same visual pattern as the existing standings page.

**Tech Stack:** Next.js 16 App Router, TypeScript, Prisma (pg adapter), Tailwind v4

---

## Files

| File | Action |
|---|---|
| `app/(dashboard)/attendance/page.tsx` | Create — Server Component with queries, computation, and table UI |
| `components/Sidebar.tsx` | Modify — add `"Asistencia"` tab pointing to `/attendance` |

---

### Task 1: Create the attendance page

**Files:**
- Create: `app/(dashboard)/attendance/page.tsx`

Reference: `app/(dashboard)/standings/page.tsx` — copy the same table shell, thead/tbody styles, and empty-state pattern.

- [ ] **Step 1: Create `app/(dashboard)/attendance/page.tsx`** with the following content:

```tsx
import { prisma } from "@/lib/prisma";

export default async function AttendancePage() {
  const [matches, users] = await Promise.all([
    prisma.match.findMany({
      select: {
        team1player1Id: true,
        team1player2Id: true,
        team2player1Id: true,
        team2player2Id: true,
        date: true,
      },
    }),
    prisma.user.findMany({
      select: { id: true, name: true },
    }),
  ]);

  if (users.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold text-chalk">Asistencia</h1>
        <p className="text-sm text-chalk-muted">No hay jugadores registrados aún.</p>
      </div>
    );
  }

  const playerMap = new Map<
    string,
    { id: string; name: string; matchesPlayed: number; lastMatchDate: Date | null }
  >();

  for (const user of users) {
    playerMap.set(user.id, {
      id: user.id,
      name: user.name ?? "(sin nombre)",
      matchesPlayed: 0,
      lastMatchDate: null,
    });
  }

  for (const m of matches) {
    const ids = [m.team1player1Id, m.team1player2Id, m.team2player1Id, m.team2player2Id];
    for (const id of ids) {
      const p = playerMap.get(id);
      if (!p) continue;
      p.matchesPlayed++;
      if (p.lastMatchDate === null || m.date > p.lastMatchDate) {
        p.lastMatchDate = m.date;
      }
    }
  }

  const rows = Array.from(playerMap.values()).sort(
    (a, b) => a.matchesPlayed - b.matchesPlayed
  );

  const maxMatchesPlayed = Math.max(0, ...rows.map((r) => r.matchesPlayed));

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-chalk">Asistencia</h1>

      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface">
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-chalk-muted">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-chalk-muted">
                Jugador
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-chalk-muted">
                PJ
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-chalk-muted">
                Asistencia
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-chalk-muted">
                Último partido
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {rows.map((row, i) => {
              const pct =
                maxMatchesPlayed === 0
                  ? 0
                  : Math.round((row.matchesPlayed / maxMatchesPlayed) * 100);
              const lastDate = row.lastMatchDate
                ? row.lastMatchDate.toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—";
              return (
                <tr key={row.id} className="transition-colors hover:bg-surface">
                  <td className="px-4 py-3 text-center font-mono text-chalk-muted">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-chalk">{row.name}</td>
                  <td className="px-4 py-3 text-center font-mono tabular-nums text-chalk-secondary">
                    {row.matchesPlayed}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-line-soft">
                        <div
                          className="h-full rounded-full bg-mint"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-chalk-muted">
                        {pct}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm tabular-nums text-chalk-secondary">
                    {lastDate}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the file was created correctly**

```bash
ls app/(dashboard)/attendance/
```

Expected: `page.tsx`

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/attendance/page.tsx"
git commit -m "feat: add attendance page with progress bar table"
```

---

### Task 2: Add nav tab in Sidebar

**Files:**
- Modify: `components/Sidebar.tsx`

The `tabs` array in `components/Sidebar.tsx` (line 6–11) currently has 4 entries. Add `"Asistencia"` as the 4th tab (before `"Jugadores"`) so the nav reads: Inicio · Partidos · Posiciones · Asistencia · Jugadores.

- [ ] **Step 1: Edit `components/Sidebar.tsx`** — add the attendance tab to the `tabs` array:

```ts
// Before (lines 6–11):
const tabs = [
  { href: "/", label: "Inicio" },
  { href: "/matches", label: "Partidos" },
  { href: "/standings", label: "Posiciones" },
  { href: "/users", label: "Jugadores" },
];

// After:
const tabs = [
  { href: "/", label: "Inicio" },
  { href: "/matches", label: "Partidos" },
  { href: "/standings", label: "Posiciones" },
  { href: "/attendance", label: "Asistencia" },
  { href: "/users", label: "Jugadores" },
];
```

- [ ] **Step 2: Verify the app builds without errors**

```bash
pnpm build
```

Expected: Build completes with no TypeScript or compilation errors.

- [ ] **Step 3: Commit**

```bash
git add components/Sidebar.tsx
git commit -m "feat: add Asistencia tab to top nav"
```

---

## Manual verification

After both tasks are done, start the dev server and verify:

```bash
pnpm dev
```

1. Open `http://localhost:3000/attendance`
2. Check that the "Asistencia" tab is active and underlined with the mint indicator
3. Verify the table shows all players sorted by fewest matches first
4. Verify the progress bar for the top player (most matches) fills 100% of the track
5. Verify players with 0 matches show an empty bar, `0 PJ`, and `—` in the last match column
6. Verify the date format reads like `"20 mar. 2026"` (es-AR locale)
