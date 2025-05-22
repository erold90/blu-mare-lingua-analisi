
import * as React from "react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { imageService } from "@/utils/image"; // Aggiorniamo l'import per usare la nuova struttura

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
      
      // Utilizziamo il normalizeApartmentId per assicurarci che il formato sia corretto
      const normalizedId = imageService.normalizeApartmentId(apartmentId);
      console.log(`ID normalizzato dell'appartamento: ${normalizedId}`);
      
      // Prima cerchiamo nella cache 
      const cachedImages = imageService.getApartmentImagesFromCache(apartmentId);
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
      
      // Percorsi assoluti con ID normalizzato (controllo entrambi i formati per compatibilità)
      const potentialPaths = [
        // Formato con ID normalizzato
        ...Array.from({ length: 16 }, (_, i) => `/images/apartments/${normalizedId}/image${i+1}.jpg`),
        // Formato originale per retrocompatibilità
        ...Array.from({ length: 16 }, (_, i) => `/images/apartments/${apartmentId}/image${i+1}.jpg`)
      ];
      
      console.log(`Percorsi da controllare:`, potentialPaths.length);
      
      // Array per tenere traccia delle immagini caricate con successo
      const validImages: string[] = [];
      
      // Controlla ogni immagine con un timeout per evitare blocchi
      for (const path of potentialPaths) {
        try {
          const exists = await imageService.checkImageExists(path);
          
          if (exists) {
            console.log(`✅ Immagine trovata: ${path}`);
            validImages.push(path);
            
            // Forza il precaricamento dell'immagine in background
            imageService.preloadImage(path);
            
            // Evitiamo duplicati (se troviamo l'immagine in un formato, non cerchiamo nell'altro)
            const baseName = path.split('/').pop();
            if (baseName) {
              const otherPathsWithSameBaseName = potentialPaths.filter(p => 
                p !== path && p.split('/').pop() === baseName
              );
              
              for (const otherPath of otherPathsWithSameBaseName) {
                const index = potentialPaths.indexOf(otherPath);
                if (index > -1) {
                  potentialPaths.splice(index, 1);
                }
              }
            }
          }
        } catch (error) {
          console.error(`Errore nel controllare l'immagine ${path}:`, error);
        }
      }
      
      // Se non abbiamo trovato immagini, prova a fare il debug della prima immagine
      if (validImages.length === 0 && potentialPaths.length > 0) {
        console.warn(`Nessuna immagine trovata per ${apartmentId}, avvio del debug...`);
        // Debug per entrambi i formati di percorso
        await imageService.debugImage(`/images/apartments/${normalizedId}/image1.jpg`);
        await imageService.debugImage(`/images/apartments/${apartmentId}/image1.jpg`);
      } else {
        console.log(`Trovate ${validImages.length} immagini valide per ${apartmentId}`);
        
        // Salva nella cache per future richieste
        if (validImages.length > 0) {
          imageService.cacheApartmentImages(apartmentId, validImages);
        }
      }
      
      setLoadedImages(validImages);
      
      // Aggiorna il componente padre se abbiamo trovato immagini valide
      if (validImages.length > 0 && onImagesChange) {
        onImagesChange(apartmentId, validImages);
      }
      
      setIsLoading(false);
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
    
    // Rimuoviamo prima le immagini dalla cache
    imageService.cacheApartmentImages(apartmentId, []);
    
    // Utilizziamo il normalizeApartmentId per assicurarci che il formato sia corretto
    const normalizedId = imageService.normalizeApartmentId(apartmentId);
    
    // Percorsi assoluti con entrambi i formati di ID
    const potentialPaths = [
      // Formato con ID normalizzato
      ...Array.from({ length: 16 }, (_, i) => `/images/apartments/${normalizedId}/image${i+1}.jpg`),
      // Formato originale per retrocompatibilità
      ...Array.from({ length: 16 }, (_, i) => `/images/apartments/${apartmentId}/image${i+1}.jpg`)
    ];
    
    // Array per tenere traccia delle immagini caricate con successo
    const validImages: string[] = [];
    
    // Controlla ogni immagine forzando il bypass della cache
    for (const path of potentialPaths) {
      try {
        // Forziamo il reload per bypassare la cache
        await imageService.forceReloadImage(path);
        const exists = await imageService.checkImageExists(path);
        
        if (exists) {
          console.log(`✅ Immagine trovata (refresh): ${path}`);
          validImages.push(path);
          
          // Evitiamo duplicati
          const baseName = path.split('/').pop();
          if (baseName) {
            const otherPathsWithSameBaseName = potentialPaths.filter(p => 
              p !== path && p.split('/').pop() === baseName
            );
            
            for (const otherPath of otherPathsWithSameBaseName) {
              const index = potentialPaths.indexOf(otherPath);
              if (index > -1) {
                potentialPaths.splice(index, 1);
              }
            }
          }
        } else {
          console.log(`❌ Immagine non trovata (refresh): ${path}`);
        }
      } catch (error) {
        console.error(`Errore nel controllare l'immagine ${path}:`, error);
      }
    }
    
    setLoadedImages(validImages);
    
    // Salva nella cache per future richieste
    if (validImages.length > 0) {
      imageService.cacheApartmentImages(apartmentId, validImages);
    }
      
    // Aggiorna il componente padre se abbiamo trovato immagini valide
    if (validImages.length > 0 && onImagesChange) {
      onImagesChange(apartmentId, validImages);
    }
    
    setIsLoading(false);
    
    if (validImages.length > 0) {
      toast.success(`Trovate ${validImages.length} immagini`);
    } else {
      toast.error("Nessuna immagine trovata");
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
            Carica manualmente le immagini nella cartella /public/images/apartments/{apartmentId}/
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Assicurati che le immagini siano chiamate: image1.jpg, image2.jpg, ecc.
          </p>
        </div>
      )}
      <div className="mt-4 space-y-2">
        <p className="text-sm text-muted-foreground">
          Per gestire le immagini dell'appartamento, caricare manualmente i file nella cartella /public/images/apartments/{apartmentId}/
        </p>
        <div className="bg-muted p-2 rounded text-xs font-mono">
          <strong>Percorsi corretti delle immagini:</strong>
          <ul className="mt-1 space-y-0.5">
            <li>/public/images/apartments/{apartmentId}/image1.jpg (copertina)</li>
            <li>/public/images/apartments/{apartmentId}/image2.jpg</li>
            <li>/public/images/apartments/{apartmentId}/image3.jpg</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
