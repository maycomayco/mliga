"use client";

import { deleteMatch } from "@/app/(dashboard)/matches/actions";

export default function DeleteMatchButton({ id }: { id: string }) {
  return (
    <form
      action={deleteMatch}
      onSubmit={(e) => {
        if (!confirm("¿Eliminar este partido?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-xs text-red-400 hover:text-red-300">
        Eliminar
      </button>
    </form>
  );
}
