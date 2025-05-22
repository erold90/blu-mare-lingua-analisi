
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
import { Skeleton } from "@/components/ui/skeleton";
import { getImage } from "@/utils/imageStorage";

export const HomeImageCarousel = () => {
  const { siteSettings } = useSettings();
  const [api, setApi] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: string }>({});
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  // Load all images from IndexedDB
  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true);
      
      // Get valid image paths from settings
      const validPaths = siteSettings.homeImages?.filter(img => img && img !== '') || [];
      
      if (validPaths.length === 0) {
        setIsLoading(false);
        return;
      }
      
      // Initialize loading state array
      setImagesLoaded(new Array(validPaths.length).fill(false));
      
      // Load each image from storage
      const loadedImageData: { [key: string]: string } = {};
      
      await Promise.all(
        validPaths.map(async (path, index) => {
          if (path.startsWith('/upload/')) {
            try {
              const storedImage = await getImage(path);
              if (storedImage && storedImage.data) {
                loadedImageData[path] = storedImage.data;
                
                // Update loading state for this image
                setImagesLoaded(prev => {
                  const newState = [...prev];
                  newState[index] = true;
                  return newState;
                });
              }
            } catch (error) {
              console.error(`Error loading image ${path}:`, error);
            }
          } else {
            // External URL
            loadedImageData[path] = path;
            
            // Update loading state for this image
            setImagesLoaded(prev => {
              const newState = [...prev];
              newState[index] = true;
              return newState;
            });
          }
        })
      );
      
      setLoadedImages(loadedImageData);
      setIsLoading(false);
    };
    
    loadImages();
  }, [siteSettings.homeImages]);
  
  // Get image data for a given path
  const getImageData = (path: string): string => {
    return loadedImages[path] || path;
  };
  
  // When there are no valid images, show a placeholder
  const validImages = siteSettings.homeImages?.filter(img => img && img !== '') || [];
  const hasImages = validImages.length > 0;
  
  // Handle image load event
  const handleImageLoad = (index: number) => {
    setImagesLoaded(prev => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  };
  
  // Handle image error event
  const handleImageError = (index: number) => {
    console.error(`Error loading image ${index}:`, validImages[index]);
    setImagesLoaded(prev => {
      const updated = [...prev];
      updated[index] = false;
      return updated;
    });
  };

  return (
    <div className="relative w-full py-10">
      <Carousel 
        opts={{ loop: true }} 
        plugins={[autoplayPlugin]} 
        setApi={setApi}
        className="w-full max-w-5xl mx-auto"
      >
        <CarouselContent>
          {isLoading ? (
            // Loading skeleton
            <CarouselItem>
              <div className="aspect-video rounded-lg overflow-hidden">
                <Skeleton className="w-full h-full" />
              </div>
            </CarouselItem>
          ) : hasImages ? (
            // Display actual images
            validImages.map((imagePath, index) => (
              <CarouselItem key={index}>
                <div className="aspect-video overflow-hidden rounded-lg bg-muted relative">
                  {!imagesLoaded[index] && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                    </div>
                  )}
                  <img 
                    src={getImageData(imagePath)} 
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
            // No images available
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
