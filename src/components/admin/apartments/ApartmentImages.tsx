
import * as React from "react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";

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
      
      // Genera percorsi per le prime 5 immagini
      const potentialImagePaths = Array.from({ length: 5 }, (_, i) => 
        `/images/apartments/${apartmentId}/image${i+1}.jpg`
      );
      
      console.log(`Percorsi da controllare:`, potentialImagePaths);
      
      // Array per tenere traccia delle immagini caricate con successo
      const validImages: string[] = [];
      
      // Funzione per verificare se un'immagine esiste
      const checkImage = (path: string): Promise<string | null> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            console.log(`Immagine caricata con successo: ${path}`);
            resolve(path);
          };
          img.onerror = () => {
            console.warn(`Impossibile caricare l'immagine: ${path}`);
            resolve(null);
          };
          img.src = path;
        });
      };
      
      // Verifica tutte le potenziali immagini
      const results = await Promise.all(potentialImagePaths.map(checkImage));
      
      // Filtra solo le immagini caricate con successo
      results.forEach(result => {
        if (result) validImages.push(result);
      });
      
      console.log(`Immagini valide trovate: ${validImages.length}`, validImages);
      
      // Aggiorna lo stato con le immagini trovate
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
  
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Immagini</h3>
        <span className="text-xs text-muted-foreground">{getInfoMessage()}</span>
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
                  src={path} 
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
      <p className="text-sm text-muted-foreground mt-4">
        Per gestire le immagini dell'appartamento, caricare manualmente i file nella cartella /public/images/apartments/{apartmentId}/
        <br />
        <span className="text-xs">Nota: Controlla che il nome dell'appartamento ({apartmentId}) corrisponda esattamente al nome della cartella.</span>
      </p>
    </div>
  );
};
