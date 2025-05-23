
import * as React from "react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { imageService, ImageRecord } from "@/services/imageService";

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
  const [loadedImages, setLoadedImages] = useState<ImageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Carica solo le immagini da Supabase
    const loadSupabaseImages = async () => {
      setIsLoading(true);
      console.log(`Caricando immagini Supabase per l'appartamento: ${apartmentId}`);
      
      try {
        // Ottieni solo le immagini da Supabase
        const supabaseImages = await imageService.getImagesByCategory('apartment', apartmentId);
        console.log(`Trovate ${supabaseImages.length} immagini Supabase per ${apartmentId}`);
        
        setLoadedImages(supabaseImages);
        
        // Converti in URLs per compatibilità con il componente padre
        const imageUrls = supabaseImages.map(img => imageService.getImageUrl(img.file_path));
        
        // Aggiorna il componente padre con le nuove immagini
        if (onImagesChange) {
          onImagesChange(apartmentId, imageUrls);
        }
        
        // Imposta automaticamente la prima immagine come cover se non ce n'è una
        if (supabaseImages.length > 0 && !supabaseImages.some(img => img.is_cover) && onCoverImageChange) {
          onCoverImageChange(apartmentId, 0);
        }
      } catch (error) {
        console.error(`Errore nel caricamento delle immagini Supabase per ${apartmentId}:`, error);
        setLoadedImages([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSupabaseImages();
  }, [apartmentId, onImagesChange, onCoverImageChange]);
  
  const handleSelectCover = async (index: number) => {
    if (loadedImages[index]) {
      const success = await imageService.setCoverImage(apartmentId, loadedImages[index].id);
      if (success && onCoverImageChange) {
        onCoverImageChange(apartmentId, index);
        toast.success("Immagine di copertina impostata");
        // Ricarica le immagini per aggiornare lo stato di cover
        const supabaseImages = await imageService.getImagesByCategory('apartment', apartmentId);
        setLoadedImages(supabaseImages);
      }
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
      const supabaseImages = await imageService.getImagesByCategory('apartment', apartmentId);
      setLoadedImages(supabaseImages);
      
      // Converti in URLs per compatibilità con il componente padre
      const imageUrls = supabaseImages.map(img => imageService.getImageUrl(img.file_path));
      
      if (onImagesChange) {
        onImagesChange(apartmentId, imageUrls);
      }
      
      if (supabaseImages.length > 0) {
        toast.success(`Trovate ${supabaseImages.length} immagini`);
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
          {loadedImages.map((image, index) => (
            <div
              key={image.id}
              className={`relative rounded-md overflow-hidden border cursor-pointer ${
                image.is_cover ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleSelectCover(index)}
            >
              <div className="aspect-square relative">
                <img 
                  src={imageService.getImageUrl(image.file_path)}
                  alt={image.alt_text || `Appartamento immagine ${index+1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    console.error(`Errore nel rendering dell'immagine: ${image.file_path}`);
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
              {image.is_cover && (
                <Badge className="absolute bottom-1 left-1">Cover</Badge>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 border border-dashed rounded-lg">
          <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground mt-2">
            Nessuna immagine caricata. Usa l'area amministrativa per caricare le immagini.
          </p>
        </div>
      )}
    </div>
  );
};
