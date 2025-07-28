
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-600">
      {/* Background image with modern overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('${getBackgroundImage()}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Modern gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/60 to-cyan-600/70 z-10" />
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 bg-white/10 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="container mx-auto px-6 text-center z-30 relative">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8 animate-fade-in">
            <span className="text-white/90 text-sm font-medium">🏖️ Salento • Vista Mare • Lusso</span>
          </div>
          
          {/* Main title */}
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold mb-6 animate-fade-in animation-delay-200">
            <span className="bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent drop-shadow-2xl">
              Villa MareBlu
            </span>
          </h1>
          
          {/* Decorative line */}
          <div className="h-1 w-32 bg-gradient-to-r from-cyan-400 via-white to-blue-400 mx-auto mb-8 rounded-full animate-scale-in animation-delay-500" />
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl mb-12 max-w-4xl mx-auto text-white/90 leading-relaxed animate-fade-in animation-delay-700 font-light">
            <span className="font-medium">Appartamenti vista mare</span> nel cuore del Salento.
            <br className="hidden md:block" />
            Dove il <span className="text-cyan-200">lusso</span> incontra la <span className="text-blue-200">tranquillità</span>.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in animation-delay-1000">
            <Button 
              size="lg" 
              onClick={handleQuoteClick}
              className="group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 px-10 py-6 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1"
            >
              <span className="mr-2">💎</span>
              Calcola Preventivo
              <ChevronRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-2" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate("/appartamenti")}
              className="group bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 px-10 py-6 text-lg font-semibold rounded-2xl shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1"
            >
              <span className="mr-2">🏡</span>
              Scopri gli Appartamenti
            </Button>
          </div>
        </div>
      </div>
      
      {/* Modern scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-30">
        <div className="flex flex-col items-center space-y-2">
          <span className="text-white/70 text-sm font-medium">Scopri di più</span>
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
