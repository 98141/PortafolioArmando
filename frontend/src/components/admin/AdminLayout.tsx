"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Shield,
  Award,
  GraduationCap,
  FileText,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/src/store/authStore";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Proyectos", href: "/admin/projects", icon: FolderKanban },
  { label: "Cyber Labs", href: "#", icon: Shield, disabled: true },
  { label: "Certificados", href: "#", icon: Award, disabled: true },
  { label: "Educación", href: "#", icon: GraduationCap, disabled: true },
  { label: "Blog", href: "#", icon: FileText, disabled: true },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#050508] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        <aside
          className={`glass-panel fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 transition-transform lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500">Admin Panel</p>
              <h1 className="text-lg font-semibold text-gradient">Armando Mora</h1>
            </div>
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              if (item.disabled) {
                return (
                  <span
                    key={item.label}
                    className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-600"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    <span className="ml-auto text-[10px] uppercase">Pronto</span>
                  </span>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? "gradient-accent text-white shadow-lg shadow-blue-500/20"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <p className="mb-3 truncate text-sm text-zinc-400">{user?.email}</p>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar overlay"
          />
        )}

        <div className="flex flex-1 flex-col">
          <header className="glass-panel sticky top-0 z-20 flex items-center justify-between border-b border-white/10 px-4 py-4 lg:px-8">
            <button
              type="button"
              className="rounded-lg border border-white/10 p-2 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm text-zinc-500">Bienvenido</p>
              <p className="font-medium">{user?.name ?? "Administrador"}</p>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
