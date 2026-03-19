# M-Liga Design System

## Direction

Padel league tracker for 5 friends. Mobile-first, post-match at the bar. Relaxed but competitive.

**Feel:** Club de pádel nocturno — dark, calm, with pastel accents that pop without being loud. Scoreboard aesthetic.

**Signature:** Match cards as scoreboards — team names left, set scores right in monospace tabular-nums. Winner row highlighted in mint.

## Palette

Pastels on dark background. Named after the padel court world.

| Token | HSL | Purpose |
|-------|-----|---------|
| `--pitch` | 240 10% 5.5% | Canvas/body background |
| `--surface` | 160 6% 9% | Cards, nav bar |
| `--surface-raised` | 160 6% 12% | Elevated elements, badges |
| `--surface-hover` | 160 6% 15% | Hover states |
| `--line` | 160 10% 40% @ 25% opacity | Standard borders |
| `--line-soft` | 160 10% 25% @ 15% opacity | Subtle separators |
| `--chalk` | 0 0% 93% | Primary text |
| `--chalk-secondary` | 215 20% 65% | Secondary text |
| `--chalk-muted` | 215 12% 42% | Labels, metadata, disabled |
| `--mint` | 162 45% 62% | Accent — buttons, winners, active tabs |
| `--mint-dimmed` | 162 30% 18% | Accent backgrounds (badges, ghost buttons) |
| `--rose` | 350 55% 68% | Destructive actions |
| `--rose-dimmed` | 350 30% 16% | Destructive backgrounds |
| `--amber` | 38 55% 62% | Warnings |

## Depth Strategy

**Borders-only.** No shadows. Low opacity rgba borders (`line` and `line-soft`) define structure. Dark mode makes shadows invisible anyway.

## Typography

- **Font:** Geist Sans (body), Geist Mono (scores, monospace data)
- **Labels:** xs, uppercase, tracking-wider, chalk-muted
- **Body:** sm, chalk or chalk-secondary
- **Headings:** lg, font-semibold, chalk
- **Scores:** sm, font-mono, tabular-nums
- **Brand:** font-mono, sm, bold, tracking-tight, text-mint

## Spacing

Base unit: 4px. Scale via Tailwind: 1 (4px), 1.5 (6px), 2 (8px), 3 (12px), 4 (16px), 5 (20px), 6 (24px).

- Card padding: p-4 to p-5
- Section gap: space-y-6
- Inner card gap: space-y-3

## Navigation

Top horizontal tabs (not sidebar). `M-LIGA` brand left, tabs right. Active tab has mint underline indicator. Max-width 3xl centered.

## Component Patterns

### Scoreboard Card (matches)
- Border `border-line`, bg `surface`, rounded-lg
- Two rows: team 1 and team 2
- Each row: truncated team name (left) + monospace set scores (right, gap-4)
- Winner row: text-mint for name, text-chalk for scores
- Loser row: text-chalk-secondary for name, text-chalk-muted for scores
- Footer: border-t border-line-soft, date left, actions right

### Stat Card (dashboard)
- Same surface treatment as scoreboard
- Label: xs uppercase tracking-wider text-chalk-muted
- Value: font-mono text-4xl font-bold tabular-nums

### Data Table (users)
- Rounded-lg border, no outer bg
- Header: bg-surface, xs uppercase tracking-wider text-chalk-muted
- Rows: divide-y divide-line-soft, hover:bg-surface
- Badges: rounded-full, px-2.5, bg-mint-dimmed/text-mint or bg-surface-raised/text-chalk-muted

### Form Controls
- Inputs: bg-pitch (inset), border-line, focus:border-mint
- Selects: same treatment as inputs
- Team groups: rounded-lg border border-line bg-surface p-4
- Score inputs: w-20 text-center font-mono tabular-nums
- Submit button: bg-mint text-pitch font-semibold, hover:opacity-90
- Errors: text-xs text-rose

### Ghost Button (primary action)
- bg-mint-dimmed text-mint, hover:bg-surface-hover
- Used for "Nuevo partido" and similar CTAs
