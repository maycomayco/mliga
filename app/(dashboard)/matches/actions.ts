"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { matchSchema, calculateWinnerTeam } from "@/lib/schemas/match";
import { auth } from "@/lib/auth";
import { logSecurityEvent } from "@/lib/security/audit";

export type ActionState = {
  errors?: Record<string, string[]>;
  message?: string;
};

/**
 * Validates that the current user is an admin. Use in Server Actions.
 * Logs unauthorized attempts to the audit trail.
 * @returns An error state if not admin, null if authorized.
 */
async function ensureAdminOrReturnState(): Promise<ActionState | null> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "ADMIN") {
    await logSecurityEvent({
      event: "admin_forbidden",
      userId: session?.user?.id ?? null,
      metadata: { action: "matches:mutate" },
    });
    return { message: "No tenes permisos para esta accion." };
  }

  return null;
}

/**
 * Validates that the current user is an admin. Use in components that redirect.
 * If not authorized, redirects to home without an error message.
 * @throws Redirects to "/" if not admin.
 */
async function ensureAdminOrRedirect(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }
}

function parseMatchFormData(formData: FormData) {
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
    set3team1: formData.get("set3team1"),
    set3team2: formData.get("set3team2"),
  };
}

function set3Needed(data: { set1team1: number; set1team2: number; set2team1: number; set2team2: number }) {
  const team1WonSet1 = data.set1team1 > data.set1team2;
  const team1WonSet2 = data.set2team1 > data.set2team2;
  return team1WonSet1 !== team1WonSet2;
}

export async function createMatch(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const forbidden = await ensureAdminOrReturnState();
  if (forbidden) return forbidden;

  const result = matchSchema.safeParse(parseMatchFormData(formData));

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const data = result.data;
  const winnerTeam = calculateWinnerTeam(data);
  const saveSet3 = set3Needed(data);

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
      set3team1: saveSet3 ? data.set3team1 : null,
      set3team2: saveSet3 ? data.set3team2 : null,
      winnerTeam,
    },
  });

  await logSecurityEvent({
    event: "admin_action",
    userId: (await auth.api.getSession({ headers: await headers() }))?.user.id ?? null,
    metadata: { action: "match.create" },
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
  const forbidden = await ensureAdminOrReturnState();
  if (forbidden) return forbidden;

  const result = matchSchema.safeParse(parseMatchFormData(formData));

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const data = result.data;
  const winnerTeam = calculateWinnerTeam(data);
  const saveSet3 = set3Needed(data);

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
      set3team1: saveSet3 ? data.set3team1 : null,
      set3team2: saveSet3 ? data.set3team2 : null,
      winnerTeam,
    },
  });

  await logSecurityEvent({
    event: "admin_action",
    userId: (await auth.api.getSession({ headers: await headers() }))?.user.id ?? null,
    metadata: { action: "match.update", matchId: id },
  });

  revalidatePath("/");
  revalidatePath("/matches");
  redirect("/matches");
}

export async function deleteMatch(formData: FormData): Promise<void> {
  await ensureAdminOrRedirect();

  const id = formData.get("id") as string;
  await prisma.match.delete({ where: { id } });
  await logSecurityEvent({
    event: "admin_action",
    userId: (await auth.api.getSession({ headers: await headers() }))?.user.id ?? null,
    metadata: { action: "match.delete", matchId: id },
  });
  revalidatePath("/");
  revalidatePath("/matches");
  redirect("/matches");
}
