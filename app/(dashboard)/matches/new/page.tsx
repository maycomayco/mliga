import Link from "next/link";
import { prisma } from "@/lib/prisma";
import MatchForm from "@/components/matches/MatchForm";
import { createMatch } from "@/app/(dashboard)/matches/actions";

export default async function NewMatchPage() {
  const players = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

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
