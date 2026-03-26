import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getMatches } from "@/lib/queries/matches";
import { MatchWithPlayers } from "@/lib/schemas/match";
import DeleteMatchButton from "@/components/matches/DeleteMatchButton";

export default async function MatchesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const matches = await getMatches();

  const isAdmin = session?.user.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-chalk">Partidos</h1>
        {isAdmin && (
          <Link
            href="/matches/new"
            className="rounded-lg bg-mint-dimmed px-4 py-2 text-sm font-medium text-mint transition-colors hover:bg-surface-hover"
          >
            + Nuevo
          </Link>
        )}
      </div>

      {matches.length === 0 ? (
        <p className="py-12 text-center text-sm text-chalk-muted">
          No hay partidos registrados.
        </p>
      ) : (
        <div className="space-y-3">
          {matches.map((match: MatchWithPlayers) => {
            const hasSet3 = match.set3team1 !== null && match.set3team2 !== null;

            return (
              <div
                key={match.id}
                className="rounded-lg border border-line bg-surface"
              >
                {/* Scoreboard */}
                <div className="px-4 pt-4 pb-3">
                  {/* Team 1 */}
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`min-w-0 flex-1 truncate text-sm font-medium ${
                        match.winnerTeam === 1 ? "text-mint" : "text-chalk-secondary"
                      }`}
                    >
                      {match.team1player1.name} / {match.team1player2.name}
                    </span>
                    <div className="flex gap-4 font-mono text-sm tabular-nums">
                      <span className={match.winnerTeam === 1 ? "text-chalk" : "text-chalk-muted"}>
                        {match.set1team1}
                      </span>
                      <span className={match.winnerTeam === 1 ? "text-chalk" : "text-chalk-muted"}>
                        {match.set2team1}
                      </span>
                      {hasSet3 && (
                        <span className={match.winnerTeam === 1 ? "text-chalk" : "text-chalk-muted"}>
                          {match.set3team1}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Team 2 */}
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <span
                      className={`min-w-0 flex-1 truncate text-sm font-medium ${
                        match.winnerTeam === 2 ? "text-mint" : "text-chalk-secondary"
                      }`}
                    >
                      {match.team2player1.name} / {match.team2player2.name}
                    </span>
                    <div className="flex gap-4 font-mono text-sm tabular-nums">
                      <span className={match.winnerTeam === 2 ? "text-chalk" : "text-chalk-muted"}>
                        {match.set1team2}
                      </span>
                      <span className={match.winnerTeam === 2 ? "text-chalk" : "text-chalk-muted"}>
                        {match.set2team2}
                      </span>
                      {hasSet3 && (
                        <span className={match.winnerTeam === 2 ? "text-chalk" : "text-chalk-muted"}>
                          {match.set3team2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-line-soft px-4 py-2">
                  <span className="text-xs text-chalk-muted">
                    {new Date(match.date).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {isAdmin && (
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/matches/${match.id}/edit`}
                        className="text-xs text-chalk-muted transition-colors hover:text-chalk-secondary"
                      >
                        Editar
                      </Link>
                      <DeleteMatchButton id={match.id} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
