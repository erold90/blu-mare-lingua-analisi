
import * as React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { IntroductionSection } from "@/components/home/IntroductionSection";
import { LocationSection } from "@/components/home/LocationSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { CtaSection } from "@/components/home/CtaSection";
import { HomeImageCarousel } from "@/components/home/HomeImageCarousel";

const Index = () => {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <IntroductionSection />
      <HomeImageCarousel />
      <LocationSection />
      <ServicesSection />
      <CtaSection />
    </div>
  );
};

export default Index;
