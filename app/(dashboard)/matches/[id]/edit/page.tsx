import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MatchForm from "@/components/matches/MatchForm";
import { updateMatch } from "@/app/(dashboard)/matches/actions";

export default async function EditMatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [match, players] = await Promise.all([
    prisma.match.findUnique({ where: { id } }),
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!match) notFound();

  const updateMatchWithId = updateMatch.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/matches" className="text-sm text-zinc-500 hover:text-white">
          ← Volver
        </Link>
        <h1 className="text-xl font-semibold text-white">Editar partido</h1>
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
