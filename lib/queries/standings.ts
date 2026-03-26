import { prisma } from "@/lib/prisma";

export type StandingRow = {
  name: string;
  sets: number;
  matches: number;
  position: number;
};

export async function getStandings(): Promise<StandingRow[]> {
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
    prisma.user.findMany({ select: { id: true, name: true } }),
  ]);

  const playerMap = new Map<string, { name: string; sets: number; matches: number }>();

  for (const user of users) {
    playerMap.set(user.id, { name: user.name ?? "(sin nombre)", sets: 0, matches: 0 });
  }

  for (const m of matches) {
    const team1 = [m.team1player1Id, m.team1player2Id];
    const team2 = [m.team2player1Id, m.team2player2Id];

    for (const id of [...team1, ...team2]) {
      const p = playerMap.get(id);
      if (p) p.matches++;
    }

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

  const sorted = Array.from(playerMap.values())
    .filter((p) => p.matches > 0)
    .sort((a, b) => b.sets - a.sets);

  let position = 1;
  return sorted.map((player, i) => {
    if (i > 0 && player.sets < sorted[i - 1].sets) position = i + 1;
    return { ...player, position };
  });
}
