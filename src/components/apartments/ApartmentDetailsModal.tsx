import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Wifi, Car, Tv, Wind, Building, Home, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Apartment } from '@/data/apartments';
import { useNavigate } from 'react-router-dom';

interface ApartmentDetailsModalProps {
  apartment: Apartment | null;
  images: string[];
  isOpen: boolean;
  onClose: () => void;
}

// Fullscreen Gallery Component - completamente isolato
const FullscreenGallery: React.FC<{
  images: string[];
  initialIndex: number;
  apartmentName: string;
  onClose: () => void;
}> = ({ images, initialIndex, apartmentName, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) goNext();
    else if (distance < -minSwipeDistance) goPrev();
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };

    // Blocca lo scroll del body
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [onClose, goNext, goPrev]);

  return createPortal(
    <div
      className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center touch-none"
      style={{ zIndex: 2147483647 }} // Massimo z-index possibile
      onClick={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header con counter e close */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-20">
        <div className="px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm">
          <span className="text-white text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="p-3 rounded-full bg-black/70 backdrop-blur-sm active:bg-white/30"
          aria-label="Chiudi"
        >
          <X className="w-7 h-7 text-white" />
        </button>
      </div>

      {/* Navigazione laterale */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goPrev();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-black/50 active:bg-white/30"
            aria-label="Precedente"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goNext();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-black/50 active:bg-white/30"
            aria-label="Successiva"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        </>
      )}

      {/* Immagine principale */}
      <div className="flex-1 flex items-center justify-center w-full px-4 py-20">
        <img
          src={images[currentIndex]}
          alt={`${apartmentName} - Immagine ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-20">
          <div className="flex justify-center">
            <div
              className="flex gap-2 p-2 bg-black/70 backdrop-blur-sm rounded-lg overflow-x-auto max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={`flex-shrink-0 w-14 h-10 rounded overflow-hidden transition-all ${
                    index === currentIndex
                      ? 'ring-2 ring-white scale-110'
                      : 'opacity-50 active:opacity-100'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Miniatura ${index + 1}`}
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          </div>
          <p className="text-center text-white/50 text-xs mt-2 md:hidden">
            Scorri per navigare
          </p>
        </div>
      )}
    </div>,
    document.body
  );
};

export const ApartmentDetailsModal: React.FC<ApartmentDetailsModalProps> = ({
  apartment,
  images,
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const getServiceIcon = (service: string) => {
    const lowerService = service.toLowerCase();
    if (lowerService.includes('wifi')) return <Wifi className="w-4 h-4" />;
    if (lowerService.includes('parcheggio')) return <Car className="w-4 h-4" />;
    if (lowerService.includes('tv')) return <Tv className="w-4 h-4" />;
    if (lowerService.includes('aria') || lowerService.includes('condizionata')) return <Wind className="w-4 h-4" />;
    if (lowerService.includes('veranda') || lowerService.includes('terrazzo')) return <Home className="w-4 h-4" />;
    return <Building className="w-4 h-4" />;
  };

  const handleBookNow = () => {
    onClose();
    navigate('/richiedi-preventivo');
  };

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setFullscreenOpen(true);
  };

  const closeFullscreen = () => {
    setFullscreenOpen(false);
  };

  if (!apartment) return null;

  // Se fullscreen è aperto, mostra SOLO il fullscreen (nasconde il Dialog)
  if (fullscreenOpen) {
    return (
      <FullscreenGallery
        images={images}
        initialIndex={fullscreenIndex}
        apartmentName={apartment.name}
        onClose={closeFullscreen}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[80vh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-serif text-primary">
            {apartment.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 overflow-hidden">
          {/* Image Gallery */}
          <div className="relative overflow-hidden">
            <Carousel className="w-full overflow-hidden" setApi={setApi}>
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index}>
                    <Card className="overflow-hidden border-0 shadow-none">
                      <CardContent className="p-0">
                        <div
                          className="aspect-[4/3] sm:aspect-[16/9] relative cursor-pointer group"
                          onClick={() => openFullscreen(index)}
                        >
                          <img
                            src={image}
                            alt={`${apartment.name} - Immagine ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                          {/* Small zoom icon in corner */}
                          <div className="absolute bottom-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm opacity-70 group-hover:opacity-100 transition-opacity">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg" />
              <CarouselNext className="right-2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg" />
            </Carousel>

            {/* Dot Indicators */}
            {count > 1 && (
              <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-2 sm:mt-4">
                {Array.from({ length: count }).map((_, index) => (
                  <span
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    role="button"
                    tabIndex={0}
                    className={`block p-0 rounded-full transition-all duration-300 cursor-pointer ${
                      index === current
                        ? 'bg-primary w-3 h-1.5 sm:w-5 sm:h-2'
                        : 'bg-gray-300 hover:bg-gray-400 w-1.5 h-1.5 sm:w-2 sm:h-2'
                    }`}
                    aria-label={`Vai all'immagine ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Image Counter */}
            <div className="flex justify-center mt-1 sm:mt-3">
              <span className="text-xs sm:text-sm text-muted-foreground">
                {current + 1} / {count} foto
              </span>
            </div>
          </div>

          {/* Apartment Info */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-semibold mb-1 sm:mb-2">Descrizione</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed break-words">
                  {apartment.longDescription || apartment.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <span className="text-xs sm:text-sm">Fino a {apartment.capacity} ospiti</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Home className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <span className="text-xs sm:text-sm">{apartment.bedrooms} camere</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Building className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <span className="text-xs sm:text-sm">{apartment.size}m²</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <span className="text-xs sm:text-sm">Vista {apartment.view}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-semibold mb-2 sm:mb-3">Servizi</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {apartment.services.map((service, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2"
                    >
                      {getServiceIcon(service)}
                      <span className="text-[10px] sm:text-xs">{service}</span>
                    </Badge>
                  ))}
                </div>
              </div>

              {apartment.CIN && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Codice Identificativo Nazionale
                  </h4>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {apartment.CIN}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="border-t pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
              <div className="text-xs sm:text-sm text-muted-foreground">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                Piano {apartment.floor}
              </div>
              <Button
                onClick={handleBookNow}
                size="default"
                className="w-full sm:w-auto px-6 sm:px-8"
              >
                Richiedi Preventivo
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
