"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/(dashboard)/matches/actions";

type Player = { id: string; name: string | null };

type Props = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  players: Player[];
  defaultValues?: {
    date?: string;
    team1player1Id?: string;
    team1player2Id?: string;
    team2player1Id?: string;
    team2player2Id?: string;
    set1team1?: number;
    set1team2?: number;
    set2team1?: number;
    set2team2?: number;
    set3team1?: number | null;
    set3team2?: number | null;
  };
};

const initialState: ActionState = {};

const inputClass =
  "w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none";
const selectClass =
  "w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none";
const labelClass = "mb-1 block text-xs font-medium text-zinc-400";

export default function MatchForm({ action, players, defaultValues }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);

  function fieldError(field: string) {
    const errs = state.errors?.[field];
    if (!errs?.length) return null;
    return <p className="mt-1 text-xs text-red-400">{errs[0]}</p>;
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Date */}
      <div>
        <label htmlFor="date" className={labelClass}>Fecha</label>
        <input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={defaultValues?.date}
          className={inputClass}
        />
        {fieldError("date")}
      </div>

      {/* Teams */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Team 1 */}
        <div className="space-y-3 rounded-lg border border-zinc-800 p-4">
          <p className="text-sm font-semibold text-white">Equipo 1</p>
          <div>
            <label htmlFor="team1player1Id" className={labelClass}>Jugador 1</label>
            <select id="team1player1Id" name="team1player1Id" required defaultValue={defaultValues?.team1player1Id ?? ""} className={selectClass}>
              <option value="">Seleccionar jugador</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name ?? p.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="team1player2Id" className={labelClass}>Jugador 2</label>
            <select id="team1player2Id" name="team1player2Id" required defaultValue={defaultValues?.team1player2Id ?? ""} className={selectClass}>
              <option value="">Seleccionar jugador</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name ?? p.id}</option>
              ))}
            </select>
          </div>
          {fieldError("team1player1Id")}
        </div>

        {/* Team 2 */}
        <div className="space-y-3 rounded-lg border border-zinc-800 p-4">
          <p className="text-sm font-semibold text-white">Equipo 2</p>
          <div>
            <label htmlFor="team2player1Id" className={labelClass}>Jugador 1</label>
            <select id="team2player1Id" name="team2player1Id" required defaultValue={defaultValues?.team2player1Id ?? ""} className={selectClass}>
              <option value="">Seleccionar jugador</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name ?? p.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="team2player2Id" className={labelClass}>Jugador 2</label>
            <select id="team2player2Id" name="team2player2Id" required defaultValue={defaultValues?.team2player2Id ?? ""} className={selectClass}>
              <option value="">Seleccionar jugador</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name ?? p.id}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="space-y-4">
        {/* Set 1 */}
        <div>
          <p className={labelClass}>Set 1</p>
          <div className="flex items-center gap-3">
            <input name="set1team1" type="number" min={0} required defaultValue={defaultValues?.set1team1 ?? 0} className={`${inputClass} w-20 text-center`} />
            <span className="text-zinc-500">–</span>
            <input name="set1team2" type="number" min={0} required defaultValue={defaultValues?.set1team2 ?? 0} className={`${inputClass} w-20 text-center`} />
          </div>
          {fieldError("set1team1")}
        </div>

        {/* Set 2 */}
        <div>
          <p className={labelClass}>Set 2</p>
          <div className="flex items-center gap-3">
            <input name="set2team1" type="number" min={0} required defaultValue={defaultValues?.set2team1 ?? 0} className={`${inputClass} w-20 text-center`} />
            <span className="text-zinc-500">–</span>
            <input name="set2team2" type="number" min={0} required defaultValue={defaultValues?.set2team2 ?? 0} className={`${inputClass} w-20 text-center`} />
          </div>
        </div>

        {/* Set 3 */}
        <div>
          <p className={labelClass}>Set 3 <span className="text-zinc-600">(solo si sets 1-1)</span></p>
          <div className="flex items-center gap-3">
            <input name="set3team1" type="number" min={0} defaultValue={defaultValues?.set3team1 ?? 0} className={`${inputClass} w-20 text-center`} />
            <span className="text-zinc-500">–</span>
            <input name="set3team2" type="number" min={0} defaultValue={defaultValues?.set3team2 ?? 0} className={`${inputClass} w-20 text-center`} />
          </div>
        </div>
      </div>

      {/* General error */}
      {state.message && <p className="text-sm text-red-400">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar partido"}
      </button>
    </form>
  );
}
