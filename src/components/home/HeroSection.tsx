
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { imageService, ImageRecord } from "@/services/imageService";

const HeroSection = () => {
  const navigate = useNavigate();
  const [heroImage, setHeroImage] = useState<ImageRecord | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const loadHeroImage = async () => {
      try {
        // Carica le immagini hero dal database (quelle impostate nell'area admin)
        const heroImages = await imageService.getImagesByCategory('hero');
        // Usa l'immagine con is_cover=true oppure la prima disponibile
        const primaryImage = heroImages.find(img => img.is_cover) || heroImages[0] || null;
        setHeroImage(primaryImage);
      } catch (error) {
        console.error('Errore caricamento immagine hero:', error);
      }
    };

    loadHeroImage();

    // Ascolta gli aggiornamenti delle immagini dall'area admin
    const handleHomeImageUpdate = () => {
      loadHeroImage();
    };

    window.addEventListener('homeImagesUpdated', handleHomeImageUpdate);

    return () => {
      window.removeEventListener('homeImagesUpdated', handleHomeImageUpdate);
    };
  }, []);

  const handleQuoteClick = () => {
    navigate("/richiedi-preventivo");
  };

  // Usa l'immagine dal database se disponibile, altrimenti fallback
  const getHeroImageUrl = () => {
    if (heroImage) {
      return imageService.getHeroUrl(heroImage.file_path);
    }
    return "/images/hero/hero.jpg"; // Fallback solo se database vuoto
  };

  const heroImageUrl = getHeroImageUrl();

  return (
    <section className="hero-section relative h-screen flex items-center justify-center overflow-hidden">
      {/* Preload hero image for faster LCP */}
      <link
        rel="preload"
        as="image"
        href={heroImageUrl}
        fetchPriority="high"
      />

      {/* Clean background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('${heroImageUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          backgroundRepeat: 'no-repeat',
          willChange: 'transform', // GPU acceleration
        }}
      />

      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-black/20 z-10" />

      {/* Content */}
      <div className="container mx-auto px-8 text-center z-20 relative text-white">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Main title - elegant typography */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-light tracking-wide">
              Villa MareBlu
            </h1>
            <div className="w-24 h-px bg-white/80 mx-auto"></div>
            <p className="text-xl md:text-2xl font-light text-white/90 max-w-2xl mx-auto leading-relaxed">
              Eleganza e tranquillità nel Salento
            </p>
          </div>

          {/* Simple CTA */}
          <div className="pt-8">
            <Button
              size="lg"
              onClick={handleQuoteClick}
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white hover:text-black px-16 py-6 text-xl font-medium rounded-none transition-all duration-300 border-2"
            >
              Calcola Preventivo
            </Button>
          </div>
        </div>
      </div>

      {/* Minimal scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
        <div className="w-px h-12 bg-white/30 mx-auto mb-2"></div>
        <div className="text-xs uppercase tracking-widest">Scroll</div>
      </div>
    </section>
  );
};

export default HeroSection;
