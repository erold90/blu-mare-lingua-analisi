
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { useIsMobile } from "@/hooks/use-mobile";

export const HeroSection = () => {
  const isMobile = useIsMobile();
  const { siteSettings } = useSettings();

  return (
    <div className="relative w-full">
      <div className={`w-full ${isMobile ? "h-[70vh]" : "h-[70vh]"} relative overflow-hidden`}>
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{backgroundImage: `url('${siteSettings.heroImage}')`}}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className={`absolute inset-0 flex flex-col justify-center items-center text-white p-6 text-center ${isMobile ? "pt-16" : ""}`}>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Villa MareBlu</h1>
          <p className="text-lg md:text-xl mb-8 max-w-md">La tua vacanza da sogno sul mare cristallino del Salento</p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md">
            <Button size="lg" className="w-full" asChild>
              <Link to="/appartamenti">I Nostri Appartamenti</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full bg-white/20 backdrop-blur-sm" asChild>
              <Link to="/preventivo">Richiedi Preventivo</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
