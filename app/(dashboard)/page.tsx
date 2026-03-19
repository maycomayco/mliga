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
