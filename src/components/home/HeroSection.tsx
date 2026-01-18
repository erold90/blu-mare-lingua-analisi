
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { imageService, ImageRecord } from "@/services/imageService";

const HERO_CACHE_KEY = 'villamareblu_hero_url';

const HeroSection = () => {
  const navigate = useNavigate();
  const [heroImage, setHeroImage] = useState<ImageRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get cached URL immediately (no flash)
  const cachedUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(HERO_CACHE_KEY);
    }
    return null;
  }, []);

  useEffect(() => {
    const loadHeroImage = async () => {
      try {
        const heroImages = await imageService.getImagesByCategory('hero');
        const primaryImage = heroImages.find(img => img.is_cover) || heroImages[0] || null;
        setHeroImage(primaryImage);

        // Cache the URL for next page load
        if (primaryImage) {
          const url = imageService.getHeroUrl(primaryImage.file_path);
          localStorage.setItem(HERO_CACHE_KEY, url);
        } else {
          localStorage.removeItem(HERO_CACHE_KEY);
        }
      } catch (error) {
        console.error('Errore caricamento immagine hero:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHeroImage();

    const handleHomeImageUpdate = () => {
      loadHeroImage();
    };

    window.addEventListener('homeImagesUpdated', handleHomeImageUpdate);

    return () => {
      window.removeEventListener('homeImagesUpdated', handleHomeImageUpdate);
    };
  }, []);

  const handleQuoteClick = () => {
    navigate("/preventivo");
  };

  // Priority: database image > cached URL (no fallback - tutto gestito da admin)
  const getHeroImageUrl = (): string | null => {
    if (heroImage) {
      return imageService.getHeroUrl(heroImage.file_path);
    }
    if (cachedUrl) {
      return cachedUrl;
    }
    return null;
  };

  const heroImageUrl = getHeroImageUrl();
  const hasHeroImage = heroImageUrl !== null;

  return (
    <section className="hero-section relative h-screen flex items-center justify-center overflow-hidden">
      {/* Preload hero image for faster LCP */}
      {hasHeroImage && (
        <link
          rel="preload"
          as="image"
          href={heroImageUrl}
          fetchPriority="high"
        />
      )}

      {/* Background: immagine da admin oppure gradiente elegante */}
      {hasHeroImage ? (
        <div
          className="absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            backgroundImage: `url('${heroImageUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 35%',
            backgroundRepeat: 'no-repeat',
            willChange: 'transform',
          }}
        />
      ) : (
        <div
          className="absolute inset-0 z-0 bg-gradient-to-br from-slate-800 via-slate-700 to-blue-900"
        />
      )}

      {/* Subtle overlay */}
      <div className={`absolute inset-0 z-10 ${hasHeroImage ? 'bg-black/20' : 'bg-black/10'}`} />

      {/* Content */}
      <div className="container mx-auto px-6 sm:px-8 text-center z-20 relative text-white">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">

          {/* Main title - elegant typography */}
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-wide">
              Villa MareBlu
            </h1>
            <div className="w-16 sm:w-24 h-px bg-white/80 mx-auto"></div>
            <p className="text-lg sm:text-xl md:text-2xl font-light text-white/90 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
              Eleganza e tranquillità nel Salento
            </p>
          </div>

          {/* Simple CTA - Mobile optimized */}
          <div className="pt-6 sm:pt-8 px-4 sm:px-0">
            <Button
              size="lg"
              onClick={handleQuoteClick}
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white hover:text-black px-8 sm:px-16 py-5 sm:py-6 text-base sm:text-xl font-medium rounded-none transition-all duration-300 border-2 w-full sm:w-auto touch-manipulation"
            >
              Calcola Preventivo
            </Button>
          </div>
        </div>
      </div>

      {/* Minimal scroll indicator - hidden on very small screens */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 hidden sm:block">
        <div className="w-px h-10 sm:h-12 bg-white/30 mx-auto mb-2"></div>
        <div className="text-xs uppercase tracking-widest">Scroll</div>
      </div>
    </section>
  );
};

export default HeroSection;
