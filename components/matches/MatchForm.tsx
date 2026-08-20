"use client";

import { useActionState, useState } from "react";
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
    isDraw?: boolean;
  };
};

const initialState: ActionState = {};

const inputClass =
  "w-full rounded-lg border border-line bg-pitch px-3 py-2 text-sm text-chalk placeholder:text-chalk-muted focus:border-mint focus:outline-none transition-colors";
const selectClass =
  "w-full rounded-lg border border-line bg-pitch px-3 py-2 text-sm text-chalk focus:border-mint focus:outline-none transition-colors";
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wider text-chalk-muted";

export default function MatchForm({ action, players, defaultValues }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [isDraw, setIsDraw] = useState(defaultValues?.isDraw ?? false);

  function fieldError(field: string) {
    const errs = state.errors?.[field];
    if (!errs?.length) return null;
    return <p className="mt-1.5 text-xs text-rose">{errs[0]}</p>;
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
        <div className="space-y-3 rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-chalk-secondary">
            Equipo 1
          </p>
          <div>
            <label htmlFor="team1player1Id" className={labelClass}>Jugador 1</label>
            <select id="team1player1Id" name="team1player1Id" required defaultValue={defaultValues?.team1player1Id ?? ""} className={selectClass}>
              <option value="">Seleccionar</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name ?? p.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="team1player2Id" className={labelClass}>Jugador 2</label>
            <select id="team1player2Id" name="team1player2Id" required defaultValue={defaultValues?.team1player2Id ?? ""} className={selectClass}>
              <option value="">Seleccionar</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name ?? p.id}</option>
              ))}
            </select>
          </div>
          {fieldError("team1player1Id")}
        </div>

        {/* Team 2 */}
        <div className="space-y-3 rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-chalk-secondary">
            Equipo 2
          </p>
          <div>
            <label htmlFor="team2player1Id" className={labelClass}>Jugador 1</label>
            <select id="team2player1Id" name="team2player1Id" required defaultValue={defaultValues?.team2player1Id ?? ""} className={selectClass}>
              <option value="">Seleccionar</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name ?? p.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="team2player2Id" className={labelClass}>Jugador 2</label>
            <select id="team2player2Id" name="team2player2Id" required defaultValue={defaultValues?.team2player2Id ?? ""} className={selectClass}>
              <option value="">Seleccionar</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name ?? p.id}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="space-y-4">
        <ScoreInput label="Set 1" name1="set1team1" name2="set1team2" default1={defaultValues?.set1team1} default2={defaultValues?.set1team2} />
        <ScoreInput label="Set 2" name1="set2team1" name2="set2team2" default1={defaultValues?.set2team1} default2={defaultValues?.set2team2} />
        {!isDraw && (
          <ScoreInput label="Set 3" hint="solo si sets 1-1" name1="set3team1" name2="set3team2" default1={defaultValues?.set3team1} default2={defaultValues?.set3team2} />
        )}
      </div>

      {/* Empate */}
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          name="isDraw"
          checked={isDraw}
          onChange={(e) => setIsDraw(e.target.checked)}
          className="h-4 w-4 rounded border-line accent-amber"
        />
        <span className="text-sm text-chalk-secondary">Concluir en empate</span>
        {fieldError("isDraw")}
      </label>

      {/* General error */}
      {state.message && <p className="text-sm text-rose">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-mint px-4 py-2.5 text-sm font-semibold text-pitch transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}

function ScoreInput({
  label,
  hint,
  name1,
  name2,
  default1,
  default2,
}: {
  label: string;
  hint?: string;
  name1: string;
  name2: string;
  default1?: number | null;
  default2?: number | null;
}) {
  return (
    <div>
      <p className={labelClass}>
        {label}
        {hint && <span className="ml-1.5 normal-case tracking-normal text-chalk-muted">({hint})</span>}
      </p>
      <div className="flex items-center gap-3">
        <input
          name={name1}
          type="number"
          min={0}
          defaultValue={default1 ?? 0}
          className={`${inputClass} w-20 text-center font-mono tabular-nums`}
        />
        <span className="text-chalk-muted">–</span>
        <input
          name={name2}
          type="number"
          min={0}
          defaultValue={default2 ?? 0}
          className={`${inputClass} w-20 text-center font-mono tabular-nums`}
        />
      </div>
    </div>
  );
}
