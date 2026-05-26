"use client";

import Link from "next/link";
import ProtectedRoute from "@/src/components/admin/ProtectedRoute";
import AdminLayout from "@/src/components/admin/AdminLayout";
import {
  Award,
  FileText,
  FolderKanban,
  GraduationCap,
  Shield,
  ArrowRight,
  Settings,
} from "lucide-react";
import { cn } from "@/src/lib/cn";

const dashboardCards = [
  {
    title: "Proyectos",
    description: "Gestiona proyectos de desarrollo de software",
    icon: FolderKanban,
    accent: "from-blue-500/20 to-blue-600/5",
    href: "/admin/projects",
    active: true,
  },
  {
    title: "Cyber Labs",
    description: "Security cases y laboratorios de ciberseguridad",
    icon: Shield,
    accent: "from-purple-500/20 to-purple-600/5",
    href: "/admin/cyber-labs",
    active: true,
  },
  {
    title: "Certificados",
    description: "Certificaciones profesionales",
    icon: Award,
    accent: "from-indigo-500/20 to-indigo-600/5",
    href: "/admin/certifications",
    active: true,
  },
  {
    title: "Educación",
    description: "Formación académica y cursos",
    icon: GraduationCap,
    accent: "from-cyan-500/20 to-cyan-600/5",
    href: "/admin/education",
    active: true,
  },
  {
    title: "Blog",
    description: "Knowledge Hub — artículos técnicos y writeups",
    icon: FileText,
    accent: "from-violet-500/20 to-violet-600/5",
    href: "/admin/blog",
    active: true,
  },
  {
    title: "Configuración",
    description: "Site Settings, SEO default y CV público",
    icon: Settings,
    accent: "from-fuchsia-500/20 to-fuchsia-600/5",
    href: "/admin/settings",
    active: true,
  },
];

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">Dashboard</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Knowledge Hub — gestiona proyectos, labs, certificaciones, educación y blog técnico.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {dashboardCards.map((card) => {
              const Icon = card.icon;
              const content = (
                <>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <Icon className="h-5 w-5 text-blue-300" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-100">{card.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{card.description}</p>
                  {card.active ? (
                    <span className="mt-4 inline-flex items-center gap-1 text-xs text-cyan-400">
                      Gestionar
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  ) : (
                    <span className="mt-4 inline-block text-xs uppercase tracking-wider text-zinc-500">
                      Próximamente
                    </span>
                  )}
                </>
              );

              if (card.active) {
                return (
                  <Link
                    key={card.title}
                    href={card.href}
                    className={cn(
                      "glass-panel group rounded-2xl bg-gradient-to-br p-6 transition hover:border-white/20",
                      card.accent
                    )}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <article
                  key={card.title}
                  className={cn(
                    "glass-panel group rounded-2xl bg-gradient-to-br p-6 opacity-80",
                    card.accent
                  )}
                >
                  {content}
                </article>
              );
            })}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
