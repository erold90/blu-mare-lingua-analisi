
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
  
  // Hero image path - directly from the public folder
  const heroImagePath = '/images/hero/hero.jpg';
  
  // Fallback image in case the hero image is not found
  const fallbackImage = "https://images.unsplash.com/photo-1559627398-8284fd5e51b1?q=80&w=2000&auto=format&fit=crop";
  
  // Get image position from settings, default to center
  const imagePosition = siteSettings.heroImagePosition || "center";
  
  // Use State to store the actual image URL with cache busting 
  const [imageUrl, setImageUrl] = useState("");
  
  // Check if image exists on component mount
  useEffect(() => {
    const checkHeroImage = async () => {
      setIsLoading(true);
      
      try {
        // Debug image loading
        await imageService.debugImage(heroImagePath);
        
        // Check if hero image exists
        const exists = await imageService.checkImageExists(heroImagePath);
        console.log(`Hero image exists check: ${exists}`);
        
        if (exists) {
          // Get a URL with cache busting
          setImageUrl(imageService.getImageUrl(heroImagePath));
          setImageError(false);
        } else {
          console.error("Hero image not found at path:", heroImagePath);
          toast.error("Immagine hero non trovata. Verifica che sia stata caricata correttamente nella cartella /public/images/hero/");
          setImageError(true);
        }
      } catch (error) {
        console.error("Error checking hero image:", error);
        setImageError(true);
      } finally {
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
            {/* Use an actual image element for better error detection */}
            {!imageError ? (
              <div 
                className="absolute inset-0 bg-cover bg-no-repeat transition-transform duration-700 hover:scale-105"
                style={{
                  backgroundImage: `url('${imageUrl}')`,
                  backgroundPosition: imagePosition
                }}
              />
            ) : (
              <>
                <div 
                  className="absolute inset-0 bg-cover bg-no-repeat transition-transform duration-700 hover:scale-105"
                  style={{
                    backgroundImage: `url('${fallbackImage}')`,
                    backgroundPosition: imagePosition
                  }}
                />
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md">
                  Usando immagine di fallback
                </div>
              </>
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
      
      {/* Add image loading instructions for admins */}
      {imageError && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mt-2">
          <p className="font-bold">Errore di caricamento immagine hero</p>
          <p>Verificare che l'immagine hero sia stata caricata nella cartella corretta:</p>
          <pre className="bg-red-100 p-2 mt-2 rounded">/public/images/hero/hero.jpg</pre>
          <p className="mt-2">Dopo aver caricato l'immagine, aggiornare la pagina.</p>
        </div>
      )}
    </div>
  );
};
