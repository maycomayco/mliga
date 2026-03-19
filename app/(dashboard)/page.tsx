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
