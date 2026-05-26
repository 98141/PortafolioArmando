"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, Shield } from "lucide-react";
import { useAuthStore } from "@/src/store/authStore";
import { loginSchema, type LoginFormValues } from "@/src/lib/validations/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, checkSession, isAuthenticated, isInitialized, isLoading, error, clearError } =
    useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!isInitialized) {
      checkSession();
    }
  }, [isInitialized, checkSession]);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace("/admin/dashboard");
    }
  }, [isInitialized, isAuthenticated, router]);

  const onSubmit = async (values: LoginFormValues) => {
    clearError();
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      router.replace("/admin/dashboard");
    } catch {
      // Error handled in store
    } finally {
      setSubmitting(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050508]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-400" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050508] px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-purple-600/15 blur-3xl" />
      </div>

      <div className="glass-panel relative w-full max-w-md rounded-3xl p-8 shadow-2xl shadow-blue-500/5">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-accent shadow-lg shadow-blue-500/25">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gradient">Panel Administrativo</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Acceso privado — Software & Ciberseguridad
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm text-zinc-400">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                placeholder="admin@ejemplo.com"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm text-zinc-400">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                placeholder="••••••••"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || isLoading}
            className="gradient-accent w-full rounded-xl py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting || isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
