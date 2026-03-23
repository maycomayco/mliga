import { prisma } from "@/lib/prisma";

export default async function StandingsPage() {
  const [matches, users] = await Promise.all([
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
    prisma.user.findMany({
      select: { id: true, name: true },
    }),
  ]);

  const playerMap = new Map<string, { name: string; sets: number; matches: number }>();

  for (const user of users) {
    playerMap.set(user.id, { name: user.name ?? "(sin nombre)", sets: 0, matches: 0 });
  }

  for (const m of matches) {
    const team1 = [m.team1player1Id, m.team1player2Id];
    const team2 = [m.team2player1Id, m.team2player2Id];
    const allPlayers = [...team1, ...team2];

    for (const id of allPlayers) {
      const p = playerMap.get(id);
      if (p) p.matches++;
    }

    // Count sets won by each team
    let team1Sets = 0;
    let team2Sets = 0;

    if (m.set1team1 > m.set1team2) team1Sets++;
    else if (m.set1team2 > m.set1team1) team2Sets++;

    if (m.set2team1 > m.set2team2) team1Sets++;
    else if (m.set2team2 > m.set2team1) team2Sets++;

    if (m.set3team1 != null && m.set3team2 != null) {
      if (m.set3team1 > m.set3team2) team1Sets++;
      else if (m.set3team2 > m.set3team1) team2Sets++;
    }

    for (const id of team1) {
      const p = playerMap.get(id);
      if (p) p.sets += team1Sets;
    }
    for (const id of team2) {
      const p = playerMap.get(id);
      if (p) p.sets += team2Sets;
    }
  }

  const standings = Array.from(playerMap.values())
    .filter((p) => p.matches > 0)
    .sort((a, b) => b.sets - a.sets);

  // Assign positions (shared if tied)
  let position = 1;
  const rows = standings.map((player, i) => {
    if (i > 0 && player.sets < standings[i - 1].sets) {
      position = i + 1;
    }
    return { ...player, position };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-chalk">Posiciones</h1>

      {rows.length === 0 ? (
        <p className="text-sm text-chalk-muted">No hay partidos registrados aún.</p>
      ) : (
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
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-chalk-muted">
                  Sets
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {rows.map((row, i) => (
                <tr key={i} className="transition-colors hover:bg-surface">
                  <td className="px-4 py-3 text-center font-mono text-chalk-muted">{row.position}</td>
                  <td className="px-4 py-3 font-medium text-chalk">
                    {row.position <= 3 && (
                      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-mint" />
                    )}
                    {row.name}
                  </td>
                  <td className="px-4 py-3 text-center font-mono tabular-nums text-chalk-secondary">
                    {row.matches}
                  </td>
                  <td className="px-4 py-3 text-center font-mono tabular-nums font-semibold text-chalk">
                    {row.sets}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
