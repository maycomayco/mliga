import { prisma } from "@/lib/prisma";

export default async function AttendancePage() {
  const [matches, users] = await Promise.all([
    prisma.match.findMany({
      select: {
        team1player1Id: true,
        team1player2Id: true,
        team2player1Id: true,
        team2player2Id: true,
        date: true,
      },
    }),
    prisma.user.findMany({
      select: { id: true, name: true },
    }),
  ]);

  if (users.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold text-chalk">Asistencia</h1>
        <p className="text-sm text-chalk-muted">No hay jugadores registrados aún.</p>
      </div>
    );
  }

  const playerMap = new Map<
    string,
    { id: string; name: string; matchesPlayed: number; lastMatchDate: Date | null }
  >();

  for (const user of users) {
    playerMap.set(user.id, {
      id: user.id,
      name: user.name ?? "(sin nombre)",
      matchesPlayed: 0,
      lastMatchDate: null,
    });
  }

  for (const m of matches) {
    const ids = [m.team1player1Id, m.team1player2Id, m.team2player1Id, m.team2player2Id];
    for (const id of ids) {
      const p = playerMap.get(id);
      if (!p) continue;
      p.matchesPlayed++;
      if (p.lastMatchDate === null || m.date > p.lastMatchDate) {
        p.lastMatchDate = m.date;
      }
    }
  }

  const rows = Array.from(playerMap.values()).sort(
    (a, b) => a.matchesPlayed - b.matchesPlayed
  );

  const maxMatchesPlayed = Math.max(0, ...rows.map((r) => r.matchesPlayed));

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-chalk">Asistencia</h1>

      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface">
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-chalk-muted">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-chalk-muted">
                Jugador
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-chalk-muted">
                PJ
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-chalk-muted">
                Asistencia
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-chalk-muted">
                Último partido
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {rows.map((row, i) => {
              const pct =
                maxMatchesPlayed === 0
                  ? 0
                  : Math.round((row.matchesPlayed / maxMatchesPlayed) * 100);
              const lastDate = row.lastMatchDate
                ? row.lastMatchDate.toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—";
              return (
                <tr key={row.id} className="transition-colors hover:bg-surface">
                  <td className="px-4 py-3 text-center font-mono text-chalk-muted">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-chalk">{row.name}</td>
                  <td className="px-4 py-3 text-center font-mono tabular-nums text-chalk-secondary">
                    {row.matchesPlayed}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-line-soft">
                        <div
                          className="h-full rounded-full bg-mint"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-chalk-muted">
                        {pct}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm tabular-nums text-chalk-secondary">
                    {lastDate}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
