import { prisma } from "@/lib/prisma";

export type AttendanceRow = {
  id: string;
  name: string;
  matchesPlayed: number;
  lastMatchDate: Date | null;
};

export async function getAttendance(): Promise<AttendanceRow[]> {
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
    prisma.user.findMany({ select: { id: true, name: true } }),
  ]);

  const playerMap = new Map<string, AttendanceRow>();

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

  return Array.from(playerMap.values()).sort((a, b) => a.matchesPlayed - b.matchesPlayed);
}
