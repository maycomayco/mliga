"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Inicio" },
  { href: "/matches", label: "Partidos" },
  { href: "/standings", label: "Posiciones" },
  { href: "/attendance", label: "Asistencia" },
  { href: "/users", label: "Jugadores" },
];

export default function TopNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4">
        <Link href="/" className="py-3 font-mono text-sm font-bold tracking-tight text-mint">
          M-LIGA
        </Link>
        <nav className="flex gap-1">
          {tabs.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`relative px-3 py-3 text-sm font-medium transition-colors ${
                isActive(href)
                  ? "text-chalk"
                  : "text-chalk-muted hover:text-chalk-secondary"
              }`}
            >
              {label}
              {isActive(href) && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-mint" />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
