---
date: 2026-03-19
topic: user-list-page
status: approved
---

# User List Page Design

## Goal

Display a list of users (name + email) on the home page (`app/page.tsx`).

## Approach

Server Component directo (opción A). Prisma se llama en `page.tsx` con `async/await`, sin API route ni estado cliente.

## Implementation

1. Crear `lib/prisma.ts` — instancia singleton de `PrismaClient` con adapter `PrismaPg`.
2. Actualizar `app/page.tsx` — Server Component async que llama `prisma.user.findMany({ select: { name, email } })` y renderiza una `<ul>` con cada usuario.

## Out of scope

- Paginación
- Búsqueda / filtros
- Loading / error states
- Campos adicionales (username, role, etc.)
