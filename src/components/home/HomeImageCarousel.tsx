
import { useEffect, useState } from "react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { useSettings } from "@/hooks/useSettings";
import Autoplay from "embla-carousel-autoplay";
import { ImageIcon } from "lucide-react";

export const HomeImageCarousel = () => {
  const { siteSettings } = useSettings();
  const [api, setApi] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  
  // Autoreplay plugin - will pause on hover/interaction
  const autoplayPlugin = Autoplay({ delay: 5000, stopOnInteraction: true });
  
  // Listen for slide changes
  useEffect(() => {
    if (!api) return;
    
    const onSelect = () => {
      setCurrentSlide(api.selectedScrollSnap());
    };
    
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Verifica se ci sono immagini valide
  const validImages = siteSettings.homeImages?.filter(img => img && img !== '') || [];
  const hasImages = validImages.length > 0;
  
  // Inizializza lo stato di caricamento delle immagini
  useEffect(() => {
    if (hasImages) {
      setImagesLoaded(new Array(validImages.length).fill(false));
    }
  }, [hasImages, validImages.length]);
  
  // Gestisce il caricamento delle immagini
  const handleImageLoad = (index: number) => {
    setImagesLoaded(prev => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  };
  
  // Gestisce gli errori di caricamento delle immagini
  const handleImageError = (index: number) => {
    console.error(`Errore nel caricamento dell'immagine ${index}:`, validImages[index]);
    setImagesLoaded(prev => {
      const updated = [...prev];
      updated[index] = false;
      return updated;
    });
  };
  
  // Quando non ci sono immagini valide, mostriamo un placeholder
  const placeholderImage = "/placeholder.svg";
  
  return (
    <div className="relative w-full py-10">
      <Carousel 
        opts={{ loop: true }} 
        plugins={[autoplayPlugin]} 
        setApi={setApi}
        className="w-full max-w-5xl mx-auto"
      >
        <CarouselContent>
          {hasImages ? (
            validImages.map((image, index) => (
              <CarouselItem key={index}>
                <div className="aspect-video overflow-hidden rounded-lg bg-muted relative">
                  {!imagesLoaded[index] && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                    </div>
                  )}
                  <img 
                    src={image} 
                    alt={`Villa MareBlu immagine ${index + 1}`} 
                    className={`w-full h-full object-cover transition-all duration-300 hover:scale-105 ${
                      imagesLoaded[index] ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index)}
                  />
                </div>
              </CarouselItem>
            ))
          ) : (
            <CarouselItem>
              <div className="aspect-video overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                  <p className="text-muted-foreground">Nessuna immagine disponibile</p>
                </div>
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
      
      {/* Slide indicators */}
      {hasImages && validImages.length > 1 && (
        <div className="flex justify-center gap-1 mt-4">
          {validImages.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide 
                  ? "bg-primary w-4" 
                  : "bg-muted-foreground/30"
              }`}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Vai all'immagine ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
