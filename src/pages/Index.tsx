
import * as React from "react";
import { useEffect } from "react";
import HeroSection from "@/components/home/HeroSection";
import { IntroductionSection } from "@/components/home/IntroductionSection";
import { LocationSection } from "@/components/home/LocationSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { CtaSection } from "@/components/home/CtaSection";
import { HomeImageCarousel } from "@/components/home/HomeImageCarousel";
import SEOHead from "@/components/seo/SEOHead";
import { getLocalBusinessSchema, getWebsiteSchema } from "@/components/seo/StructuredData";
import { getPageSpecificKeywords } from "@/utils/seo/seoConfig";

const Index = () => {
  useEffect(() => {
    console.log("Index page mounted");
    console.log("Available routes should include /preventivo");
  }, []);

  const structuredData = [
    getLocalBusinessSchema(),
    getWebsiteSchema()
  ];

  return (
    <div className="flex flex-col relative overflow-hidden">
      <SEOHead
        title="Villa MareBlu Vista Mare Salento - Appartamenti Vacanze Lusso Puglia | Casa Vacanze Sul Mare"
        description="Villa MareBlu: appartamenti vacanze lusso con vista mare in Salento, Puglia. Casa vacanze fronte mare a 100m dalla spiaggia. Villa sul mare con giardino, tutti i comfort. Prenota ora la tua vacanza da sogno!"
        keywords={getPageSpecificKeywords('home')}
        canonicalUrl="/"
        structuredData={structuredData}
        ogTitle="Villa MareBlu Vista Mare - Appartamenti Vacanze Lusso Salento"
        ogDescription="Scopri Villa MareBlu: appartamenti vacanze lusso con vista mare in Salento. La tua casa vacanze fronte mare in Puglia ti aspetta!"
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
