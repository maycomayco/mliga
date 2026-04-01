"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/(dashboard)/dinner/actions";

type Player = { id: string; name: string | null };

type Props = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  players: Player[];
  defaultValues?: {
    date?: string;
    attendeeIds?: string[];
  };
};

const initialState: ActionState = {};

const inputClass =
  "w-full rounded-lg border border-line bg-pitch px-3 py-2 text-sm text-chalk placeholder:text-chalk-muted focus:border-mint focus:outline-none transition-colors";
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wider text-chalk-muted";

export default function DinnerForm({ action, players, defaultValues }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);

  function fieldError(field: string) {
    const errs = state.errors?.[field];
    if (!errs?.length) return null;
    return <p className="mt-1.5 text-xs text-rose">{errs[0]}</p>;
  }

  return (
    <form action={formAction} className="space-y-6">
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

      <div>
        <p className={labelClass}>Asistentes</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {players.map((player) => {
            const isSelected = defaultValues?.attendeeIds?.includes(player.id);
            return (
              <label
                key={player.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  isSelected
                    ? "border-mint bg-mint/10"
                    : "border-line bg-surface hover:border-line-soft"
                }`}
              >
                <input
                  type="checkbox"
                  name="attendeeIds"
                  value={player.id}
                  defaultChecked={isSelected}
                  className="h-4 w-4 rounded border-line accent-mint"
                />
                <span className="text-sm text-chalk">{player.name ?? player.id}</span>
              </label>
            );
          })}
        </div>
        {fieldError("attendeeIds")}
      </div>

      {state.message && <p className="text-sm text-rose">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-mint px-4 py-2.5 text-sm font-semibold text-pitch transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar cena"}
      </button>
    </form>
  );
}