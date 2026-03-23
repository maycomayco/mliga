"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Status = {
  error: string | null;
  pending: boolean;
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>({ error: null, pending: false });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = String(form.get("username") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    if (!username || !password) {
      setStatus({ pending: false, error: "Completá usuario y contrasena." });
      return;
    }

    setStatus({ pending: true, error: null });

    const callbackURL = searchParams.get("next") || "/";

    const response = await fetch("/api/auth/sign-in/username", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        callbackURL,
      }),
    });

    if (!response.ok) {
      await fetch("/api/security/auth-event", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ event: "login_failed", username }),
      }).catch(() => undefined);

      setStatus({ pending: false, error: "Credenciales invalidas." });
      return;
    }

    router.push(callbackURL);
    router.refresh();
  }

  return (
    <form className="mt-5 space-y-4" onSubmit={onSubmit}>
      <label className="block text-sm">
        <span className="mb-1 block text-chalk-secondary">Usuario</span>
        <input
          name="username"
          autoComplete="username"
          className="w-full rounded-md border border-line bg-pitch px-3 py-2 text-sm text-chalk outline-none ring-mint/50 focus:ring-2"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-chalk-secondary">Contrasena</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-md border border-line bg-pitch px-3 py-2 text-sm text-chalk outline-none ring-mint/50 focus:ring-2"
        />
      </label>

      {status.error ? <p className="text-sm text-rose">{status.error}</p> : null}

      <button
        type="submit"
        disabled={status.pending}
        className="w-full rounded-md bg-mint px-3 py-2 text-sm font-semibold text-pitch transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status.pending ? "Ingresando..." : "Entrar"}
      </button>
    </form>
  );
}
