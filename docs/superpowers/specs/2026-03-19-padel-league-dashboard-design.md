# Padel League Dashboard — Design Spec

**Status:** APPROVED
**Date:** 2026-03-19

## Overview

Dashboard funcional para trackear resultados de partidos de una liga de padel entre 5 amigos. Sin autenticacion por ahora. Mobile-first con soporte desktop.

## Modelo de datos

Nuevo modelo `Match` en Prisma:

```prisma
model Match {
  id            String   @id @default(cuid())
  date          DateTime
  team1player1  User     @relation("team1player1", fields: [team1player1Id], references: [id])
  team1player1Id String
  team1player2  User     @relation("team1player2", fields: [team1player2Id], references: [id])
  team1player2Id String
  team2player1  User     @relation("team2player1", fields: [team2player1Id], references: [id])
  team2player1Id String
  team2player2  User     @relation("team2player2", fields: [team2player2Id], references: [id])
  team2player2Id String
  set1team1     Int
  set1team2     Int
  set2team1     Int
  set2team2     Int
  set3team1     Int?
  set3team2     Int?
  winnerTeam    Int      // 1 o 2
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([team1player1Id])
  @@index([team1player2Id])
  @@index([team2player1Id])
  @@index([team2player2Id])
}
```

Relaciones inversas en User:

```prisma
model User {
  // ... campos existentes
  matchesAsTeam1Player1 Match[] @relation("team1player1")
  matchesAsTeam1Player2 Match[] @relation("team1player2")
  matchesAsTeam2Player1 Match[] @relation("team2player1")
  matchesAsTeam2Player2 Match[] @relation("team2player2")
}
```

`winnerTeam` se calcula automaticamente al crear/editar el partido: el equipo que gana 2 de 3 sets gana el partido. Un set se gana teniendo mayor cantidad de games. Si tras 2 sets hay empate 1-1, el set 3 es obligatorio. No se aplican reglas estrictas de scoring de padel (ej. llegar a 6) — los scores son libres para flexibilidad.

## Prerequisitos

- Agregar `zod` como dependencia: `pnpm add zod`
- Eliminar `app/page.tsx` existente (conflicto de ruta con `(dashboard)/page.tsx` que tambien mapea a `/`)

## Estructura de rutas

```
app/
├── layout.tsx                    — Root layout (fuentes, estilos globales)
├── (dashboard)/
│   ├── layout.tsx                — Layout con sidebar + header
│   ├── page.tsx                  — Dashboard home
│   ├── users/
│   │   └── page.tsx              — Tabla de usuarios (solo lectura)
│   └── matches/
│       ├── page.tsx              — Lista de partidos
│       ├── new/
│       │   └── page.tsx          — Crear partido
│       └── [id]/
│           └── edit/
│               └── page.tsx      — Editar partido
```

## Layout

- **Sidebar:** Links a Dashboard, Usuarios, Partidos. En mobile se colapsa con menu hamburguesa.
- **Header:** Titulo de la seccion actual.

## Dashboard home

Dos cards:
- Total de partidos jugados
- Ultimo partido (equipos + resultado)

## Usuarios

Tabla simple con nombre, email, rol. Solo lectura.

## Partidos — CRUD completo

### Lista (`/matches`)
- Server Component con lista de partidos mostrando equipos, resultado, fecha
- Ordenados por fecha descendente (mas reciente primero)
- Botones: "Nuevo partido", "Editar", "Eliminar" por partido
- No hay pagina de detalle individual — la lista muestra toda la informacion necesaria

### Crear (`/matches/new`)
- Server Component page que carga usuarios y pasa a MatchForm
- MatchForm es Client Component con `useActionState`

### Editar (`/matches/[id]/edit`)
- Server Component page que carga partido + usuarios y pasa a MatchForm
- Reutiliza el mismo MatchForm con datos precargados

### Eliminar
- DeleteMatchButton Client Component con confirmacion antes de eliminar

## Formulario de partido (MatchForm)

- 4 selects para elegir jugadores (deben ser distintos)
- Input de fecha
- Inputs numericos para scores: set 1, set 2
- Toggle/checkbox para habilitar set 3 (campos opcionales)
- Validacion con Zod, errores inline via `useActionState`
- Estado loading durante submit

## Validacion (Zod)

Schema en `lib/schemas/match.ts`:
- `date`: fecha valida
- `team1player1Id`, `team1player2Id`, `team2player1Id`, `team2player2Id`: cuid, los 4 distintos
- `set1team1`, `set1team2`, `set2team1`, `set2team2`: int >= 0
- `set3team1`, `set3team2`: int >= 0, opcionales (ambos presentes o ambos ausentes)
- Validacion cruzada: si sets estan 1-1, set 3 es obligatorio
- Scores libres (sin minimo de 6 games ni reglas estrictas de padel)

## Server Actions

En `app/(dashboard)/matches/actions.ts`:
- `createMatch(prevState, formData)` — valida, calcula winnerTeam, crea, redirect a /matches
- `updateMatch(prevState, formData)` — valida, calcula winnerTeam, actualiza, redirect a /matches
- `deleteMatch(formData)` — elimina por id, redirect a /matches

## Enfoque tecnico

- **Server Components + Server Actions + useActionState** (Enfoque B)
- **Zod** para validacion de schemas
- **Tailwind CSS** puro, mobile-first
- **Prisma** queries directas en Server Components
- Sin librerias de componentes UI
- Sin autenticacion por ahora

## Fuera de alcance

- Autenticacion / login
- Tabla de posiciones / ranking
- Estadisticas avanzadas por jugador
- Paginacion
- Filtros / busqueda
