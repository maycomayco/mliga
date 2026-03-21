# Mobile Nav — Hamburger Drawer — Spec

**Date:** 2026-03-20
**Status:** Approved

## Objetivo

Arreglar la navegación en mobile, que se rompe con 5 tabs en pantallas chicas. En mobile se reemplaza el top nav horizontal por un botón hamburger (☰) que abre un drawer deslizable desde la izquierda. En desktop el comportamiento actual no cambia.

---

## Archivo afectado

| Archivo | Cambio |
|---|---|
| `components/Sidebar.tsx` | Único archivo modificado — ya es `"use client"` |

`app/(dashboard)/layout.tsx` no se toca.

---

## Comportamiento

### Breakpoints
- **Mobile** (< `md`, < 768px): se oculta el nav horizontal (`hidden md:flex`), se muestra el botón ☰ (`md:hidden`)
- **Desktop** (≥ `md`): se muestra el nav horizontal actual, se oculta el botón ☰

### Apertura / cierre del drawer
- Click en ☰ → `setIsOpen(true)`
- Click en el backdrop → `setIsOpen(false)`
- Navegar a cualquier link → `setIsOpen(false)` via `useEffect` sobre `pathname`
- Tecla `Escape` → `setIsOpen(false)` via `useEffect` con event listener en `document`

### Drawer
- Posición: `fixed top-0 left-0 h-full` con `z-50`
- Ancho: `w-64` (256px)
- Animación: `transition-transform duration-200`, `translate-x-0` (abierto) / `-translate-x-full` (cerrado)
- Fondo: `bg-surface border-r border-line`
- Header del drawer: logo M-LIGA a la izquierda, botón ✕ a la derecha
- Links: lista vertical, mismo array `tabs` del nav horizontal
- Item activo: `border-l-2 border-mint bg-surface-raised text-chalk`, inactivo: `text-chalk-muted`

### Backdrop
- `fixed inset-0 bg-black/50 z-40 md:hidden`
- Transición de opacidad: `transition-opacity duration-200`, `opacity-100` (abierto) / `opacity-0 pointer-events-none` (cerrado)
- El drawer siempre está en el DOM — la animación CSS controla visibilidad (no montaje condicional), para que la transición funcione correctamente

---

## Estructura del componente

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Carried over from existing file — do not remove
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
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  // Cerrar al navegar
  useEffect(() => { setIsOpen(false); }, [pathname]);


  // Focus management: mover foco al botón ✕ al abrir, volver al ☰ al cerrar
  // Guard isMounted para no robar foco en el render inicial
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

  // Focus trap: mantener el foco dentro del drawer mientras está abierto
  useEffect(() => {
    if (!isOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    const focusable = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])'
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

  // Scroll lock: bloquear scroll del body mientras el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Cerrar con Escape
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
        <Link href="/" className="py-3 font-mono text-sm font-bold tracking-tight text-mint">
          M-LIGA
        </Link>

        {/* Desktop nav — oculto en mobile */}
        <nav className="hidden md:flex gap-1">
          {/* tabs existentes sin cambios */}
        </nav>

        {/* Hamburger — oculto en desktop */}
        <button
          ref={hamburgerRef}
          className="md:hidden py-3 text-chalk-muted hover:text-chalk transition-colors"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={isOpen}
          aria-controls="mobile-drawer"
        >
          {/* ícono SVG de 3 líneas */}
        </button>
      </div>

      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        aria-label="Menú de navegación"
        className={`fixed top-0 left-0 h-full w-64 bg-surface border-r border-line z-50 md:hidden transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header del drawer: logo + botón ✕ */}
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="font-mono text-sm font-bold tracking-tight text-mint">M-LIGA</span>
          <button
            ref={closeButtonRef}
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar menú"
            className="text-chalk-muted hover:text-chalk transition-colors"
          >
            {/* ícono SVG ✕ */}
          </button>
        </div>
        {/* Nav links verticales — padding: block px-4 py-3 text-sm font-medium */}
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

---

## Restricciones

- No se agregan dependencias externas — animación con Tailwind `transition-transform`
- Tailwind v4: no usar `var()` dentro de `@theme`. Tokens usados: `surface`, `line`, `chalk`, `chalk-muted`, `mint`; se agrega `surface-raised` para el item activo en drawer (token existente en globals.css)
- El drawer está siempre en el DOM (no `{isOpen && <Drawer />}`) para que la animación CSS funcione
- El ícono hamburger se implementa con SVG inline, sin librería de íconos
