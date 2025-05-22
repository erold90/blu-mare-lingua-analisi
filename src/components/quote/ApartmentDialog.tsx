
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
import { imageService } from "@/utils/imageService";
import { Skeleton } from "@/components/ui/skeleton";

interface ApartmentDialogProps {
  apartmentId: string | null;
  apartments: Apartment[];
  onOpenChange: (open: boolean) => void;
  onSelect: (id: string) => void;
}

// Componente di immagine progressiva per caricamento ottimizzato
const ProgressiveImage = ({ src, alt, className }: { src: string, alt: string, className?: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState("/placeholder.svg");
  
  useEffect(() => {
    if (src !== "/placeholder.svg") {
      setIsLoaded(false);
      
      const img = new Image();
      img.onload = () => {
        setImgSrc(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${src}`);
        setImgSrc("/placeholder.svg");
        setIsLoaded(true);
      };
      img.src = src;
    }
  }, [src]);
  
  return (
    <>
      {!isLoaded && <Skeleton className={`${className} absolute inset-0`} />}
      <img 
        src={imgSrc}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onError={(e) => {
          console.error(`Error in image render: ${src}`);
          e.currentTarget.src = "/placeholder.svg";
        }}
      />
    </>
  );
};

const ApartmentDialog: React.FC<ApartmentDialogProps> = ({
  apartmentId,
  apartments,
  onOpenChange,
  onSelect
}) => {
  const apartment = apartments.find(apt => apt.id === apartmentId);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (apartment) {
      // Reimpostare l'indice delle immagini quando cambia l'appartamento
      setCurrentImageIndex(0);
      setIsLoading(true);
      
      // Controllo prima nella cache per un caricamento istantaneo
      const cachedImages = imageService.getApartmentImagesFromCache(apartment.id);
      if (cachedImages && cachedImages.length > 0) {
        setGalleryImages(cachedImages);
        setIsLoading(false);
        
        // Precarica le immagini successive in background per transizioni fluide
        if (cachedImages.length > 1) {
          imageService.preloadImages(cachedImages.slice(1, 4)); // Precarica le prossime 3
        }
        return;
      }
      
      // Fallback alle immagini predefinite dell'appartamento se presenti
      if (apartment.images && apartment.images.length > 0) {
        setGalleryImages(apartment.images);
        setIsLoading(false);
      }
      
      // In background, cerca comunque le immagini più recenti senza bloccare l'interfaccia
      imageService.scanApartmentImages(apartment.id).then(images => {
        setIsLoading(false);
        if (images && images.length > 0) {
          setGalleryImages(images);
          
          // Precarica le prossime immagini
          if (images.length > 1) {
            imageService.preloadImages(images.slice(1, 4));
          }
        }
      });
    }
  }, [apartment]);
  
  // Precarica l'immagine successiva quando cambia l'indice corrente
  useEffect(() => {
    if (galleryImages.length > 1) {
      const nextIndex = (currentImageIndex + 1) % galleryImages.length;
      imageService.preloadImage(galleryImages[nextIndex]);
    }
  }, [currentImageIndex, galleryImages]);
  
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

  // Determina l'URL dell'immagine corrente
  const currentImage = galleryImages[currentImageIndex] || apartment.images[0] || "/placeholder.svg";
  const imageUrl = currentImage.startsWith('/images/apartments/')
    ? imageService.getImageUrl(currentImage)
    : currentImage;

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
            <ProgressiveImage 
              src={imageUrl} 
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
