
import * as React from "react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { imageService } from "@/utils/image";

interface ApartmentImagesProps {
  apartmentId: string;
  images: string[];
  coverImageIndex: number | undefined;
  onImagesChange: (apartmentId: string, images: string[]) => void;
  onCoverImageChange: (apartmentId: string, index: number) => void;
}

export const ApartmentImages: React.FC<ApartmentImagesProps> = ({
  apartmentId,
  images,
  coverImageIndex,
  onImagesChange,
  onCoverImageChange
}) => {
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Funzione per caricare e verificare le immagini
    const checkAndLoadImages = async () => {
      setIsLoading(true);
      console.log(`Cercando immagini per l'appartamento: ${apartmentId}`);
      
      try {
        // Prima cerchiamo nella cache (ora con async)
        const cachedImages = await imageService.getApartmentImagesFromCache(apartmentId);
        if (cachedImages && cachedImages.length > 0) {
          console.log(`Trovate ${cachedImages.length} immagini in cache per ${apartmentId}`);
          setLoadedImages(cachedImages);
          
          // Verifichiamo che le immagini esistano ancora
          const stillValid = await Promise.all(
            cachedImages.map(path => imageService.checkImageExists(path))
          );
          
          // Se tutte sono valide, usiamo quelle
          if (stillValid.every(Boolean)) {
            console.log("Tutte le immagini cached sono ancora valide");
            setLoadedImages(cachedImages);
            onImagesChange(apartmentId, cachedImages);
            setIsLoading(false);
            return;
          } else {
            console.log("Alcune immagini cached non sono più valide, effettuo nuova scansione");
          }
        }
        
        // Scansione completa delle immagini
        const validImages = await imageService.scanApartmentImages(apartmentId);
        
        console.log(`Trovate ${validImages.length} immagini valide per ${apartmentId}`);
        
        // Salva nella cache per future richieste
        if (validImages.length > 0) {
          imageService.cacheApartmentImages(apartmentId, validImages);
        }
        
        setLoadedImages(validImages);
        
        // Aggiorna il componente padre se abbiamo trovato immagini valide
        if (validImages.length > 0 && onImagesChange) {
          onImagesChange(apartmentId, validImages);
        }
      } catch (error) {
        console.error(`Errore nel caricamento delle immagini per ${apartmentId}:`, error);
        setLoadedImages([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAndLoadImages();
  }, [apartmentId, onImagesChange]);
  
  const handleSelectCover = (index: number) => {
    if (onCoverImageChange) {
      onCoverImageChange(apartmentId, index);
      toast.success("Immagine di copertina impostata");
    }
  };
  
  // Genera un messaggio informativo basato sullo stato attuale
  const getInfoMessage = () => {
    if (isLoading) {
      return "Caricamento immagini in corso...";
    }
    
    if (loadedImages.length === 0) {
      return `Nessuna immagine trovata per l'appartamento ${apartmentId}`;
    }
    
    return `${loadedImages.length} immagini trovate`;
  };
  
  // Funzione per forzare il ricaricamento delle immagini
  const handleRefreshImages = async () => {
    setIsLoading(true);
    toast.info("Ricerca immagini in corso...");
    
    try {
      // Pulisci la cache
      imageService.clearImageCache();
      
      // Ricarica le immagini da Supabase
      const validImages = await imageService.scanApartmentImages(apartmentId);
      
      setLoadedImages(validImages);
      
      // Salva nella cache per future richieste
      if (validImages.length > 0) {
        imageService.cacheApartmentImages(apartmentId, validImages);
      }
        
      // Aggiorna il componente padre se abbiamo trovato immagini valide
      if (validImages.length > 0 && onImagesChange) {
        onImagesChange(apartmentId, validImages);
      }
      
      if (validImages.length > 0) {
        toast.success(`Trovate ${validImages.length} immagini`);
      } else {
        toast.error("Nessuna immagine trovata");
      }
    } catch (error) {
      console.error(`Errore nel refresh delle immagini:`, error);
      toast.error("Errore nel caricamento delle immagini");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Immagini</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{getInfoMessage()}</span>
          <button 
            onClick={handleRefreshImages} 
            className="text-xs text-primary hover:underline"
            disabled={isLoading}
          >
            Aggiorna
          </button>
        </div>
      </div>
      
      {loadedImages.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {loadedImages.map((path, index) => (
            <div
              key={index}
              className={`relative rounded-md overflow-hidden border cursor-pointer ${
                coverImageIndex === index ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleSelectCover(index)}
            >
              <div className="aspect-square relative">
                <img 
                  src={imageService.getImageUrl(path)}
                  alt={`Appartamento immagine ${index+1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    console.error(`Errore nel rendering dell'immagine: ${path}`);
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
              {coverImageIndex === index && (
                <Badge className="absolute bottom-1 left-1">Cover</Badge>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 border border-dashed rounded-lg">
          <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground mt-2">
            Le immagini vengono ora gestite tramite Supabase. Usa l'area amministrativa per caricare le immagini.
          </p>
        </div>
      )}
    </div>
  );
};
