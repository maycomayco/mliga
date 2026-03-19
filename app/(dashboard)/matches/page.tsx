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
