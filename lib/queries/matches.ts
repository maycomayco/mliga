import { prisma } from "@/lib/prisma";
import { matchWithPlayersArgs, MatchWithPlayers } from "@/lib/schemas/match";

export async function getMatches(): Promise<MatchWithPlayers[]> {
  return prisma.match.findMany({
    ...matchWithPlayersArgs,
    orderBy: { date: "desc" },
  });
}

export async function getMatch(id: string) {
  return prisma.match.findUnique({ where: { id } });
}

export async function getPlayers() {
  return prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
