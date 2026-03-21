# Asistencia a Partidos — Spec

**Date:** 2026-03-20
**Status:** Approved

## Objetivo

Crear una nueva sección "Asistencia" en la app M-LIGA que muestre en una tabla cuántos partidos ha jugado cada jugador históricamente, con una barra visual de progreso y la fecha de su último partido. El objetivo es que el organizador pueda decidir de un vistazo quién debería jugar el próximo partido para mantener la participación equitativa.

---

## Ruta y navegación

- Nueva página: `app/(dashboard)/attendance/page.tsx`
- Nueva pestaña en `components/Sidebar.tsx`: label `"Asistencia"`, href `"/attendance"`

---

## Datos y lógica

**Query:** Dos llamadas concurrentes via `Promise.all`:
1. Todos los `Match` con `team1player1Id`, `team1player2Id`, `team2player1Id`, `team2player2Id`, `date`
2. Todos los `User` con `id`, `name`

**Cálculo (en memoria, en el Server Component):**

Para cada jugador se acumula:
- `matchesPlayed` — número de partidos en los que aparece como cualquiera de los 4 jugadores
- `lastMatchDate` — objeto `Date` de Prisma correspondiente a la fecha más reciente de los partidos en que participó. Inicializar en `null`; por cada partido en que aparece el jugador, si `match.date > lastMatchDate` (o `lastMatchDate` es `null`), asignar `lastMatchDate = match.date`.

Valores derivados:
- `maxMatchesPlayed` — valor máximo de `matchesPlayed` entre todos los jugadores
- `pct` — `Math.round(matchesPlayed / maxMatchesPlayed * 100)`. El jugador con más partidos muestra la barra completa (100%) y el resto es proporcional. Si `maxMatchesPlayed === 0`, `pct = 0` para todos.

**Formateo de fecha:** Se usa `date.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })` directamente en el Server Component (sin librerías externas).

**Ordenamiento:** Ascendente por `matchesPlayed` (menor asistencia primero). Los jugadores con 0 partidos se incluyen al principio.

---

## UI

### Tabla

Columnas:

| Columna | Contenido |
|---|---|
| `#` | Posición en el ranking (1 = menos jugó) |
| `Jugador` | `user.name` o `"(sin nombre)"` |
| `PJ` | `matchesPlayed` (font-mono, tabular-nums) |
| `Asistencia` | Barra de progreso + porcentaje (`XX%`) |
| `Último partido` | Fecha formateada, ej. `"20 mar. 2026"`, o `—` si nunca jugó |

### Barra de progreso

La celda de Asistencia contiene un wrapper `flex items-center gap-2`:
- Contenedor de barra: `bg-line-soft rounded-full h-1.5 w-24`
- Relleno: `bg-mint rounded-full h-full` con `style={{ width: pct + "%" }}`
- Porcentaje: `<span>` con clases `text-chalk-muted text-xs tabular-nums` a la derecha de la barra

### Estados vacíos

El `<h1>Asistencia</h1>` se muestra siempre; el estado vacío reemplaza únicamente la tabla.

- Sin usuarios en la DB: mensaje `"No hay jugadores registrados aún."`
- Usuarios existen pero ninguno jugó: la tabla se renderiza normalmente con todos mostrando `0 PJ`, barra vacía y `—` en última fecha. No se muestra mensaje vacío.

### Estilo general

Sigue el mismo patrón visual de `app/(dashboard)/standings/page.tsx`:
- Wrapper: `overflow-hidden rounded-lg border border-line`
- `thead` con `bg-surface`, texto `text-xs font-medium uppercase tracking-wider text-chalk-muted`
- `tbody` con `divide-y divide-line-soft`, hover `hover:bg-surface`
- Título de página: `text-lg font-semibold text-chalk` con texto `"Asistencia"`

---

## Archivos a modificar / crear

| Archivo | Cambio |
|---|---|
| `app/(dashboard)/attendance/page.tsx` | Crear — Server Component con query + tabla |
| `components/Sidebar.tsx` | Agregar pestaña `{ href: "/attendance", label: "Asistencia" }` |

---

## Restricciones

- No se crean API routes — todo es Server Component + Prisma directo.
- No se modifica el schema de Prisma — la asistencia se calcula en runtime.
- No se agrega ninguna columna de "estado" ni semáforo de color — se mantiene simple (Opción B acordada).
- Tailwind v4: no usar `var()` dentro de `@theme`. No se agregan tokens nuevos; se reusan `mint`, `line-soft`, `surface`, `chalk`, `chalk-muted`, `chalk-secondary`, `line`.
