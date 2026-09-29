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
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import Modal from "@/src/components/ui/Modal";
import { useAuthStore } from "@/src/store/authStore";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Proyectos", href: "/admin/projects", icon: FolderKanban },
  { label: "Cyber Labs", href: "/admin/cyber-labs", icon: Shield },
  { label: "Certificados", href: "/admin/certifications", icon: Award },
  { label: "Educación", href: "/admin/education", icon: GraduationCap },
  { label: "Blog", href: "/admin/blog", icon: FileText },
  { label: "CV", href: "/admin/cv", icon: FileText },
  { label: "Site Settings", href: "/admin/settings", icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleLogout = async () => {
    setLogoutError(null);
    try {
      await logout();
      router.replace("/admin/login");
    } catch {
      setLogoutError("No se pudo confirmar el cierre de sesión. Inténtalo de nuevo.");
    }
  };

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktop.matches) setSidebarOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const navigation = <>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-400">Admin Panel</p>
              <p className="text-lg font-semibold text-gradient">Armando Mora</p>
            </div>
            <button
              type="button"
              className="rounded-lg p-3 lg:hidden" data-autofocus
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Administración" className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? "gradient-accent text-white shadow-lg shadow-blue-500/20"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
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
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Cerrar sesión
            </button>
          </div>

  </>;

  return (
    <div className="min-h-screen bg-[#080c18] text-zinc-100">
      <a href="#main-content" className="skip-link">Saltar al contenido</a>
      {logoutError && <p role="alert" className="relative z-50 bg-red-950 p-4 text-red-100">{logoutError}</p>}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        <aside className="glass-panel hidden w-64 shrink-0 flex-col border-r border-white/10 lg:flex">{navigation}</aside>
        <Modal open={sidebarOpen} onClose={() => setSidebarOpen(false)} id="admin-navigation-dialog" titleId="admin-navigation-title" className="admin-drawer border-r border-white/20 bg-[#080c18] text-zinc-100">
          <h2 id="admin-navigation-title" className="sr-only">Menú de administración</h2>
          {navigation}
        </Modal>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="glass-panel sticky top-0 z-20 flex items-center justify-between border-b border-white/10 px-4 py-4 lg:px-8">
            <button
              type="button"
              className="shrink-0 rounded-lg border border-white/20 p-3 lg:hidden"
              aria-expanded={sidebarOpen}
              aria-controls="admin-navigation-dialog"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div>
              <p className="text-sm text-zinc-400">Bienvenido</p>
              <p className="font-medium">{user?.name ?? "Administrador"}</p>
            </div>
          </header>

          <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
