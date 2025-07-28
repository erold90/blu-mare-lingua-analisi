
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { imageService, ImageRecord } from "@/services/imageService";

const HeroSection = () => {
  const navigate = useNavigate();
  const [heroImage, setHeroImage] = useState<ImageRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHeroImage = async () => {
      try {
        // Timeout disabilitato per evitare errori, gestita con try/catch
        const heroImages = await imageService.getImagesByCategory('hero');
        const primaryImage = heroImages.find(img => img.is_cover) || heroImages[0] || null;
        setHeroImage(primaryImage);
      } catch (error) {
        console.error('Error loading hero image:', error);
        // Fallback veloce senza immagine da Supabase
      } finally {
        setLoading(false);
      }
    };

    loadHeroImage();
  }, []);

  const handleQuoteClick = () => {
    navigate("/preventivo");
  };

  const getBackgroundImage = () => {
    if (heroImage) {
      return imageService.getImageUrl(heroImage.file_path);
    }
    return "/images/hero/hero.jpg"; // Fallback image
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Clean background image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('${getBackgroundImage()}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
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
              className="bg-transparent border-white/50 text-white hover:bg-white hover:text-black px-12 py-4 text-lg font-light rounded-none transition-all duration-300"
            >
              Richiedi Preventivo
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
