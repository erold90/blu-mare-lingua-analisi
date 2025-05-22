
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { useIsMobile } from "@/hooks/use-mobile";

export const HeroSection = () => {
  const isMobile = useIsMobile();
  const { siteSettings } = useSettings();
  
  // Verify if the hero image is valid and not the placeholder
  const heroImage = siteSettings.heroImage && !siteSettings.heroImage.includes("placeholder.svg") 
    ? siteSettings.heroImage 
    : "https://images.unsplash.com/photo-1559627398-8284fd5e51b1?q=80&w=2000&auto=format&fit=crop";
  
  // Get image position, default to center if not set
  const imagePosition = siteSettings.heroImagePosition || "center";

  return (
    <div className="relative w-full">
      <div className={`w-full ${isMobile ? "h-[70vh]" : "h-[80vh]"} relative overflow-hidden`}>
        <div 
          className="absolute inset-0 bg-cover bg-no-repeat transition-transform duration-700 hover:scale-105"
          style={{
            backgroundImage: `url('${heroImage}')`,
            backgroundPosition: imagePosition
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className={`absolute inset-0 flex flex-col justify-center items-center text-white p-6 text-center ${isMobile ? "pt-16" : ""}`}>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">Villa MareBlu</h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl font-light">La tua vacanza da sogno sul mare cristallino del Salento</p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md">
            <Button size="lg" className="w-full" asChild>
              <Link to="/appartamenti">I Nostri Appartamenti</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full bg-white/20 backdrop-blur-sm border-white" asChild>
              <Link to="/preventivo">Richiedi Preventivo</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
