import { Prisma } from "@/prisma/generated/client";
import { z } from "zod";

export const matchSchema = z
  .object({
    date: z.string().min(1, "La fecha es requerida"),
    team1player1Id: z.string().min(1, "Requerido"),
    team1player2Id: z.string().min(1, "Requerido"),
    team2player1Id: z.string().min(1, "Requerido"),
    team2player2Id: z.string().min(1, "Requerido"),
    set1team1: z.coerce.number().int().min(0, "Mínimo 0"),
    set1team2: z.coerce.number().int().min(0, "Mínimo 0"),
    set2team1: z.coerce.number().int().min(0, "Mínimo 0"),
    set2team2: z.coerce.number().int().min(0, "Mínimo 0"),
    set3team1: z.coerce.number().int().min(0, "Mínimo 0"),
    set3team2: z.coerce.number().int().min(0, "Mínimo 0"),
    // isDraw: true indica partido concluido sin 3er set con resultado 1-1.
    // En ese caso winnerTeam se guarda como 0 (ver calculateWinnerTeam).
    isDraw: z.coerce.boolean().default(false),
  })
  .refine(
    (d) =>
      new Set([
        d.team1player1Id,
        d.team1player2Id,
        d.team2player1Id,
        d.team2player2Id,
      ]).size === 4,
    { message: "Los 4 jugadores deben ser distintos", path: ["team1player1Id"] }
  )
  .refine(
    (d) => {
      if (!d.isDraw) return true;
      // Para concluir en empate los sets deben estar 1-1
      const team1WonSet1 = d.set1team1 > d.set1team2;
      const team1WonSet2 = d.set2team1 > d.set2team2;
      return team1WonSet1 !== team1WonSet2;
    },
    { message: "Para concluir en empate, los sets deben estar 1 a 1", path: ["isDraw"] }
  );

export type MatchInput = z.infer<typeof matchSchema>;

export const matchWithPlayersArgs = {
  include: {
    team1player1: { select: { name: true } },
    team1player2: { select: { name: true } },
    team2player1: { select: { name: true } },
    team2player2: { select: { name: true } },
  },
} satisfies Prisma.MatchDefaultArgs;

export type MatchWithPlayers = Prisma.MatchGetPayload<
  typeof matchWithPlayersArgs
>;

export function calculateWinnerTeam(data: MatchInput): number {
  // winnerTeam = 0 significa empate: partido concluido sin 3er set, cada pareja ganó un set.
  // En standings cada equipo suma 1 set (los scores crudos ya lo reflejan).
  if (data.isDraw) return 0;

  let team1Sets = 0;
  let team2Sets = 0;

  if (data.set1team1 > data.set1team2) team1Sets++;
  else team2Sets++;

  if (data.set2team1 > data.set2team2) team1Sets++;
  else team2Sets++;

  // Solo contar set 3 si los primeros dos sets quedaron 1-1
  const set3Needed = team1Sets === 1 && team2Sets === 1;
  if (set3Needed) {
    if (data.set3team1 > data.set3team2) team1Sets++;
    else team2Sets++;
  }

  return team1Sets > team2Sets ? 1 : 2;
}
