
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { imageService, ImageRecord } from "@/services/imageService";

export const HomeImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);

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

  const nextImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === displayImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? displayImages.length - 1 : prevIndex - 1
    );
  };

  // Auto-advance carousel
  useEffect(() => {
    if (displayImages.length <= 1) return;

    const timer = setInterval(nextImage, 5000);
    return () => clearInterval(timer);
  }, [displayImages.length]);

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
              <div className="relative aspect-[16/9] md:aspect-[21/9]">
                <img
                  src={displayImages[currentIndex].url}
                  alt={displayImages[currentIndex].alt}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                
                {displayImages.length > 1 && (
                  <>
                    {/* Navigation buttons */}
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                    
                    {/* Dots indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {displayImages.map((_, index) => (
                        <button
                          key={index}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentIndex
                              ? "bg-white scale-110"
                              : "bg-white/50 hover:bg-white/75"
                          }`}
                          onClick={() => setCurrentIndex(index)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Image counter */}
        {displayImages.length > 1 && (
          <div className="text-center mt-6">
            <span className="text-sm text-gray-500">
              {currentIndex + 1} di {displayImages.length}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
