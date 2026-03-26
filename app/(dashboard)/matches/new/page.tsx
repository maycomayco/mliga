import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPlayers } from "@/lib/queries/matches";
import MatchForm from "@/components/matches/MatchForm";
import { createMatch } from "@/app/(dashboard)/matches/actions";

export default async function NewMatchPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.role !== "ADMIN") {
    redirect("/");
  }

  const players = await getPlayers();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/matches" className="text-sm text-chalk-muted transition-colors hover:text-chalk-secondary">
          ← Volver
        </Link>
        <h1 className="text-lg font-semibold text-chalk">Nuevo partido</h1>
      </div>
      <MatchForm action={createMatch} players={players} />
    </div>
  );
}
