
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Apartment } from "@/data/apartments";
import { Bed, BedDouble, MapPin, Sun, ThermometerSun, ArrowLeft, ArrowRight } from "lucide-react";

interface ApartmentDialogProps {
  apartmentId: string | null;
  apartments: Apartment[];
  onOpenChange: (open: boolean) => void;
  onSelect: (id: string) => void;
}

const ApartmentDialog: React.FC<ApartmentDialogProps> = ({
  apartmentId,
  apartments,
  onOpenChange,
  onSelect
}) => {
  const apartment = apartments.find(apt => apt.id === apartmentId);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  useEffect(() => {
    if (apartment) {
      // Try to load gallery images from localStorage
      try {
        const apartmentImagesStr = localStorage.getItem("apartmentImages");
        if (apartmentImagesStr) {
          const allApartmentImages = JSON.parse(apartmentImagesStr);
          const aptImages = allApartmentImages[apartment.id] || [];
          
          if (aptImages.length > 0) {
            setGalleryImages(aptImages);
            return;
          }
        }
        
        // Fallback to apartment's default image
        setGalleryImages(apartment.images);
      } catch (error) {
        console.error("Error loading apartment images:", error);
        setGalleryImages(apartment.images);
      }
      
      // Reset image index when apartment changes
      setCurrentImageIndex(0);
    }
  }, [apartment]);
  
  const nextImage = () => {
    if (galleryImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    }
  };
  
  const prevImage = () => {
    if (galleryImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    }
  };
  
  if (!apartment) {
    return null;
  }

  return (
    <Dialog open={!!apartmentId} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{apartment.name}</DialogTitle>
          <DialogDescription>
            {apartment.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
            <img 
              src={galleryImages[currentImageIndex] || apartment.images[0]} 
              alt={apartment.name} 
              className="w-full h-full object-cover"
            />
            
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.preventDefault(); prevImage(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); nextImage(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
                
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                  {galleryImages.map((_, idx) => (
                    <button 
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                      onClick={(e) => { e.preventDefault(); setCurrentImageIndex(idx); }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          
          {/* Apartment Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4 text-primary" />
              <span>{apartment.beds} posti letto</span>
            </div>
            <div className="flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-primary" />
              <span>{apartment.bedrooms} {apartment.bedrooms === 1 ? 'camera' : 'camere'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Piano {apartment.floor}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-primary" />
              <span>
                {apartment.hasVeranda ? 'Ampia Veranda' : apartment.hasTerrace ? 'Terrazza Vista Mare' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ThermometerSun className="h-4 w-4 text-primary" />
              <span>{apartment.hasAirConditioning ? 'Climatizzatore' : 'Non Climatizzato'}</span>
            </div>
          </div>
          
          {/* Long Description */}
          {apartment.longDescription && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Descrizione dettagliata</h4>
              <p className="text-sm text-muted-foreground">{apartment.longDescription}</p>
            </div>
          )}

          {/* CIN */}
          {apartment.CIN && (
            <div className="text-xs text-muted-foreground">
              CIN: {apartment.CIN}
            </div>
          )}
          
          {/* Services */}
          <div>
            <h4 className="font-medium mb-2">Servizi inclusi:</h4>
            <div className="flex flex-wrap gap-2">
              {apartment.services.map((service, index) => (
                <span key={index} className="text-xs bg-muted px-2 py-1 rounded">{service}</span>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button 
            variant="default" 
            onClick={() => onSelect(apartment.id)}
          >
            Seleziona
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApartmentDialog;
