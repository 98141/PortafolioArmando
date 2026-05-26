import { cn } from "@/src/lib/cn";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  as?: "div" | "article" | "section";
}

export default function GlassCard({
  children,
  className,
  hover = false,
  as: Component = "div",
}: GlassCardProps) {
  return (
    <Component
      className={cn(
        "glass-panel rounded-2xl",
        hover && "transition duration-300 hover:border-white/15 hover:bg-white/[0.03]",
        className
      )}
    >
      {children}
    </Component>
  );
}
