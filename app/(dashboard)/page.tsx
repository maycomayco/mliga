import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [totalMatches, lastMatch, matches, users] = await Promise.all([
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
    prisma.match.findMany({
      select: {
        team1player1Id: true,
        team1player2Id: true,
        team2player1Id: true,
        team2player2Id: true,
        set1team1: true,
        set1team2: true,
        set2team1: true,
        set2team2: true,
        set3team1: true,
        set3team2: true,
      },
    }),
    prisma.user.findMany({ select: { id: true, name: true } }),
  ]);

  // Build standings
  const playerMap = new Map<string, { name: string; sets: number }>();
  for (const user of users) {
    playerMap.set(user.id, { name: user.name ?? "(sin nombre)", sets: 0 });
  }
  for (const m of matches) {
    let t1 = 0, t2 = 0;
    if (m.set1team1 > m.set1team2) t1++; else if (m.set1team2 > m.set1team1) t2++;
    if (m.set2team1 > m.set2team2) t1++; else if (m.set2team2 > m.set2team1) t2++;
    if (m.set3team1 != null && m.set3team2 != null) {
      if (m.set3team1 > m.set3team2) t1++; else if (m.set3team2 > m.set3team1) t2++;
    }
    for (const id of [m.team1player1Id, m.team1player2Id]) {
      const p = playerMap.get(id); if (p) p.sets += t1;
    }
    for (const id of [m.team2player1Id, m.team2player2Id]) {
      const p = playerMap.get(id); if (p) p.sets += t2;
    }
  }
  const topStandings = Array.from(playerMap.values())
    .filter((p) => p.sets > 0)
    .sort((a, b) => b.sets - a.sets)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-chalk">Inicio</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Total matches */}
        <div className="rounded-lg border border-line bg-surface p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-chalk-muted">
            Partidos jugados
          </p>
          <p className="mt-2 font-mono text-4xl font-bold tabular-nums text-chalk">
            {totalMatches}
          </p>
        </div>

        {/* Last match scoreboard */}
        <div className="rounded-lg border border-line bg-surface p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-chalk-muted">
            Último partido
          </p>
          {lastMatch ? (
            <div className="mt-3 space-y-1">
              <ScoreRow
                name={`${lastMatch.team1player1.name} / ${lastMatch.team1player2.name}`}
                scores={[lastMatch.set1team1, lastMatch.set2team1, lastMatch.set3team1]}
                won={lastMatch.winnerTeam === 1}
              />
              <ScoreRow
                name={`${lastMatch.team2player1.name} / ${lastMatch.team2player2.name}`}
                scores={[lastMatch.set1team2, lastMatch.set2team2, lastMatch.set3team2]}
                won={lastMatch.winnerTeam === 2}
              />
              <p className="pt-1 text-xs text-chalk-muted">
                {new Date(lastMatch.date).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-chalk-muted">Sin partidos aún</p>
          )}
        </div>
      </div>

      {/* Top standings */}
      <div className="rounded-lg border border-line bg-surface p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-chalk-muted">
            Posiciones
          </p>
          <Link href="/standings" className="text-xs text-mint hover:underline">
            Ver todas
          </Link>
        </div>
        {topStandings.length > 0 ? (
          <div className="mt-3 space-y-2">
            {topStandings.map((player, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center font-mono text-xs text-chalk-muted">{i + 1}</span>
                  {i < 3 && <span className="inline-block h-2 w-2 rounded-full bg-mint" />}
                  <span className="text-sm font-medium text-chalk">{player.name}</span>
                </div>
                <span className="font-mono text-sm font-semibold tabular-nums text-chalk">
                  {player.sets}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-chalk-muted">Sin partidos aún</p>
        )}
      </div>
    </div>
  );
}

function ScoreRow({
  name,
  scores,
  won,
}: {
  name: string;
  scores: [number, number, number | null];
  won: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`truncate text-sm font-medium ${won ? "text-mint" : "text-chalk-secondary"}`}>
        {name}
      </span>
      <div className="flex gap-3 font-mono text-sm tabular-nums">
        {scores.map((s, i) =>
          s !== null ? (
            <span key={i} className={won ? "text-chalk" : "text-chalk-muted"}>
              {s}
            </span>
          ) : null
        )}
      </div>
    </div>
  );
}
