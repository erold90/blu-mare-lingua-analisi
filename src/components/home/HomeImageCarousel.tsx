
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { imageService, ImageRecord } from "@/services/imageService";
import { imageService as imageUtilService } from "@/utils/image";
import Autoplay from "embla-carousel-autoplay";

export const HomeImageCarousel = () => {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const timeoutPromise = new Promise<ImageRecord[]>((_, reject) =>
          setTimeout(() => reject(new Error('Image loading timeout')), 10000) // Aumentato a 10s
        );
        
        const imagesPromise = imageService.getImagesByCategory('home_gallery');
        
        const galleryImages = await Promise.race([imagesPromise, timeoutPromise]);
        setImages(galleryImages);
        
        // Preload ottimizzato - solo le prime 2 immagini
        if (galleryImages.length > 0) {
          const firstTwoImages = galleryImages.slice(0, 2).map(img => 
            imageService.getImageUrl(img.file_path)
          );
          // Usa il servizio corretto per il preload
          imageUtilService.preloadImages(firstTwoImages, 1); // Ridotta concorrenza
        }
      } catch (error) {
        console.error('Error loading gallery images:', error);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
              Scopri Villa MareBlu
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Una collezione di immagini che racconta la bellezza e l'eleganza del nostro resort
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
              Scopri Villa MareBlu
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Una collezione di immagini che racconta la bellezza e l'eleganza del nostro resort
            </p>
          </div>
          <div className="text-center text-muted-foreground">
            <p>Nessuna immagine disponibile al momento.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-blue-50/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
            Scopri Villa MareBlu
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Una collezione di immagini che racconta la bellezza e l'eleganza del nostro resort
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto animate-fade-in animation-delay-300">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 6000, // Aumentato per performance
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-1">
              {images.map((image, index) => (
                <CarouselItem key={image.id} className="pl-1 md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <CardContent className="p-0">
                        <div className="aspect-[4/3] relative overflow-hidden">
                          <img
                            src={imageService.getImageUrl(image.file_path)}
                            alt={image.alt_text || `Villa MareBlu - Immagine ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                            loading={index < 2 ? "eager" : "lazy"}
                            onError={(e) => {
                              console.error('Gallery image failed to load:', image.file_path);
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};
