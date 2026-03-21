# Mobile Nav — Hamburger Drawer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken horizontal top nav on mobile with a hamburger button that opens an accessible slide-in drawer from the left, while keeping the desktop nav unchanged.

**Architecture:** Single file change — `components/Sidebar.tsx`. Already a `"use client"` component. Add `useState`/`useRef`/`useEffect` hooks for open state, focus management, focus trap, scroll lock, and Escape key. Desktop nav gets `hidden md:flex`; hamburger gets `md:hidden`. Drawer and backdrop are always in the DOM (CSS controls visibility) for smooth transitions.

**Tech Stack:** Next.js 16 App Router, React hooks, Tailwind v4, TypeScript

---

## Files

| File | Action |
|---|---|
| `components/Sidebar.tsx` | Modify — only file changed |

---

### Task 1: Rewrite `components/Sidebar.tsx` with mobile drawer

**Files:**
- Modify: `components/Sidebar.tsx`

- [ ] **Step 1: Replace the entire contents of `components/Sidebar.tsx`** with the following:

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
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

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4">
        <Link
          href="/"
          className="py-3 font-mono text-sm font-bold tracking-tight text-mint"
        >
          M-LIGA
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <nav className="hidden md:flex gap-1">
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
            M-LIGA
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
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify the build passes**

```bash
pnpm build
```

Expected: build completes with no TypeScript or compilation errors. `/attendance` and all other routes appear in the route list.

- [ ] **Step 3: Commit**

```bash
git add components/Sidebar.tsx
git commit -m "feat: add mobile hamburger drawer nav"
```

---

## Manual verification

```bash
pnpm dev
```

Open `http://localhost:3000` and verify:

**Mobile (narrow the browser to < 768px or use DevTools device emulation):**
1. The horizontal nav tabs are hidden — only the M-LIGA logo and ☰ button are visible
2. Clicking ☰ slides the drawer in from the left with a smooth animation
3. The backdrop appears and clicking it closes the drawer
4. The current page is highlighted with a left mint border in the drawer
5. Clicking any nav link navigates and closes the drawer
6. Pressing Escape closes the drawer
7. Tab key cycles focus only within the drawer while it's open (focus trap)
8. Body scroll is locked while the drawer is open

**Desktop (> 768px):**
1. The horizontal nav is visible — all 5 tabs shown as before
2. The ☰ button is not visible
3. Active tab shows the mint underline indicator
4. No visual regressions from the previous desktop layout
