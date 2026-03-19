"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/users", label: "Usuarios" },
  { href: "/matches", label: "Partidos" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navLinks = (
    <nav className="flex flex-col gap-1 p-4">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            pathname === href
              ? "bg-zinc-800 text-white"
              : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile header bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-3 md:hidden">
        <span className="text-sm font-semibold text-white">M-Liga</span>
        <button
          onClick={() => setOpen(!open)}
          className="text-zinc-400 hover:text-white"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile overlay menu */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-zinc-900 pt-14">
            {navLinks}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-zinc-800 bg-zinc-900 md:flex md:flex-col">
        <div className="border-b border-zinc-800 px-4 py-4">
          <span className="text-sm font-semibold text-white">M-Liga</span>
        </div>
        {navLinks}
      </aside>
    </>
  );
}
