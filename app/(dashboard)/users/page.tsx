import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.role !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, username: true, role: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-chalk">Jugadores</h1>

      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-chalk-muted">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-chalk-muted">
                Email
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-chalk-muted sm:table-cell">
                Username
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-chalk-muted">
                Rol
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {users.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-surface">
                <td className="px-4 py-3 font-medium text-chalk">
                  {user.name ?? "(sin nombre)"}
                </td>
                <td className="px-4 py-3 text-chalk-secondary">{user.email}</td>
                <td className="hidden px-4 py-3 font-mono text-xs text-chalk-muted sm:table-cell">
                  {user.username}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === "ADMIN"
                        ? "bg-mint-dimmed text-mint"
                        : "bg-surface-raised text-chalk-muted"
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
