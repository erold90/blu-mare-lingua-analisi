
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { useIsMobile } from "@/hooks/use-mobile";

export const HeroSection = () => {
  const isMobile = useIsMobile();
  const { siteSettings } = useSettings();
  
  // Implementazione migliorata per la gestione dell'immagine hero
  const [heroImageUrl, setHeroImageUrl] = React.useState<string | null>(null);
  const [imageError, setImageError] = React.useState(false);
  
  // Immagine di fallback da utilizzare se l'immagine hero non è disponibile
  const fallbackImage = "https://images.unsplash.com/photo-1559627398-8284fd5e51b1?q=80&w=2000&auto=format&fit=crop";
  
  React.useEffect(() => {
    // Resetta lo stato di errore quando cambia l'URL dell'immagine
    setImageError(false);
    
    if (siteSettings.heroImage && siteSettings.heroImage !== "/placeholder.svg") {
      console.log("Caricamento immagine hero:", siteSettings.heroImage);
      setHeroImageUrl(siteSettings.heroImage);
    } else {
      console.log("Nessuna immagine hero valida trovata, uso fallback");
      setHeroImageUrl(fallbackImage);
    }
  }, [siteSettings.heroImage]);
  
  // Get image position, default to center if not set
  const imagePosition = siteSettings.heroImagePosition || "center";
  
  // L'URL effettivo dell'immagine da utilizzare
  const effectiveImageUrl = imageError ? fallbackImage : (heroImageUrl || fallbackImage);

  return (
    <div className="relative w-full">
      <div className={`w-full ${isMobile ? "h-[70vh]" : "h-[80vh]"} relative overflow-hidden`}>
        <div 
          className="absolute inset-0 bg-cover bg-no-repeat transition-transform duration-700 hover:scale-105"
          style={{
            backgroundImage: `url('${effectiveImageUrl}')`,
            backgroundPosition: imagePosition
          }}
          onError={() => {
            console.error("Errore nel caricamento dell'immagine hero:", heroImageUrl);
            setImageError(true);
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
