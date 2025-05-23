
import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Bed, Home, ArrowRight, ArrowLeft, Sun, ThermometerSun } from "lucide-react";
import { Apartment } from "@/data/apartments";
import { imageService } from "@/utils/image";

interface ApartmentDialogProps {
  apartment: Apartment;
  isSelected: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

export const ApartmentDialog: React.FC<ApartmentDialogProps> = ({
  apartment,
  isSelected,
  onToggle,
  onClose
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [apartmentImages, setApartmentImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      try {
        console.log(`Loading images for apartment ${apartment.id} in dialog`);
        
        // Try to get images from Supabase first
        const images = await imageService.scanApartmentImages(apartment.id);
        
        if (images && images.length > 0) {
          console.log(`Found ${images.length} images for apartment ${apartment.id} in dialog`);
          setApartmentImages(images);
        } else {
          console.log(`No images found for apartment ${apartment.id}, using default`);
          setApartmentImages(apartment.images || []);
        }
      } catch (error) {
        console.error(`Error loading images for apartment ${apartment.id}:`, error);
        setApartmentImages(apartment.images || []);
      } finally {
        setLoading(false);
      }
    };
    
    loadImages();
  }, [apartment.id, apartment.images]);

  const nextImage = () => {
    if (apartmentImages.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % apartmentImages.length);
    }
  };

  const prevImage = () => {
    if (apartmentImages.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + apartmentImages.length) % apartmentImages.length);
    }
  };

  const currentImage = apartmentImages.length > 0 ? apartmentImages[currentImageIndex] : "/placeholder.svg";

  return (
    <Dialog onOpenChange={(open) => {
      if (!open && onClose) {
        onClose();
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          Dettagli
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">{apartment.name}</DialogTitle>
          <DialogDescription>{apartment.description}</DialogDescription>
        </DialogHeader>
        
        <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-md mt-4">
          {loading ? (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">Caricamento immagini...</span>
            </div>
          ) : (
            <>
              <div className="absolute inset-0">
                <img 
                  src={currentImage} 
                  alt={`${apartment.name} - Immagine ${currentImageIndex + 1}`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error(`Error loading image: ${currentImage}`);
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
              
              {apartmentImages.length > 1 && (
                <>
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
                    {apartmentImages.map((_, idx) => (
                      <button 
                        key={idx}
                        className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                        onClick={() => setCurrentImageIndex(idx)}
                        aria-label={`Vai all'immagine ${idx + 1}`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full"
                    aria-label="Immagine precedente"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full"
                    aria-label="Immagine successiva"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </>
          )}
        </div>
        
        <div className="mt-6">
          <h4 className="font-medium mb-2">Descrizione dettagliata</h4>
          <p className="text-sm text-muted-foreground">{apartment.longDescription}</p>
        </div>

        {apartment.CIN && (
          <div className="text-xs text-muted-foreground">
            CIN: {apartment.CIN}
          </div>
        )}
        
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Caratteristiche</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-2">
            <div className="flex items-center gap-2">
              <Bed className="h-5 w-5 text-primary" />
              <span>{apartment.beds} {apartment.beds === 1 ? 'posto letto' : 'posti letto'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              <span>{apartment.bedrooms} {apartment.bedrooms === 1 ? 'camera' : 'camere'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              <span>{apartment.hasVeranda ? 'Ampia Veranda' : apartment.hasTerrace ? 'Terrazza Vista Mare' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <ThermometerSun className="h-5 w-5 text-primary" />
              <span>{apartment.hasAirConditioning ? 'Climatizzatore' : 'Non Climatizzato'}</span>
            </div>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            {apartment.services && apartment.services.map((feature: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex justify-center mt-6 gap-4">
          <Button 
            variant={isSelected ? "default" : "outline"}
            onClick={onToggle}
          >
            {isSelected ? "Selezionato" : "Seleziona"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
