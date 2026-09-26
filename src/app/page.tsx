import { AnatomySection } from "@/components/landing/AnatomySection";
import { CtaSection } from "@/components/landing/CtaSection";
import { DomainsSection } from "@/components/landing/DomainsSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { SilentApiReady } from "@/components/landing/SilentApiReady";
import { StartHereSection } from "@/components/landing/StartHereSection";
import { UseCasesSection } from "@/components/landing/UseCasesSection";
import { WhySection } from "@/components/landing/WhySection";

export default function HomePage() {
  return (
    <>
      <SilentApiReady />
      <HeroSection />
      <StartHereSection />
      <UseCasesSection />
      <DomainsSection />
      <AnatomySection />
      <WhySection />
      <CtaSection />
    </>
  );
}
