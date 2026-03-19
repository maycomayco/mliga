import { prisma } from "@/lib/prisma";

export default async function Home() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="p-8">
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="flex gap-4">
            <span className="font-medium">{user.name ?? "(sin nombre)"}</span>
            <span className="text-zinc-500">{user.email}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
