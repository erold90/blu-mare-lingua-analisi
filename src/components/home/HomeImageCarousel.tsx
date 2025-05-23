
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { imageService, ImageRecord } from "@/services/imageService";

export const HomeImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const loadGalleryImages = async () => {
      try {
        const images = await imageService.getImagesByCategory('home_gallery');
        setGalleryImages(images);
      } catch (error) {
        console.error('Error loading gallery images:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGalleryImages();
  }, []);

  // Fallback images se non ci sono immagini nel database
  const fallbackImages = [
    "/images/gallery/image1.jpg",
    "/images/gallery/image2.jpg",
    "/images/gallery/image3.jpg",
    "/images/gallery/image4.jpg",
    "/images/gallery/image5.jpg"
  ];

  const displayImages = galleryImages.length > 0 
    ? galleryImages.map(img => ({
        url: imageService.getImageUrl(img.file_path),
        alt: img.alt_text || img.file_name
      }))
    : fallbackImages.map(url => ({ url, alt: "Villa Marina Resort" }));

  const changeImage = (newIndex: number) => {
    if (isTransitioning || newIndex === currentIndex || displayImages.length <= 1) return;
    
    setIsTransitioning(true);
    
    // Smooth transition delay
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 150);
  };

  const nextImage = () => {
    const newIndex = (currentIndex + 1) % displayImages.length;
    changeImage(newIndex);
  };

  const prevImage = () => {
    const newIndex = (currentIndex - 1 + displayImages.length) % displayImages.length;
    changeImage(newIndex);
  };

  // Auto-advance carousel
  useEffect(() => {
    if (displayImages.length <= 1) return;

    const timer = setInterval(nextImage, 5000);
    return () => clearInterval(timer);
  }, [displayImages.length, currentIndex]);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Caricamento galleria...
            </h2>
          </div>
        </div>
      </section>
    );
  }

  if (displayImages.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Scopri Villa Marina
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Una collezione di immagini che racconta la bellezza e l'eleganza del nostro resort
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <Card className="overflow-hidden shadow-2xl">
            <CardContent className="p-0">
              <div className="relative aspect-[16/9] md:aspect-[21/9] bg-gray-100">
                {/* Contenitore per le transizioni fluide */}
                <div className="relative w-full h-full overflow-hidden">
                  {displayImages.map((image, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                        index === currentIndex 
                          ? 'opacity-100 scale-100 z-10' 
                          : 'opacity-0 scale-105 z-0'
                      }`}
                      style={{
                        transform: index === currentIndex 
                          ? 'translateX(0)' 
                          : index < currentIndex 
                            ? 'translateX(-100%)' 
                            : 'translateX(100%)'
                      }}
                    >
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover transition-all duration-500"
                      />
                    </div>
                  ))}
                  
                  {/* Overlay per transizione */}
                  <div 
                    className={`absolute inset-0 bg-black/10 transition-opacity duration-300 pointer-events-none ${
                      isTransitioning ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>
                
                {displayImages.length > 1 && (
                  <>
                    {/* Navigation buttons con effetti migliorati */}
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 disabled:bg-black/20 text-white transition-all duration-300 hover:scale-110 backdrop-blur-sm z-20 group"
                      onClick={prevImage}
                      disabled={isTransitioning}
                    >
                      <ChevronLeft className="h-6 w-6 transition-transform group-hover:-translate-x-0.5" />
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 disabled:bg-black/20 text-white transition-all duration-300 hover:scale-110 backdrop-blur-sm z-20 group"
                      onClick={nextImage}
                      disabled={isTransitioning}
                    >
                      <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                    
                    {/* Indicatori con animazioni migliorate */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                      {displayImages.map((_, index) => (
                        <button
                          key={index}
                          className={`transition-all duration-300 ease-out rounded-full ${
                            index === currentIndex
                              ? "w-8 h-3 bg-white shadow-lg"
                              : "w-3 h-3 bg-white/60 hover:bg-white/80 hover:scale-110"
                          }`}
                          onClick={() => changeImage(index)}
                          disabled={isTransitioning}
                        />
                      ))}
                    </div>
                    
                    {/* Contatore immagini */}
                    <div className="absolute top-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm z-20">
                      {currentIndex + 1} / {displayImages.length}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Image counter text */}
        {displayImages.length > 1 && (
          <div className="text-center mt-6">
            <span className="text-sm text-gray-500 font-medium">
              {currentIndex + 1} di {displayImages.length}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
