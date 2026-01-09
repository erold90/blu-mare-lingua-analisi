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

// Fullscreen Gallery Component (rendered via Portal)
const FullscreenGallery: React.FC<{
  images: string[];
  currentIndex: number;
  apartmentName: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSelectIndex: (index: number) => void;
}> = ({ images, currentIndex, apartmentName, onClose, onNext, onPrev, onSelectIndex }) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onNext();
    } else if (isRightSwipe) {
      onPrev();
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNext, onPrev]);

  return createPortal(
    <div
      className="fixed inset-0 bg-black flex items-center justify-center"
      style={{ zIndex: 99999 }}
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors"
        aria-label="Chiudi"
      >
        <X className="w-7 h-7 text-white" />
      </button>

      {/* Image counter */}
      <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm">
        <span className="text-white text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </span>
      </div>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors"
            aria-label="Immagine precedente"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors"
            aria-label="Immagine successiva"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        </>
      )}

      {/* Main image */}
      <img
        src={images[currentIndex]}
        alt={`${apartmentName} - Immagine ${currentIndex + 1}`}
        className="max-w-[95vw] max-h-[80vh] object-contain select-none"
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/60 backdrop-blur-sm rounded-lg max-w-[95vw] overflow-x-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((image, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                onSelectIndex(index);
              }}
              className={`flex-shrink-0 w-14 h-10 rounded overflow-hidden transition-all ${
                index === currentIndex
                  ? 'ring-2 ring-white opacity-100 scale-110'
                  : 'opacity-50 hover:opacity-75 active:opacity-100'
              }`}
            >
              <img
                src={image}
                alt={`Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}

      {/* Swipe hint (shown briefly) */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/50 text-xs md:hidden">
        Scorri per navigare
      </div>
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

  const nextFullscreenImage = useCallback(() => {
    setFullscreenIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevFullscreenImage = useCallback(() => {
    setFullscreenIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  if (!apartment) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-primary">
              {apartment.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Image Gallery */}
            <div className="relative">
              <Carousel className="w-full" setApi={setApi}>
                <CarouselContent>
                  {images.map((image, index) => (
                    <CarouselItem key={index}>
                      <Card className="overflow-hidden border-0 shadow-none">
                        <CardContent className="p-0">
                          <div
                            className="aspect-[16/9] relative cursor-pointer group"
                            onClick={() => openFullscreen(index)}
                          >
                            <img
                              src={image}
                              alt={`${apartment.name} - Immagine ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-lg flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                                <span className="text-sm font-medium text-gray-800 flex items-center gap-2">
                                  <Eye className="w-4 h-4" />
                                  Clicca per ingrandire
                                </span>
                              </div>
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
                <div className="flex justify-center gap-2 mt-4">
                  {Array.from({ length: count }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => api?.scrollTo(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === current
                          ? 'bg-primary w-6'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Vai all'immagine ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Image Counter */}
              <div className="flex justify-center mt-3">
                <span className="text-sm text-muted-foreground">
                  {current + 1} / {count} foto
                </span>
              </div>
            </div>

            {/* Apartment Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-serif font-semibold mb-2">Descrizione</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {apartment.longDescription || apartment.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-sm">Fino a {apartment.capacity} ospiti</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-primary" />
                    <span className="text-sm">{apartment.bedrooms} camere</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary" />
                    <span className="text-sm">{apartment.size}m²</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    <span className="text-sm">Vista {apartment.view}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-serif font-semibold mb-3">Servizi</h3>
                  <div className="flex flex-wrap gap-2">
                    {apartment.services.map((service, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-2 px-3 py-2"
                      >
                        {getServiceIcon(service)}
                        <span className="text-xs">{service}</span>
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
            <div className="border-t pt-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Piano {apartment.floor}
                </div>
                <Button
                  onClick={handleBookNow}
                  size="lg"
                  className="px-8"
                >
                  Richiedi Preventivo
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Gallery (rendered via Portal) */}
      {fullscreenOpen && apartment && (
        <FullscreenGallery
          images={images}
          currentIndex={fullscreenIndex}
          apartmentName={apartment.name}
          onClose={closeFullscreen}
          onNext={nextFullscreenImage}
          onPrev={prevFullscreenImage}
          onSelectIndex={setFullscreenIndex}
        />
      )}
    </>
  );
};
