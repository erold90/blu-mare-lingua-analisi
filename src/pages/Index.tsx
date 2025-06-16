
import * as React from "react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
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
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    console.log("Index page mounted");
    console.log("Available routes should include /preventivo");

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const structuredData = [
    getLocalBusinessSchema(),
    getWebsiteSchema()
  ];

  return (
    <div className="flex flex-col relative overflow-hidden">
      <SEOHead
        title="Villa MareBlu Salento - Appartamenti Vacanze Lusso Sul Mare Puglia | Torre Vado"
        description="Villa MareBlu: appartamenti vacanze di lusso sul mare in Salento, Puglia. Case vacanze Torre Vado, Santa Maria di Leuca con piscina privata, vista mare, giardino. Affitto settimanale 4-8 persone. Prenota ora la tua vacanza da sogno!"
        keywords={getPageSpecificKeywords('home')}
        canonicalUrl="/"
        structuredData={structuredData}
        ogTitle="Villa MareBlu Salento - Appartamenti Vacanze Lusso Sul Mare"
        ogDescription="Scopri Villa MareBlu: appartamenti vacanze di lusso in Salento con piscina privata e vista mare. La tua vacanza da sogno in Puglia ti aspetta!"
      />

      {/* Parallax background elements */}
      <div 
        className="fixed inset-0 bg-gradient-to-b from-blue-50/20 to-transparent pointer-events-none z-0"
        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
      />
      
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
