
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { useIsMobile } from "@/hooks/use-mobile";
import { getImage } from "@/utils/imageStorage";
import { ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const HeroSection = () => {
  const isMobile = useIsMobile();
  const { siteSettings } = useSettings();
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  // Default fallback image
  const fallbackImage = "https://images.unsplash.com/photo-1559627398-8284fd5e51b1?q=80&w=2000&auto=format&fit=crop";
  
  useEffect(() => {
    const loadHeroImage = async () => {
      setIsLoading(true);
      setImageError(false);
      
      if (siteSettings.heroImage && siteSettings.heroImage !== "/placeholder.svg") {
        if (siteSettings.heroImage.startsWith('/upload/')) {
          // This is a stored image, get it from IndexedDB
          try {
            console.log("Loading hero image from storage:", siteSettings.heroImage);
            const storedImage = await getImage(siteSettings.heroImage);
            
            if (storedImage && storedImage.data) {
              setHeroImageUrl(storedImage.data);
            } else {
              console.error("Hero image not found in storage:", siteSettings.heroImage);
              setImageError(true);
            }
          } catch (error) {
            console.error("Error loading hero image:", error);
            setImageError(true);
          }
        } else {
          // External URL
          setHeroImageUrl(siteSettings.heroImage);
        }
      } else {
        setImageError(true);
      }
      
      setIsLoading(false);
    };
    
    loadHeroImage();
  }, [siteSettings.heroImage]);
  
  // Get image position, default to center if not set
  const imagePosition = siteSettings.heroImagePosition || "center";
  
  // The URL to use for the hero image
  const effectiveImageUrl = imageError ? fallbackImage : (heroImageUrl || fallbackImage);
  
  return (
    <div className="relative w-full">
      <div className={`w-full ${isMobile ? "h-[70vh]" : "h-[80vh]"} relative overflow-hidden`}>
        {isLoading ? (
          <Skeleton className="absolute inset-0" />
        ) : (
          <div 
            className="absolute inset-0 bg-cover bg-no-repeat transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: `url('${effectiveImageUrl}')`,
              backgroundPosition: imagePosition
            }}
            onError={() => {
              console.error("Error loading hero image:", heroImageUrl);
              setImageError(true);
            }}
          />
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
