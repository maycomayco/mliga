import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDinners } from "@/lib/queries/dinner";
import { DinnerWithAttendees } from "@/lib/schemas/dinner";
import DeleteDinnerButton from "@/components/dinners/DeleteDinnerButton";

export default async function DinnersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const dinners = await getDinners();

  const isAdmin = session?.user.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-chalk">Asados</h1>
        {isAdmin && (
          <Link
            href="/dinner/new"
            className="rounded-lg bg-mint-dimmed px-4 py-2 text-sm font-medium text-mint transition-colors hover:bg-surface-hover"
          >
            Agregar
          </Link>
        )}
      </div>

      {dinners.length === 0 ? (
        <p className="py-12 text-center text-sm text-chalk-muted">
          No hay comidas registradas.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-chalk-muted">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-chalk-muted">
                  Asistentes
                </th>
                {isAdmin && (
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-chalk-muted">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {dinners.map((dinner: DinnerWithAttendees) => (
                <tr key={dinner.id} className="transition-colors hover:bg-surface">
                  <td className="px-4 py-3">
                    <span className="font-mono text-chalk-secondary">
                      {new Date(dinner.date).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {dinner.attendees.map((a) => (
                        <span
                          key={a.user.id}
                          className="inline-flex rounded bg-surface-raised px-2 py-0.5 text-xs text-chalk-secondary"
                        >
                          {a.user.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/dinner/${dinner.id}/edit`}
                          className="text-xs text-chalk-muted transition-colors hover:text-chalk-secondary"
                        >
                          Editar
                        </Link>
                        <DeleteDinnerButton id={dinner.id} />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}