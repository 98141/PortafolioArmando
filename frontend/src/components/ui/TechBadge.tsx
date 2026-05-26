import { cn } from "@/src/lib/cn";

interface TechBadgeProps {
  label: string;
  variant?: "default" | "cyan" | "purple" | "blue" | "status";
  className?: string;
}

const variants = {
  default: "border-white/10 bg-white/5 text-zinc-300",
  cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  purple: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  blue: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  status: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
};

export default function TechBadge({
  label,
  variant = "default",
  className,
}: TechBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-lg border px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {label}
    </span>
  );
}
