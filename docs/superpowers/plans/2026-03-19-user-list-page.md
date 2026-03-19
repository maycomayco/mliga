# User List Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display a list of users (name + email) on the home page using a Next.js Server Component querying Postgres via Prisma.

**Architecture:** Singleton PrismaClient with PrismaPg adapter in `lib/prisma.ts`, imported directly in the async Server Component `app/page.tsx`. No API route, no client state.

**Tech Stack:** Next.js 16 App Router, Prisma 7.5, @prisma/adapter-pg, Tailwind 4, TypeScript

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/prisma.ts` | Create | Singleton PrismaClient with PrismaPg adapter |
| `app/page.tsx` | Modify | Async Server Component — query + render user list |

---

### Task 1: Create Prisma client singleton

**Files:**
- Create: `lib/prisma.ts`

- [ ] **Step 1: Create `lib/prisma.ts`**

```ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

> The `globalThis` singleton pattern prevents creating multiple PrismaClient instances during Next.js hot-reload in development.

- [ ] **Step 2: Commit**

```bash
git add lib/prisma.ts
git commit -m "feat: add prisma client singleton"
```

---

### Task 2: Update home page to show user list

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx` with:**

```tsx
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="p-8">
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="flex gap-4">
            <span className="font-medium">{user.name ?? "(sin nombre)"}</span>
            <span className="text-zinc-500">{user.email}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Step 2: Asegurarse de que la DB tiene datos**

```bash
pnpm prisma db seed
```

- [ ] **Step 3: Verify locally**

```bash
pnpm dev
```

Open `http://localhost:3000` — debe mostrar los 5 usuarios con nombre y email.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: show user list on home page"
```
