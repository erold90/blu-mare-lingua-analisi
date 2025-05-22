
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { useIsMobile } from "@/hooks/use-mobile";
import { ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { imageService } from "@/utils/imageService";
import { toast } from "sonner";

export const HeroSection = () => {
  const isMobile = useIsMobile();
  const { siteSettings } = useSettings();
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageExists, setImageExists] = useState(false);
  
  // Hero image path - directly from the public folder
  const heroImagePath = '/images/hero/hero.jpg';
  
  // Fallback image in case the hero image is not found
  const fallbackImage = "https://images.unsplash.com/photo-1559627398-8284fd5e51b1?q=80&w=2000&auto=format&fit=crop";
  
  // Get image position from settings, default to center
  const imagePosition = siteSettings.heroImagePosition || "center";
  
  // Check if image exists on component mount
  useEffect(() => {
    const checkHeroImage = async () => {
      try {
        setIsLoading(true);
        
        // Debug image loading
        await imageService.debugImage(heroImagePath);
        
        // Check if hero image exists
        const exists = await imageService.checkImageExists(heroImagePath);
        console.log(`Hero image exists check: ${exists}`);
        
        setImageExists(exists);
        setImageError(!exists);
        setIsLoading(false);
        
        if (!exists) {
          console.error("Hero image not found at path:", heroImagePath);
          toast.error("Immagine hero non trovata. Verifica che sia stata caricata correttamente.");
        }
      } catch (error) {
        console.error("Error checking hero image:", error);
        setImageError(true);
        setIsLoading(false);
      }
    };
    
    checkHeroImage();
  }, [heroImagePath]);
  
  return (
    <div className="relative w-full">
      <div className={`w-full ${isMobile ? "h-[70vh]" : "h-[80vh]"} relative overflow-hidden`}>
        {isLoading ? (
          <Skeleton className="absolute inset-0" />
        ) : (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-no-repeat transition-transform duration-700 hover:scale-105"
              style={{
                backgroundImage: `url('${imageError ? fallbackImage : heroImagePath}')`,
                backgroundPosition: imagePosition
              }}
            />
            
            {imageError && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md">
                Usando immagine di fallback
              </div>
            )}
          </>
        )}
        
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
};
