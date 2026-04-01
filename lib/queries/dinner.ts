import { prisma } from "@/lib/prisma";

export async function getDinners() {
  return prisma.argentinianDinner.findMany({
    include: {
      attendees: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { date: "desc" },
  });
}

export async function getDinner(id: string) {
  return prisma.argentinianDinner.findUnique({
    where: { id },
    include: {
      attendees: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export async function getPlayers() {
  return prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}