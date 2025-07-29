
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

    // Listen for home image updates from admin panel
    const handleHomeImageUpdate = () => {
      console.log("🔄 Received homeImagesUpdated event, reloading hero image...");
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

  const getBackgroundImage = () => {
    if (heroImage) {
      return imageService.getImageUrl(heroImage.file_path);
    }
    return "/images/hero/hero.jpg"; // Fallback image
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#D4B496]">
      {/* Arch frame container */}
      <div className="relative w-full h-full max-w-7xl mx-auto">
        {/* Arch-shaped frame */}
        <div 
          className="absolute inset-x-4 inset-y-12 md:inset-x-8 md:inset-y-16 z-10"
          style={{
            background: `url('${getBackgroundImage()}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            clipPath: 'ellipse(50% 45% at 50% 55%)',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'
          }}
        >
          {/* Content overlay */}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center text-center text-white">
            <div className="max-w-4xl mx-auto space-y-8 px-8">
              
              {/* Main title - elegant typography */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-wide">
                  Villa MareBlu
                </h1>
                <div className="w-24 h-px bg-white/80 mx-auto"></div>
                <p className="text-lg md:text-xl font-light text-white/90 max-w-2xl mx-auto leading-relaxed">
                  Eleganza e tranquillità nel Salento
                </p>
              </div>
              
              {/* Simple CTA */}
              <div className="pt-4">
                <Button 
                  size="lg" 
                  onClick={handleQuoteClick}
                  variant="outline"
                  className="bg-transparent border-white/50 text-white hover:bg-white hover:text-black px-8 py-3 text-base font-light rounded-none transition-all duration-300"
                >
                  Richiedi Preventivo
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Arch frame border */}
        <div 
          className="absolute inset-x-4 inset-y-12 md:inset-x-8 md:inset-y-16 border-4 border-[#B8956F]"
          style={{
            clipPath: 'ellipse(50% 45% at 50% 55%)',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'
          }}
        />
      </div>
      
      {/* Minimal scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-[#8B6F47] z-20">
        <div className="w-px h-12 bg-[#8B6F47]/50 mx-auto mb-2"></div>
        <div className="text-xs uppercase tracking-widest font-medium">Scroll</div>
      </div>
    </section>
  );
};

export default HeroSection;
