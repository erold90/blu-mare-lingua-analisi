
import * as React from "react";
import HeroSection from "@/components/home/HeroSection";
import IntroductionSection from "@/components/home/IntroductionSection";
import { LocationSection } from "@/components/home/LocationSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { CtaSection } from "@/components/home/CtaSection";
import { HomeImageCarousel } from "@/components/home/HomeImageCarousel";
import SEOHead from "@/components/seo/SEOHead";
import { getAllHomeSchemas } from "@/components/seo/StructuredData";
import { getPageSpecificKeywords } from "@/utils/seo/seoConfig";

const Index = () => {
  const structuredData = getAllHomeSchemas();

  return (
    <div className="flex flex-col relative overflow-hidden">
      <SEOHead
        title="Villa MareBlu Torre Vado | Casa Vacanze Salento Vista Mare | Appartamenti Pescoluse Leuca"
        description="Villa MareBlu: appartamenti vacanze vista mare a Torre Vado, nel Salento. A 100m dalla spiaggia, vicino Pescoluse (Maldive del Salento) e Santa Maria di Leuca. 4 appartamenti da 4 a 8 posti con terrazza panoramica. Prenota diretto!"
        keywords={getPageSpecificKeywords('home')}
        canonicalUrl="/"
        structuredData={structuredData}
        ogTitle="Villa MareBlu - Casa Vacanze Torre Vado Salento | Vista Mare"
        ogDescription="Appartamenti vacanze vista mare a Torre Vado, Salento. Vicino Pescoluse e Leuca. Terrazza panoramica, parcheggio, Wi-Fi. Prenota diretto e risparmia!"
      />

      {/* Simplified background - removed parallax for performance */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue-50/20 to-transparent pointer-events-none z-0" />

      <div className="relative z-10">
        <HeroSection />

        <div className="animate-fade-in">
          <IntroductionSection />
        </div>

        <div className="animate-fade-in animation-delay-200">
          <HomeImageCarousel />
        </div>

        <div className="animate-fade-in animation-delay-400">
          <LocationSection />
        </div>

        <div className="animate-fade-in animation-delay-600">
          <ServicesSection />
        </div>

        <div className="animate-fade-in animation-delay-800">
          <CtaSection />
        </div>
      </div>
    </div>
  );
};

export default Index;
