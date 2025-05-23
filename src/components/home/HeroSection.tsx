
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { ImageIcon, AlertCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { imageService, ImageRecord } from "@/services/imageService";

const HeroSection = () => {
  const [heroImage, setHeroImage] = useState<ImageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isMobile = useIsMobile();

  const loadHeroImage = async () => {
    setLoading(true);
    setError(false);
    
    try {
      const heroImages = await imageService.getImagesByCategory('hero');
      const primaryHero = heroImages.find(img => img.is_cover) || heroImages[0] || null;
      setHeroImage(primaryHero);
    } catch (err) {
      console.error('Error loading hero image:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHeroImage();
  }, []);

  const getImageUrl = () => {
    if (!heroImage) return "/placeholder.svg";
    return imageService.getImageUrl(heroImage.file_path);
  };

  const getImageAlt = () => {
    return heroImage?.alt_text || "Villa MareBlu - Appartamenti vacanze";
  };

  if (loading) {
    return (
      <section className="relative h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        <Skeleton className="absolute inset-0 w-full h-full" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <Skeleton className="h-12 md:h-16 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-6 w-2/3 mx-auto mb-8" />
          <Skeleton className="h-12 w-48 mx-auto" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden bg-gray-100">
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Errore nel caricamento
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            Non è stato possibile caricare l'immagine hero.
          </p>
          <Button onClick={loadHeroImage} className="inline-flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Riprova
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        {heroImage ? (
          <img 
            src={getImageUrl()}
            alt={getImageAlt()}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Hero image failed to load');
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
            <ImageIcon className="h-24 w-24 text-white/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto text-white">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
          Villa MareBlu
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl mb-8 drop-shadow-md">
          I tuoi appartamenti vacanze sul mare
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size={isMobile ? "default" : "lg"} className="bg-primary hover:bg-primary/90">
            <Link to="/appartamenti">Scopri gli Appartamenti</Link>
          </Button>
          <Button asChild variant="outline" size={isMobile ? "default" : "lg"} className="text-white border-white hover:bg-white hover:text-primary">
            <Link to="/preventivo">Richiedi Preventivo</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
