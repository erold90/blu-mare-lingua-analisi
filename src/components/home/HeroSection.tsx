
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
  }, []);

  const handleQuoteClick = () => {
    navigate("/preventivo");
  };

  const getBackgroundImage = () => {
    if (heroImage) {
      return imageService.getImageUrl(heroImage.file_path);
    }
    // Fallback alla vecchia immagine statica
    return "/images/hero/hero.jpg";
  };

  return (
    <section 
      className="relative h-[90vh] flex items-center justify-center text-white overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${getBackgroundImage()}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="container mx-auto px-4 text-center z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
          Villa MareBlu
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto drop-shadow-md">
          Scopri il paradiso nel cuore del Salento. Appartamenti di lusso con vista mozzafiato 
          e tutti i comfort per una vacanza indimenticabile.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={handleQuoteClick}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Richiedi Preventivo
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => navigate("/appartamenti")}
            className="bg-white/20 backdrop-blur-sm border-white text-white hover:bg-white hover:text-gray-900 px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Scopri gli Appartamenti
          </Button>
        </div>
      </div>
      
      {/* Overlay decorativo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
