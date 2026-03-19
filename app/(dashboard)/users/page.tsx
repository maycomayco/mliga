import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, username: true, role: true },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-white">Usuarios</h1>
      <div className="overflow-hidden rounded-lg border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-300">Nombre</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-300">Email</th>
              <th className="hidden px-4 py-3 text-left font-medium text-zinc-300 sm:table-cell">Username</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-300">Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users.map((user) => (
              <tr key={user.id} className="bg-zinc-900">
                <td className="px-4 py-3 font-medium text-white">
                  {user.name ?? "(sin nombre)"}
                </td>
                <td className="px-4 py-3 text-zinc-400">{user.email}</td>
                <td className="hidden px-4 py-3 text-zinc-400 sm:table-cell">
                  {user.username}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      user.role === "ADMIN"
                        ? "bg-violet-900 text-violet-300"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
