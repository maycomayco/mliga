import { prisma } from "@/lib/prisma";

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, username: true, role: true },
  });
}
