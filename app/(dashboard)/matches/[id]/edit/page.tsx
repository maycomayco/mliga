import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getMatch, getPlayers } from "@/lib/queries/matches";
import MatchForm from "@/components/matches/MatchForm";
import { updateMatch } from "@/app/(dashboard)/matches/actions";

export default async function EditMatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;
  const [match, players] = await Promise.all([getMatch(id), getPlayers()]);

  if (!match) notFound();

  const updateMatchWithId = updateMatch.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/matches" className="text-sm text-chalk-muted transition-colors hover:text-chalk-secondary">
          ← Volver
        </Link>
        <h1 className="text-lg font-semibold text-chalk">Editar partido</h1>
      </div>
      <MatchForm
        action={updateMatchWithId}
        players={players}
        defaultValues={{
          date: match.date.toISOString().split("T")[0],
          team1player1Id: match.team1player1Id,
          team1player2Id: match.team1player2Id,
          team2player1Id: match.team2player1Id,
          team2player2Id: match.team2player2Id,
          set1team1: match.set1team1,
          set1team2: match.set1team2,
          set2team1: match.set2team1,
          set2team2: match.set2team2,
          set3team1: match.set3team1,
          set3team2: match.set3team2,
        }}
      />
    </div>
  );
}
