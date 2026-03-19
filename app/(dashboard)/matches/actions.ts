"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { matchSchema, calculateWinnerTeam } from "@/lib/schemas/match";

export type ActionState = {
  errors?: Record<string, string[]>;
  message?: string;
};

function parseMatchFormData(formData: FormData) {
  // Use explicit null check so "0" is preserved (not treated as falsy)
  const set3team1Raw = formData.get("set3team1");
  const set3team2Raw = formData.get("set3team2");

  return {
    date: formData.get("date"),
    team1player1Id: formData.get("team1player1Id"),
    team1player2Id: formData.get("team1player2Id"),
    team2player1Id: formData.get("team2player1Id"),
    team2player2Id: formData.get("team2player2Id"),
    set1team1: formData.get("set1team1"),
    set1team2: formData.get("set1team2"),
    set2team1: formData.get("set2team1"),
    set2team2: formData.get("set2team2"),
    set3team1: set3team1Raw !== null ? set3team1Raw : undefined,
    set3team2: set3team2Raw !== null ? set3team2Raw : undefined,
  };
}

export async function createMatch(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const result = matchSchema.safeParse(parseMatchFormData(formData));

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const data = result.data;
  const winnerTeam = calculateWinnerTeam(data);

  await prisma.match.create({
    data: {
      date: new Date(data.date),
      team1player1Id: data.team1player1Id,
      team1player2Id: data.team1player2Id,
      team2player1Id: data.team2player1Id,
      team2player2Id: data.team2player2Id,
      set1team1: data.set1team1,
      set1team2: data.set1team2,
      set2team1: data.set2team1,
      set2team2: data.set2team2,
      set3team1: data.set3team1 ?? null,
      set3team2: data.set3team2 ?? null,
      winnerTeam,
    },
  });

  revalidatePath("/");
  revalidatePath("/matches");
  redirect("/matches");
}

export async function updateMatch(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const result = matchSchema.safeParse(parseMatchFormData(formData));

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const data = result.data;
  const winnerTeam = calculateWinnerTeam(data);

  await prisma.match.update({
    where: { id },
    data: {
      date: new Date(data.date),
      team1player1Id: data.team1player1Id,
      team1player2Id: data.team1player2Id,
      team2player1Id: data.team2player1Id,
      team2player2Id: data.team2player2Id,
      set1team1: data.set1team1,
      set1team2: data.set1team2,
      set2team1: data.set2team1,
      set2team2: data.set2team2,
      set3team1: data.set3team1 ?? null,
      set3team2: data.set3team2 ?? null,
      winnerTeam,
    },
  });

  revalidatePath("/");
  revalidatePath("/matches");
  redirect("/matches");
}

export async function deleteMatch(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  await prisma.match.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/matches");
  redirect("/matches");
}
