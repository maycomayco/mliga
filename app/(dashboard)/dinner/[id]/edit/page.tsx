import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDinner, getPlayers } from "@/lib/queries/dinner";
import DinnerForm from "@/components/dinners/DinnerForm";
import { updateDinner } from "@/app/(dashboard)/dinner/actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditDinnerPage({ params }: Props) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;
  const dinner = await getDinner(id);
  if (!dinner) redirect("/dinner");

  const players = await getPlayers();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dinner" className="text-sm text-chalk-muted transition-colors hover:text-chalk-secondary">
          ← Volver
        </Link>
        <h1 className="text-lg font-semibold text-chalk">Editar asado</h1>
      </div>
      <DinnerForm
        action={updateDinner.bind(null, id)}
        players={players}
        defaultValues={{
          date: dinner.date.toISOString().split("T")[0],
          attendeeIds: dinner.attendees.map((a) => a.user.id),
        }}
      />
    </div>
  );
}