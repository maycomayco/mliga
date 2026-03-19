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
      <button
        type="submit"
        className="text-xs text-chalk-muted transition-colors hover:text-rose"
      >
        Eliminar
      </button>
    </form>
  );
}
