
import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { Camera, X, Move, CheckCircle, ImageIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { v4 as uuidv4 } from 'uuid';

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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onImagesChange(apartmentId, items);
    
    // If the cover image was moved, update its index
    if (coverImageIndex === result.source.index) {
      onCoverImageChange(apartmentId, result.destination.index);
    }
    
    toast.success("Ordine immagini aggiornato");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // For this demo, we'll use local file URLs
    const newImages: string[] = [];
    
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      const objectURL = URL.createObjectURL(file);
      
      // We'll use the objectURL directly since we're not implementing file storage for this component
      newImages.push(objectURL);
    }
    
    onImagesChange(apartmentId, [...images, ...newImages]);
    
    // Set the first image as cover if no cover is set
    if (coverImageIndex === undefined && newImages.length > 0) {
      onCoverImageChange(apartmentId, 0);
    }
    
    toast.success(`${newImages.length} immagini caricate`);
  };

  const removeImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    onImagesChange(apartmentId, updatedImages);
    
    // Adjust cover image index if needed
    if (coverImageIndex === index) {
      // If we removed the cover image, set the first image as cover or clear it
      onCoverImageChange(apartmentId, updatedImages.length > 0 ? 0 : -1);
    } else if (coverImageIndex !== undefined && coverImageIndex > index) {
      // If we removed an image before the cover, adjust the index
      onCoverImageChange(apartmentId, coverImageIndex - 1);
    }
    
    toast.success("Immagine rimossa");
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Immagini ({images.length})</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => document.getElementById(`file-upload-${apartmentId}`)?.click()}
            className="flex items-center"
          >
            <Camera className="h-4 w-4 mr-2" /> Aggiungi
          </Button>
          <Input 
            id={`file-upload-${apartmentId}`}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      </div>
      
      {images.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="apartment-images" direction={isMobile ? "vertical" : "horizontal"}>
            {(provided) => (
              <div 
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              >
                {images.map((imageUrl, index) => (
                  <Draggable key={`${apartmentId}-${index}`} draggableId={`${apartmentId}-${index}`} index={index}>
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
                            src={imageUrl} 
                            alt={`Apartment ${index+1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              console.error(`Failed to load image: ${imageUrl}`);
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
                            onClick={() => onCoverImageChange(apartmentId, index)}
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
