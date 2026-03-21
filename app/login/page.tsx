import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md items-center px-4 py-8">
      <section className="w-full rounded-xl border border-line bg-surface p-6">
        <h1 className="text-lg font-semibold text-chalk">Iniciar sesion</h1>
        <p className="mt-1 text-sm text-chalk-muted">
          Accede con tu usuario y contrasena.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
