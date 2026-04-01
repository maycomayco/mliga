"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const allTabs = [
  { href: "/", label: "Inicio" },
  { href: "/matches", label: "Partidos" },
  { href: "/standings", label: "Posiciones" },
  { href: "/attendance", label: "Asistencia" },
  { href: "/dinner", label: "Comidas" },
  { href: "/users", label: "Jugadores", adminOnly: true },
];

export default function TopNav({ isAdmin }: { isAdmin: boolean }) {
  const tabs = allTabs.filter((t) => !t.adminOnly || isAdmin);
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Focus management — skip on initial render to avoid stealing focus
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isOpen) {
      closeButtonRef.current?.focus();
    } else {
      hamburgerRef.current?.focus();
    }
  }, [isOpen]);

  // Focus trap — cycle focus within drawer while open
  useEffect(() => {
    if (!isOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    const focusable = drawer.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled])"
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    drawer.addEventListener("keydown", trap);
    return () => drawer.removeEventListener("keydown", trap);
  }, [isOpen]);

  // Scroll lock — prevent body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  async function handleSignOut() {
    await fetch("/api/auth/sign-out", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4">
        <Link
          href="/"
          className="py-3 font-mono text-sm font-bold tracking-tight text-mint"
        >
          La Liga
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <nav className="hidden items-center gap-1 md:flex">
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
          <button
            type="button"
            onClick={handleSignOut}
            className="px-3 py-3 text-sm font-medium text-chalk-muted transition-colors hover:text-chalk-secondary"
          >
            Salir
          </button>
        </nav>

        {/* Hamburger button — hidden on desktop */}
        <button
          ref={hamburgerRef}
          type="button"
          className="md:hidden py-3 text-chalk-muted hover:text-chalk transition-colors"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={isOpen}
          aria-controls="mobile-drawer"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="2" y="4" width="16" height="2" rx="1" fill="currentColor" />
            <rect x="2" y="9" width="16" height="2" rx="1" fill="currentColor" />
            <rect x="2" y="14" width="16" height="2" rx="1" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Backdrop — click to close */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer — slides in from the left */}
      <div
        ref={drawerRef}
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        aria-label="Menú de navegación"
        inert={!isOpen || undefined}
        className={`fixed top-0 left-0 h-full w-64 bg-surface border-r border-line z-50 md:hidden transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="font-mono text-sm font-bold tracking-tight text-mint">
            La Liga
          </span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar menú"
            className="text-chalk-muted hover:text-chalk transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M2 2L16 16M16 2L2 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Drawer nav links */}
        <nav className="flex flex-col py-2">
          {tabs.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block px-4 py-3 text-sm font-medium transition-colors ${
                isActive(href)
                  ? "border-l-2 border-mint bg-surface-raised text-chalk"
                  : "text-chalk-muted hover:text-chalk-secondary"
              }`}
            >
              {label}
            </Link>
          ))}
          <button
            type="button"
            onClick={handleSignOut}
            className="px-4 py-3 text-left text-sm font-medium text-chalk-muted transition-colors hover:text-chalk-secondary"
          >
            Salir
          </button>
        </nav>
      </div>
    </header>
  );
}
