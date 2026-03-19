# Padel League Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a functional mobile-first dashboard for tracking padel match results among 5 friends, with full CRUD for matches and a read-only users table.

**Architecture:** Server Components fetch data directly with Prisma; Server Actions handle all mutations; Client Components use `useActionState` for inline form feedback. A `(dashboard)` route group wraps all pages in a shared sidebar/header layout.

**Tech Stack:** Next.js 16 (App Router), React 19, Prisma 7.5 (PostgreSQL), Tailwind CSS v4, Zod.

---

## File Map

**Create:**
- `lib/schemas/match.ts` — Zod schema + `calculateWinnerTeam` helper
- `app/(dashboard)/layout.tsx` — Dashboard layout wrapping sidebar + main
- `components/Sidebar.tsx` — Client Component: nav links, mobile hamburger
- `app/(dashboard)/page.tsx` — Dashboard home: total matches + last match cards
- `app/(dashboard)/users/page.tsx` — Users table (read-only)
- `app/(dashboard)/matches/actions.ts` — Server Actions: createMatch, updateMatch, deleteMatch
- `components/matches/MatchForm.tsx` — Client Component: shared form for create/edit
- `components/matches/DeleteMatchButton.tsx` — Client Component: delete with confirmation
- `app/(dashboard)/matches/page.tsx` — Matches list with edit/delete
- `app/(dashboard)/matches/new/page.tsx` — Create match page
- `app/(dashboard)/matches/[id]/edit/page.tsx` — Edit match page

**Modify:**
- `prisma/schema.prisma` — Add Match model + inverse relations on User
- `app/layout.tsx` — Update metadata title/description

**Delete:**
- `app/page.tsx` — Conflicts with `(dashboard)/page.tsx` (both map to `/`)

---

### Task 1: Install Zod and clean up

**Files:**
- Modify: `package.json` (via pnpm)
- Delete: `app/page.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Install Zod**

```bash
cd /Users/mayco/dev/mliga && pnpm add zod
```

Expected: `dependencies: + zod ...`

- [ ] **Step 2: Delete the old home page**

`app/page.tsx` conflicts with `(dashboard)/page.tsx` — both map to the `/` route.

```bash
git rm app/page.tsx
```

- [ ] **Step 3: Update metadata in `app/layout.tsx`**

Change only the `metadata` export:

```ts
export const metadata: Metadata = {
  title: "M-Liga",
  description: "Liga de pádel entre amigos",
};
```

- [ ] **Step 4: Verify dev server starts**

```bash
pnpm dev
```

Navigate to `http://localhost:3000`. Expected: 404 page (no home yet — correct). Stop with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml app/layout.tsx
git commit -m "chore: install zod, remove old home page, update metadata"
```

---

### Task 2: Add Match model to Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Replace `prisma/schema.prisma` with the following**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

enum Role {
  USER
  ADMIN
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  name      String?
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  matchesAsTeam1Player1 Match[] @relation("team1player1")
  matchesAsTeam1Player2 Match[] @relation("team1player2")
  matchesAsTeam2Player1 Match[] @relation("team2player1")
  matchesAsTeam2Player2 Match[] @relation("team2player2")
}

model Match {
  id             String   @id @default(cuid())
  date           DateTime
  team1player1   User     @relation("team1player1", fields: [team1player1Id], references: [id])
  team1player1Id String
  team1player2   User     @relation("team1player2", fields: [team1player2Id], references: [id])
  team1player2Id String
  team2player1   User     @relation("team2player1", fields: [team2player1Id], references: [id])
  team2player1Id String
  team2player2   User     @relation("team2player2", fields: [team2player2Id], references: [id])
  team2player2Id String
  set1team1      Int
  set1team2      Int
  set2team1      Int
  set2team2      Int
  set3team1      Int?
  set3team2      Int?
  winnerTeam     Int
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([team1player1Id])
  @@index([team1player2Id])
  @@index([team2player1Id])
  @@index([team2player2Id])
}
```

- [ ] **Step 2: Run migration**

```bash
pnpm prisma migrate dev --name add-match-model
```

Expected: `✔ Generated Prisma Client`, migration applied successfully.

- [ ] **Step 3: Seed the database**

The seed script creates the 5 players needed in the MatchForm selects.

```bash
pnpm prisma db seed
```

Expected: `✓ Mayco`, `✓ Jano`, `✓ Victor`, `✓ Santi`, `✓ Lucas`

- [ ] **Step 4: Validate schema**

```bash
pnpm prisma validate
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add Match model to Prisma schema"
```

---

### Task 3: Zod validation schema

**Files:**
- Create: `lib/schemas/match.ts`

- [ ] **Step 1: Create `lib/schemas/match.ts`**

```ts
import { z } from "zod";

export const matchSchema = z
  .object({
    date: z.string().min(1, "La fecha es requerida"),
    team1player1Id: z.string().min(1, "Requerido"),
    team1player2Id: z.string().min(1, "Requerido"),
    team2player1Id: z.string().min(1, "Requerido"),
    team2player2Id: z.string().min(1, "Requerido"),
    set1team1: z.coerce.number().int().min(0, "Mínimo 0"),
    set1team2: z.coerce.number().int().min(0, "Mínimo 0"),
    set2team1: z.coerce.number().int().min(0, "Mínimo 0"),
    set2team2: z.coerce.number().int().min(0, "Mínimo 0"),
    set3team1: z.coerce.number().int().min(0, "Mínimo 0").optional(),
    set3team2: z.coerce.number().int().min(0, "Mínimo 0").optional(),
  })
  .refine(
    (d) =>
      new Set([
        d.team1player1Id,
        d.team1player2Id,
        d.team2player1Id,
        d.team2player2Id,
      ]).size === 4,
    { message: "Los 4 jugadores deben ser distintos", path: ["team1player1Id"] }
  )
  .refine(
    (d) => (d.set3team1 === undefined) === (d.set3team2 === undefined),
    { message: "Ambos scores del set 3 son requeridos", path: ["set3team1"] }
  )
  .refine(
    (d) => {
      const team1WonSet1 = d.set1team1 > d.set1team2;
      const team1WonSet2 = d.set2team1 > d.set2team2;
      if (team1WonSet1 !== team1WonSet2) {
        return d.set3team1 !== undefined && d.set3team2 !== undefined;
      }
      return true;
    },
    {
      message: "El set 3 es obligatorio cuando los sets están 1-1",
      path: ["set3team1"],
    }
  );

export type MatchInput = z.infer<typeof matchSchema>;

export function calculateWinnerTeam(data: MatchInput): number {
  let team1Sets = 0;
  let team2Sets = 0;

  if (data.set1team1 > data.set1team2) team1Sets++;
  else team2Sets++;

  if (data.set2team1 > data.set2team2) team1Sets++;
  else team2Sets++;

  if (data.set3team1 !== undefined && data.set3team2 !== undefined) {
    if (data.set3team1 > data.set3team2) team1Sets++;
    else team2Sets++;
  }

  return team1Sets > team2Sets ? 1 : 2;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/schemas/match.ts
git commit -m "feat: add Zod match schema with validation and winner calculation"
```

---

### Task 4: Dashboard layout with Sidebar

**Files:**
- Create: `components/Sidebar.tsx`
- Create: `app/(dashboard)/layout.tsx`

- [ ] **Step 1: Create `components/Sidebar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/users", label: "Usuarios" },
  { href: "/matches", label: "Partidos" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navLinks = (
    <nav className="flex flex-col gap-1 p-4">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            pathname === href
              ? "bg-zinc-800 text-white"
              : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile header bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-3 md:hidden">
        <span className="text-sm font-semibold text-white">M-Liga</span>
        <button
          onClick={() => setOpen(!open)}
          className="text-zinc-400 hover:text-white"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile overlay menu */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-zinc-900 pt-14">
            {navLinks}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-zinc-800 bg-zinc-900 md:flex md:flex-col">
        <div className="border-b border-zinc-800 px-4 py-4">
          <span className="text-sm font-semibold text-white">M-Liga</span>
        </div>
        {navLinks}
      </aside>
    </>
  );
}
```

- [ ] **Step 2: Create `app/(dashboard)/layout.tsx`**

```tsx
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-zinc-950 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Start dev server and verify layout renders**

```bash
pnpm dev
```

Navigate to `http://localhost:3000`. Expected: dark sidebar on desktop, hamburger on mobile (resize browser). You'll see a 404 for page content — that's fine for now. Stop with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add components/Sidebar.tsx "app/(dashboard)/layout.tsx"
git commit -m "feat: add dashboard layout with responsive sidebar"
```

---

### Task 5: Dashboard home page

**Files:**
- Create: `app/(dashboard)/page.tsx`

- [ ] **Step 1: Create `app/(dashboard)/page.tsx`**

```tsx
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [totalMatches, lastMatch] = await Promise.all([
    prisma.match.count(),
    prisma.match.findFirst({
      orderBy: { date: "desc" },
      include: {
        team1player1: { select: { name: true } },
        team1player2: { select: { name: true } },
        team2player1: { select: { name: true } },
        team2player2: { select: { name: true } },
      },
    }),
  ]);

  function formatScore(match: NonNullable<typeof lastMatch>) {
    const sets = [
      `${match.set1team1}-${match.set1team2}`,
      `${match.set2team1}-${match.set2team2}`,
    ];
    if (match.set3team1 !== null && match.set3team2 !== null) {
      sets.push(`${match.set3team1}-${match.set3team2}`);
    }
    return sets.join("  ");
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-white">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Total partidos</p>
          <p className="mt-1 text-3xl font-bold text-white">{totalMatches}</p>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Último partido</p>
          {lastMatch ? (
            <div className="mt-2">
              <p className="text-sm font-medium text-white">
                <span className={lastMatch.winnerTeam === 1 ? "text-green-400" : ""}>
                  {lastMatch.team1player1.name} / {lastMatch.team1player2.name}
                </span>
                <span className="mx-2 text-zinc-500">vs</span>
                <span className={lastMatch.winnerTeam === 2 ? "text-green-400" : ""}>
                  {lastMatch.team2player1.name} / {lastMatch.team2player2.name}
                </span>
              </p>
              <p className="mt-1 font-mono text-sm text-zinc-300">
                {formatScore(lastMatch)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {new Date(lastMatch.date).toLocaleDateString("es-AR")}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">Sin partidos aún</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Start dev server and verify**

```bash
pnpm dev
```

Navigate to `http://localhost:3000`. Expected: dashboard with "Total partidos: 0" and "Sin partidos aún". Sidebar links should be visible. Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/page.tsx"
git commit -m "feat: add dashboard home with stats cards"
```

---

### Task 6: Users page

**Files:**
- Create: `app/(dashboard)/users/page.tsx`

- [ ] **Step 1: Create `app/(dashboard)/users/page.tsx`**

```tsx
import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, username: true, role: true },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-white">Usuarios</h1>
      <div className="overflow-hidden rounded-lg border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-300">Nombre</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-300">Email</th>
              <th className="hidden px-4 py-3 text-left font-medium text-zinc-300 sm:table-cell">Username</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-300">Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users.map((user) => (
              <tr key={user.id} className="bg-zinc-900">
                <td className="px-4 py-3 font-medium text-white">
                  {user.name ?? "(sin nombre)"}
                </td>
                <td className="px-4 py-3 text-zinc-400">{user.email}</td>
                <td className="hidden px-4 py-3 text-zinc-400 sm:table-cell">
                  {user.username}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      user.role === "ADMIN"
                        ? "bg-violet-900 text-violet-300"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```

Navigate to `http://localhost:3000/users`. Expected: table with 5 users (Mayco as ADMIN, rest as USER). Username column hidden on mobile. Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/users/page.tsx"
git commit -m "feat: add users page with responsive table"
```

---

### Task 7: Match server actions

**Files:**
- Create: `app/(dashboard)/matches/actions.ts`

- [ ] **Step 1: Create `app/(dashboard)/matches/actions.ts`**

```ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { matchSchema, calculateWinnerTeam } from "@/lib/schemas/match";

export type ActionState = {
  errors?: Record<string, string[]>;
  message?: string;
};

function parseMatchFormData(formData: FormData) {
  // Use explicit null check so "0" is preserved (not treated as falsy)
  const set3team1Raw = formData.get("set3team1");
  const set3team2Raw = formData.get("set3team2");

  return {
    date: formData.get("date"),
    team1player1Id: formData.get("team1player1Id"),
    team1player2Id: formData.get("team1player2Id"),
    team2player1Id: formData.get("team2player1Id"),
    team2player2Id: formData.get("team2player2Id"),
    set1team1: formData.get("set1team1"),
    set1team2: formData.get("set1team2"),
    set2team1: formData.get("set2team1"),
    set2team2: formData.get("set2team2"),
    set3team1: set3team1Raw !== null ? set3team1Raw : undefined,
    set3team2: set3team2Raw !== null ? set3team2Raw : undefined,
  };
}

export async function createMatch(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const result = matchSchema.safeParse(parseMatchFormData(formData));

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const data = result.data;
  const winnerTeam = calculateWinnerTeam(data);

  await prisma.match.create({
    data: {
      date: new Date(data.date),
      team1player1Id: data.team1player1Id,
      team1player2Id: data.team1player2Id,
      team2player1Id: data.team2player1Id,
      team2player2Id: data.team2player2Id,
      set1team1: data.set1team1,
      set1team2: data.set1team2,
      set2team1: data.set2team1,
      set2team2: data.set2team2,
      set3team1: data.set3team1 ?? null,
      set3team2: data.set3team2 ?? null,
      winnerTeam,
    },
  });

  revalidatePath("/");
  revalidatePath("/matches");
  redirect("/matches");
}

export async function updateMatch(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const result = matchSchema.safeParse(parseMatchFormData(formData));

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const data = result.data;
  const winnerTeam = calculateWinnerTeam(data);

  await prisma.match.update({
    where: { id },
    data: {
      date: new Date(data.date),
      team1player1Id: data.team1player1Id,
      team1player2Id: data.team1player2Id,
      team2player1Id: data.team2player1Id,
      team2player2Id: data.team2player2Id,
      set1team1: data.set1team1,
      set1team2: data.set1team2,
      set2team1: data.set2team1,
      set2team2: data.set2team2,
      set3team1: data.set3team1 ?? null,
      set3team2: data.set3team2 ?? null,
      winnerTeam,
    },
  });

  revalidatePath("/");
  revalidatePath("/matches");
  redirect("/matches");
}

export async function deleteMatch(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  await prisma.match.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/matches");
  redirect("/matches");
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/matches/actions.ts"
git commit -m "feat: add match server actions (create, update, delete)"
```

---

### Task 8: MatchForm client component

**Files:**
- Create: `components/matches/MatchForm.tsx`

- [ ] **Step 1: Create `components/matches/MatchForm.tsx`**

```tsx
"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/app/(dashboard)/matches/actions";

type Player = { id: string; name: string | null };

type Props = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  players: Player[];
  defaultValues?: {
    date?: string;
    team1player1Id?: string;
    team1player2Id?: string;
    team2player1Id?: string;
    team2player2Id?: string;
    set1team1?: number;
    set1team2?: number;
    set2team1?: number;
    set2team2?: number;
    set3team1?: number | null;
    set3team2?: number | null;
  };
};

const initialState: ActionState = {};

const inputClass =
  "w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none";
const selectClass =
  "w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none";
const labelClass = "mb-1 block text-xs font-medium text-zinc-400";

export default function MatchForm({ action, players, defaultValues }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [showSet3, setShowSet3] = useState(defaultValues?.set3team1 != null);

  function fieldError(field: string) {
    const errs = state.errors?.[field];
    if (!errs?.length) return null;
    return <p className="mt-1 text-xs text-red-400">{errs[0]}</p>;
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Date */}
      <div>
        <label htmlFor="date" className={labelClass}>Fecha</label>
        <input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={defaultValues?.date}
          className={inputClass}
        />
        {fieldError("date")}
      </div>

      {/* Teams */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Team 1 */}
        <div className="space-y-3 rounded-lg border border-zinc-800 p-4">
          <p className="text-sm font-semibold text-white">Equipo 1</p>
          <div>
            <label htmlFor="team1player1Id" className={labelClass}>Jugador 1</label>
            <select id="team1player1Id" name="team1player1Id" required defaultValue={defaultValues?.team1player1Id ?? ""} className={selectClass}>
              <option value="">Seleccionar jugador</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name ?? p.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="team1player2Id" className={labelClass}>Jugador 2</label>
            <select id="team1player2Id" name="team1player2Id" required defaultValue={defaultValues?.team1player2Id ?? ""} className={selectClass}>
              <option value="">Seleccionar jugador</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name ?? p.id}</option>
              ))}
            </select>
          </div>
          {fieldError("team1player1Id")}
        </div>

        {/* Team 2 */}
        <div className="space-y-3 rounded-lg border border-zinc-800 p-4">
          <p className="text-sm font-semibold text-white">Equipo 2</p>
          <div>
            <label htmlFor="team2player1Id" className={labelClass}>Jugador 1</label>
            <select id="team2player1Id" name="team2player1Id" required defaultValue={defaultValues?.team2player1Id ?? ""} className={selectClass}>
              <option value="">Seleccionar jugador</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name ?? p.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="team2player2Id" className={labelClass}>Jugador 2</label>
            <select id="team2player2Id" name="team2player2Id" required defaultValue={defaultValues?.team2player2Id ?? ""} className={selectClass}>
              <option value="">Seleccionar jugador</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name ?? p.id}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="space-y-4">
        {/* Set 1 */}
        <div>
          <p className={labelClass}>Set 1</p>
          <div className="flex items-center gap-3">
            <input name="set1team1" type="number" min={0} required defaultValue={defaultValues?.set1team1 ?? 0} className={`${inputClass} w-20 text-center`} />
            <span className="text-zinc-500">–</span>
            <input name="set1team2" type="number" min={0} required defaultValue={defaultValues?.set1team2 ?? 0} className={`${inputClass} w-20 text-center`} />
          </div>
          {fieldError("set1team1")}
        </div>

        {/* Set 2 */}
        <div>
          <p className={labelClass}>Set 2</p>
          <div className="flex items-center gap-3">
            <input name="set2team1" type="number" min={0} required defaultValue={defaultValues?.set2team1 ?? 0} className={`${inputClass} w-20 text-center`} />
            <span className="text-zinc-500">–</span>
            <input name="set2team2" type="number" min={0} required defaultValue={defaultValues?.set2team2 ?? 0} className={`${inputClass} w-20 text-center`} />
          </div>
        </div>

        {/* Set 3 toggle */}
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={showSet3}
            onChange={(e) => setShowSet3(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-600 bg-zinc-800"
          />
          <span className="text-sm text-zinc-400">Agregar Set 3</span>
        </label>

        {/* Set 3 */}
        {showSet3 && (
          <div>
            <p className={labelClass}>Set 3</p>
            <div className="flex items-center gap-3">
              <input name="set3team1" type="number" min={0} defaultValue={defaultValues?.set3team1 ?? 0} className={`${inputClass} w-20 text-center`} />
              <span className="text-zinc-500">–</span>
              <input name="set3team2" type="number" min={0} defaultValue={defaultValues?.set3team2 ?? 0} className={`${inputClass} w-20 text-center`} />
            </div>
            {fieldError("set3team1")}
          </div>
        )}
      </div>

      {/* General error */}
      {state.message && <p className="text-sm text-red-400">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar partido"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/matches/MatchForm.tsx
git commit -m "feat: add MatchForm client component with useActionState"
```

---

### Task 9: DeleteMatchButton component

**Files:**
- Create: `components/matches/DeleteMatchButton.tsx`

- [ ] **Step 1: Create `components/matches/DeleteMatchButton.tsx`**

```tsx
"use client";

import { deleteMatch } from "@/app/(dashboard)/matches/actions";

export default function DeleteMatchButton({ id }: { id: string }) {
  return (
    <form
      action={deleteMatch}
      onSubmit={(e) => {
        if (!confirm("¿Eliminar este partido?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-xs text-red-400 hover:text-red-300">
        Eliminar
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/matches/DeleteMatchButton.tsx
git commit -m "feat: add DeleteMatchButton with browser confirmation"
```

---

### Task 10: Matches list page

**Files:**
- Create: `app/(dashboard)/matches/page.tsx`

- [ ] **Step 1: Create `app/(dashboard)/matches/page.tsx`**

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteMatchButton from "@/components/matches/DeleteMatchButton";

export default async function MatchesPage() {
  const matches = await prisma.match.findMany({
    orderBy: { date: "desc" },
    include: {
      team1player1: { select: { name: true } },
      team1player2: { select: { name: true } },
      team2player1: { select: { name: true } },
      team2player2: { select: { name: true } },
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Partidos</h1>
        <Link
          href="/matches/new"
          className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
        >
          + Nuevo partido
        </Link>
      </div>

      {matches.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay partidos registrados.</p>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => {
            const sets = [
              `${match.set1team1}-${match.set1team2}`,
              `${match.set2team1}-${match.set2team2}`,
            ];
            if (match.set3team1 !== null && match.set3team2 !== null) {
              sets.push(`${match.set3team1}-${match.set3team2}`);
            }

            return (
              <div key={match.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                      <span className={`font-medium ${match.winnerTeam === 1 ? "text-green-400" : "text-white"}`}>
                        {match.team1player1.name} / {match.team1player2.name}
                      </span>
                      <span className="text-zinc-500">vs</span>
                      <span className={`font-medium ${match.winnerTeam === 2 ? "text-green-400" : "text-white"}`}>
                        {match.team2player1.name} / {match.team2player2.name}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-sm text-zinc-300">{sets.join("  ")}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {new Date(match.date).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Link href={`/matches/${match.id}/edit`} className="text-xs text-zinc-400 hover:text-white">
                      Editar
                    </Link>
                    <DeleteMatchButton id={match.id} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```

Navigate to `http://localhost:3000/matches`. Expected: empty state "No hay partidos registrados." with a "+ Nuevo partido" button. Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/matches/page.tsx"
git commit -m "feat: add matches list page"
```

---

### Task 11: Create match page

**Files:**
- Create: `app/(dashboard)/matches/new/page.tsx`

- [ ] **Step 1: Create `app/(dashboard)/matches/new/page.tsx`**

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import MatchForm from "@/components/matches/MatchForm";
import { createMatch } from "@/app/(dashboard)/matches/actions";

export default async function NewMatchPage() {
  const players = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/matches" className="text-sm text-zinc-500 hover:text-white">
          ← Volver
        </Link>
        <h1 className="text-xl font-semibold text-white">Nuevo partido</h1>
      </div>
      <MatchForm action={createMatch} players={players} />
    </div>
  );
}
```

- [ ] **Step 2: Verify create flow**

```bash
pnpm dev
```

1. Navigate to `http://localhost:3000/matches/new`
2. Expected: form with date input, 4 player selects, set score inputs, "Agregar Set 3" checkbox
3. Submit empty form — expected: inline validation errors appear without page reload
4. Fill in all fields with valid data (4 different players, scores, date) and submit
5. Expected: redirects to `/matches`, new match appears in the list

Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/matches/new/page.tsx"
git commit -m "feat: add create match page"
```

---

### Task 12: Edit match page

**Files:**
- Create: `app/(dashboard)/matches/[id]/edit/page.tsx`

- [ ] **Step 1: Create `app/(dashboard)/matches/[id]/edit/page.tsx`**

In Next.js 16, `params` is a `Promise` and must be awaited.

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MatchForm from "@/components/matches/MatchForm";
import { updateMatch } from "@/app/(dashboard)/matches/actions";

export default async function EditMatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [match, players] = await Promise.all([
    prisma.match.findUnique({ where: { id } }),
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!match) notFound();

  const updateMatchWithId = updateMatch.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/matches" className="text-sm text-zinc-500 hover:text-white">
          ← Volver
        </Link>
        <h1 className="text-xl font-semibold text-white">Editar partido</h1>
      </div>
      <MatchForm
        action={updateMatchWithId}
        players={players}
        defaultValues={{
          date: match.date.toISOString().split("T")[0],
          team1player1Id: match.team1player1Id,
          team1player2Id: match.team1player2Id,
          team2player1Id: match.team2player1Id,
          team2player2Id: match.team2player2Id,
          set1team1: match.set1team1,
          set1team2: match.set1team2,
          set2team1: match.set2team1,
          set2team2: match.set2team2,
          set3team1: match.set3team1,
          set3team2: match.set3team2,
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify full CRUD flow**

```bash
pnpm dev
```

1. Go to `http://localhost:3000/matches` and click "Editar" on an existing match
2. Expected: form pre-populated with existing values; if match had set 3, checkbox shows checked
3. Change a score and submit — expected: match updates, redirects back to `/matches`
4. Click "Eliminar" on a match — expected: browser confirm dialog; confirm deletes it
5. Go to `http://localhost:3000` — expected: total matches count reflects current state

Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/matches/[id]/edit/page.tsx"
git commit -m "feat: add edit match page — completes full CRUD for matches"
```

---

## Done

All 12 tasks complete. The dashboard is fully functional:

- `/` — Dashboard with total matches and last match
- `/users` — Users table (read-only)
- `/matches` — Matches list with edit/delete, ordered by date descending
- `/matches/new` — Create match with Zod validation and inline errors
- `/matches/[id]/edit` — Edit match with pre-populated form
