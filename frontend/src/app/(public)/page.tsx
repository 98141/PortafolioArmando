import HeroSection from "@/src/components/sections/HeroSection";
import ProfessionalSummary from "@/src/components/sections/ProfessionalSummary";
import ExpertiseSection from "@/src/components/sections/ExpertiseSection";
import FeaturedProjects from "@/src/components/sections/FeaturedProjects";
import CyberLabsPreview from "@/src/components/sections/CyberLabsPreview";
import CertificationsPreview from "@/src/components/sections/CertificationsPreview";
import EducationTimeline from "@/src/components/sections/EducationTimeline";
import CallToAction from "@/src/components/sections/CallToAction";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProfessionalSummary />
      <ExpertiseSection />
      <FeaturedProjects />
      <CyberLabsPreview />
      <CertificationsPreview />
      <EducationTimeline />
      <CallToAction />
    </>
  );
}
