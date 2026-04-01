"use client";

import { deleteDinner } from "@/app/(dashboard)/dinner/actions";

export default function DeleteDinnerButton({ id }: { id: string }) {
  return (
    <form
      action={deleteDinner}
      onSubmit={(e) => {
        if (!confirm("¿Eliminar esta cena?")) e.preventDefault();
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