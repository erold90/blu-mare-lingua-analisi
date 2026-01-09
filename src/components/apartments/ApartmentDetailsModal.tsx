import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Wifi, Car, Tv, Wind, Building, Home, Eye, Images, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Apartment } from '@/data/apartments';
import { useNavigate } from 'react-router-dom';

interface ApartmentDetailsModalProps {
  apartment: Apartment | null;
  images: string[];
  isOpen: boolean;
  onClose: () => void;
}

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

  // Handle keyboard navigation in fullscreen
  useEffect(() => {
    if (!fullscreenOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFullscreen();
      if (e.key === 'ArrowRight') nextFullscreenImage();
      if (e.key === 'ArrowLeft') prevFullscreenImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenOpen, nextFullscreenImage, prevFullscreenImage]);

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

              {/* Image Counter & View All Button */}
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-muted-foreground">
                  {current + 1} / {count} foto
                </span>
                {images.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openFullscreen(0)}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    <Images className="w-4 h-4 mr-2" />
                    Vedi tutte le foto
                  </Button>
                )}
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

      {/* Fullscreen Gallery Modal */}
      {fullscreenOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeFullscreen}
        >
          {/* Close button */}
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Chiudi"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
            <span className="text-white text-sm font-medium">
              {fullscreenIndex + 1} / {images.length}
            </span>
          </div>

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevFullscreenImage();
                }}
                className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Immagine precedente"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextFullscreenImage();
                }}
                className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Immagine successiva"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            </>
          )}

          {/* Main image */}
          <img
            src={images[fullscreenIndex]}
            alt={`${apartment.name} - Immagine ${fullscreenIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 backdrop-blur-sm rounded-lg max-w-[90vw] overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenIndex(index);
                  }}
                  className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden transition-all ${
                    index === fullscreenIndex
                      ? 'ring-2 ring-white opacity-100'
                      : 'opacity-50 hover:opacity-75'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Miniatura ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
