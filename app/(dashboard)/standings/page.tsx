import { getStandings } from "@/lib/queries/standings";

export default async function StandingsPage() {
  const rows = await getStandings();

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-chalk">Posiciones</h1>

      {rows.length === 0 ? (
        <p className="text-sm text-chalk-muted">No hay partidos registrados aún.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface">
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-chalk-muted">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-chalk-muted">
                  Jugador
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-chalk-muted">
                  PJ
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-chalk-muted">
                  Sets
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {rows.map((row, i) => (
                <tr key={i} className="transition-colors hover:bg-surface">
                  <td className="px-4 py-3 text-center font-mono text-chalk-muted">{row.position}</td>
                  <td className="px-4 py-3 font-medium text-chalk">
                    {row.position <= 3 && (
                      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-mint" />
                    )}
                    {row.name}
                  </td>
                  <td className="px-4 py-3 text-center font-mono tabular-nums text-chalk-secondary">
                    {row.matches}
                  </td>
                  <td className="px-4 py-3 text-center font-mono tabular-nums font-semibold text-chalk">
                    {row.sets}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
