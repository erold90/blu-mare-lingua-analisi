import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Wifi, Car, Tv, Wind, Building, Home, Eye } from 'lucide-react';
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

  if (!apartment) return null;

  return (
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
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index}>
                    <Card className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="aspect-[16/9] relative">
                          <img
                            src={image}
                            alt={`${apartment.name} - Immagine ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
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
  );
};