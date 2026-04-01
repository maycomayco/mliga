"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { dinnerSchema } from "@/lib/schemas/dinner";
import { auth } from "@/lib/auth";
import { logSecurityEvent } from "@/lib/security/audit";

export type ActionState = {
  errors?: Record<string, string[]>;
  message?: string;
};

async function ensureAdminOrReturnState(): Promise<ActionState | null> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "ADMIN") {
    await logSecurityEvent({
      event: "admin_forbidden",
      userId: session?.user?.id ?? null,
      metadata: { action: "dinners:mutate" },
    });
    return { message: "No tenes permisos para esta accion." };
  }

  return null;
}

async function ensureAdminOrRedirect(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }
}

function parseDinnerFormData(formData: FormData) {
  const attendeeIds = formData.getAll("attendeeIds");
  return {
    date: formData.get("date"),
    attendeeIds: attendeeIds as string[],
  };
}

export async function createDinner(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const forbidden = await ensureAdminOrReturnState();
  if (forbidden) return forbidden;

  const result = dinnerSchema.safeParse(parseDinnerFormData(formData));

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const data = result.data;

  await prisma.argentinianDinner.create({
    data: {
      date: new Date(data.date),
      attendees: {
        create: data.attendeeIds.map((userId) => ({ userId })),
      },
    },
  });

  await logSecurityEvent({
    event: "admin_action",
    userId: (await auth.api.getSession({ headers: await headers() }))?.user.id ?? null,
    metadata: { action: "dinner.create" },
  });

  revalidatePath("/");
  revalidatePath("/dinner");
  redirect("/dinner");
}

export async function updateDinner(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const forbidden = await ensureAdminOrReturnState();
  if (forbidden) return forbidden;

  const result = dinnerSchema.safeParse(parseDinnerFormData(formData));

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const data = result.data;

  await prisma.$transaction([
    prisma.dinnerAttendance.deleteMany({ where: { dinnerId: id } }),
    prisma.argentinianDinner.update({
      where: { id },
      data: {
        date: new Date(data.date),
        attendees: {
          create: data.attendeeIds.map((userId) => ({ userId })),
        },
      },
    }),
  ]);

  await logSecurityEvent({
    event: "admin_action",
    userId: (await auth.api.getSession({ headers: await headers() }))?.user.id ?? null,
    metadata: { action: "dinner.update", dinnerId: id },
  });

  revalidatePath("/");
  revalidatePath("/dinner");
  redirect("/dinner");
}

export async function deleteDinner(formData: FormData): Promise<void> {
  await ensureAdminOrRedirect();

  const id = formData.get("id") as string;
  await prisma.argentinianDinner.delete({ where: { id } });
  await logSecurityEvent({
    event: "admin_action",
    userId: (await auth.api.getSession({ headers: await headers() }))?.user.id ?? null,
    metadata: { action: "dinner.delete", dinnerId: id },
  });
  revalidatePath("/");
  revalidatePath("/dinner");
  redirect("/dinner");
}