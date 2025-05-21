
import * as React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { IntroductionSection } from "@/components/home/IntroductionSection";
import { LocationSection } from "@/components/home/LocationSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { ExperienceCarousel } from "@/components/home/ExperienceCarousel";
import { CtaSection } from "@/components/home/CtaSection";

const Index = () => {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <IntroductionSection />
      <LocationSection />
      <ServicesSection />
      <ExperienceCarousel />
      <CtaSection />
    </div>
  );
};

export default Index;
