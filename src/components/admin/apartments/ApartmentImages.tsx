
import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { Camera, X, Move, CheckCircle, ImageIcon, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { imageService, IMAGE_CATEGORIES, ImageMetadata } from "@/utils/imageService";

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
  onCoverImageChange,
}) => {
  const isMobile = useIsMobile();
  const [loadingImages, setLoadingImages] = useState(true);
  const [apartmentImages, setApartmentImages] = useState<ImageMetadata[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Carica le immagini quando cambia l'ID dell'appartamento
  useEffect(() => {
    const loadImages = async () => {
      setLoadingImages(true);
      try {
        const result = await imageService.getImages(IMAGE_CATEGORIES.APARTMENTS, apartmentId);
        
        if (result.success) {
          setApartmentImages(result.images);
          
          // Aggiorna il componente parent con i nuovi percorsi delle immagini
          const imagePaths = result.images.map(img => img.path);
          onImagesChange(apartmentId, imagePaths);
          
          // Trova l'indice dell'immagine di copertina
          const coverIndex = result.images.findIndex(img => img.isCover);
          if (coverIndex >= 0) {
            onCoverImageChange(apartmentId, coverIndex);
          }
        } else {
          toast.error("Errore nel caricamento delle immagini: " + result.message);
        }
      } catch (error) {
        console.error("Errore nel caricamento delle immagini:", error);
        toast.error("Errore nel caricamento delle immagini");
      } finally {
        setLoadingImages(false);
      }
    };
    
    if (apartmentId) {
      loadImages();
    }
  }, [apartmentId, onImagesChange, onCoverImageChange]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(apartmentImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setApartmentImages(items);
    
    // Aggiorna il componente parent con i nuovi percorsi delle immagini
    const imagePaths = items.map(img => img.path);
    onImagesChange(apartmentId, imagePaths);
    
    // Se l'immagine di copertina è stata spostata, aggiorna il suo indice
    if (coverImageIndex === result.source.index) {
      onCoverImageChange(apartmentId, result.destination.index);
    }
    
    // Salva il nuovo ordine sul server
    try {
      const imageIds = items.map(img => img.id);
      const success = await imageService.updateImagesOrder(apartmentId, imageIds);
      
      if (success) {
        toast.success("Ordine immagini aggiornato");
      }
    } catch (error) {
      console.error("Errore nell'aggiornamento dell'ordine:", error);
      toast.error("Errore nell'aggiornamento dell'ordine delle immagini");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploadingImage(true);
    setUploadProgress(0);
    
    try {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        
        // Calcola la percentuale di avanzamento per questo file
        const fileProgress = (i) / e.target.files.length * 100;
        setUploadProgress(fileProgress);
        
        // Carica l'immagine
        const isCover = apartmentImages.length === 0; // Prima immagine = copertina
        const result = await imageService.uploadImage(
          file,
          IMAGE_CATEGORIES.APARTMENTS,
          { apartmentId, isCover },
          (progress) => {
            // Converti il progresso individuale in progresso complessivo
            const fileWeight = 100 / e.target.files.length;
            const overallProgress = fileProgress + (progress / 100 * fileWeight);
            setUploadProgress(Math.min(overallProgress, 99));
          }
        );
        
        if (result.success && result.metadata) {
          // Aggiungi l'immagine caricata all'elenco
          setApartmentImages(prev => [...prev, result.metadata!]);
          
          // Aggiorna il componente parent
          onImagesChange(apartmentId, [...images, result.metadata!.path]);
          
          // Se è la prima immagine o impostata come copertina, aggiorna l'indice di copertina
          if (isCover) {
            onCoverImageChange(apartmentId, apartmentImages.length);
          }
        } else {
          toast.error("Errore nel caricamento dell'immagine: " + result.message);
        }
      }
      
      setUploadProgress(100);
      toast.success(`${e.target.files.length} immagini caricate`);
    } catch (error) {
      console.error('Errore nel caricamento delle immagini:', error);
      toast.error(`Errore durante il caricamento delle immagini: ${(error as Error).message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageToRemove = apartmentImages[index];
    
    try {
      // Elimina l'immagine dal server
      const result = await imageService.deleteImage(
        imageToRemove.id,
        IMAGE_CATEGORIES.APARTMENTS,
        apartmentId
      );
      
      if (result.success) {
        // Rimuovi l'immagine dall'elenco locale
        const updatedImages = [...apartmentImages];
        updatedImages.splice(index, 1);
        setApartmentImages(updatedImages);
        
        // Aggiorna il componente parent
        onImagesChange(apartmentId, updatedImages.map(img => img.path));
        
        // Aggiusta l'indice dell'immagine di copertina se necessario
        if (coverImageIndex === index) {
          // Se abbiamo rimosso l'immagine di copertina, imposta la prima immagine come copertina o nessuna
          onCoverImageChange(apartmentId, updatedImages.length > 0 ? 0 : -1);
        } else if (coverImageIndex !== undefined && coverImageIndex > index) {
          // Se abbiamo rimosso un'immagine prima della copertina, aggiusta l'indice
          onCoverImageChange(apartmentId, coverImageIndex - 1);
        }
        
        toast.success("Immagine rimossa");
      } else {
        toast.error("Errore nella rimozione dell'immagine: " + result.message);
      }
    } catch (error) {
      console.error('Errore nella rimozione dell\'immagine:', error);
      toast.error("Errore nella rimozione dell'immagine");
    }
  };

  const setCoverImage = async (index: number) => {
    const image = apartmentImages[index];
    
    try {
      const success = await imageService.setCoverImage(image.id, apartmentId);
      
      if (success) {
        onCoverImageChange(apartmentId, index);
        
        // Aggiorna anche lo stato locale
        setApartmentImages(prev => 
          prev.map((img, i) => ({
            ...img,
            isCover: i === index
          }))
        );
        
        toast.success("Immagine di copertina impostata");
      }
    } catch (error) {
      console.error('Errore nell\'impostazione dell\'immagine di copertina:', error);
      toast.error("Errore nell'impostazione dell'immagine di copertina");
    }
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Immagini ({apartmentImages.length})</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => document.getElementById(`file-upload-${apartmentId}`)?.click()}
            className="flex items-center"
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
            ) : (
              <Camera className="h-4 w-4 mr-2" />
            )}
            Aggiungi
          </Button>
          <Input 
            id={`file-upload-${apartmentId}`}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={uploadingImage}
          />
        </div>
      </div>
      
      {uploadingImage && (
        <div className="mb-4">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">Caricamento in corso...</p>
        </div>
      )}
      
      {loadingImages ? (
        <div className="text-center py-6">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground mt-2">Caricamento immagini...</p>
        </div>
      ) : apartmentImages.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="apartment-images" direction={isMobile ? "vertical" : "horizontal"}>
            {(provided) => (
              <div 
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              >
                {apartmentImages.map((image, index) => (
                  <Draggable key={image.id} draggableId={image.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`relative rounded-md overflow-hidden border ${
                          coverImageIndex === index ? 'ring-2 ring-primary' : ''
                        }`}
                      >
                        <div className="aspect-square relative">
                          <img 
                            src={image.path} 
                            alt={`Appartamento ${index+1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              console.error(`Failed to load image: ${image.path}`);
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                        <div className="absolute top-1 right-1 flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 bg-white/80 hover:bg-white"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 bg-white/80 hover:bg-white"
                            onClick={() => setCoverImage(index)}
                          >
                            <CheckCircle className={`h-3 w-3 ${coverImageIndex === index ? 'text-primary' : ''}`} />
                          </Button>
                          <div
                            {...provided.dragHandleProps}
                            className="h-6 w-6 flex items-center justify-center bg-white/80 hover:bg-white rounded-sm cursor-move"
                          >
                            <Move className="h-3 w-3" />
                          </div>
                        </div>
                        {coverImageIndex === index && (
                          <Badge className="absolute bottom-1 left-1">Cover</Badge>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="text-center py-6 border border-dashed rounded-lg">
          <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground mt-2">
            Nessuna immagine caricata
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => document.getElementById(`file-upload-${apartmentId}`)?.click()}
          >
            <Camera className="h-4 w-4 mr-2" /> Carica immagini
          </Button>
        </div>
      )}
    </div>
  );
};
