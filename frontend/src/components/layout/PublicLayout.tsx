import AnimatedBackground from "@/src/components/ui/AnimatedBackground";
import PublicFooter from "@/src/components/layout/PublicFooter";
import PublicNavbar from "@/src/components/layout/PublicNavbar";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <AnimatedBackground />
      <PublicNavbar />
      <main className="relative min-h-[calc(100vh-4rem)]">{children}</main>
      <PublicFooter />
    </>
  );
}
