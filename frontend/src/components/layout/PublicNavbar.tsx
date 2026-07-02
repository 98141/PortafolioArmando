"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Shield, X } from "lucide-react";
import { navLinks, profile } from "@/src/data/portfolioData";
import { cn } from "@/src/lib/cn";

interface PublicNavbarProps {
  brandName?: string;
}

export default function PublicNavbar({ brandName }: PublicNavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#080c18]/80 backdrop-blur-xl">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-8"
        aria-label="Navegación principal"
      >
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-accent shadow-lg shadow-blue-500/20">
            <Shield className="h-4 w-4 text-white" aria-hidden="true" />
          </span>
          <span className="font-semibold text-zinc-100 transition group-hover:text-white">
            {brandName || profile.name}
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition",
                  pathname === link.href
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/admin/login"
              className="ml-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-400 transition hover:border-purple-500/40 hover:text-purple-300"
            >
              Admin
            </Link>
          </li>
        </ul>

        <button
          type="button"
          className="rounded-lg border border-white/10 p-2 text-zinc-300 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          className="border-t border-white/5 bg-[#080c18]/95 px-4 py-4 lg:hidden"
        >
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-sm",
                    pathname === link.href
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/admin/login"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm text-purple-300"
              >
                Admin
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
