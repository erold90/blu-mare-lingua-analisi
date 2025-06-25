
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
        // Timeout ridotto per caricamento più veloce
        const timeoutPromise = new Promise<ImageRecord[]>((_, reject) =>
          setTimeout(() => reject(new Error('Hero image timeout')), 1500)
        );
        
        const heroImagesPromise = imageService.getImagesByCategory('hero');
        
        const heroImages = await Promise.race([heroImagesPromise, timeoutPromise]);
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
    <section 
      className="relative h-screen flex items-center justify-center text-white overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url('${getBackgroundImage()}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll'
      }}
    >
      {/* Simplified overlay without parallax */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      
      {/* Reduced particles for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 text-center z-20 relative">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold mb-6 md:mb-8 drop-shadow-2xl animate-fade-in">
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              Villa MareBlu
            </span>
          </h1>
          
          <div className="h-1 w-24 md:w-32 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-6 md:mb-8 animate-scale-in animation-delay-500" />
          
          <p className="text-lg md:text-xl lg:text-2xl mb-8 md:mb-12 max-w-3xl mx-auto drop-shadow-lg leading-relaxed animate-fade-in animation-delay-700 px-4">
            Villa con vista mare nel Salento. Tranquillità e comfort per una vacanza indimenticabile.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center animate-fade-in animation-delay-1000 px-4">
            <Button 
              size="lg" 
              onClick={handleQuoteClick}
              className="group bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white hover:text-gray-900 px-8 md:px-10 py-4 md:py-6 text-base md:text-lg font-semibold rounded-full shadow-2xl hover:shadow-white/20 transition-all duration-500 transform hover:scale-105"
            >
              Calcola Preventivo
              <ChevronRight className="ml-2 h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate("/appartamenti")}
              className="group bg-transparent border-2 border-white/40 text-white hover:bg-white/20 hover:border-white px-8 md:px-10 py-4 md:py-6 text-base md:text-lg font-semibold rounded-full shadow-xl transition-all duration-500 transform hover:scale-105"
            >
              Scopri gli Appartamenti
            </Button>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-2 md:h-3 bg-white/70 rounded-full mt-1 md:mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
