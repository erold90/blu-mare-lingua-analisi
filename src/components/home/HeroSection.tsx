
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { imageService, ImageRecord } from "@/services/imageService";

const HeroSection = () => {
  const navigate = useNavigate();
  const [heroImage, setHeroImage] = useState<ImageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const loadHeroImage = async () => {
      try {
        const heroImages = await imageService.getImagesByCategory('hero');
        const primaryImage = heroImages.find(img => img.is_cover) || heroImages[0] || null;
        setHeroImage(primaryImage);
      } catch (error) {
        console.error('Error loading hero image:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHeroImage();

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleQuoteClick = () => {
    navigate("/preventivo");
  };

  const getBackgroundImage = () => {
    if (heroImage) {
      return imageService.getImageUrl(heroImage.file_path);
    }
    return "/images/hero/hero.jpg";
  };

  return (
    <section 
      className="relative h-screen flex items-center justify-center text-white overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url('${getBackgroundImage()}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Parallax overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
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

      <div 
        className="container mx-auto px-4 text-center z-20 relative"
        style={{ transform: `translateY(${scrollY * 0.2}px)` }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 drop-shadow-2xl animate-fade-in">
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              Villa MareBlu
            </span>
          </h1>
          
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-8 animate-scale-in animation-delay-500" />
          
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto drop-shadow-lg leading-relaxed animate-fade-in animation-delay-700">
            Scopri il paradiso nel cuore del Salento. Appartamenti di lusso con vista mozzafiato 
            e tutti i comfort per una vacanza indimenticabile.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in animation-delay-1000">
            <Button 
              size="lg" 
              onClick={handleQuoteClick}
              className="group bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white hover:text-gray-900 px-10 py-6 text-lg font-semibold rounded-full shadow-2xl hover:shadow-white/20 transition-all duration-500 transform hover:scale-105"
            >
              Richiedi Preventivo
              <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate("/appartamenti")}
              className="group bg-transparent border-2 border-white/40 text-white hover:bg-white/20 hover:border-white px-10 py-6 text-lg font-semibold rounded-full shadow-xl transition-all duration-500 transform hover:scale-105"
            >
              Scopri gli Appartamenti
            </Button>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
