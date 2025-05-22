
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

export const HomeImageCarousel = () => {
  const { siteSettings } = useSettings();
  const [api, setApi] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
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

  const hasImages = siteSettings.homeImages && siteSettings.homeImages.length > 0;
  
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
            siteSettings.homeImages.map((image, index) => (
              <CarouselItem key={index}>
                <div className="aspect-video overflow-hidden rounded-lg">
                  <img 
                    src={image} 
                    alt={`Villa MareBlu immagine ${index + 1}`} 
                    className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
                  />
                </div>
              </CarouselItem>
            ))
          ) : (
            <CarouselItem>
              <div className="aspect-video overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Nessuna immagine disponibile</p>
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
      
      {/* Slide indicators */}
      {hasImages && siteSettings.homeImages.length > 1 && (
        <div className="flex justify-center gap-1 mt-4">
          {siteSettings.homeImages.map((_, index) => (
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
