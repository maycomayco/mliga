import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPlayers } from "@/lib/queries/dinner";
import DinnerForm from "@/components/dinners/DinnerForm";
import { createDinner } from "@/app/(dashboard)/dinner/actions";

export default async function NewDinnerPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.role !== "ADMIN") {
    redirect("/");
  }

  const players = await getPlayers();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dinner" className="text-sm text-chalk-muted transition-colors hover:text-chalk-secondary">
          ← Volver
        </Link>
        <h1 className="text-lg font-semibold text-chalk">Nuevo asado</h1>
      </div>
      <DinnerForm action={createDinner} players={players} />
    </div>
    );
  }