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
  );

export type MatchInput = z.infer<typeof matchSchema>;

export function calculateWinnerTeam(data: MatchInput): number {
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
