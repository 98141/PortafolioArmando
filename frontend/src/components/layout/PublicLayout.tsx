import AnimatedBackground from "@/src/components/ui/AnimatedBackground";
import PublicFooter from "@/src/components/layout/PublicFooter";
import PublicNavbar from "@/src/components/layout/PublicNavbar";
import { getPublicSiteSettings } from "@/src/lib/publicSiteSettings";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default async function PublicLayout({ children }: PublicLayoutProps) {
  const settings = await getPublicSiteSettings();
  return (
    <>
      <AnimatedBackground />
      <PublicNavbar brandName={settings.profile?.fullName} />
      <main className="relative min-h-[calc(100vh-4rem)]">{children}</main>
      <PublicFooter settings={settings} />
    </>
  );
}
